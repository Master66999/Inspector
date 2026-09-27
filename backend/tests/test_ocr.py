import io
import pytest
from PIL import Image
from fastapi.testclient import TestClient

from app.main import app
from app.services.ocr_service import OCRService

client = TestClient(app)


def test_image_preprocessing():
    service = OCRService()
    # Create simple synthetic test image
    img = Image.new("RGB", (200, 100), color="white")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    img_bytes = buf.getvalue()

    _, processed, metadata = service.preprocess_image(img_bytes)
    assert metadata["format"] == "PNG"
    assert metadata["width"] == 200
    assert metadata["height"] == 100
    assert processed.mode == "L"


def test_label_text_parser():
    service = OCRService()
    sample_text = (
        "CRISPY POTATO CHIPS\n"
        "Nutrition Facts (per 100g):\n"
        "Energy: 540 kcal\n"
        "Total Fat: 35g\n"
        "Saturated Fat: 15g\n"
        "Trans Fat: 0.1g\n"
        "Total Carbohydrates: 52g\n"
        "Sugars: 1.5g\n"
        "Dietary Fiber: 4.2g\n"
        "Protein: 6.5g\n"
        "Sodium: 650mg\n"
        "INGREDIENTS: Potatoes, edible vegetable oil (palmolein), iodised salt.\n"
        "May contain traces of milk."
    )

    parsed = service.parse_label_text(sample_text)
    assert parsed["detected_name"] == "CRISPY POTATO CHIPS"
    assert parsed["nutrition"].energy_kcal == 540.0
    assert parsed["nutrition"].fat == 35.0
    assert parsed["nutrition"].saturated_fat == 15.0
    assert parsed["nutrition"].sugars == 1.5
    assert parsed["nutrition"].sodium == 0.65  # 650mg converted to 0.65g
    assert len(parsed["ingredients_list"]) >= 3
    assert "potatoes" in [i.lower() for i in parsed["ingredients_list"]]


@pytest.mark.asyncio
async def test_ocr_pipeline_execution():
    service = OCRService()
    sample_text = (
        "NUTRITION FACTS per 100g\n"
        "Calories: 210 kcal\n"
        "Fat: 8.0g\n"
        "Saturated Fat: 2.0g\n"
        "Sugars: 24.0g\n"
        "Protein: 3.0g\n"
        "Sodium: 200mg\n"
        "INGREDIENTS: Wheat flour, sugar, butter, baking soda.\n"
        "Contains wheat and milk."
    )

    result = await service.process_ocr_pipeline(raw_text_override=sample_text)
    assert result["status"] == "success"
    assert result["extracted_nutrition"].energy_kcal == 210.0
    assert result["extracted_nutrition"].sugars == 24.0

    analysis = result["analysis"]
    assert "sugar" in analysis.nutrition_analysis
    assert len(analysis.ingredient_analysis) > 0
    # Allergen detection
    assert "Wheat" in analysis.allergen_breakdown.contains or "Milk" in analysis.allergen_breakdown.contains


def test_ocr_api_endpoint_with_text():
    sample_text = (
        "Energy: 120 kcal\n"
        "Fat: 2.0g\n"
        "Sugars: 15.0g\n"
        "Sodium: 100mg\n"
        "INGREDIENTS: Water, sugar, citric acid."
    )
    response = client.post("/api/ocr/analyze", data={"text": sample_text})
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["extracted_nutrition"]["sugars"] == 15.0
    assert "sugar" in data["extracted_ingredients"] or "Sugar" in data["extracted_ingredients"]


def test_ocr_api_endpoint_with_image():
    img = Image.new("RGB", (150, 100), color="white")
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    buf.seek(0)

    response = client.post(
        "/api/ocr/analyze",
        files={"image": ("label.jpg", buf.getvalue(), "image/jpeg")}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["image_metadata"]["format"] == "JPEG"
