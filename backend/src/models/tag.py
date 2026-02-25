from typing import Optional, List, TYPE_CHECKING
from datetime import datetime, timezone
from uuid import UUID, uuid4
from sqlmodel import SQLModel, Field, DateTime, Relationship
import re

if TYPE_CHECKING:
    from src.models.task_tag import TaskTag

# Database Model: Kept simple to avoid "unhashable type" error
class Tag(SQLModel, table=True):
    __tablename__ = "tag"

    id: Optional[UUID] = Field(
        default_factory=uuid4,
        primary_key=True,
        description="Unique tag identifier"
    )

    user_id: str = Field(
        index=True,
        max_length=256,
        description="Tag owner for user isolation"
    )

    name: str = Field(
        max_length=50,
        description="Tag name (e.g., work, urgent)"
    )

    # Simplified color field (removed Annotated/StringConstraints here)
    color: str = Field(
        default="#6B7280",
        max_length=7,
        description="Hex color for UI display"
    )

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        # Use sa_type inside Field or define sa_column carefully
        sa_type=DateTime(timezone=True),
        description="UTC creation timestamp"
    )

    # Relationship with task_tags
    task_tags: List["TaskTag"] = Relationship(back_populates="tag")

# API Schemas: You can keep stricter validation here if needed,
# but for maximum safety with Pydantic v2, simple types are best.
class TagCreate(SQLModel):
    name: str = Field(..., min_length=1, max_length=50)
    color: str = Field(default="#6B7280", max_length=7)

class TagUpdate(SQLModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=50)
    color: Optional[str] = Field(default=None, max_length=7)

class TagResponse(SQLModel):
    id: UUID
    user_id: str
    name: str
    color: str
    created_at: datetime
    task_count: int = Field(default=0)