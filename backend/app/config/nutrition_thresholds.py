"""
Nutritional benchmark thresholds configuration.
Derived from internationally recognized, documented public health guidelines:
- WHO (World Health Organization) Technical Report Series on Diet, Nutrition and Prevention of Chronic Diseases
- ICMR - National Institute of Nutrition (NIN) Dietary Guidelines for Indians (2024)
- Public Health / Front-of-Pack Nutrition Labeling (FOPNL) standard criteria (per 100g solids / 100ml liquids)

All threshold cutoffs and descriptions are isolated here so they can be easily reviewed,
calibrated, or customized for different regulatory jurisdictions without altering core logic.
"""

NUTRITION_THRESHOLDS = {
    "sugar": {
        "unit": "g",
        "reference_basis": "per 100g / 100ml",
        "thresholds": {
            "low": 5.0,        # <= 5.0g is low sugar
            "high": 12.5       # > 12.5g is high sugar (WHO guidance advises limiting free sugars)
        },
        "messages": {
            "low": "Low sugar content (<= 5g per 100g/ml).",
            "moderate": "Moderate sugar content (5g - 12.5g per 100g/ml).",
            "high": "High sugar content (> 12.5g per 100g/ml). Frequent high intake contributes to elevated energy density."
        }
    },
    "added_sugar": {
        "unit": "g",
        "reference_basis": "per 100g / 100ml",
        "thresholds": {
            "low": 2.5,
            "high": 10.0
        },
        "messages": {
            "low": "Low added sugar content (<= 2.5g per 100g/ml).",
            "moderate": "Contains moderate added sugars (2.5g - 10g per 100g/ml).",
            "high": "High in added sugars (> 10g per 100g/ml). WHO guidelines recommend limiting added sugars to < 10% of total daily energy."
        }
    },
    "sodium": {
        "unit": "mg",
        "reference_basis": "per 100g / 100ml",
        "thresholds": {
            "low": 120.0,      # <= 120mg (0.12g) is low sodium
            "high": 600.0      # > 600mg (0.6g) is high sodium
        },
        "messages": {
            "low": "Low sodium content (<= 120mg per 100g/ml).",
            "moderate": "Moderate sodium content (120mg - 600mg per 100g/ml).",
            "high": "High sodium content (> 600mg per 100g/ml). High sodium consumption is associated with increased blood pressure."
        }
    },
    "salt": {
        "unit": "g",
        "reference_basis": "per 100g / 100ml",
        "thresholds": {
            "low": 0.3,
            "high": 1.5
        },
        "messages": {
            "low": "Low salt content (<= 0.3g per 100g/ml).",
            "moderate": "Moderate salt content (0.3g - 1.5g per 100g/ml).",
            "high": "High salt content (> 1.5g per 100g/ml). ICMR-NIN recommends limiting total salt intake to under 5g daily."
        }
    },
    "fat": {
        "unit": "g",
        "reference_basis": "per 100g / 100ml",
        "thresholds": {
            "low": 3.0,
            "high": 17.5
        },
        "messages": {
            "low": "Low total fat content (<= 3g per 100g/ml).",
            "moderate": "Moderate total fat content (3g - 17.5g per 100g/ml).",
            "high": "High total fat content (> 17.5g per 100g/ml). Frequent high intake contributes to elevated energy intake."
        }
    },
    "saturated_fat": {
        "unit": "g",
        "reference_basis": "per 100g / 100ml",
        "thresholds": {
            "low": 1.5,
            "high": 5.0
        },
        "messages": {
            "low": "Low saturated fat content (<= 1.5g per 100g/ml).",
            "moderate": "Moderate saturated fat content (1.5g - 5g per 100g/ml).",
            "high": "High saturated fat content (> 5g per 100g/ml). Guidelines recommend replacing saturated fats with unsaturated plant fats."
        }
    },
    "trans_fat": {
        "unit": "g",
        "reference_basis": "per 100g / 100ml",
        "thresholds": {
            "low": 0.1,        # Practically zero / negligible
            "high": 0.2        # FSSAI / WHO eliminate industrially produced trans fats ceiling
        },
        "messages": {
            "low": "Negligible or zero trans fat (<= 0.1g per 100g/ml).",
            "moderate": "Trace trans fat detected (0.1g - 0.2g per 100g/ml).",
            "high": "Contains measurable trans fat (> 0.2g per 100g/ml). WHO recommends limiting trans fat to less than 1% of total energy."
        }
    },
    "calories": {
        "unit": "kcal",
        "reference_basis": "per 100g / 100ml",
        "thresholds": {
            "low": 40.0,
            "high": 250.0
        },
        "messages": {
            "low": "Low energy density (<= 40 kcal per 100g/ml).",
            "moderate": "Moderate energy density (40 kcal - 250 kcal per 100g/ml).",
            "high": "High energy density (> 250 kcal per 100g/ml). Energy-dense food; consider portion size."
        }
    },
    "protein": {
        "unit": "g",
        "reference_basis": "per 100g / 100ml",
        "thresholds": {
            "source": 5.0,     # >= 5g qualifies as a protein source
            "high": 10.0       # >= 10g is high in protein
        },
        "messages": {
            "low": "Low protein content (< 5g per 100g/ml).",
            "source": "Source of dietary protein (5g - 10g per 100g/ml).",
            "high": "High in protein (>= 10g per 100g/ml). Supports muscle maintenance and satiety."
        }
    },
    "fiber": {
        "unit": "g",
        "reference_basis": "per 100g / 100ml",
        "thresholds": {
            "source": 3.0,     # >= 3g is a source of fiber
            "high": 6.0        # >= 6g is high in fiber
        },
        "messages": {
            "low": "Low dietary fiber (< 3g per 100g/ml).",
            "source": "Source of dietary fiber (3g - 6g per 100g/ml).",
            "high": "High in dietary fiber (>= 6g per 100g/ml). Contributes to healthy digestive function."
        }
    }
}
