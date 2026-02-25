"""
Reminder entity for scheduled task notifications.

Implements SQLModel entity with field validation and Dapr Jobs API integration.
Reminders are triggered via Dapr Jobs API at the scheduled trigger_time.
"""

from typing import Optional
from datetime import datetime, timezone
from uuid import UUID, uuid4
from sqlmodel import SQLModel, Field, DateTime


class Reminder(SQLModel, table=True):
    """
    Reminder entity persisted in PostgreSQL.

    Scheduled notifications for tasks. Each reminder is associated with a task
    and has a trigger time. When the trigger time arrives, Dapr Jobs API
    calls the notification endpoint to deliver the reminder.

    Attributes:
        id: Unique reminder identifier (UUID)
        task_id: Associated task (foreign key)
        trigger_time: When to trigger notification in UTC
        delivered: Whether reminder has been delivered
        delivered_at: When reminder was actually delivered
        created_at: UTC timestamp when reminder was created
    """

    __tablename__ = "reminder"

    # Primary Key
    id: Optional[UUID] = Field(
        default_factory=uuid4,
        primary_key=True,
        description="Unique reminder identifier"
    )

    # Foreign Key (Task)
    task_id: UUID = Field(
        ...,
        foreign_key="tasks.id",
        ondelete="CASCADE",
        index=True,
        description="Associated task"
    )

    # Trigger time (must be in future)
    trigger_time: datetime = Field(
        ...,
        sa_type=DateTime(timezone=True),
        description="When to trigger notification in UTC"
    )

    # Delivery status
    delivered: bool = Field(
        default=False,
        description="Whether reminder has been delivered"
    )
    delivered_at: Optional[datetime] = Field(
        default=None,
        sa_type=DateTime(timezone=True),
        description="When reminder was actually delivered"
    )

    # Timestamp
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_type=DateTime(timezone=True),
        description="UTC creation timestamp"
    )

    model_config = {"validate_assignment": True}


# Pydantic schemas for API I/O

class ReminderCreate(SQLModel):
    """Schema for creating a new reminder"""
    task_id: UUID = Field(..., description="Associated task ID")
    trigger_time: datetime = Field(..., description="Trigger time in UTC")


class ReminderUpdate(SQLModel):
    """Schema for updating a reminder"""
    trigger_time: Optional[datetime] = Field(
        default=None,
        description="New trigger time in UTC"
    )


class ReminderResponse(SQLModel):
    """Schema for reminder responses"""
    id: UUID = Field(..., description="Reminder ID")
    task_id: UUID = Field(..., description="Associated task ID")
    trigger_time: datetime = Field(..., description="Trigger time in UTC")
    delivered: bool = Field(..., description="Delivery status")
    delivered_at: Optional[datetime] = Field(..., description="Delivery timestamp")
    created_at: datetime = Field(..., description="Creation timestamp")
