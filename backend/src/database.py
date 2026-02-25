import os
import time
from sqlmodel import SQLModel, create_engine, Session
from sqlalchemy import event, text
from dotenv import load_dotenv
from pathlib import Path

# Import all models
from src.models.user import User
from src.models.task import Task
from src.models.chat import ChatSession, ChatMessage
from src.models.tag import Tag
from src.models.task_tag import TaskTag
from src.models.reminder import Reminder
from src.models.event import TaskEvent

# Load environment variables
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

def create_neon_engine():
    """Create database engine with Neon-specific configuration"""
    if not DATABASE_URL:
        # Fallback for local testing if no URL is provided
        return create_engine("sqlite:///dummy.db", echo=True, connect_args={"check_same_thread": False})

    engine_args = {
        "echo": True,
        "pool_size": 1,
        "max_overflow": 4,
        "pool_pre_ping": True,
        "pool_recycle": 300,
        "pool_timeout": 30,
        "max_identifier_length": 63,
        "connect_args": {
            "connect_timeout": 30,
        },
    }

    # Only add SSL if using Neon/Postgres
    if "postgresql" in DATABASE_URL or "neon.tech" in DATABASE_URL:
        engine_args["connect_args"]["sslmode"] = "require"

    return create_engine(DATABASE_URL, **engine_args)

engine = create_neon_engine()

# --- FIXED SECTION: Removing the context manager error ---
@event.listens_for(engine, "connect")
def receive_connect(dbapi_conn, connection_record):
    """Handle connection setup safely for both SQLite and Postgres"""
    cursor = dbapi_conn.cursor()
    try:
        # Check if we are connected to Postgres (Neon)
        # SQLite cursors don't support these SET commands
        if DATABASE_URL and "postgresql" in DATABASE_URL:
            cursor.execute("SET idle_in_transaction_session_timeout = 30000;")
            cursor.execute("SET statement_timeout = 30000;")
            cursor.execute("SET timezone = 'UTC';")
        else:
            # If fallback to SQLite, enable foreign keys
            cursor.execute("PRAGMA foreign_keys=ON;")
    except Exception as e:
        print(f"[DB] Connection setup notice: {e}")
    finally:
        # Manually closing the cursor avoids the Context Manager TypeError
        cursor.close()

@event.listens_for(engine, "checkout")
def receive_checkout(dbapi_conn, connection_record, connection_proxy):
    pass

def run_migrations():
    """Run SQL migrations from backend/src/db/migrations/ directory"""
    migrations_dir = Path(__file__).parent / "db" / "migrations"
    
    if not migrations_dir.exists():
        return
    
    migration_files = sorted(migrations_dir.glob("*.sql"))
    if not migration_files:
        return
    
    with engine.connect() as conn:
        for migration_file in migration_files:
            try:
                with open(migration_file, 'r') as f:
                    sql = f.read()
                # Use text() for SQLAlchemy 2.0 compatibility
                conn.execute(text(sql))
                conn.commit()
                print(f"[DB] OK Migration {migration_file.name} completed")
            except Exception as e:
                print(f"[DB] FAIL Migration {migration_file.name}: {str(e)}")
                raise

def create_db_and_tables():
    """Create database tables with retry logic"""
    max_retries = 5
    for attempt in range(max_retries):
        try:
            # Test connection
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            
            SQLModel.metadata.create_all(engine)
            print(f"Database tables verified/created on attempt {attempt + 1}")
            return
        except Exception as e:
            print(f"Database connection attempt {attempt + 1} failed: {str(e)}")
            if attempt < max_retries - 1:
                time.sleep(min(2 ** attempt, 10))
            else:
                raise

def get_db():
    with Session(engine) as session:
        yield session

get_session = get_db

if __name__ == "__main__":
    run_migrations()
    create_db_and_tables()