"""
Database schema initialization.

Creates all required tables and indexes using SQLModel create_all().
Idempotent - safe to call multiple times (uses IF NOT EXISTS patterns).

Tables created:
- tasks: Task entity with indexes for user_id, completion status, and timestamps
"""

import logging
from sqlalchemy.ext.asyncio import AsyncEngine
from sqlmodel import SQLModel

logger = logging.getLogger(__name__)


async def create_all_tables(engine: AsyncEngine) -> None:
    """
    Create all database tables using SQLModel metadata.

    This function:
    1. Uses SQLModel.metadata.create_all() which includes IF NOT EXISTS
    2. Is idempotent - safe to call multiple times
    3. Creates indexes defined in models

    Tables created:
    - tasks (with indexes: PRIMARY (id), idx_user_tasks(user_id, completed),
             idx_user_created(user_id, created_at DESC), idx_updated(updated_at DESC))

    Args:
        engine: AsyncEngine instance for database connection

    Raises:
        Exception: If database connection fails or schema creation fails
    """
    try:
        async with engine.begin() as conn:
            # Import Task model to register it with SQLModel.metadata
            from src.models.task import Task  # noqa: F401

            # Create all tables defined in SQLModel.metadata
            await conn.run_sync(SQLModel.metadata.create_all)

        logger.info("Database schema created successfully")

    except Exception as e:
        logger.error(f"Failed to create database schema: {str(e)}")
        raise


async def verify_schema(engine: AsyncEngine) -> dict:
    """
    Verify that all required tables exist.

    Args:
        engine: AsyncEngine instance

    Returns:
        dict: Map of table names to existence status
        Example: {"tasks": True}

    Raises:
        Exception: If verification query fails
    """
    from sqlalchemy import inspect

    try:
        async with engine.begin() as conn:
            inspector = await conn.run_sync(
                lambda conn: inspect(conn)
            )
            tables = {
                "tasks": "tasks" in inspector.get_table_names()
            }
            return tables

    except Exception as e:
        logger.error(f"Failed to verify schema: {str(e)}")
        raise


# SQL schema reference for documentation
SCHEMA_DEFINITION = """
-- Tasks table with indexes for optimal query performance
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY,
    user_id VARCHAR(256) NOT NULL,
    title VARCHAR(500) NOT NULL,
    description VARCHAR(5000),
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT chk_title_length CHECK (LENGTH(title) > 0 AND LENGTH(title) <= 500),
    CONSTRAINT chk_description_length CHECK (description IS NULL OR LENGTH(description) <= 5000),
    CONSTRAINT chk_completed_bool CHECK (completed IN (true, false))
);

-- Indexes for query optimization
CREATE INDEX IF NOT EXISTS idx_user_tasks ON tasks(user_id, completed);
CREATE INDEX IF NOT EXISTS idx_user_created ON tasks(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_updated ON tasks(updated_at DESC);
"""
