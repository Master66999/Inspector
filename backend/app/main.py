import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from .api.products import router as products_router
from .api.scanner import router as scanner_router
from .api.analysis import router as analysis_router
from .api.alternatives import router as alternatives_router
from .api.ocr import router as ocr_router
from .database.connection import init_db

load_dotenv()

# Logging setup
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("packcheck.main")

PROJECT_NAME = os.getenv("PROJECT_NAME", "PackCheck Backend")
VERSION = os.getenv("VERSION", "1.0.0")
ALLOWED_ORIGINS_RAW = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000,http://localhost:8000,http://127.0.0.1:8000"
)
ALLOWED_ORIGINS = [o.strip() for o in ALLOWED_ORIGINS_RAW.split(",") if o.strip()]


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"Starting {PROJECT_NAME} v{VERSION}...")
    try:
        await init_db()
    except Exception as e:
        logger.error(f"Error during database startup: {e}")
    yield
    logger.info(f"Shutting down {PROJECT_NAME}...")


app = FastAPI(
    title=PROJECT_NAME,
    version=VERSION,
    description="Production-ready FastAPI backend for PackCheck food & beverage package scanner.",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS if ALLOWED_ORIGINS else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Routers
app.include_router(products_router, prefix="/api")
app.include_router(scanner_router, prefix="/api")
app.include_router(analysis_router, prefix="/api")
app.include_router(alternatives_router, prefix="/api")
app.include_router(ocr_router, prefix="/api")


@app.get(
    "/api/health",
    status_code=status.HTTP_200_OK,
    tags=["System"],
    summary="Health check endpoint"
)
async def health_check():
    """Returns runtime status of the PackCheck backend service."""
    return {
        "status": "ok",
        "service": "PackCheck Backend",
        "version": VERSION,
        "phase": "Phase 1 & Phase 2 Active (Open Food Facts integrated)"
    }


@app.get("/", tags=["System"], include_in_schema=False)
async def root():
    return {
        "name": PROJECT_NAME,
        "version": VERSION,
        "docs": "/docs",
        "health": "/api/health"
    }


if __name__ == "__main__":
    import uvicorn
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("app.main:app", host=host, port=port, reload=True)
