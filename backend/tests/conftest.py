import asyncio
import pytest
from app.database.connection import init_db


@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    """Ensure database tables exist before running test suite."""
    asyncio.run(init_db())
