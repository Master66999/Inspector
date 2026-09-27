import logging
from fastapi import APIRouter, HTTPException, status, Path, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from ..schemas.alternatives import AlternativesResponse
from ..services.recommendations import RecommendationService
from ..services.product_service import ProductService
from ..database.models import Product
from ..database.connection import get_db

logger = logging.getLogger("packcheck.api.alternatives")

router = APIRouter(prefix="/alternatives", tags=["Alternatives"])

recommendation_service = RecommendationService()
product_service = ProductService()


@router.get(
    "/{identifier}",
    response_model=AlternativesResponse,
    status_code=status.HTTP_200_OK,
    summary="Retrieve comparable healthier alternatives (Phase 7)",
    description="Compares the target product against others in its category and returns alternatives with transparent nutritional differentials."
)
async def get_alternatives(
    identifier: str = Path(
        ...,
        description="Barcode or database product ID of the scanned product",
        examples=["5449000000996"]
    ),
    db: AsyncSession = Depends(get_db)
):
    cleaned_id = identifier.strip()

    try:
        if cleaned_id.isdigit():
            # Lookup product by barcode
            product = await product_service.get_or_fetch_product(cleaned_id, db)
        else:
            # Lookup by UUID
            stmt = select(Product).where(Product.id == cleaned_id)
            res = await db.execute(stmt)
            p_obj = res.scalar_one_or_none()
            if not p_obj:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Product with ID '{cleaned_id}' not found."
                )
            product = product_service._db_product_to_response(p_obj)

    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Error fetching product for alternatives: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Could not retrieve product: {str(e)}"
        )

    # Compute transparent alternatives
    response = await recommendation_service.get_alternatives_for_product(product, db)
    return response
