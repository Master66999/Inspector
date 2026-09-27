import re
import logging
from typing import Dict, List, Set, Any, Optional

logger = logging.getLogger("packcheck.services.allergens")

# Core allergen taxonomy mapping keywords and regex patterns
ALLERGEN_TAXONOMY = {
    "milk": {
        "canonical": "Milk / Dairy",
        "keywords": [
            "milk", "dairy", "lactose", "casein", "caseinate", "whey",
            "butter", "cheese", "cream", "ghee", "yogurt", "curd",
            "milk solids", "skimmed milk", "whole milk", "condensed milk"
        ]
    },
    "peanuts": {
        "canonical": "Peanuts",
        "keywords": [
            "peanut", "peanuts", "arachis", "groundnut", "groundnuts", "monkey nut"
        ]
    },
    "tree nuts": {
        "canonical": "Tree Nuts",
        "keywords": [
            "tree nut", "tree nuts", "nuts", "nut", "almond", "walnut", "cashew", "hazelnut", "pecan",
            "pistachio", "macadamia", "brazil nut", "chestnut", "pine nut"
        ]
    },
    "soy": {
        "canonical": "Soy / Soybeans",
        "keywords": [
            "soy", "soya", "soybean", "soybeans", "soy lecithin", "edamame",
            "tofu", "tempeh", "miso", "textured vegetable protein", "tvp"
        ]
    },
    "wheat": {
        "canonical": "Wheat",
        "keywords": [
            "wheat", "maida", "atta", "semolina", "durum", "spelt", "farina",
            "wheat flour", "wheat gluten", "wheat starch"
        ]
    },
    "gluten": {
        "canonical": "Gluten",
        "keywords": [
            "gluten", "wheat", "barley", "rye", "malt", "malt extract",
            "spelt", "triticale", "brewer's yeast"
        ]
    },
    "egg": {
        "canonical": "Egg",
        "keywords": [
            "egg", "eggs", "egg white", "egg yolk", "albumen", "ovalbumin",
            "mayonnaise", "lysozyme"
        ]
    },
    "fish": {
        "canonical": "Fish",
        "keywords": [
            "fish", "cod", "salmon", "tuna", "anchovy", "mackerel", "tilapia",
            "sardine", "halibut", "isinglass"
        ]
    },
    "crustaceans": {
        "canonical": "Crustaceans / Shellfish",
        "keywords": [
            "crustacean", "crustaceans", "shellfish", "shrimp", "prawn", "crab",
            "lobster", "crawfish", "crayfish", "krill"
        ]
    },
    "sesame": {
        "canonical": "Sesame",
        "keywords": [
            "sesame", "sesame seed", "sesame seeds", "sesame oil", "tahini", "til"
        ]
    }
}


class AllergenDetectionService:
    """
    Allergen identification service.
    Detects declared and derived food allergens from:
    1. Direct product allergen tags
    2. Ingredient composition analysis ('Contains')
    3. Precautionary facility declarations and traces ('May Contain')
    """

    def __init__(self, taxonomy: Dict[str, Any] = ALLERGEN_TAXONOMY):
        self.taxonomy = taxonomy

    def detect_allergens(
        self,
        ingredients: List[str],
        declared_allergens: Optional[List[str]] = None,
        traces: Optional[List[str]] = None,
        raw_packaging_text: Optional[str] = None
    ) -> Dict[str, List[str]]:
        """
        Analyzes ingredient list and packaging metadata.
        Returns a dictionary clearly separating 'contains' from 'may_contain'.
        """
        contains_set: Set[str] = set()
        may_contain_set: Set[str] = set()

        # 1. Process explicit declared allergens from database/API tags
        if declared_allergens:
            for item in declared_allergens:
                matched = self._match_allergen_key(item)
                if matched:
                    contains_set.add(self.taxonomy[matched]["canonical"])
                elif item.strip():
                    contains_set.add(item.strip().title())

        # 2. Inspect individual ingredients for confirmed allergen presence
        for ing in ingredients:
            ing_lower = ing.lower()
            for key, data in self.taxonomy.items():
                for kw in data["keywords"]:
                    # Match whole words or clean boundaries
                    pattern = r"\b" + re.escape(kw) + r"\b"
                    if re.search(pattern, ing_lower):
                        contains_set.add(data["canonical"])
                        break

        # 3. Process explicit precautionary trace tags (May Contain)
        if traces:
            for item in traces:
                matched = self._match_allergen_key(item)
                if matched:
                    may_contain_set.add(self.taxonomy[matched]["canonical"])
                elif item.strip():
                    may_contain_set.add(item.strip().title())

        # 4. Search raw ingredient text for cross-contact warning phrases
        if raw_packaging_text:
            text_lower = raw_packaging_text.lower()
            trace_phrases = [
                r"may\s+contain(?:\s+traces\s+of)?[:\s]+([^.]+)",
                r"(?:processed\s+on\s+equipment|made|manufactured)(?:\s+in\s+a\s+facility)?\s+that\s+(?:also\s+)?(?:processes|handles)[:\s]+([^.]+)",
                r"traces(?:\s+of)?[:\s]+([^.]+)"
            ]
            for pattern in trace_phrases:
                matches = re.findall(pattern, text_lower)
                for match in matches:
                    for key, data in self.taxonomy.items():
                        for kw in data["keywords"]:
                            if re.search(r"\b" + re.escape(kw) + r"\b", match):
                                may_contain_set.add(data["canonical"])

        # Any allergen confirmed in 'contains' should not duplicate in 'may_contain'
        may_contain_set = may_contain_set - contains_set

        return {
            "contains": sorted(list(contains_set)),
            "may_contain": sorted(list(may_contain_set))
        }

    def _match_allergen_key(self, text: str) -> Optional[str]:
        """Matches raw tag string (e.g., 'en:soybeans', 'peanuts') to taxonomy key."""
        clean = text.lower().replace("en:", "").replace("-", " ").strip()
        for key, data in self.taxonomy.items():
            if key in clean or any(kw in clean for kw in data["keywords"]):
                return key
        return None
