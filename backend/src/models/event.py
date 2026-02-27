"""
TaskEvent entity for event sourcing and audit trail.

Implements SQLModel entity for capturing all task state changes.
Events are immutable and append-only - no UPDATE or DELETE operations allowed.
"""

from typing import Optional, Dict, Any
from datetime import datetime, timezone
from uuid import UUID, uuid4
from sqlmodel import SQLModel, Field, DateTime, JSON


class TaskEvent(SQLModel, table=True):
    """
    TaskEvent entity for event sourcing.

    Captures all state changes to tasks for audit trail, real-time synchronization,
    and event-driven architecture. Events are published to Dapr Pub/Sub for
    distribution to interested subscribers (WebSocket gateway, recurring service, etc.).

    Event Types:
        - task.created: New task created
        - task.updated: Task modified
        - task.completed: Task marked as completed
        - task.deleted: Task removed
        - task.recurring_instance_created: New recurring instance generated

    Attributes:
        id: Unique event identifier (UUID)
        event_type: Type of event (e.g., "task.created")
        aggregate_id: Task ID (aggregate root)
        user_id: User who triggered the event
        version: Task version at time of event
        payload: Event payload with before/after snapshots
        timestamp: UTC timestamp when event occurred
        correlation_id: Optional ID to group related events
    """

    __tablename__ = "task_event"

    # Primary Key
    id: Optional[UUID] = Field(
        default_factory=uuid4,
        primary_key=True,
        description="Unique event identifier"
    )

    # Event Type
    event_type: str = Field(
        ...,
        max_length=50,
        description="Event type: task.created, task.updated, task.completed, task.deleted"
    )

    # Aggregate Root (Task ID)
    aggregate_id: UUID = Field(
        ...,
        index=True,
        description="Task ID (aggregate root)"
    )

    # User who triggered the event (stored as string to avoid FK constraint issues with Better Auth user IDs)
    user_id: str = Field(
        ...,
        index=True,
        description="User who triggered the event"
    )

    # Version at time of event
    version: int = Field(
        ...,
        ge=1,
        description="Task version at time of event"
    )

    # Event Payload (JSONB)
    payload: Dict[str, Any] = Field(
        ...,
        sa_type=JSON,
        description="Event payload with before/after snapshots"
    )

    # Timestamp
    timestamp: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_type=DateTime(timezone=True),
        description="UTC timestamp when event occurred"
    )

    # Correlation ID for tracing
    correlation_id: Optional[UUID] = Field(
        default=None,
        index=True,
        description="Groups related events for distributed tracing"
    )

    model_config = {"validate_assignment": True}


# Pydantic schemas for API I/O

class TaskEventCreate(SQLModel):
    """Schema for creating a new task event"""
    event_type: str = Field(..., description="Event type")
    aggregate_id: UUID = Field(..., description="Task ID")
    user_id: UUID = Field(..., description="User ID")
    version: int = Field(..., description="Task version")
    payload: Dict[str, Any] = Field(..., description="Event payload")
    correlation_id: Optional[UUID] = Field(default=None, description="Correlation ID")


class TaskEventResponse(SQLModel):
    """Schema for task event responses"""
    id: UUID = Field(..., description="Event ID")
    event_type: str = Field(..., description="Event type")
    aggregate_id: UUID = Field(..., description="Task ID")
    user_id: UUID = Field(..., description="User ID")
    version: int = Field(..., description="Task version")
    payload: Dict[str, Any] = Field(..., description="Event payload")
    timestamp: datetime = Field(..., description="Event timestamp")
    correlation_id: Optional[UUID] = Field(..., description="Correlation ID")
