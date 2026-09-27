import logging
from typing import Dict, Any, Optional

from ..config.nutrition_thresholds import NUTRITION_THRESHOLDS
from ..schemas.nutrition import NutritionData

logger = logging.getLogger("packcheck.services.nutrition")


class NutritionAnalysisService:
    """
    Transparent rule-based nutrition analysis engine.
    Evaluates individual macro- and micronutrients against public health guidelines
    and generates an explainable, multi-factor nutritional profile without making
    arbitrary medical claims or binary 'healthy/unhealthy' judgments.
    """

    def __init__(self, thresholds: Dict[str, Any] = NUTRITION_THRESHOLDS):
        self.thresholds = thresholds

    def analyze_nutrition(self, nutrition: NutritionData) -> Dict[str, Any]:
        """
        Processes normalized nutrition values (per 100g/ml) and produces
        structured, transparent evaluations for each nutrient component.
        """
        analysis: Dict[str, Dict[str, Any]] = {}

        # 1. Sugar evaluation
        sugar_cfg = self.thresholds.get("sugar", {})
        s_val = nutrition.sugars
        if s_val <= sugar_cfg["thresholds"]["low"]:
            s_level = "low"
        elif s_val <= sugar_cfg["thresholds"]["high"]:
            s_level = "moderate"
        else:
            s_level = "high"
        analysis["sugar"] = {
            "value": s_val,
            "unit": "g",
            "level": s_level,
            "message": sugar_cfg["messages"][s_level]
        }

        # 2. Added Sugar evaluation (if reported)
        if nutrition.added_sugars is not None:
            as_cfg = self.thresholds.get("added_sugar", {})
            as_val = nutrition.added_sugars
            if as_val <= as_cfg["thresholds"]["low"]:
                as_level = "low"
            elif as_val <= as_cfg["thresholds"]["high"]:
                as_level = "moderate"
            else:
                as_level = "high"
            analysis["added_sugar"] = {
                "value": as_val,
                "unit": "g",
                "level": as_level,
                "message": as_cfg["messages"][as_level]
            }

        # 3. Sodium evaluation (convert g to mg if needed; standard is mg)
        sod_cfg = self.thresholds.get("sodium", {})
        # Note: if sodium was stored as grams (e.g. 0.12), convert to mg if <= 10.0
        raw_sodium = nutrition.sodium
        sodium_mg = raw_sodium * 1000.0 if raw_sodium < 10.0 else raw_sodium
        if sodium_mg <= sod_cfg["thresholds"]["low"]:
            sod_level = "low"
        elif sodium_mg <= sod_cfg["thresholds"]["high"]:
            sod_level = "moderate"
        else:
            sod_level = "high"
        analysis["sodium"] = {
            "value": round(sodium_mg, 1),
            "unit": "mg",
            "level": sod_level,
            "message": sod_cfg["messages"][sod_level]
        }

        # 4. Salt evaluation
        salt_cfg = self.thresholds.get("salt", {})
        salt_val = nutrition.salt
        if salt_val <= salt_cfg["thresholds"]["low"]:
            salt_level = "low"
        elif salt_val <= salt_cfg["thresholds"]["high"]:
            salt_level = "moderate"
        else:
            salt_level = "high"
        analysis["salt"] = {
            "value": salt_val,
            "unit": "g",
            "level": salt_level,
            "message": salt_cfg["messages"][salt_level]
        }

        # 5. Saturated Fat evaluation
        sf_cfg = self.thresholds.get("saturated_fat", {})
        sf_val = nutrition.saturated_fat
        if sf_val <= sf_cfg["thresholds"]["low"]:
            sf_level = "low"
        elif sf_val <= sf_cfg["thresholds"]["high"]:
            sf_level = "moderate"
        else:
            sf_level = "high"
        analysis["saturated_fat"] = {
            "value": sf_val,
            "unit": "g",
            "level": sf_level,
            "message": sf_cfg["messages"][sf_level]
        }

        # 6. Trans Fat evaluation
        tf_cfg = self.thresholds.get("trans_fat", {})
        tf_val = nutrition.trans_fat
        if tf_val <= tf_cfg["thresholds"]["low"]:
            tf_level = "low"
        elif tf_val <= tf_cfg["thresholds"]["high"]:
            tf_level = "moderate"
        else:
            tf_level = "high"
        analysis["trans_fat"] = {
            "value": tf_val,
            "unit": "g",
            "level": tf_level,
            "message": tf_cfg["messages"][tf_level]
        }

        # 7. Energy / Calories evaluation
        cal_cfg = self.thresholds.get("calories", {})
        cal_val = nutrition.energy_kcal
        if cal_val <= cal_cfg["thresholds"]["low"]:
            cal_level = "low"
        elif cal_val <= cal_cfg["thresholds"]["high"]:
            cal_level = "moderate"
        else:
            cal_level = "high"
        analysis["calories"] = {
            "value": cal_val,
            "unit": "kcal",
            "level": cal_level,
            "message": cal_cfg["messages"][cal_level]
        }

        # 8. Protein evaluation (source vs low)
        prot_cfg = self.thresholds.get("protein", {})
        prot_val = nutrition.protein
        if prot_val >= prot_cfg["thresholds"]["high"]:
            prot_level = "high"
        elif prot_val >= prot_cfg["thresholds"]["source"]:
            prot_level = "source"
        else:
            prot_level = "low"
        analysis["protein"] = {
            "value": prot_val,
            "unit": "g",
            "level": prot_level,
            "message": prot_cfg["messages"][prot_level]
        }

        # 9. Fiber evaluation (source vs low)
        fib_cfg = self.thresholds.get("fiber", {})
        fib_val = nutrition.fiber
        if fib_val >= fib_cfg["thresholds"]["high"]:
            fib_level = "high"
        elif fib_val >= fib_cfg["thresholds"]["source"]:
            fib_level = "source"
        else:
            fib_level = "low"
        analysis["fiber"] = {
            "value": fib_val,
            "unit": "g",
            "level": fib_level,
            "message": fib_cfg["messages"][fib_level]
        }

        profile_summary = self._generate_profile_summary(analysis)

        return {
            "nutrition_analysis": analysis,
            "nutritional_profile": profile_summary
        }

    def _generate_profile_summary(self, analysis: Dict[str, Dict[str, Any]]) -> Dict[str, Any]:
        """
        Synthesizes evaluated nutrient levels into a transparent multidimensional profile
        highlighting positive aspects and areas to monitor.
        """
        highlights = []
        cautions = []

        # Positive attributes
        if analysis.get("protein", {}).get("level") in ("source", "high"):
            highlights.append("Notable source of dietary protein")
        if analysis.get("fiber", {}).get("level") in ("source", "high"):
            highlights.append("Contributes dietary fiber")
        if analysis.get("sugar", {}).get("level") == "low":
            highlights.append("Low sugar formulation")
        if analysis.get("sodium", {}).get("level") == "low":
            highlights.append("Low in sodium")

        # Cautions / limit indicators
        if analysis.get("sugar", {}).get("level") == "high":
            cautions.append("High sugar content")
        if analysis.get("added_sugar", {}).get("level") == "high":
            cautions.append("High added sugars")
        if analysis.get("sodium", {}).get("level") == "high":
            cautions.append("High sodium content")
        if analysis.get("saturated_fat", {}).get("level") == "high":
            cautions.append("High saturated fat")
        if analysis.get("trans_fat", {}).get("level") == "high":
            cautions.append("Contains measurable trans fats")

        density = analysis.get("calories", {}).get("level", "moderate")

        return {
            "energy_density": density,
            "positive_factors": highlights,
            "factors_to_monitor": cautions,
            "transparency_note": "Evaluations are based on 100g/ml reference standards (WHO / ICMR-NIN). Individual dietary needs vary."
        }
