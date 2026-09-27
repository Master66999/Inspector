import pytest
from app.services.nutrition import NutritionAnalysisService
from app.schemas.nutrition import NutritionData


def test_sugar_analysis():
    service = NutritionAnalysisService()

    # Low sugar
    low_sugar = NutritionData(sugars=3.5)
    res_low = service.analyze_nutrition(low_sugar)
    assert res_low["nutrition_analysis"]["sugar"]["level"] == "low"
    assert res_low["nutrition_analysis"]["sugar"]["value"] == 3.5

    # Moderate sugar
    mod_sugar = NutritionData(sugars=9.0)
    res_mod = service.analyze_nutrition(mod_sugar)
    assert res_mod["nutrition_analysis"]["sugar"]["level"] == "moderate"

    # High sugar
    high_sugar = NutritionData(sugars=25.0)
    res_high = service.analyze_nutrition(high_sugar)
    assert res_high["nutrition_analysis"]["sugar"]["level"] == "high"


def test_sodium_and_salt_analysis():
    service = NutritionAnalysisService()

    # Low sodium (e.g. 80mg)
    data_low = NutritionData(sodium=80.0, salt=0.2)
    res = service.analyze_nutrition(data_low)
    assert res["nutrition_analysis"]["sodium"]["level"] == "low"
    assert res["nutrition_analysis"]["salt"]["level"] == "low"

    # High sodium (e.g. 850mg)
    data_high = NutritionData(sodium=850.0, salt=2.1)
    res_h = service.analyze_nutrition(data_high)
    assert res_h["nutrition_analysis"]["sodium"]["level"] == "high"
    assert res_h["nutrition_analysis"]["salt"]["level"] == "high"


def test_protein_and_fiber_positive_factors():
    service = NutritionAnalysisService()

    data = NutritionData(
        energy_kcal=350.0,
        sugars=2.0,
        fat=4.0,
        protein=12.0,  # High protein
        fiber=7.5      # High fiber
    )
    res = service.analyze_nutrition(data)
    analysis = res["nutrition_analysis"]
    profile = res["nutritional_profile"]

    assert analysis["protein"]["level"] == "high"
    assert analysis["fiber"]["level"] == "high"
    assert any("protein" in f.lower() for f in profile["positive_factors"])
    assert any("fiber" in f.lower() for f in profile["positive_factors"])


def test_trans_and_saturated_fat():
    service = NutritionAnalysisService()

    data = NutritionData(
        saturated_fat=6.5,  # High saturated fat (> 5g)
        trans_fat=0.4       # High trans fat (> 0.2g)
    )
    res = service.analyze_nutrition(data)
    assert res["nutrition_analysis"]["saturated_fat"]["level"] == "high"
    assert res["nutrition_analysis"]["trans_fat"]["level"] == "high"
    assert any("saturated fat" in f.lower() for f in res["nutritional_profile"]["factors_to_monitor"])
