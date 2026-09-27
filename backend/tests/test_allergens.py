import pytest
from app.services.allergens import AllergenDetectionService


def test_contains_detection_from_ingredients():
    service = AllergenDetectionService()
    ingredients = [
        "Wheat flour",
        "Milk solids",
        "Sugar",
        "Soy lecithin",
        "Butter"
    ]
    res = service.detect_allergens(ingredients=ingredients)

    assert "Wheat" in res["contains"]
    assert "Gluten" in res["contains"]
    assert "Milk / Dairy" in res["contains"]
    assert "Soy / Soybeans" in res["contains"]
    assert len(res["may_contain"]) == 0


def test_may_contain_detection():
    service = AllergenDetectionService()
    ingredients = ["Carbonated water", "Sugar", "Citric acid"]
    packaging_text = "Manufactured in a facility that also processes peanuts and tree nuts."

    res = service.detect_allergens(
        ingredients=ingredients,
        raw_packaging_text=packaging_text
    )

    assert len(res["contains"]) == 0
    assert "Peanuts" in res["may_contain"]
    assert "Tree Nuts" in res["may_contain"]


def test_contains_overrules_may_contain_deduplication():
    service = AllergenDetectionService()
    # Recipe has milk, and disclaimer also mentions milk and peanuts
    ingredients = ["Whole milk powder", "Sugar"]
    traces = ["en:milk", "en:peanuts"]

    res = service.detect_allergens(
        ingredients=ingredients,
        traces=traces
    )

    # Milk should be strictly in 'contains', and NOT duplicated in 'may_contain'
    assert "Milk / Dairy" in res["contains"]
    assert "Milk / Dairy" not in res["may_contain"]
    assert "Peanuts" in res["may_contain"]


def test_crustaceans_and_fish_and_sesame():
    service = AllergenDetectionService()
    ingredients = ["Prawn extract", "Anchovy paste", "Toasted sesame oil"]

    res = service.detect_allergens(ingredients=ingredients)
    assert "Crustaceans / Shellfish" in res["contains"]
    assert "Fish" in res["contains"]
    assert "Sesame" in res["contains"]
