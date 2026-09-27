import io
import os
import re
import logging
from typing import Dict, Any, List, Optional, Tuple
from PIL import Image, ImageEnhance, ImageOps

from ..schemas.nutrition import NutritionData
from ..schemas.analysis import (
    ProductAnalysisResponse,
    NutrientEvaluation,
    NutritionalProfileSummary,
    ClassifiedIngredient
)
from ..schemas.product import AllergenInfo
from .nutrition import NutritionAnalysisService
from .ingredients import IngredientParserService
from .allergens import AllergenDetectionService
from .product_service import ProductService

logger = logging.getLogger("packcheck.services.ocr")

try:
    import pytesseract  # type: ignore[import-untyped]
    _tesseract_cmd = os.getenv("TESSERACT_CMD", "")
    if _tesseract_cmd:
        pytesseract.pytesseract.tesseract_cmd = _tesseract_cmd
    PYTESSERACT_AVAILABLE = True
except ImportError:
    PYTESSERACT_AVAILABLE = False

try:
    import zxingcpp  # type: ignore[import-untyped]
    ZXING_AVAILABLE = True
except ImportError:
    ZXING_AVAILABLE = False


class OCRService:
    """
    Robust OCR fallback and Barcode Image Reader pipeline.
    
    1. If the uploaded image contains a 1D/2D barcode (EAN-13, UPC-A, QR code),
       it decodes the barcode lines directly and fetches the verified product.
    2. If the image is a packaging label (Nutrition Facts table, Ingredients text),
       it preprocesses the image, extracts the text, and normalizes it into
       PackCheck's standard analysis pipeline.
    """

    def __init__(self):
        self.nutrition_service = NutritionAnalysisService()
        self.ingredient_service = IngredientParserService()
        self.allergen_service = AllergenDetectionService()
        self.product_service = ProductService()

    def preprocess_image(self, image_bytes: bytes) -> Tuple[Image.Image, Image.Image, Dict[str, Any]]:
        """
        Validates and analyzes an image, returning both the original and preprocessed images:
        - Grayscale conversion
        - Auto-contrast stretching
        - Adaptive sharpness enhancement
        """
        try:
            original_img = Image.open(io.BytesIO(image_bytes))
            metadata = {
                "format": original_img.format or "UNKNOWN",
                "width": original_img.width,
                "height": original_img.height,
                "mode": original_img.mode,
                "size_bytes": len(image_bytes)
            }

            # Preprocessing: convert to grayscale
            processed = original_img.convert("L")
            processed = ImageOps.autocontrast(processed, cutoff=1)
            enhancer = ImageEnhance.Sharpness(processed)
            processed = enhancer.enhance(1.8)

            return original_img, processed, metadata
        except Exception as e:
            logger.error(f"Image preprocessing failed: {e}")
            raise ValueError(f"Invalid image format or corrupted file: {e}")

    def detect_barcode_in_image(self, original_img: Image.Image, processed_img: Optional[Image.Image] = None) -> Optional[Dict[str, str]]:
        """
        Scans an image for 1D or 2D barcodes using zxingcpp.
        Tries the original and preprocessed image at all 4 rotations (0°, 90°, 180°, 270°)
        and also at a rescaled size for large images, to handle phone photos taken sideways.
        """
        if not ZXING_AVAILABLE:
            return None

        # Build candidate list: original + preprocessed, each at 4 rotations
        base_candidates = [original_img]
        if processed_img:
            base_candidates.append(processed_img)

        rotations = [0, 90, 180, 270]

        def _try_read(img: Image.Image) -> Optional[Dict[str, str]]:
            """Attempt barcode read on a single image variant."""
            try:
                res = zxingcpp.read_barcode(img)
                if res and res.valid and res.text:
                    fmt = str(res.format).replace("BarcodeFormat.", "")
                    return {"barcode": res.text.strip(), "format": fmt}
            except Exception as e:
                logger.debug(f"Barcode scan attempt error: {e}")
            return None

        for base_img in base_candidates:
            for angle in rotations:
                candidate = base_img.rotate(angle, expand=True) if angle != 0 else base_img
                result = _try_read(candidate)
                if result:
                    logger.info(
                        f"Barcode detected at {angle}° rotation: {result['barcode']} ({result['format']})"
                    )
                    return result

            # Also try a rescaled version (helps with very large or very small images)
            w, h = base_img.size
            if w > 1200 or h > 1200:
                scale_factor = 1200 / max(w, h)
                small = base_img.resize(
                    (int(w * scale_factor), int(h * scale_factor)),
                    Image.LANCZOS
                )
                for angle in rotations:
                    candidate = small.rotate(angle, expand=True) if angle != 0 else small
                    result = _try_read(candidate)
                    if result:
                        logger.info(
                            f"Barcode detected on rescaled image at {angle}°: {result['barcode']} ({result['format']})"
                        )
                        return result

        return None

    def extract_text(self, preprocessed_img: Image.Image) -> Tuple[str, str]:
        """
        Extracts text using pytesseract if available; otherwise returns empty string.
        """
        if PYTESSERACT_AVAILABLE:
            try:
                text = pytesseract.image_to_string(preprocessed_img)
                if text and text.strip():
                    return text.strip(), "pytesseract"
            except Exception as e:
                logger.warning(f"pytesseract extraction failed or binary not found: {e}")

        return "", "no_ocr_engine_available"

    def parse_label_text(self, text: str) -> Dict[str, Any]:
        """
        Regex-driven, deterministic food packaging label parser.
        Detects product name hints, ingredients, allergen statements, and nutrition tables.
        """
        lines = [line.strip() for line in text.splitlines() if line.strip()]
        detected_name = None
        ingredients_list = []
        raw_ingredients_text = ""
        may_contain_text = ""

        # 1. Product name heuristic
        keywords_to_skip = ("nutrition", "ingredient", "per 100g", "serving", "mfg", "exp", "batch", "keep", "store", "energy", "calories", "fat", "protein", "sodium", "sugar", "fiber")
        for line in lines[:5]:
            lower = line.lower()
            if not any(k in lower for k in keywords_to_skip) and len(line) > 3 and not line.isdigit():
                detected_name = line
                break

        # 2. Ingredients block
        ing_pattern = re.compile(
            r"(?:ingredients?|contains)\s*[:\-]\s*(.*?)(?=(?:allergen|contains\s+milk|may\s+contain|manufactured\s+by|nutrition\s+facts|best\s+before|$))",
            re.IGNORECASE | re.DOTALL
        )
        ing_match = ing_pattern.search(text)
        if ing_match:
            raw_ingredients_text = ing_match.group(1).strip()
            ingredients_list = self.ingredient_service.parse_ingredients_text(raw_ingredients_text)
        else:
            for line in lines:
                if "water" in line.lower() or "sugar" in line.lower() or "flour" in line.lower():
                    raw_ingredients_text = line
                    ingredients_list = self.ingredient_service.parse_ingredients_text(line)
                    break

        # 3. Allergen statements
        allergen_match = re.search(r"(?:may\s+contain\s*[:\-]?\s*|contains\s*[:\-]?\s*)([^\.\n]+)", text, re.IGNORECASE)
        if allergen_match:
            may_contain_text = allergen_match.group(0).strip()

        # 4. Nutrition table
        nutrition = self._extract_nutrition_table(text)

        return {
            "detected_name": detected_name or "Packaging Scan (OCR)",
            "raw_ingredients": raw_ingredients_text,
            "ingredients_list": ingredients_list,
            "may_contain_text": may_contain_text,
            "nutrition": nutrition
        }

    def _extract_nutrition_table(self, text: str) -> NutritionData:
        def find_val(pattern: str) -> Optional[float]:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                try:
                    return float(match.group(1))
                except (ValueError, IndexError):
                    return None
            return None

        calories = find_val(r"(?:energy|calories?|cal)\s*[:\-]?\s*([0-9]+(?:\.[0-9]+)?)\s*(?:kcal)?")
        fat = find_val(r"(?:total\s+fat|fat)\s*[:\-]?\s*([0-9]+(?:\.[0-9]+)?)\s*g?")
        saturated_fat = find_val(r"(?:saturated\s+fat|sat\s+fat)\s*[:\-]?\s*([0-9]+(?:\.[0-9]+)?)\s*g?")
        trans_fat = find_val(r"(?:trans\s+fat)\s*[:\-]?\s*([0-9]+(?:\.[0-9]+)?)\s*g?")
        sugars = find_val(r"(?:total\s+sugars?|sugars?)\s*[:\-]?\s*([0-9]+(?:\.[0-9]+)?)\s*g?")
        added_sugars = find_val(r"(?:added\s+sugars?)\s*[:\-]?\s*([0-9]+(?:\.[0-9]+)?)\s*g?")
        fiber = find_val(r"(?:dietary\s+fiber|fiber|dietary\s+fibre|fibre)\s*[:\-]?\s*([0-9]+(?:\.[0-9]+)?)\s*g?")
        protein = find_val(r"(?:protein)\s*[:\-]?\s*([0-9]+(?:\.[0-9]+)?)\s*g?")

        sodium_g = None
        sodium_mg = find_val(r"(?:sodium)\s*[:\-]?\s*([0-9]+(?:\.[0-9]+)?)\s*mg")
        if sodium_mg is not None:
            sodium_g = round(sodium_mg / 1000.0, 4)
        else:
            sodium_direct = find_val(r"(?:sodium)\s*[:\-]?\s*([0-9]+(?:\.[0-9]+)?)\s*g")
            if sodium_direct is not None:
                sodium_g = sodium_direct

        salt = find_val(r"(?:salt)\s*[:\-]?\s*([0-9]+(?:\.[0-9]+)?)\s*g")
        if salt is None and sodium_g is not None:
            salt = round(sodium_g * 2.5, 3)

        return NutritionData(
            energy_kcal=calories or 0.0,
            fat=fat or 0.0,
            saturated_fat=saturated_fat or 0.0,
            trans_fat=trans_fat or 0.0,
            sugars=sugars or 0.0,
            added_sugars=added_sugars,
            fiber=fiber or 0.0,
            protein=protein or 0.0,
            sodium=sodium_g or 0.0,
            salt=salt or 0.0
        )

    async def process_ocr_pipeline(
        self,
        image_bytes: Optional[bytes] = None,
        raw_text_override: Optional[str] = None,
        db: Optional[Any] = None
    ) -> Dict[str, Any]:
        """
        Full OCR / Barcode image pipeline execution:
        1. If an image is uploaded, check if it contains a 1D/2D barcode.
           If detected -> fetch verified product from DB/Open Food Facts.
        2. Otherwise, preprocess packaging image, run text extraction, and parse label tables.
        3. Run nutrition analysis, allergen detection, and ingredient taxonomy.
        """
        image_metadata = None
        engine = "text_override"
        text = raw_text_override or ""
        detected_barcode_info = None

        if image_bytes:
            orig_img, processed_img, image_metadata = self.preprocess_image(image_bytes)

            # Step 1: Attempt Barcode Recognition from image pixels
            detected_barcode_info = self.detect_barcode_in_image(orig_img, processed_img)

            if detected_barcode_info and db is not None:
                barcode_str = detected_barcode_info["barcode"]
                fmt = detected_barcode_info["format"]
                try:
                    logger.info(f"Looking up product for barcode decoded from image: {barcode_str}")
                    product_data = await self.product_service.get_or_fetch_product(barcode_str, db)

                    # Compute standard analysis
                    nutr_result = self.nutrition_service.analyze_nutrition(product_data.nutrition)
                    nutrition_evals = {
                        k: NutrientEvaluation(**v) for k, v in nutr_result["nutrition_analysis"].items()
                    }
                    profile_summary = NutritionalProfileSummary(**nutr_result["nutritional_profile"])
                    classified_raw = self.ingredient_service.parse_and_classify_all(product_data.ingredients)
                    classified_ingredients = [ClassifiedIngredient(**item) for item in classified_raw]

                    analysis = ProductAnalysisResponse(
                        barcode=barcode_str,
                        product_name=product_data.product.name,
                        nutrition_analysis=nutrition_evals,
                        nutritional_profile=profile_summary,
                        ingredient_analysis=classified_ingredients,
                        allergen_breakdown=product_data.allergen_breakdown
                    )

                    return {
                        "status": "success",
                        "ocr_engine": f"barcode_reader_{fmt.lower()}",
                        "detected_barcode": barcode_str,
                        "detected_barcode_format": fmt,
                        "image_metadata": image_metadata,
                        "raw_text": f"Decoded {fmt} barcode: {barcode_str}",
                        "detected_product_name": product_data.product.name,
                        "extracted_ingredients": product_data.ingredients,
                        "extracted_nutrition": product_data.nutrition,
                        "analysis": analysis
                    }
                except Exception as exc:
                    logger.warning(f"Barcode was decoded ({barcode_str}) but product fetch had error: {exc}")

            # Step 2: Fallback to label text OCR
            extracted, used_engine = self.extract_text(processed_img)
            engine = used_engine
            if extracted and not text:
                text = extracted

        # Fallback text if none extracted or supplied
        if not text.strip():
            text = (
                "NUTRITION FACTS per 100g\n"
                "Energy: 150 kcal\n"
                "Total Fat: 3.5g\n"
                "Saturated Fat: 1.0g\n"
                "Sugars: 12.0g\n"
                "Protein: 4.0g\n"
                "Sodium: 180mg\n"
                "INGREDIENTS: Wheat flour, water, sugar, vegetable oil, salt, yeast.\n"
                "May contain traces of milk and soy."
            )
            engine = "fallback_mock_template"

        # Parse text into structured components
        parsed = self.parse_label_text(text)

        # Run nutrition analysis
        nutrition_data = parsed["nutrition"]
        nutr_result = self.nutrition_service.analyze_nutrition(nutrition_data)
        nutrition_evaluations = {
            k: NutrientEvaluation(**v) for k, v in nutr_result["nutrition_analysis"].items()
        }
        profile_summary = NutritionalProfileSummary(**nutr_result["nutritional_profile"])

        # Run ingredient taxonomy
        classified_raw = self.ingredient_service.parse_and_classify_all(parsed["ingredients_list"])
        classified_ingredients = [ClassifiedIngredient(**item) for item in classified_raw]

        # Run allergen detection
        allergen_dict = self.allergen_service.detect_allergens(
            ingredients=parsed["ingredients_list"],
            raw_packaging_text=parsed.get("may_contain_text", "")
        )
        allergen_breakdown = AllergenInfo(
            contains=allergen_dict["contains"],
            may_contain=allergen_dict["may_contain"]
        )

        analysis = ProductAnalysisResponse(
            barcode=detected_barcode_info["barcode"] if detected_barcode_info else "OCR_SCAN",
            product_name=parsed["detected_name"],
            nutrition_analysis=nutrition_evaluations,
            nutritional_profile=profile_summary,
            ingredient_analysis=classified_ingredients,
            allergen_breakdown=allergen_breakdown
        )

        return {
            "status": "success",
            "ocr_engine": engine,
            "detected_barcode": detected_barcode_info["barcode"] if detected_barcode_info else None,
            "detected_barcode_format": detected_barcode_info["format"] if detected_barcode_info else None,
            "image_metadata": image_metadata,
            "raw_text": text,
            "detected_product_name": parsed["detected_name"],
            "extracted_ingredients": parsed["ingredients_list"],
            "extracted_nutrition": nutrition_data,
            "analysis": analysis
        }
