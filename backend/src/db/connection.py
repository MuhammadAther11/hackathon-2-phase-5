"""
Database connection configuration with async support.

Provides SQLAlchemy async engine with asyncpg driver configured for Neon PostgreSQL.
Features:
- Async/await support via asyncpg
- Connection pooling optimized for serverless (pool_size=10, max_overflow=5)
- Connection pre-ping to detect stale connections
- SSL support for Neon
"""

import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncEngine
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get database URL from environment
DATABASE_URL = os.getenv("DATABASE_URL")

# Log configuration on startup (with masked sensitive data)
if DATABASE_URL:
    masked_url = DATABASE_URL.split("@")[0] + "@***" if "@" in DATABASE_URL else "***"
    print(f"[DB] Async database configured: {masked_url}")
else:
    print("[DB] WARNING: DATABASE_URL not set. Database operations will fail.")


def create_async_db_engine() -> AsyncEngine:
    """
    Create async SQLAlchemy engine for Neon PostgreSQL.

    Configuration:
    - Driver: asyncpg (async PostgreSQL driver)
    - Pool size: 10 (optimized for serverless)
    - Max overflow: 5 (allow temporary overflow for bursts)
    - Pre-ping: True (verify connections before use)
    - Echo: False (disable SQL logging by default, set via LOG_LEVEL)

    Returns:
        AsyncEngine: Configured async engine ready for use

    Raises:
        Exception: If DATABASE_URL is not configured
    """
    if not DATABASE_URL:
        raise ValueError(
            "DATABASE_URL environment variable not configured. "
            "Set it to: postgresql+asyncpg://user:password@host:port/dbname"
        )

    # Ensure the URL uses asyncpg driver
    if "postgresql://" in DATABASE_URL:
        database_url = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")
    elif "postgres://" in DATABASE_URL:
        database_url = DATABASE_URL.replace("postgres://", "postgresql+asyncpg://")
    else:
        database_url = DATABASE_URL

    # Create async engine with connection pooling optimized for Neon
    engine = create_async_engine(
        database_url,
        echo=False,  # Set to True to log all SQL; control via LOG_LEVEL in config
        pool_size=10,
        max_overflow=5,
        pool_pre_ping=True,
        pool_recycle=300,  # Recycle connections every 5 minutes
        connect_args={
            "connect_timeout": 30,
            "sslmode": "require",  # Neon requires SSL
            "keepalives": 1,
            "keepalives_idle": 30,
            "keepalives_interval": 10,
            "keepalives_count": 5,
        },
    )

    return engine


# Create global engine instance
engine: AsyncEngine = create_async_db_engine()


async def dispose_engine():
    """
    Dispose of engine and close all connections.

    Call this at application shutdown.
    """
    await engine.dispose()
