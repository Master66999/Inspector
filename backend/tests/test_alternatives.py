import pytest
from unittest.mock import AsyncMock, patch
from fastapi.testclient import TestClient

from app.main import app
from app.services.product_service import ProductService
from app.schemas.product import ProductResponse, ProductInfo, AllergenInfo
from app.schemas.nutrition import NutritionData

client = TestClient(app)


def test_alternatives_endpoint_and_scoring():
    # Target high-sugar soda (10.6g sugar per 100ml)
    sample_target = ProductResponse(
        barcode="5449000000996",
        product=ProductInfo(
            name="Classic Sweetened Cola",
            brand="MegaSip",
            category="Carbonated Drinks"
        ),
        nutrition=NutritionData(
            energy_kcal=42.0,
            sugars=10.6,
            fat=0.0,
            saturated_fat=0.0,
            protein=0.0,
            fiber=0.0,
            sodium=0.01,
            salt=0.02
        ),
        ingredients=["Carbonated water", "Sugar", "Caramel color"],
        allergens=[],
        allergen_breakdown=AllergenInfo()
    )

    with patch.object(
        ProductService,
        "get_or_fetch_product",
        new_callable=AsyncMock
    ) as mock_get:
        mock_get.return_value = sample_target

        response = client.get("/api/alternatives/5449000000996")
        assert response.status_code == 200
        data = response.json()

        assert data["product"] == "Classic Sweetened Cola"
        assert len(data["alternatives"]) > 0

        # Check the first alternative
        first_alt = data["alternatives"][0]
        assert "Lower sugar" in first_alt["reason"]
        # Comparison delta must show negative sugar difference
        assert first_alt["comparison"]["sugar_difference"] < 0
        assert "score_explanation" in first_alt
        assert len(first_alt["score_explanation"]) > 10
