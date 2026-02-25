from typing import Optional, List, Dict, Any, TYPE_CHECKING
from datetime import datetime, timezone
from uuid import UUID, uuid4
from sqlmodel import SQLModel, Field, Relationship, DateTime, JSON

if TYPE_CHECKING:
    from src.models.task_tag import TaskTag

class Task(SQLModel, table=True):
    __tablename__ = "tasks"

    # Primary Key
    id: Optional[UUID] = Field(
        default_factory=uuid4,
        primary_key=True,
        description="Unique task identifier (UUID v4)"
    )

    # Foreign Key (User)
    user_id: str = Field(
        index=True,
        max_length=256,
        description="Owner of the task"
    )

    # Core Fields
    title: str = Field(
        max_length=500,
        description="Task title"
    )
    description: Optional[str] = Field(
        default=None,
        max_length=5000,
        description="Task description"
    )

    status: str = Field(
        default="pending",
        max_length=20,
        description="Task status"
    )

    priority: int = Field(
        default=2,
        ge=1,
        le=4,
        description="Task priority"
    )

    # FIXED: Use sa_type instead of sa_column to avoid FieldInfoMetadata error
    due_date: Optional[datetime] = Field(
        default=None,
        sa_type=DateTime(timezone=True),
        description="Task deadline in UTC"
    )

    # FIXED: Use sa_type=JSON to prevent hashing crash in Pydantic v2
    recurrence_rule: Optional[Dict[str, Any]] = Field(
        default=None,
        sa_type=JSON,
        description="Recurrence configuration"
    )

    version: int = Field(
        default=1,
        description="Optimistic locking version"
    )

    # Timestamps
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_type=DateTime(timezone=True),
        description="UTC creation timestamp"
    )
    
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_type=DateTime(timezone=True),
        description="UTC last modified timestamp"
    )

    completed: Optional[bool] = Field(
        default=False,
        description="Legacy flag"
    )

    # Relationship
    task_tags: List["TaskTag"] = Relationship(
        back_populates="task",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )

    # Pydantic v2 Configuration
    model_config = {
        "validate_assignment": True,
        "arbitrary_types_allowed": True
    }

# --- API Schemas ---

class TaskCreate(SQLModel):
    title: str = Field(..., min_length=1, max_length=500)
    description: Optional[str] = None
    priority: Optional[int] = 2
    due_date: Optional[datetime] = None
    recurrence_rule: Optional[Dict[str, Any]] = None
    tags: Optional[List[str]] = None

class TaskUpdate(SQLModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[int] = None
    due_date: Optional[datetime] = None
    recurrence_rule: Optional[Dict[str, Any]] = None
    version: Optional[int] = None
    tags: Optional[List[str]] = None

class TaskTagInfo(SQLModel):
    """Minimal tag info embedded in task responses."""
    id: UUID
    name: str
    color: str

class TaskResponse(SQLModel):
    id: UUID
    user_id: str
    title: str
    description: Optional[str]
    status: str
    priority: int
    due_date: Optional[datetime]
    recurrence_rule: Optional[Dict[str, Any]] = None
    version: int
    created_at: datetime
    updated_at: datetime
    tags: List[TaskTagInfo] = []

class TaskListResponse(SQLModel):
    tasks: List[TaskResponse]
    count: int