from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class NutritionData(BaseModel):
    """Normalized nutritional values per 100g or 100ml."""
    model_config = ConfigDict(from_attributes=True)

    energy_kcal: float = Field(default=0.0, description="Energy in kilocalories per 100g/ml")
    sugars: float = Field(default=0.0, description="Total sugars in grams per 100g/ml")
    added_sugars: Optional[float] = Field(default=None, description="Added sugars if specified")
    fat: float = Field(default=0.0, description="Total fat in grams per 100g/ml")
    saturated_fat: float = Field(default=0.0, description="Saturated fat in grams per 100g/ml")
    trans_fat: float = Field(default=0.0, description="Trans fat in grams per 100g/ml")
    protein: float = Field(default=0.0, description="Protein in grams per 100g/ml")
    fiber: float = Field(default=0.0, description="Dietary fiber in grams per 100g/ml")
    sodium: float = Field(default=0.0, description="Sodium in grams per 100g/ml")
    salt: float = Field(default=0.0, description="Salt in grams per 100g/ml")
