from sqlmodel import Session, select
from typing import List, Optional
from uuid import UUID

from src.models.reminder import Reminder, ReminderCreate, ReminderUpdate, ReminderResponse
from src.models.task import Task
from .event_publisher import event_publisher


def get_task_reminders(*, session: Session, task_id: UUID, user_id: str) -> List[ReminderResponse]:
    """Get all reminders for a specific task that belongs to the user."""
    # Verify task belongs to user first
    task = session.get(Task, task_id)
    if not task or task.user_id != user_id:
        return []

    reminders = session.exec(
        select(Reminder).where(Reminder.task_id == task_id)
    ).all()

    return [ReminderResponse(
        id=r.id,
        task_id=r.task_id,
        trigger_time=r.trigger_time,
        delivered=r.delivered,
        delivered_at=r.delivered_at,
        created_at=r.created_at,
    ) for r in reminders]


async def create_reminder(*, session: Session, reminder_create: ReminderCreate, user_id: str) -> Optional[ReminderResponse]:
    """Create a new reminder for a task that belongs to the user."""
    # Verify task belongs to user
    task = session.get(Task, reminder_create.task_id)
    if not task or task.user_id != user_id:
        return None

    reminder = Reminder(**reminder_create.model_dump())
    session.add(reminder)
    session.commit()
    session.refresh(reminder)

    # Publish event after successful creation
    await event_publisher.publish_task_updated(
        task_id=reminder.task_id,
        user_id=user_id,
        payload={
            "action": "reminder_added",
            "reminder_id": str(reminder.id),
            "trigger_time": reminder.trigger_time.isoformat(),
        }
    )

    return ReminderResponse(
        id=reminder.id,
        task_id=reminder.task_id,
        trigger_time=reminder.trigger_time,
        delivered=reminder.delivered,
        delivered_at=reminder.delivered_at,
        created_at=reminder.created_at,
    )


def get_reminder_by_id(*, session: Session, reminder_id: UUID, user_id: str) -> Optional[ReminderResponse]:
    """Get a specific reminder if it belongs to a task owned by the user."""
    reminder = session.get(Reminder, reminder_id)
    if not reminder:
        return None

    task = session.get(Task, reminder.task_id)
    if not task or task.user_id != user_id:
        return None

    return ReminderResponse(
        id=reminder.id,
        task_id=reminder.task_id,
        trigger_time=reminder.trigger_time,
        delivered=reminder.delivered,
        delivered_at=reminder.delivered_at,
        created_at=reminder.created_at,
    )


async def update_reminder(*, session: Session, reminder_id: UUID, reminder_update: ReminderUpdate, user_id: str) -> Optional[ReminderResponse]:
    """Update a reminder if it belongs to a task owned by the user."""
    reminder = session.get(Reminder, reminder_id)
    if not reminder:
        return None

    task = session.get(Task, reminder.task_id)
    if not task or task.user_id != user_id:
        return None

    for key, value in reminder_update.model_dump(exclude_unset=True).items():
        setattr(reminder, key, value)

    session.add(reminder)
    session.commit()
    session.refresh(reminder)

    # Publish event after successful update
    await event_publisher.publish_task_updated(
        task_id=reminder.task_id,
        user_id=user_id,
        payload={
            "action": "reminder_updated",
            "reminder_id": str(reminder.id),
            "trigger_time": reminder.trigger_time.isoformat(),
        }
    )

    return ReminderResponse(
        id=reminder.id,
        task_id=reminder.task_id,
        trigger_time=reminder.trigger_time,
        delivered=reminder.delivered,
        delivered_at=reminder.delivered_at,
        created_at=reminder.created_at,
    )


async def delete_reminder(*, session: Session, reminder_id: UUID, user_id: str) -> bool:
    """Delete a reminder if it belongs to a task owned by the user."""
    reminder = session.get(Reminder, reminder_id)
    if not reminder:
        return False

    task = session.get(Task, reminder.task_id)
    if not task or task.user_id != user_id:
        return False

    session.delete(reminder)
    session.commit()

    # Publish event after successful deletion
    await event_publisher.publish_task_updated(
        task_id=reminder.task_id,
        user_id=user_id,
        payload={
            "action": "reminder_removed",
            "reminder_id": str(reminder.id),
        }
    )

    return True


def mark_reminder_delivered(*, session: Session, reminder_id: UUID) -> bool:
    """Mark a reminder as delivered with current timestamp."""
    reminder = session.get(Reminder, reminder_id)
    if not reminder:
        return False

    from datetime import datetime, timezone
    reminder.delivered = True
    reminder.delivered_at = datetime.now(timezone.utc)
    session.add(reminder)
    session.commit()
    return True
