import pytest
from app.services.ingredients import IngredientParserService


def test_ingredient_parentheses_parsing():
    service = IngredientParserService()
    raw = "Carbonated water, sugar, vegetable oil (palm oil, sunflower oil), citric acid (INS 330), caffeine"
    tokens = service.parse_ingredients_text(raw)

    assert len(tokens) == 5
    assert tokens[0] == "Carbonated water"
    assert tokens[1] == "sugar"
    assert tokens[2] == "vegetable oil (palm oil, sunflower oil)"
    assert tokens[3] == "citric acid (INS 330)"
    assert tokens[4] == "caffeine"


def test_ingredient_classification():
    service = IngredientParserService()

    # Sweetener
    res_sugar = service.classify_ingredient("Cane Sugar")
    assert res_sugar["ingredient_type"] == "Sweetener"

    # Acidity Regulator
    res_acid = service.classify_ingredient("Citric Acid")
    assert res_acid["ingredient_type"] == "Acidity regulator"

    # Caffeine
    res_caf = service.classify_ingredient("Caffeine")
    assert res_caf["ingredient_type"] == "Caffeine"

    # Preservative
    res_pres = service.classify_ingredient("Sodium Benzoate (INS 211)")
    assert res_pres["ingredient_type"] == "Preservative"

    # Colour via INS code
    res_col = service.classify_ingredient("INS 150d")
    assert res_col["ingredient_type"] == "Colour"

    # Emulsifier
    res_emul = service.classify_ingredient("Soy Lecithin")
    assert res_emul["ingredient_type"] == "Emulsifier"

    # Oil
    res_oil = service.classify_ingredient("Refined Palm Oil")
    assert res_oil["ingredient_type"] == "Oil"


def test_neutral_descriptions():
    service = IngredientParserService()
    res = service.classify_ingredient("INS 330")
    # Verify no alarmist or unsupported medical claims
    assert "toxic" not in res["notes"].lower()
    assert "poison" not in res["notes"].lower()
    assert len(res["description"]) > 10
    assert len(res["common_use"]) > 10
