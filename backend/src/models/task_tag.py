"""
TaskTag junction entity for many-to-many relationship between tasks and tags.

Implements SQLModel junction table with cascade delete and unique constraints.
"""

from typing import Optional, TYPE_CHECKING
from datetime import datetime, timezone
from uuid import UUID, uuid4
from sqlmodel import SQLModel, Field, DateTime, Relationship

if TYPE_CHECKING:
    from src.models.task import Task
    from src.models.tag import Tag


class TaskTag(SQLModel, table=True):
    """
    TaskTag junction table for many-to-many relationship.

    Associates tasks with tags. Each task can have multiple tags,
    and each tag can be associated with multiple tasks.
    Cascade delete: if a task or tag is deleted, the association is removed.
    """

    __tablename__ = "task_tag"

    # Primary Key
    id: Optional[UUID] = Field(
        default_factory=uuid4,
        primary_key=True,
        description="Unique junction identifier"
    )

    # Foreign Keys (cascade delete)
    task_id: UUID = Field(
        ...,
        foreign_key="tasks.id",
        ondelete="CASCADE",
        index=True,
        description="Reference to task"
    )

    tag_id: UUID = Field(
        ...,
        foreign_key="tag.id",
        ondelete="CASCADE",
        index=True,
        description="Reference to tag"
    )

    # Timestamp
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="UTC creation timestamp"
    )

    # Relationships
    task: Optional["Task"] = Relationship(back_populates="task_tags")
    tag: Optional["Tag"] = Relationship(back_populates="task_tags")

    model_config = {"validate_assignment": True}


# Pydantic schemas for API I/O
class TaskTagCreate(SQLModel):
    """Schema for creating a task-tag association"""
    task_id: UUID = Field(..., description="Task ID")
    tag_id: UUID = Field(..., description="Tag ID")


class TaskTagResponse(SQLModel):
    """Schema for task-tag response"""
    id: UUID = Field(..., description="Junction ID")
    task_id: UUID = Field(..., description="Task ID")
    tag_id: UUID = Field(..., description="Tag ID")
    created_at: datetime = Field(..., description="Creation timestamp")
