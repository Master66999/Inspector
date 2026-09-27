import re
import logging
from typing import List, Dict, Any, Optional

from ..config.ingredient_knowledge_base import INGREDIENT_KNOWLEDGE_BASE
from ..utils.helpers import clean_text

logger = logging.getLogger("packcheck.services.ingredients")

# INS / E-number pattern mappings
INS_CODE_MAP = {
    "102": "tartrazine",
    "110": "sunset yellow",
    "150": "caramel",
    "150d": "caramel",
    "160a": "beta carotene",
    "202": "potassium sorbate",
    "211": "sodium benzoate",
    "296": "malic acid",
    "322": "soy lecithin",
    "330": "citric acid",
    "331": "sodium citrate",
    "338": "phosphoric acid",
    "412": "guar gum",
    "415": "xanthan gum",
    "471": "mono and diglycerides",
    "950": "acesulfame potassium",
    "951": "aspartame",
    "955": "sucralose",
    "960": "stevia",
}


class IngredientParserService:
    """
    Parses complex ingredient lists from food labels and classifies them
    neutrally against an evidence-based knowledge base.
    """

    def __init__(self, knowledge_base: Dict[str, Any] = INGREDIENT_KNOWLEDGE_BASE):
        self.kb = knowledge_base

    def parse_ingredients_text(self, text: str) -> List[str]:
        """
        Splits a raw ingredient declaration string into distinct ingredient tokens,
        properly preserving parenthetical details.
        Example: 'Water, Sugar, Vegetable Oil (Palm, Sunflower), Citric Acid'
        -> ['Water', 'Sugar', 'Vegetable Oil (Palm, Sunflower)', 'Citric Acid']
        """
        if not text:
            return []

        tokens: List[str] = []
        current: List[str] = []
        paren_depth = 0

        for char in text:
            if char in "([{":
                paren_depth += 1
                current.append(char)
            elif char in ")]}":
                if paren_depth > 0:
                    paren_depth -= 1
                current.append(char)
            elif (char == "," or char == ";") and paren_depth == 0:
                token = "".join(current).strip()
                if token:
                    tokens.append(clean_text(token))
                current = []
            else:
                current.append(char)

        if current:
            token = "".join(current).strip()
            if token:
                tokens.append(clean_text(token))

        return [t for t in tokens if t]

    def classify_ingredient(self, raw_name: str) -> Dict[str, Any]:
        """
        Matches an individual ingredient against the knowledge base using:
        1. Exact and normalized key matching
        2. INS / E-number recognition (e.g. INS 330, E150d)
        3. Substring matching
        4. Category heuristic detection
        """
        cleaned = clean_text(raw_name).lower()
        if not cleaned:
            return {
                "raw_name": raw_name,
                "ingredient_name": "Unknown",
                "ingredient_type": "Other",
                "description": "Ingredient details not provided.",
                "common_use": "Standard food formulation.",
                "notes": "No specific notes available."
            }

        # 1. Exact match in knowledge base
        if cleaned in self.kb:
            entry = self.kb[cleaned]
            return {
                "raw_name": raw_name,
                "ingredient_name": entry["ingredient_name"],
                "ingredient_type": entry["ingredient_type"],
                "description": entry["description"],
                "common_use": entry["common_use"],
                "notes": entry["notes"]
            }

        # 2. Check for INS or E-numbers (e.g. INS 330, E150d, 330, E-211)
        ins_match = re.search(r"(?:ins|e)[-\s]?([0-9]{3,4}[a-z]?)", cleaned)
        if ins_match:
            code = ins_match.group(1).lower()
            if code in INS_CODE_MAP and INS_CODE_MAP[code] in self.kb:
                entry = self.kb[INS_CODE_MAP[code]]
                return {
                    "raw_name": raw_name,
                    "ingredient_name": f"{entry['ingredient_name']} (matched via INS {code.upper()})",
                    "ingredient_type": entry["ingredient_type"],
                    "description": entry["description"],
                    "common_use": entry["common_use"],
                    "notes": entry["notes"]
                }

        # 3. Substring keyword matching against knowledge base entries
        for key, entry in self.kb.items():
            if key in cleaned:
                return {
                    "raw_name": raw_name,
                    "ingredient_name": entry["ingredient_name"],
                    "ingredient_type": entry["ingredient_type"],
                    "description": entry["description"],
                    "common_use": entry["common_use"],
                    "notes": entry["notes"]
                }

        # 4. Functional heuristic category detection if not explicitly in KB
        inferred_type = self._infer_ingredient_type(cleaned)
        return {
            "raw_name": raw_name,
            "ingredient_name": raw_name.strip().title(),
            "ingredient_type": inferred_type,
            "description": f"Classified under {inferred_type} based on formulation characteristics.",
            "common_use": f"Standard functional role as a {inferred_type.lower()}.",
            "notes": "Recognized under standard food manufacturing practices."
        }

    def _infer_ingredient_type(self, text: str) -> str:
        """Determines category for unrecognized ingredients based on food chemical suffixes/keywords."""
        if any(w in text for w in ("sugar", "syrup", "dextrose", "fructose", "maltitol", "sucralose", "aspartame", "sweetener")):
            return "Sweetener"
        if any(w in text for w in ("benzoate", "sorbate", "propionate", "sulphite", "sulfite", "preservative")):
            return "Preservative"
        if any(w in text for w in ("colour", "color", "caramel", "dye", "pigment")):
            return "Colour"
        if any(w in text for w in ("acid", "citrate", "acetate", "tartrate", "lactate", "regulator")):
            return "Acidity regulator"
        if any(w in text for w in ("lecithin", "polysorbate", "emulsifier", "glyceride")):
            return "Emulsifier"
        if any(w in text for w in ("gum", "pectin", "carrageenan", "stabilizer", "thickener", "starch")):
            return "Stabilizer"
        if any(w in text for w in ("flavor", "flavour", "vanilla", "extract", "aroma")):
            return "Flavoring"
        if "caffeine" in text:
            return "Caffeine"
        if any(w in text for w in ("salt", "sodium chloride")):
            return "Salt"
        if any(w in text for w in ("oil", "fat", "tallow", "shortening", "butter", "ghee")):
            return "Oil"
        return "Other"

    def parse_and_classify_all(self, ingredients_input: Any) -> List[Dict[str, Any]]:
        """
        Accepts either a comma-separated string or a list of ingredient strings,
        and returns a fully parsed, classified list.
        """
        if isinstance(ingredients_input, str):
            tokens = self.parse_ingredients_text(ingredients_input)
        elif isinstance(ingredients_input, (list, tuple)):
            tokens = [str(t) for t in ingredients_input if str(t).strip()]
        else:
            tokens = []

        return [self.classify_ingredient(token) for token in tokens]
