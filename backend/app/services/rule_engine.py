import logging
from typing import Dict, Any, List, Optional, Union
from ..config.nutrition_thresholds import NUTRITION_THRESHOLDS
from ..schemas.nutrition import NutritionData

logger = logging.getLogger("packcheck.services.rule_engine")


class PackCheckRuleEngine:
    """
    Deterministic nutrition & ingredient rule-analysis layer.
    Evaluates factual nutritional values and ingredient compositions against public health
    benchmarks (WHO, ICMR-NIN, FSSAI) to produce structured analytical flags without
    making arbitrary medical claims.
    """

    def __init__(self, thresholds: Dict[str, Any] = NUTRITION_THRESHOLDS):
        self.thresholds = thresholds

    def analyze(
        self,
        nutrition: Optional[Union[NutritionData, Dict[str, Any]]] = None,
        ingredients: Optional[List[str]] = None,
        allergens: Optional[List[str]] = None,
        category: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Processes nutrition and product composition data to calculate factual flags,
        a 0-100 health score, and a normalized nutrition summary.
        """
        # Normalize nutrition input
        nutr_dict = self._normalize_nutrition(nutrition)

        flags: List[str] = []
        positive_flags: List[str] = []
        warnings: List[str] = []

        # 1. Sugar evaluation
        sugar_g = nutr_dict.get("sugars") or 0.0
        sugar_cfg = self.thresholds.get("sugar", {}).get("thresholds", {})
        high_sugar_thresh = sugar_cfg.get("high", 12.5)
        low_sugar_thresh = sugar_cfg.get("low", 5.0)

        if sugar_g > high_sugar_thresh:
            flags.append("HIGH_SUGAR")
            warnings.append(f"High sugar content ({sugar_g:.1f}g per 100g/ml; benchmark > {high_sugar_thresh}g)")
        elif sugar_g <= low_sugar_thresh:
            positive_flags.append("LOW_SUGAR")

        # 2. Sodium / Salt evaluation
        raw_sodium = nutr_dict.get("sodium") or 0.0
        # If stored as grams (e.g. 0.12g), convert to mg
        sodium_mg = raw_sodium * 1000.0 if raw_sodium < 10.0 and raw_sodium > 0 else raw_sodium
        salt_g = nutr_dict.get("salt") or 0.0

        sod_cfg = self.thresholds.get("sodium", {}).get("thresholds", {})
        high_sod_thresh = sod_cfg.get("high", 600.0)
        low_sod_thresh = sod_cfg.get("low", 120.0)

        salt_cfg = self.thresholds.get("salt", {}).get("thresholds", {})
        high_salt_thresh = salt_cfg.get("high", 1.5)

        if sodium_mg > high_sod_thresh or salt_g > high_salt_thresh:
            flags.append("HIGH_SODIUM")
            warnings.append(f"High sodium ({sodium_mg:.0f}mg per 100g/ml; benchmark > {high_sod_thresh}mg)")
        elif sodium_mg <= low_sod_thresh and sodium_mg > 0:
            positive_flags.append("LOW_SODIUM")

        # 3. Saturated Fat evaluation
        sat_fat_g = nutr_dict.get("saturated_fat") or 0.0
        sf_cfg = self.thresholds.get("saturated_fat", {}).get("thresholds", {})
        high_sf_thresh = sf_cfg.get("high", 5.0)
        low_sf_thresh = sf_cfg.get("low", 1.5)

        if sat_fat_g > high_sf_thresh:
            flags.append("HIGH_SATURATED_FAT")
            warnings.append(f"High saturated fat ({sat_fat_g:.1f}g per 100g/ml; benchmark > {high_sf_thresh}g)")
        elif sat_fat_g <= low_sf_thresh and sat_fat_g > 0:
            positive_flags.append("LOW_SATURATED_FAT")

        # 4. Total Fat evaluation
        total_fat_g = nutr_dict.get("fat") or 0.0
        fat_cfg = self.thresholds.get("fat", {}).get("thresholds", {})
        high_fat_thresh = fat_cfg.get("high", 17.5)

        if total_fat_g > high_fat_thresh:
            flags.append("HIGH_FAT")
            warnings.append(f"High total fat ({total_fat_g:.1f}g per 100g/ml; benchmark > {high_fat_thresh}g)")

        # 5. Protein evaluation
        protein_g = nutr_dict.get("protein") or 0.0
        prot_cfg = self.thresholds.get("protein", {}).get("thresholds", {})
        source_prot = prot_cfg.get("source", 5.0)

        if protein_g < source_prot:
            flags.append("LOW_PROTEIN")
        else:
            positive_flags.append("CONTAINS_PROTEIN")

        # 6. Calories / Energy density
        cal_val = nutr_dict.get("energy_kcal") or 0.0
        cal_cfg = self.thresholds.get("calories", {}).get("thresholds", {})
        high_cal_thresh = cal_cfg.get("high", 250.0)

        if cal_val > high_cal_thresh:
            flags.append("HIGH_CALORIES")
            warnings.append(f"High energy density ({cal_val:.0f} kcal per 100g/ml; benchmark > {high_cal_thresh} kcal)")

        # 7. Fiber check
        fiber_g = nutr_dict.get("fiber") or 0.0
        if fiber_g >= 3.0:
            positive_flags.append("CONTAINS_FIBER")

        # 8. Allergen check
        if allergens and len(allergens) > 0:
            flags.append("ALLERGEN_PRESENT")
            warnings.append(f"Contains declared allergens: {', '.join(allergens)}")

        # 9. Additives check
        if self._detect_additives(ingredients):
            flags.append("ADDITIVE_PRESENT")
            warnings.append("Contains formulated food additives (preservatives, colors, or artificial sweeteners)")

        # Calculate deterministic health score (0-100)
        score = self._calculate_health_score(nutr_dict, flags, positive_flags)

        nutrition_summary = {
            "sugar": round(sugar_g, 2),
            "fat": round(total_fat_g, 2),
            "saturated_fat": round(sat_fat_g, 2),
            "sodium": round(sodium_mg, 1),
            "protein": round(protein_g, 2),
            "fiber": round(fiber_g, 2),
            "calories": round(cal_val, 1)
        }

        return {
            "score": score,
            "flags": flags,
            "positive_flags": positive_flags,
            "nutrition_summary": nutrition_summary,
            "warnings": warnings
        }

    def _normalize_nutrition(self, nutrition: Optional[Union[NutritionData, Dict[str, Any]]]) -> Dict[str, float]:
        """Ensures all standard nutrition values are available as floats."""
        if nutrition is None:
            return {
                "energy_kcal": 0.0,
                "sugars": 0.0,
                "fat": 0.0,
                "saturated_fat": 0.0,
                "protein": 0.0,
                "fiber": 0.0,
                "sodium": 0.0,
                "salt": 0.0
            }

        if hasattr(nutrition, "model_dump"):
            data = nutrition.model_dump()
        elif isinstance(nutrition, dict):
            data = nutrition
        else:
            data = {}

        return {
            "energy_kcal": float(data.get("energy_kcal") or 0.0),
            "sugars": float(data.get("sugars") or data.get("sugar") or 0.0),
            "fat": float(data.get("fat") or 0.0),
            "saturated_fat": float(data.get("saturated_fat") or 0.0),
            "protein": float(data.get("protein") or 0.0),
            "fiber": float(data.get("fiber") or 0.0),
            "sodium": float(data.get("sodium") or 0.0),
            "salt": float(data.get("salt") or 0.0)
        }

    def _detect_additives(self, ingredients: Optional[List[str]]) -> bool:
        """Determines if any additive, artificial sweetener, preservative or E-number is present."""
        if not ingredients:
            return False

        additive_keywords = {
            "preservative", "emulsifier", "stabilizer", "color", "colour",
            "artificial", "flavoring", "flavouring", "aspartame", "sucralose",
            "acesulfame", "benzoate", "sorbate", "tartrazine", "ins ", "ins", "e1", "e2", "e3", "e4", "e9"
        }

        for item in ingredients:
            lowered = str(item).lower()
            for kw in additive_keywords:
                if kw in lowered:
                    return True

        return False

    def _calculate_health_score(
        self,
        nutr: Dict[str, float],
        flags: List[str],
        positive_flags: List[str]
    ) -> int:
        """
        Deterministic, transparent scoring formula based on WHO/FSSAI nutritional profile guidelines.
        Baseline: 70 points
        Penalties for limit nutrients, bonuses for protective nutrients.
        Strictly bounded between 0 and 100.
        """
        score = 70

        # Sugar penalties
        sugar = nutr.get("sugars", 0.0)
        if sugar > 25.0:
            score -= 28
        elif sugar > 12.5:
            score -= 18
        elif sugar <= 5.0 and sugar > 0:
            score += 6

        # Sodium penalties
        raw_sodium = nutr.get("sodium", 0.0)
        sodium_mg = raw_sodium * 1000.0 if raw_sodium < 10.0 and raw_sodium > 0 else raw_sodium
        if sodium_mg > 900.0:
            score -= 20
        elif sodium_mg > 600.0:
            score -= 14
        elif sodium_mg <= 120.0 and sodium_mg > 0:
            score += 5

        # Saturated fat penalties
        sf = nutr.get("saturated_fat", 0.0)
        if sf > 10.0:
            score -= 18
        elif sf > 5.0:
            score -= 12
        elif sf <= 1.5 and sf > 0:
            score += 4

        # Total fat penalties
        fat = nutr.get("fat", 0.0)
        if fat > 20.0:
            score -= 8

        # Energy density penalties
        kcal = nutr.get("energy_kcal", 0.0)
        if kcal > 400.0:
            score -= 10
        elif kcal > 250.0:
            score -= 5

        # Protein bonuses
        protein = nutr.get("protein", 0.0)
        if protein >= 10.0:
            score += 12
        elif protein >= 5.0:
            score += 6

        # Fiber bonuses
        fiber = nutr.get("fiber", 0.0)
        if fiber >= 6.0:
            score += 10
        elif fiber >= 3.0:
            score += 5

        # Additives penalty
        if "ADDITIVE_PRESENT" in flags:
            score -= 4

        # Clamp between 0 and 100
        return max(5, min(98, round(score)))
