import logging
from typing import List, Optional
from fastapi import APIRouter, HTTPException, status, Path, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from ..schemas.product import ProductResponse, ProductCreateRequest
from ..services.openfoodfacts import ProductNotFoundError, OpenFoodFactsAPIError
from ..services.product_service import ProductService
from ..database.connection import get_db
from ..utils.helpers import is_valid_barcode

logger = logging.getLogger("packcheck.api.products")

router = APIRouter(prefix="/products", tags=["Products"])
product_service = ProductService()


@router.get(
    "/id/{product_id}",
    response_model=ProductResponse,
    status_code=status.HTTP_200_OK,
    summary="Retrieve product by internal database ID",
    description="Fetches product details using its internal UUID/ID."
)
async def get_product_by_id(
    product_id: str = Path(..., description="Internal database product ID / UUID"),
    db: AsyncSession = Depends(get_db)
):
    product = await product_service.get_product_by_id(product_id.strip(), db)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID '{product_id}' not found."
        )
    return product


@router.get(
    "/{barcode}",
    response_model=ProductResponse,
    status_code=status.HTTP_200_OK,
    summary="Retrieve normalized product details by barcode",
    description="Checks local database first. If not cached, queries Open Food Facts, caches to database, and returns clean normalized PackCheck data."
)
async def get_product_by_barcode(
    barcode: str = Path(
        ...,
        description="Numeric barcode (e.g. EAN-13, EAN-8, UPC-A) found on product packaging",
        examples=["5449000000996"]
    ),
    db: AsyncSession = Depends(get_db)
):
    cleaned_barcode = barcode.strip()
    if not is_valid_barcode(cleaned_barcode):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid barcode format '{barcode}'. Barcodes must be 7 to 14 numeric digits."
        )

    try:
        product_data = await product_service.get_or_fetch_product(cleaned_barcode, db)
        return product_data
    except ProductNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc)
        )
    except OpenFoodFactsAPIError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(exc)
        )
    except Exception as exc:
        logger.exception(f"Unexpected error while processing barcode {barcode}: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while fetching product data."
        )


@router.post(
    "",
    response_model=ProductResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new product",
    description="Allows custom or local creation of a food/beverage product."
)
async def create_product(
    product_in: ProductCreateRequest,
    db: AsyncSession = Depends(get_db)
):
    """Registers product data into local system."""
    try:
        return await product_service.create_product(product_in, db)
    except Exception as exc:
        logger.exception(f"Failed to create product: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Could not register product: {str(exc)}"
        )
