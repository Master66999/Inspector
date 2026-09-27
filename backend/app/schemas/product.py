from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict
from .nutrition import NutritionData


class ProductInfo(BaseModel):
    """Normalized descriptive information of the food product."""
    name: str = Field(default="Unknown Product", description="Product title/commercial name")
    brand: str = Field(default="Unknown Brand", description="Manufacturer or brand name")
    category: str = Field(default="Uncategorized", description="Primary food category")
    image: Optional[str] = Field(default=None, description="Direct URL to product package photo")


class AllergenInfo(BaseModel):
    """Detailed allergen classification separating confirmed presence from trace exposure."""
    model_config = ConfigDict(from_attributes=True)

    contains: List[str] = Field(default_factory=list, description="Explicitly identified allergens in recipe/ingredients")
    may_contain: List[str] = Field(default_factory=list, description="Precautionary trace allergens due to shared equipment/facility")


class ProductResponse(BaseModel):
    """
    Standard normalized PackCheck product representation
    returned by GET /api/products/{barcode}.
    """
    model_config = ConfigDict(from_attributes=True)

    barcode: str
    product: ProductInfo
    nutrition: NutritionData
    ingredients: List[str] = Field(default_factory=list, description="Extracted list of individual ingredients")
    allergens: List[str] = Field(default_factory=list, description="Extracted allergens/warnings")
    allergen_breakdown: AllergenInfo = Field(default_factory=AllergenInfo, description="Distinction between Contains and May Contain")


class ProductCreateRequest(BaseModel):
    """Schema for manually creating or registering a product."""
    barcode: str
    name: str
    brand: Optional[str] = "Unknown Brand"
    category: Optional[str] = "Uncategorized"
    image_url: Optional[str] = None
    nutrition: Optional[NutritionData] = None
    ingredients: Optional[List[str]] = None
    allergens: Optional[List[str]] = None
