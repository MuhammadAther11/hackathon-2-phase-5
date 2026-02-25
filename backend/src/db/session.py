"""
Database session management for FastAPI.

Provides AsyncSession dependency for FastAPI endpoints.
Handles connection lifecycle and error handling.
"""

import logging
from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker
from fastapi import Depends

from src.db.connection import engine

logger = logging.getLogger(__name__)

# Create async session factory
async_session_maker = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
    autocommit=False,
)


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    """
    FastAPI dependency that provides an AsyncSession.

    Usage in endpoints:
        @app.get("/tasks")
        async def list_tasks(session: AsyncSession = Depends(get_session)):
            ...

    Handles:
    - Session creation with engine
    - Automatic cleanup and connection return to pool
    - Error handling and rollback on exceptions

    Yields:
        AsyncSession: Database session for async operations

    Raises:
        Exception: Any database error is re-raised after cleanup
    """
    async with async_session_maker() as session:
        try:
            yield session
        except Exception as e:
            logger.error(f"Database error: {str(e)}", exc_info=True)
            await session.rollback()
            raise
        finally:
            await session.close()
