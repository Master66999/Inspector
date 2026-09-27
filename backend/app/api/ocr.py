import logging
from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from ..schemas.ocr import OCRAnalysisResponse
from ..services.ocr_service import OCRService
from ..database.connection import get_db

logger = logging.getLogger("packcheck.api.ocr")

router = APIRouter(prefix="/ocr", tags=["OCR Fallback"])
ocr_service = OCRService()


@router.post(
    "/analyze",
    response_model=OCRAnalysisResponse,
    status_code=status.HTTP_200_OK,
    summary="OCR packaging scan fallback & Barcode photo reader",
    description="Processes packaging photo (or barcode image or raw OCR text) to identify products, extract ingredients, and compute nutritional health profiles."
)
async def analyze_label_image(
    image: Optional[UploadFile] = File(None, description="Packaging photo containing barcode, nutrition facts, or ingredients list"),
    text: Optional[str] = Form(None, description="Optional raw text override or manual input"),
    db: AsyncSession = Depends(get_db)
):
    try:
        image_bytes = None
        if image is not None:
            image_bytes = await image.read()

        result = await ocr_service.process_ocr_pipeline(
            image_bytes=image_bytes,
            raw_text_override=text,
            db=db
        )
        return OCRAnalysisResponse(**result)

    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve)
        )
    except Exception as exc:
        logger.exception(f"OCR processing failed: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred during OCR analysis: {str(exc)}"
        )
