from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field, ConfigDict
from .nutrition import NutritionData
from .analysis import ProductAnalysisResponse


class OCRAnalysisResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    status: str = Field(default="success", description="Status of OCR processing")
    ocr_engine: str = Field(default="regex_heuristic", description="Engine used for extraction")
    detected_barcode: Optional[str] = Field(default=None, description="Decoded 1D/2D barcode if detected in image")
    detected_barcode_format: Optional[str] = Field(default=None, description="Format of detected barcode (EAN-13, UPC-A, QR, etc.)")
    image_metadata: Optional[Dict[str, Any]] = Field(default=None, description="Image details (resolution, format, size)")
    raw_text: str = Field(default="", description="Extracted raw label text or scan notes")
    detected_product_name: Optional[str] = Field(default=None, description="Inferred or looked up product name")
    extracted_ingredients: List[str] = Field(default_factory=list, description="Extracted individual ingredients")
    extracted_nutrition: NutritionData = Field(default_factory=NutritionData, description="Parsed nutritional values per 100g/ml")
    analysis: ProductAnalysisResponse = Field(..., description="Standard PackCheck health & ingredient profile analysis")
