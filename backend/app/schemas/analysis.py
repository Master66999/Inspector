from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field, ConfigDict
from .product import AllergenInfo


class NutrientEvaluation(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    value: float = Field(..., description="Nutrient quantity per 100g/ml")
    unit: str = Field(default="g", description="Unit of measure (g, mg, kcal)")
    level: str = Field(..., description="Objective assessment level: low, moderate, high, or source")
    message: str = Field(..., description="Neutral explanation referenced to public health benchmarks")


class NutritionalProfileSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    energy_density: str = Field(default="moderate", description="Calculated energy density: low, moderate, or high")
    positive_factors: List[str] = Field(default_factory=list, description="Favorable nutrient attributes (e.g. fiber/protein source)")
    factors_to_monitor: List[str] = Field(default_factory=list, description="Nutrients subject to ceiling limits (e.g. sugar, sodium, saturated fat)")
    transparency_note: str = Field(default="Evaluations are referenced to 100g/ml standards. Not medical advice.")


class ClassifiedIngredient(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    raw_name: str
    ingredient_name: str
    ingredient_type: str = Field(..., description="Category (Sweetener, Preservative, Colour, Acidity regulator, Emulsifier, Stabilizer, Flavoring, Caffeine, Salt, Oil, Other)")
    description: str
    common_use: str
    notes: str


class ProductAnalysisResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, extra="allow")

    barcode: str
    product_name: str = "Unknown Product"
    nutrition_analysis: Dict[str, NutrientEvaluation] = Field(default_factory=dict)
    nutritional_profile: NutritionalProfileSummary = Field(default_factory=NutritionalProfileSummary)
    ingredient_analysis: List[ClassifiedIngredient] = Field(default_factory=list)
    allergen_breakdown: AllergenInfo = Field(default_factory=AllergenInfo)
    rule_engine_analysis: Optional[Dict[str, Any]] = Field(default=None, description="Deterministic PackCheck rule engine flags & score")
    jev_evaluation: Optional[Dict[str, Any]] = Field(default=None, description="Jev AI product classification and evaluation")

