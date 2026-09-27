import logging
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, status, Path, Depends, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from ..schemas.analysis import (
    ProductAnalysisResponse,
    ClassifiedIngredient,
    NutrientEvaluation,
    NutritionalProfileSummary
)
from ..schemas.product import AllergenInfo
from ..schemas.nutrition import NutritionData
from ..services.nutrition import NutritionAnalysisService
from ..services.ingredients import IngredientParserService
from ..services.product_service import ProductService
from ..services.rule_engine import PackCheckRuleEngine
from ..services.jev_service import JevService
from ..database.models import Product
from ..database.connection import get_db

logger = logging.getLogger("packcheck.api.analysis")

router = APIRouter(prefix="/analyze", tags=["Analysis"])

nutrition_service = NutritionAnalysisService()
ingredient_service = IngredientParserService()
product_service = ProductService()
rule_engine = PackCheckRuleEngine()
jev_service = JevService()


@router.post(
    "/{identifier}",
    response_model=ProductAnalysisResponse,
    status_code=status.HTTP_200_OK,
    summary="Generate comprehensive nutrition & ingredient analysis",
    description="Accepts a product barcode or product ID, evaluates all nutritional values against benchmark guidelines, and classifies ingredients neutrally."
)
async def analyze_product(
    identifier: str = Path(
        ...,
        description="Barcode or database product ID",
        examples=["5449000000996"]
    ),
    db: AsyncSession = Depends(get_db)
):
    cleaned_id = identifier.strip()

    # 1. Retrieve product data (from DB or Open Food Facts via ProductService)
    try:
        if cleaned_id.isdigit():
            # Barcode lookup
            product = await product_service.get_or_fetch_product(cleaned_id, db)
            barcode = product.barcode
            product_name = product.product.name
            nutrition = product.nutrition
            ingredients_list = product.ingredients
        else:
            # Query by UUID product ID
            stmt = select(Product).where(Product.id == cleaned_id)
            res = await db.execute(stmt)
            p_obj = res.scalar_one_or_none()
            if not p_obj:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Product with ID '{cleaned_id}' not found."
                )
            product = product_service._db_product_to_response(p_obj)
            barcode = product.barcode
            product_name = product.product.name
            nutrition = product.nutrition
            ingredients_list = product.ingredients

    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Error fetching product for analysis: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Could not retrieve product: {str(e)}"
        )

    # 2. Compute transparent rule-based nutrition analysis
    nutr_result = nutrition_service.analyze_nutrition(nutrition)
    nutrition_evaluations = {
        k: NutrientEvaluation(**v) for k, v in nutr_result["nutrition_analysis"].items()
    }
    profile_summary = NutritionalProfileSummary(**nutr_result["nutritional_profile"])

    # 3. Parse and classify ingredients neutrally
    classified_raw = ingredient_service.parse_and_classify_all(ingredients_list)
    classified_ingredients = [ClassifiedIngredient(**item) for item in classified_raw]

    # 4. Deterministic PackCheck Rule Engine analysis
    rule_analysis = rule_engine.analyze(
        nutrition=nutrition,
        ingredients=ingredients_list,
        allergens=getattr(product, "allergens", []),
        category=getattr(getattr(product, "product", None), "category", "Uncategorized")
    )

    # 5. Jev AI Evaluation (fails gracefully)
    try:
        jev_eval = await jev_service.evaluate_product(
            product_name=product_name,
            category=getattr(getattr(product, "product", None), "category", "Uncategorized"),
            ingredients=ingredients_list,
            nutrition=rule_analysis.get("nutrition_summary", {}),
            packcheck_flags=rule_analysis.get("flags", [])
        )
    except Exception as e:
        logger.warning(f"Jev AI evaluation error during analyze: {e}")
        jev_eval = {
            "available": False,
            "reason": "AI evaluation temporarily unavailable"
        }

    return ProductAnalysisResponse(
        barcode=barcode,
        product_name=product_name,
        nutrition_analysis=nutrition_evaluations,
        nutritional_profile=profile_summary,
        ingredient_analysis=classified_ingredients,
        allergen_breakdown=getattr(product, "allergen_breakdown", None) or AllergenInfo(),
        rule_engine_analysis=rule_analysis,
        jev_evaluation=jev_eval
    )


@router.post(
    "/parse-ingredients/text",
    response_model=List[ClassifiedIngredient],
    status_code=status.HTTP_200_OK,
    summary="Parse and classify raw ingredients text",
    description="Utility endpoint that takes any raw ingredients string (e.g. 'Water, Sugar, Citric Acid, Caffeine') and classifies every constituent neutrally."
)
async def parse_raw_ingredients(
    text: str = Body(
        ...,
        media_type="text/plain",
        examples=["Carbonated water, sugar, citric acid, caffeine, caramel colour (INS 150d), natural flavorings"]
    )
):
    classified_raw = ingredient_service.parse_and_classify_all(text)
    return [ClassifiedIngredient(**item) for item in classified_raw]
