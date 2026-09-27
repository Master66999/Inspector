import os
import logging
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import declarative_base
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("packcheck.database")

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+asyncpg://postgres:postgres@localhost:5432/packcheck_db"
)
FALLBACK_SQLITE_URL = "sqlite+aiosqlite:///./packcheck.db"

Base = declarative_base()

engine = None
AsyncSessionLocal = None


def get_engine():
    global engine, AsyncSessionLocal
    if engine is None:
        # Default to configured DB or fallback
        target_url = DATABASE_URL if "sqlite" in DATABASE_URL.lower() else FALLBACK_SQLITE_URL
        engine = create_async_engine(target_url, echo=False, future=True)
        AsyncSessionLocal = async_sessionmaker(
            engine, class_=AsyncSession, expire_on_commit=False
        )
    return engine


async def init_db():
    """Initializes tables in database, prioritizing PostgreSQL and gracefully falling back to SQLite if offline."""
    global engine, AsyncSessionLocal
    
    # First, attempt connecting to primary DATABASE_URL if configured
    if "sqlite" not in DATABASE_URL.lower():
        try:
            logger.info(f"Connecting to primary database: {DATABASE_URL}...")
            test_engine = create_async_engine(DATABASE_URL, echo=False, future=True)
            async with test_engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
            engine = test_engine
            AsyncSessionLocal = async_sessionmaker(
                engine, class_=AsyncSession, expire_on_commit=False
            )
            logger.info("Connected to PostgreSQL. Database tables verified and initialized.")
            return
        except Exception as e:
            logger.warning(
                f"PostgreSQL server not detected or connection refused ({e}). "
                "Switching seamlessly to local SQLite storage (packcheck.db)."
            )

    # Use SQLite fallback
    engine = create_async_engine(FALLBACK_SQLITE_URL, echo=False, future=True)
    AsyncSessionLocal = async_sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Local SQLite database tables initialized successfully at packcheck.db.")


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency provider for database session."""
    get_engine()
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
