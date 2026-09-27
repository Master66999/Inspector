import uuid
import pytest
from unittest.mock import AsyncMock, patch
from fastapi.testclient import TestClient

from app.main import app
from app.services.openfoodfacts import OpenFoodFactsService
from app.schemas.product import ProductResponse

client = TestClient(app)


def test_database_caching_flow():
    """
    Verifies Phase 3 flow:
    Scan 1: Not in DB -> Query Open Food Facts -> Save to DB -> Return.
    Scan 2: In DB -> Return cached DB record (Open Food Facts is NOT called).
    """
    # Use dynamic valid 13-digit barcode for test isolation
    test_barcode = f"99{uuid.uuid4().int % 100000000000:011d}"

    mock_data = ProductResponse(
        barcode=test_barcode,
        product={
            "name": "Oreo Original Biscuits",
            "brand": "Mondelez",
            "category": "Biscuits",
            "image": "https://example.com/oreo.jpg"
        },
        nutrition={
            "energy_kcal": 476.0,
            "sugars": 38.0,
            "fat": 20.0,
            "saturated_fat": 5.4,
            "trans_fat": 0.0,
            "protein": 5.3,
            "fiber": 2.7,
            "sodium": 0.29,
            "salt": 0.73
        },
        ingredients=["Wheat Flour", "Sugar", "Palm Oil", "Cocoa Powder"],
        allergens=["wheat", "gluten"]
    )

    with patch.object(
        OpenFoodFactsService,
        "fetch_product_by_barcode",
        new_callable=AsyncMock
    ) as mock_off:
        mock_off.return_value = mock_data

        # --- First Call: Should hit Open Food Facts and save to DB ---
        res1 = client.get(f"/api/products/{test_barcode}")
        assert res1.status_code == 200
        assert mock_off.call_count == 1
        data1 = res1.json()
        assert data1["barcode"] == test_barcode
        assert data1["product"]["name"] == "Oreo Original Biscuits"

        # --- Second Call: Should be served from database cache ---
        res2 = client.get(f"/api/products/{test_barcode}")
        assert res2.status_code == 200
        # Call count should STILL be 1 because it read from DB cache!
        assert mock_off.call_count == 1
        data2 = res2.json()
        assert data2["barcode"] == test_barcode
        assert data2["product"]["name"] == "Oreo Original Biscuits"
        assert data2["nutrition"]["sugars"] == 38.0
        assert len(data2["ingredients"]) == 4
