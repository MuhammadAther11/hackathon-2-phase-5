from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import SQLAlchemyError
import os
import traceback

from src.api.tasks import router as tasks_router
from src.api.auth import router as auth_router
from src.api.chat import router as chat_router
from src.database import run_migrations, create_db_and_tables

# Import new routers for advanced features
from src.api.tags import router as tags_router
from src.api.search import router as search_router
from src.api.reminders import router as reminders_router

# 1. FIXED: Added separate_input_output_schemas=False
# This prevents the "unhashable type: 'FieldInfoMetadata'" error caused by SQLModel + Pydantic v2
app = FastAPI(
    title="Task Management API - Phase V",
    version="5.0.0",
    root_path=os.getenv("ROOT_PATH", ""),
    servers=[
        {"url": "https://atherali11-todo-advanced-features.hf.space", "description": "Hugging Face Spaces (Production)"},
        {"url": "http://localhost:8000", "description": "Local Development"},
    ],
    separate_input_output_schemas=False  # CRITICAL FIX
)

@app.on_event("startup")
def on_startup():
    """Initialize database and run migrations on startup"""
    try:
        print("[STARTUP] Initializing database tables...")
        create_db_and_tables()
        print("[STARTUP] Database tables initialized successfully")
        
        print("[STARTUP] Running SQL migrations...")
        run_migrations()
        print("[STARTUP] Database migrations completed successfully")
        
        daprd_endpoint = os.getenv("DAPR_HTTP_ENDPOINT", "http://localhost:3500")
        print(f"[STARTUP] Dapr HTTP endpoint: {daprd_endpoint}")
        
    except Exception as e:
        print(f"[STARTUP] ERROR: Database initialization failed: {str(e)}")
        traceback.print_exc()

app.add_middleware(
    CORSMiddleware,
       allow_origins=[
        "https://hackathon-2-phase-5-jet.vercel.app",
        "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. FIXED: Included routers with consistent tagging
app.include_router(auth_router, prefix="/auth")
# IMPORTANT: search_router MUST be registered BEFORE tasks_router
# because /{user_id}/tasks/search would otherwise match /{user_id}/tasks/{id}
app.include_router(search_router, prefix="/api")
app.include_router(tasks_router, prefix="/api")
app.include_router(chat_router, prefix="/chat")
app.include_router(tags_router, prefix="/api")
app.include_router(reminders_router, prefix="/api")

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": exc.errors(), "body": exc.body},
    )

@app.exception_handler(SQLAlchemyError)
async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
    print(f"SQLAlchemy Error: {exc}")
    traceback.print_exc()
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": f"Database error occurred: {str(exc)}"},
    )

@app.get("/", tags=["General"])
async def root():
    return {
        "message": "Welcome to the Task Management API - Phase V",
        "version": "5.0.0",
        "docs_url": "/docs",
        "features": ["priorities", "tags", "search", "filter", "sort", "due_dates", "recurring", "reminders", "realtime_sync"]
    }

@app.get("/health", tags=["General"])
async def health():
    health_status = {
        "status": "ok",
        "service": "Task Management API",
        "version": "5.0.0",
        "dapr": {
            "enabled": bool(os.getenv("DAPR_HTTP_ENDPOINT")),
            "endpoint": os.getenv("DAPR_HTTP_ENDPOINT", "not configured")
        }
    }
    
    if os.getenv("DAPR_HTTP_ENDPOINT"):
        try:
            from dapr.clients import DaprClient
            with DaprClient() as client:
                metadata = client.get_metadata()
                health_status["dapr"]["connected"] = True
                health_status["dapr"]["sidecar_version"] = metadata.version
        except Exception as e:
            health_status["dapr"]["connected"] = False
            health_status["dapr"]["error"] = str(e)
    
    return health_status

@app.get("/debug/config", tags=["Debug"])
async def debug_config():
    return {
        "has_database_url": bool(os.getenv("DATABASE_URL")),
        "has_better_auth_secret": bool(os.getenv("BETTER_AUTH_SECRET")),
        "secret_length": len(os.getenv("BETTER_AUTH_SECRET", "")),
        "frontend_url": os.getenv("FRONTEND_URL", "not set"),
        "dapr_http_endpoint": os.getenv("DAPR_HTTP_ENDPOINT", "not set")
    }