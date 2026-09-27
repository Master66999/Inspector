import uuid
import logging
from typing import Optional, Dict, Any, List
from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, Field, ConfigDict
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from ..database.models import Product, ScanHistory
from ..database.connection import get_db
from ..schemas.product import ProductResponse
from ..schemas.jev import JevEvaluation
from ..services.product_service import ProductService
from ..services.rule_engine import PackCheckRuleEngine
from ..services.jev_service import JevService
from ..services.recommendations import RecommendationService
from ..utils.helpers import is_valid_barcode

logger = logging.getLogger("packcheck.api.scanner")
router = APIRouter(prefix="/scan", tags=["Scanner"])

product_service = ProductService()
rule_engine = PackCheckRuleEngine()
jev_service = JevService()
recommendation_service = RecommendationService()


class ScanRequest(BaseModel):
    barcode: str = Field(..., description="Scanned barcode string", examples=["5449000000996"])
    user_id: Optional[str] = Field(default=None, description="Optional user ID for personalized history")
    device_info: str = Field(default="browser", description="Scanner client device metadata")


class ScanResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, extra="allow")

    success: bool = True
    status: str = "success"
    scan_id: str
    barcode: str
    product: ProductResponse
    nutrition_analysis: Dict[str, Any] = Field(default_factory=dict, description="Deterministic PackCheck rule engine analysis")
    jev_evaluation: Dict[str, Any] = Field(default_factory=dict, description="Jev AI product classification and evaluation")
    recommendations: List[Any] = Field(default_factory=list, description="Healthier product recommendations")


@router.post(
    "",
    response_model=ScanResponse,
    status_code=status.HTTP_200_OK,
    summary="Record product scan event and generate AI health assessment",
    description="Full scanner pipeline: validates barcode, caches product data, runs deterministic rule engine, invokes Jev AI evaluation, and gathers recommendations."
)
async def process_scan(scan_in: ScanRequest, db: AsyncSession = Depends(get_db)):
    cleaned_barcode = scan_in.barcode.strip()
    if not is_valid_barcode(cleaned_barcode):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid barcode '{cleaned_barcode}'. Must be 7 to 14 numeric digits."
        )

    try:
        product_data = await product_service.get_or_fetch_product(cleaned_barcode, db)
    except Exception as exc:
        logger.exception(f"Error fetching product during scan: {exc}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with barcode '{cleaned_barcode}' not found: {str(exc)}"
        )

    # 1. Record scan history entry
    scan_id = str(uuid.uuid4())
    try:
        stmt = select(Product).where(Product.barcode == cleaned_barcode)
        res = await db.execute(stmt)
        p_obj = res.scalar_one_or_none()
        if p_obj:
            history_entry = ScanHistory(
                id=scan_id,
                user_id=scan_in.user_id,
                product_id=p_obj.id
            )
            db.add(history_entry)
            await db.commit()
    except Exception as e:
        logger.warning(f"Could not record scan history: {e}")
        await db.rollback()

    # 2. Run deterministic PackCheck Rule Engine
    try:
        nutrition_analysis = rule_engine.analyze(
            nutrition=product_data.nutrition,
            ingredients=product_data.ingredients,
            allergens=product_data.allergens,
            category=product_data.product.category
        )
    except Exception as e:
        logger.error(f"Rule engine calculation failed: {e}")
        nutrition_analysis = {
            "score": 50,
            "flags": [],
            "positive_flags": [],
            "nutrition_summary": {},
            "warnings": []
        }

    # 3. Invoke Jev AI Evaluation (resilient; fails gracefully without crashing scan)
    try:
        jev_eval = await jev_service.evaluate_product(
            product_name=product_data.product.name,
            category=product_data.product.category,
            ingredients=product_data.ingredients,
            nutrition=nutrition_analysis.get("nutrition_summary", {}),
            packcheck_flags=nutrition_analysis.get("flags", [])
        )
    except Exception as e:
        logger.warning(f"Jev AI evaluation invocation error: {type(e).__name__}")
        jev_eval = {
            "available": False,
            "reason": "AI evaluation temporarily unavailable"
        }

    # 4. Gather category healthier recommendations
    recommendations = []
    try:
        recs_obj = await recommendation_service.get_alternatives_for_product(product_data, db)
        recommendations = [
            alt.model_dump() if hasattr(alt, "model_dump") else alt
            for alt in recs_obj.alternatives
        ]
    except Exception as e:
        logger.warning(f"Could not retrieve recommendations: {e}")

    return ScanResponse(
        success=True,
        status="success",
        scan_id=scan_id,
        barcode=cleaned_barcode,
        product=product_data,
        nutrition_analysis=nutrition_analysis,
        jev_evaluation=jev_eval,
        recommendations=recommendations
    )
