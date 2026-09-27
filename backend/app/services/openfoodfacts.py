import os
import re
import logging
from typing import Dict, Any, List, Optional
import httpx
from dotenv import load_dotenv

from ..schemas.product import ProductResponse, ProductInfo, AllergenInfo
from ..schemas.nutrition import NutritionData
from ..utils.helpers import validate_barcode, safe_float, clean_text
from .allergens import AllergenDetectionService

load_dotenv()

logger = logging.getLogger("packcheck.openfoodfacts")

OPENFOODFACTS_BASE_URL = os.getenv(
    "OPENFOODFACTS_BASE_URL",
    "https://world.openfoodfacts.org/api/v2"
)
OPENFOODFACTS_USER_AGENT = os.getenv(
    "OPENFOODFACTS_USER_AGENT",
    "PackCheck - Food and Beverage Scanner - Version 1.0 - https://github.com/PackCheck/PackCheck"
)
TIMEOUT_SECONDS = float(os.getenv("OPENFOODFACTS_TIMEOUT_SECONDS", "10.0"))


class ProductNotFoundError(Exception):
    """Raised when a product with given barcode is not found in Open Food Facts."""
    pass


class OpenFoodFactsAPIError(Exception):
    """Raised when the Open Food Facts API is unavailable, times out, or returns a server error."""
    pass


class OpenFoodFactsService:
    """Service to interact with the Open Food Facts API and normalize product datasets."""

    def __init__(
        self,
        base_url: str = OPENFOODFACTS_BASE_URL,
        user_agent: str = OPENFOODFACTS_USER_AGENT,
        timeout: float = TIMEOUT_SECONDS
    ):
        self.base_url = base_url.rstrip("/")
        self.headers = {
            "User-Agent": user_agent,
            "Accept": "application/json"
        }
        self.timeout = timeout
        self.allergen_service = AllergenDetectionService()

    async def fetch_product_by_barcode(self, barcode: str) -> ProductResponse:
        """
        Fetches and normalizes a food or beverage product by its barcode.
        
        1. Validates barcode format
        2. Queries Open Food Facts v2 API
        3. Handles missing products and network/API failures
        4. Normalizes output to clean PackCheck structure
        """
        valid_barcode = validate_barcode(barcode)
        endpoint = f"{self.base_url}/product/{valid_barcode}.json"

        # Explicit fields request to optimize network payload and latency
        params = {
            "fields": (
                "code,product_name,product_name_en,generic_name,brands,brand_owner,"
                "categories,categories_tags,image_front_url,image_url,"
                "nutriments,ingredients,ingredients_text,ingredients_text_en,"
                "allergens_tags,allergens_hierarchy,allergens,"
                "traces_tags,traces_hierarchy,traces"
            )
        }

        try:
            async with httpx.AsyncClient(timeout=self.timeout, follow_redirects=True) as client:
                response = await client.get(endpoint, headers=self.headers, params=params)
                
                if response.status_code == 404:
                    raise ProductNotFoundError(f"Product with barcode '{valid_barcode}' not found.")
                
                response.raise_for_status()
                data = response.json()

        except httpx.TimeoutException as exc:
            logger.error(f"Timeout querying Open Food Facts for barcode {valid_barcode}: {exc}")
            raise OpenFoodFactsAPIError("External Open Food Facts API request timed out. Please try again.") from exc
        except httpx.HTTPStatusError as exc:
            logger.error(f"HTTP error {exc.response.status_code} from Open Food Facts: {exc}")
            if exc.response.status_code == 404:
                raise ProductNotFoundError(f"Product with barcode '{valid_barcode}' not found.")
            raise OpenFoodFactsAPIError(f"Open Food Facts returned status code {exc.response.status_code}.") from exc
        except httpx.RequestError as exc:
            logger.error(f"Connection error to Open Food Facts: {exc}")
            raise OpenFoodFactsAPIError("Could not connect to Open Food Facts service.") from exc

        # Check Open Food Facts status indicators
        status = data.get("status")
        if status == 0 or not data.get("product"):
            raise ProductNotFoundError(f"Product with barcode '{valid_barcode}' not found in Open Food Facts.")

        product_raw = data.get("product", {})
        return self._normalize_product_data(valid_barcode, product_raw)

    def _normalize_product_data(self, barcode: str, raw: Dict[str, Any]) -> ProductResponse:
        """Transforms raw Open Food Facts payload into PackCheck normalized schema."""
        # 1. Product descriptive info
        name = (
            raw.get("product_name")
            or raw.get("product_name_en")
            or raw.get("generic_name")
            or "Unknown Product"
        )
        brand = (
            raw.get("brands")
            or raw.get("brand_owner")
            or "Unknown Brand"
        )
        
        # Primary category extraction
        category = "Uncategorized"
        categories = raw.get("categories")
        categories_tags = raw.get("categories_tags", [])
        if categories_tags and isinstance(categories_tags, list) and len(categories_tags) > 0:
            last_tag = categories_tags[-1]
            category = last_tag.replace("en:", "").replace("-", " ").title()
        elif categories and isinstance(categories, str):
            parts = [c.strip() for c in categories.split(",") if c.strip()]
            if parts:
                category = parts[-1].title()

        image = raw.get("image_front_url") or raw.get("image_url") or None

        product_info = ProductInfo(
            name=clean_text(name),
            brand=clean_text(brand),
            category=clean_text(category),
            image=image
        )

        # 2. Nutrition normalization
        nutriments = raw.get("nutriments", {}) or {}
        
        energy_kcal = safe_float(
            nutriments.get("energy-kcal_100g")
            or nutriments.get("energy-kcal")
        )
        if energy_kcal == 0.0 and "energy_100g" in nutriments:
            # If in kJ, convert to kcal (1 kcal ≈ 4.184 kJ)
            energy_kj = safe_float(nutriments.get("energy_100g"))
            if energy_kj > 0:
                energy_kcal = round(energy_kj / 4.184, 1)

        sugars = safe_float(nutriments.get("sugars_100g") or nutriments.get("sugars"))
        added_sugars_val = nutriments.get("sugars_added_100g") or nutriments.get("added-sugars_100g")
        added_sugars = safe_float(added_sugars_val) if added_sugars_val is not None else None

        fat = safe_float(nutriments.get("fat_100g") or nutriments.get("fat"))
        saturated_fat = safe_float(nutriments.get("saturated-fat_100g") or nutriments.get("saturated-fat"))
        trans_fat = safe_float(nutriments.get("trans-fat_100g") or nutriments.get("trans-fat"))
        protein = safe_float(nutriments.get("proteins_100g") or nutriments.get("proteins"))
        fiber = safe_float(nutriments.get("fiber_100g") or nutriments.get("fiber"))
        
        sodium = safe_float(nutriments.get("sodium_100g") or nutriments.get("sodium"))
        salt = safe_float(nutriments.get("salt_100g") or nutriments.get("salt"))
        
        # If salt is given but sodium is 0, sodium ≈ salt / 2.5
        if sodium == 0.0 and salt > 0.0:
            sodium = round(salt / 2.5, 3)
        elif salt == 0.0 and sodium > 0.0:
            salt = round(sodium * 2.5, 3)

        nutrition_data = NutritionData(
            energy_kcal=energy_kcal,
            sugars=sugars,
            added_sugars=added_sugars,
            fat=fat,
            saturated_fat=saturated_fat,
            trans_fat=trans_fat,
            protein=protein,
            fiber=fiber,
            sodium=sodium,
            salt=salt
        )

        # 3. Ingredients extraction
        ingredients_list: List[str] = []
        raw_ingredients = raw.get("ingredients")
        if isinstance(raw_ingredients, list) and len(raw_ingredients) > 0:
            for item in raw_ingredients:
                if isinstance(item, dict):
                    ing_name = item.get("text") or item.get("id") or ""
                    cleaned_ing = self._clean_ingredient_name(ing_name)
                    if cleaned_ing and cleaned_ing not in ingredients_list:
                        ingredients_list.append(cleaned_ing)
        
        if not ingredients_list:
            text_field = raw.get("ingredients_text_en") or raw.get("ingredients_text") or ""
            if text_field:
                # Split on comma, semicolon, or parenthetical groups
                parts = re.split(r"[,;.]", text_field)
                for part in parts:
                    cleaned_ing = self._clean_ingredient_name(part)
                    if cleaned_ing and cleaned_ing not in ingredients_list:
                        ingredients_list.append(cleaned_ing)

        # 4. Allergen detection (distinguishing Contains from May Contain)
        raw_allergens = raw.get("allergens_tags") or raw.get("allergens_hierarchy") or []
        declared_list: List[str] = []
        if isinstance(raw_allergens, list):
            declared_list = [str(a) for a in raw_allergens if a]
        elif isinstance(raw.get("allergens"), str):
            declared_list = [p.strip() for p in raw.get("allergens").split(",") if p.strip()]

        raw_traces = raw.get("traces_tags") or raw.get("traces_hierarchy") or []
        traces_list: List[str] = []
        if isinstance(raw_traces, list):
            traces_list = [str(t) for t in raw_traces if t]
        elif isinstance(raw.get("traces"), str):
            traces_list = [p.strip() for p in raw.get("traces").split(",") if p.strip()]

        raw_ingredients_text = raw.get("ingredients_text_en") or raw.get("ingredients_text") or ""
        allergen_dict = self.allergen_service.detect_allergens(
            ingredients=ingredients_list,
            declared_allergens=declared_list,
            traces=traces_list,
            raw_packaging_text=raw_ingredients_text
        )

        allergen_breakdown = AllergenInfo(
            contains=allergen_dict["contains"],
            may_contain=allergen_dict["may_contain"]
        )
        allergens_flat = allergen_dict["contains"]

        return ProductResponse(
            barcode=barcode,
            product=product_info,
            nutrition=nutrition_data,
            ingredients=ingredients_list,
            allergens=allergens_flat,
            allergen_breakdown=allergen_breakdown
        )

    def _clean_ingredient_name(self, name: str) -> str:
        """Helper to format and sanitize individual ingredient strings."""
        if not name:
            return ""
        # Strip language prefixes like 'en:'
        cleaned = re.sub(r"^[a-z]{2}:", "", name.strip())
        # Remove percentage signs or parenthesis fragments like '(15%)'
        cleaned = re.sub(r"\(\s*\d+(\.\d+)?\s*%\s*\)", "", cleaned)
        # Strip trailing/leading punctuation
        cleaned = cleaned.strip(" ():;,.*-_")
        return clean_text(cleaned)
