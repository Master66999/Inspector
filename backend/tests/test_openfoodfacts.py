import pytest
from unittest.mock import AsyncMock, patch
from fastapi.testclient import TestClient

from app.main import app
from app.services.openfoodfacts import (
    OpenFoodFactsService,
    ProductNotFoundError,
    OpenFoodFactsAPIError
)
from app.schemas.product import ProductResponse

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "PackCheck" in data["service"]


def test_invalid_barcode_endpoint():
    response = client.get("/api/products/invalid_barcode_xyz")
    assert response.status_code == 400
    assert "Invalid barcode format" in response.json()["detail"]


def test_product_not_found_endpoint():
    with patch.object(
        OpenFoodFactsService,
        "fetch_product_by_barcode",
        new_callable=AsyncMock
    ) as mock_fetch:
        mock_fetch.side_effect = ProductNotFoundError("Product not found.")
        response = client.get("/api/products/0000000000000")
        assert response.status_code == 404
        assert "not found" in response.json()["detail"]


def test_normalization_logic():
    service = OpenFoodFactsService()
    raw_sample = {
        "product_name": "Sparkling Mango Drink",
        "brands": "Tropic Bliss",
        "categories_tags": ["en:beverages", "en:fruit-juices", "en:carbonated-drinks"],
        "image_front_url": "https://example.com/image.jpg",
        "nutriments": {
            "energy-kcal_100g": 45,
            "sugars_100g": 11.2,
            "fat_100g": 0.1,
            "saturated-fat_100g": 0.0,
            "proteins_100g": 0.2,
            "salt_100g": 0.05
        },
        "ingredients": [
            {"text": "Carbonated Water (80%)"},
            {"text": "Mango Puree (15%)"},
            {"text": "Cane Sugar"}
        ],
        "allergens_tags": ["en:gluten-free"]
    }

    normalized = service._normalize_product_data("8901234567890", raw_sample)
    assert normalized.barcode == "8901234567890"
    assert normalized.product.name == "Sparkling Mango Drink"
    assert normalized.product.brand == "Tropic Bliss"
    assert normalized.product.category == "Carbonated Drinks"
    assert normalized.product.image == "https://example.com/image.jpg"
    assert normalized.nutrition.energy_kcal == 45.0
    assert normalized.nutrition.sugars == 11.2
    assert normalized.nutrition.fat == 0.1
    assert normalized.nutrition.salt == 0.05
    assert normalized.nutrition.sodium == 0.02  # 0.05 / 2.5
    assert "Carbonated Water" in normalized.ingredients
    assert "Mango Puree" in normalized.ingredients


def test_product_success_mocked():
    sample_response = ProductResponse(
        barcode="5449000000996",
        product={
            "name": "Coca-Cola Original",
            "brand": "Coca-Cola",
            "category": "Soft Drinks",
            "image": "https://example.com/coke.jpg"
        },
        nutrition={
            "energy_kcal": 42.0,
            "sugars": 10.6,
            "fat": 0.0,
            "saturated_fat": 0.0,
            "trans_fat": 0.0,
            "protein": 0.0,
            "fiber": 0.0,
            "sodium": 0.0,
            "salt": 0.0
        },
        ingredients=["carbonated water", "sugar", "caramel"],
        allergens=[]
    )

    with patch.object(
        OpenFoodFactsService,
        "fetch_product_by_barcode",
        new_callable=AsyncMock
    ) as mock_fetch:
        mock_fetch.return_value = sample_response
        response = client.get("/api/products/5449000000996")
        assert response.status_code == 200
        data = response.json()
        assert data["barcode"] == "5449000000996"
        assert data["product"]["name"] == "Coca-Cola Original"
        assert data["nutrition"]["sugars"] == 10.6
        assert len(data["ingredients"]) == 3
