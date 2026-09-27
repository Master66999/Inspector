import pytest
from unittest.mock import patch, AsyncMock
from fastapi.testclient import TestClient
import httpx

from app.main import app
from app.services.rule_engine import PackCheckRuleEngine
from app.services.jev_service import JevService
from app.services.openfoodfacts import ProductNotFoundError
from app.schemas.product import ProductResponse, ProductInfo, AllergenInfo
from app.schemas.nutrition import NutritionData

client = TestClient(app)

SAMPLE_PRODUCT = ProductResponse(
    barcode="8901234567890",
    product=ProductInfo(
        name="Example Chocolate Drink",
        brand="ChocoPure",
        category="Beverage",
        image="https://example.com/chocodrink.jpg"
    ),
    nutrition=NutritionData(
        energy_kcal=210.0,
        sugars=18.0,
        fat=3.2,
        saturated_fat=2.1,
        trans_fat=0.0,
        protein=4.0,
        fiber=1.2,
        sodium=120.0,
        salt=0.3
    ),
    ingredients=["milk", "sugar", "cocoa", "emulsifier (INS 322)"],
    allergens=["milk", "soy"],
    allergen_breakdown=AllergenInfo(contains=["milk", "soy"], may_contain=[])
)


# ---------------------------------------------------------------------------
# 1. Test Rule Engine: Missing Nutrition Data
# ---------------------------------------------------------------------------
def test_missing_nutrition_data():
    """Verify rule engine gracefully handles missing or empty nutrition without crashing."""
    rule_engine = PackCheckRuleEngine()

    # Empty nutrition dict
    result = rule_engine.analyze(nutrition={}, ingredients=[], allergens=[])
    assert "score" in result
    assert result["score"] >= 0
    assert isinstance(result["flags"], list)
    assert result["nutrition_summary"]["sugar"] == 0.0
    assert result["nutrition_summary"]["sodium"] == 0.0

    # None nutrition
    result_none = rule_engine.analyze(nutrition=None)
    assert "score" in result_none
    assert result_none["nutrition_summary"]["calories"] == 0.0


# ---------------------------------------------------------------------------
# 2. Test Rule Engine: High Sugar Product
# ---------------------------------------------------------------------------
def test_high_sugar_product():
    """Verify rule engine generates HIGH_SUGAR flag when sugar exceeds threshold (> 12.5g)."""
    rule_engine = PackCheckRuleEngine()
    nutr = NutritionData(
        energy_kcal=180.0,
        sugars=22.5,
        fat=2.0,
        saturated_fat=0.5,
        protein=1.0,
        fiber=0.0,
        sodium=30.0,
        salt=0.08
    )
    result = rule_engine.analyze(nutrition=nutr)
    assert "HIGH_SUGAR" in result["flags"]
    assert any("sugar" in w.lower() for w in result["warnings"])
    assert result["nutrition_summary"]["sugar"] == 22.5


# ---------------------------------------------------------------------------
# 3. Test Rule Engine: High Sodium Product
# ---------------------------------------------------------------------------
def test_high_sodium_product():
    """Verify rule engine generates HIGH_SODIUM flag when sodium exceeds benchmark (> 600mg)."""
    rule_engine = PackCheckRuleEngine()
    nutr = NutritionData(
        energy_kcal=320.0,
        sugars=3.0,
        fat=12.0,
        saturated_fat=3.0,
        protein=7.0,
        fiber=2.0,
        sodium=850.0,  # 850mg > 600mg
        salt=2.1
    )
    result = rule_engine.analyze(nutrition=nutr)
    assert "HIGH_SODIUM" in result["flags"]
    assert any("sodium" in w.lower() for w in result["warnings"])
    assert result["nutrition_summary"]["sodium"] == 850.0


# ---------------------------------------------------------------------------
# 4. Test Jev Service: Success Response (Mocked Jev API)
# ---------------------------------------------------------------------------
@pytest.mark.asyncio
async def test_jev_service_success():
    """Verify JevService parses System One choice decisions into PackCheck schema."""
    service = JevService(api_key="mock_jev_test_key_123")

    mock_jev_response_data = {
        "answers": {
            "overall_profile": {"choice": "LIMIT", "confidence": 0.96},
            "sugar_level": {"choice": "HIGH", "confidence": 0.99},
            "sodium_level": {"choice": "LOW", "confidence": 0.91}
        }
    }

    mock_response = httpx.Response(200, json=mock_jev_response_data)

    with patch("httpx.AsyncClient.post", new_callable=AsyncMock) as mock_post:
        mock_post.return_value = mock_response

        eval_result = await service.evaluate_product(
            product_name="Example Chocolate Drink",
            category="Beverage",
            ingredients=["milk", "sugar", "cocoa", "emulsifier"],
            nutrition={"sugar": 18.0, "sodium": 120.0, "protein": 4.0},
            packcheck_flags=["HIGH_SUGAR"]
        )

        assert eval_result["available"] is True
        assert eval_result["overall_profile"] == "LIMIT"
        assert eval_result["sugar_level"] == "HIGH"
        assert eval_result["sodium_level"] == "LOW"
        assert "HIGH_SUGAR" in eval_result["concerns"]
        assert len(eval_result["explanation"]) > 0


# ---------------------------------------------------------------------------
# 5. Test Jev Service: API Failure / Timeout (Resilience & Non-crash)
# ---------------------------------------------------------------------------
@pytest.mark.asyncio
async def test_jev_service_failure():
    """Verify system remains resilient when Jev API returns 500 or times out."""
    service = JevService(api_key="mock_jev_test_key_123")

    # Case 1: HTTP 500 Internal Error
    mock_err_response = httpx.Response(500, text="Internal Gateway Error")
    with patch("httpx.AsyncClient.post", new_callable=AsyncMock) as mock_post:
        mock_post.return_value = mock_err_response

        eval_result = await service.evaluate_product(
            product_name="Example Chocolate Drink",
            category="Beverage",
            ingredients=["milk", "sugar"],
            nutrition={"sugar": 18.0},
            packcheck_flags=["HIGH_SUGAR"]
        )

        assert eval_result["available"] is False
        assert "unavailable" in eval_result["reason"].lower()

    # Case 2: Timeout exception
    with patch("httpx.AsyncClient.post", side_effect=httpx.TimeoutException("Timeout")):
        eval_result_timeout = await service.evaluate_product(
            product_name="Example Chocolate Drink",
            category="Beverage",
            ingredients=["milk", "sugar"],
            nutrition={"sugar": 18.0},
            packcheck_flags=["HIGH_SUGAR"]
        )

        assert eval_result_timeout["available"] is False
        assert "unavailable" in eval_result_timeout["reason"].lower()


# ---------------------------------------------------------------------------
# 6. Test Endpoint: Product Not Found
# ---------------------------------------------------------------------------
@pytest.mark.asyncio
async def test_scan_product_not_found():
    """Verify scanning non-existent barcode returns clean 404 without crashing."""
    with patch(
        "app.services.product_service.ProductService.get_or_fetch_product",
        new_callable=AsyncMock
    ) as mock_fetch:
        mock_fetch.side_effect = ProductNotFoundError("Product with barcode '0000000000000' not found.")
        response = client.post("/api/scan", json={"barcode": "0000000000000"})
        assert response.status_code == 404
        detail = response.json().get("detail", "")
        assert "not found" in detail.lower()


# ---------------------------------------------------------------------------
# 7. Test Endpoint: Product Found
# ---------------------------------------------------------------------------
@pytest.mark.asyncio
async def test_scan_product_found():
    """Verify scanning valid product returns 200, product details, and rule analysis."""
    with patch(
        "app.services.product_service.ProductService.get_or_fetch_product",
        new_callable=AsyncMock
    ) as mock_fetch:
        mock_fetch.return_value = SAMPLE_PRODUCT

        scan_res = client.post("/api/scan", json={"barcode": SAMPLE_PRODUCT.barcode})
        assert scan_res.status_code == 200
        data = scan_res.json()
        assert data["success"] is True
        assert data["barcode"] == SAMPLE_PRODUCT.barcode
        assert data["product"]["product"]["name"] == "Example Chocolate Drink"
        assert "nutrition_analysis" in data
        assert "score" in data["nutrition_analysis"]
        assert "flags" in data["nutrition_analysis"]
        assert "jev_evaluation" in data
        assert "recommendations" in data


# ---------------------------------------------------------------------------
# 8. Complete Flow: Barcode → Product → Rule Engine → Jev → Recommendations
# ---------------------------------------------------------------------------
@pytest.mark.asyncio
async def test_complete_barcode_scan_pipeline():
    """
    End-to-end integration test verifying the complete data pipeline:
    Barcode → Product Data → Deterministic Rule Engine → Jev AI Evaluation → Recommendations
    """
    mock_jev_data = {
        "answers": {
            "overall_profile": {"choice": "LIMIT", "confidence": 0.94},
            "sugar_level": {"choice": "HIGH", "confidence": 0.97},
            "sodium_level": {"choice": "LOW", "confidence": 0.89}
        }
    }

    with patch(
        "app.services.product_service.ProductService.get_or_fetch_product",
        new_callable=AsyncMock
    ) as mock_fetch, patch(
        "httpx.AsyncClient.post",
        new_callable=AsyncMock
    ) as mock_post:
        mock_fetch.return_value = SAMPLE_PRODUCT
        mock_post.return_value = httpx.Response(200, json=mock_jev_data)

        with patch.dict("os.environ", {"JEV_API_KEY": "test_jev_key_xyz"}):
            # Recreate JevService with the test key
            from app.api.scanner import jev_service
            jev_service.api_key = "test_jev_key_xyz"

            # Perform scan
            response = client.post("/api/scan", json={
                "barcode": SAMPLE_PRODUCT.barcode,
                "device_info": "integration_test_runner"
            })

            assert response.status_code == 200
            data = response.json()

            # 1. Pipeline status
            assert data["success"] is True
            assert data["status"] == "success"

            # 2. Product identification & facts preserved
            product = data["product"]
            assert product["barcode"] == SAMPLE_PRODUCT.barcode
            assert product["product"]["name"] == "Example Chocolate Drink"

            # 3. Deterministic rule engine evaluation
            nutr_analysis = data["nutrition_analysis"]
            assert "score" in nutr_analysis
            assert "HIGH_SUGAR" in nutr_analysis["flags"]
            assert nutr_analysis["nutrition_summary"]["sugar"] == 18.0

            # 4. Jev AI Evaluation (classified, not facts-invented)
            jev_eval = data["jev_evaluation"]
            assert jev_eval["available"] is True
            assert jev_eval["overall_profile"] == "LIMIT"
            assert "HIGH_SUGAR" in jev_eval["concerns"]
            assert "disclaimer" in jev_eval

            # 5. Category healthier recommendations
            recs = data["recommendations"]
            assert isinstance(recs, list)
