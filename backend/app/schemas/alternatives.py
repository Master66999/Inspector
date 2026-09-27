from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field, ConfigDict


class AlternativeProduct(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    name: str = Field(..., description="Alternative product title")
    brand: Optional[str] = Field(default=None, description="Brand name")
    barcode: Optional[str] = Field(default=None, description="Barcode if available")
    category: Optional[str] = Field(default=None, description="Product category")
    image: Optional[str] = Field(default=None, description="Product image URL")
    reason: str = Field(..., description="Primary comparative nutritional advantage")
    clean_score: Optional[int] = Field(default=95, description="CleanScore of the alternative")
    comparison: Dict[str, Any] = Field(default_factory=dict, description="Objective nutrient differences (sugar, sodium, protein, etc.)")
    score_explanation: Optional[str] = Field(default=None, description="Detailed explanation of the comparative score")


class AlternativesResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    product: str = Field(..., description="Target product evaluated")
    barcode: Optional[str] = Field(default=None, description="Target product barcode")
    category: Optional[str] = Field(default="Uncategorized", description="Evaluated category")
    alternatives: List[AlternativeProduct] = Field(default_factory=list, description="Ranked comparable alternatives")
