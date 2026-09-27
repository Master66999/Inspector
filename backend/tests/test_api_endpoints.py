import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, AsyncMock

from app.main import app
from app.schemas.product import ProductResponse, ProductInfo, AllergenInfo
from app.schemas.nutrition import NutritionData

client = TestClient(app)

MOCK_PRODUCT = ProductResponse(
    barcode="8901030000001",
    product=ProductInfo(
        name="Parle-G Gluco Biscuits",
        brand="Parle",
        category="Biscuits",
        image="http://example.com/parleg.jpg"
    ),
    nutrition=NutritionData(
        energy_kcal=450.0,
        sugars=25.0,
        fat=13.0,
        saturated_fat=6.0,
        trans_fat=0.0,
        protein=7.0,
        fiber=1.5,
        sodium=0.25,
        salt=0.625
    ),
    ingredients=["Wheat Flour", "Sugar", "Edible Vegetable Oil", "Invert Sugar Syrup", "Salt", "Milk Solids"],
    allergens=["Wheat", "Milk"],
    allergen_breakdown=AllergenInfo(contains=["Wheat", "Milk"], may_contain=[])
)


def test_health_check_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "version" in data
    assert "PackCheck" in data["service"]


@pytest.mark.asyncio
async def test_get_product_endpoint():
    with patch("app.services.product_service.ProductService.get_or_fetch_product", new_callable=AsyncMock) as mock_fetch:
        mock_fetch.return_value = MOCK_PRODUCT
        response = client.get("/api/products/8901030000001")
        assert response.status_code == 200
        data = response.json()
        assert data["barcode"] == "8901030000001"
        assert data["product"]["name"] == "Parle-G Gluco Biscuits"


def test_get_product_invalid_barcode():
    response = client.get("/api/products/123")
    assert response.status_code == 400


@pytest.mark.asyncio
async def test_scan_endpoint():
    with patch("app.services.product_service.ProductService.get_or_fetch_product", new_callable=AsyncMock) as mock_fetch:
        mock_fetch.return_value = MOCK_PRODUCT
        payload = {"barcode": "8901030000001", "device_info": "test-runner"}
        response = client.post("/api/scan", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert data["barcode"] == "8901030000001"
        assert "product" in data
        assert data["product"]["product"]["name"] == "Parle-G Gluco Biscuits"


@pytest.mark.asyncio
async def test_analyze_endpoint():
    with patch("app.services.product_service.ProductService.get_or_fetch_product", new_callable=AsyncMock) as mock_fetch:
        mock_fetch.return_value = MOCK_PRODUCT
        response = client.post("/api/analyze/8901030000001")
        assert response.status_code == 200
        data = response.json()
        assert data["barcode"] == "8901030000001"
        assert "nutrition_analysis" in data
        assert "nutritional_profile" in data
        assert "ingredient_analysis" in data
        assert "allergen_breakdown" in data
        assert "Wheat" in data["allergen_breakdown"]["contains"]


@pytest.mark.asyncio
async def test_alternatives_endpoint():
    with patch("app.services.product_service.ProductService.get_or_fetch_product", new_callable=AsyncMock) as mock_fetch:
        mock_fetch.return_value = MOCK_PRODUCT
        response = client.get("/api/alternatives/8901030000001?limit=3")
        assert response.status_code == 200
        data = response.json()
        assert data["barcode"] == "8901030000001"
        assert "alternatives" in data
