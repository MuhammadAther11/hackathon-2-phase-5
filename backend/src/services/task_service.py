import logging
from sqlmodel import Session, select
from typing import List, Optional
from uuid import UUID
from src.models.task import Task, TaskCreate, TaskUpdate
from src.models.task_tag import TaskTag
from .event_publisher import event_publisher

logger = logging.getLogger(__name__)


def get_user_tasks(*, session: Session, user_id: str) -> List[Task]:
    """Get all tasks for a specific user."""
    tasks = session.exec(
        select(Task).where(Task.user_id == user_id)
    ).all()
    return tasks


async def create_task(*, session: Session, task_create: TaskCreate, user_id: str, tag_ids: Optional[List[str]] = None) -> Task:
    """Create a new task for a user with optional tags."""
    # Exclude 'tags' field — it's a schema-only field, not a DB column
    task_data = task_create.model_dump(exclude={"tags"})
    task = Task(**task_data, user_id=user_id)
    session.add(task)
    session.commit()
    session.refresh(task)

    # Associate tags if provided
    if tag_ids:
        for tag_id_str in tag_ids:
            try:
                tag_id = UUID(tag_id_str)
                task_tag = TaskTag(task_id=task.id, tag_id=tag_id)
                session.add(task_tag)
            except (ValueError, AttributeError):
                # Skip invalid tag IDs
                continue
        session.commit()
        session.refresh(task)

    # Publish event after successful creation (non-blocking)
    try:
        await event_publisher.publish_task_created(
            task_id=task.id,
            user_id=user_id,
            payload={
                "title": task.title,
                "description": task.description,
                "status": task.status,
                "priority": task.priority,
                "due_date": task.due_date.isoformat() if task.due_date else None,
                "recurrence_rule": task.recurrence_rule,
                "version": task.version,
            }
        )
    except Exception as e:
        logger.warning(f"[task_service] event publish failed: {e}")

    return task


def get_task_by_id(*, session: Session, task_id: UUID, user_id: str) -> Optional[Task]:
    """Get a specific task by ID if it belongs to the user."""
    task = session.get(Task, task_id)
    if task and str(task.user_id) == user_id:
        return task
    return None


async def update_task(*, session: Session, task_id: UUID, task_update: TaskUpdate, user_id: str, tag_ids: Optional[List[str]] = None) -> Optional[Task]:
    """Update a task if it belongs to the user, with optional tag updates."""
    db_task = session.get(Task, task_id)
    if not db_task or str(db_task.user_id) != user_id:
        return None

    from datetime import datetime, timezone
    task_data = task_update.model_dump(exclude_unset=True, exclude={"tags"})
    for key, value in task_data.items():
        setattr(db_task, key, value)
    db_task.updated_at = datetime.now(timezone.utc)

    # Update tags if provided
    if tag_ids is not None:
        # Remove existing tag associations
        existing_tags = session.exec(
            select(TaskTag).where(TaskTag.task_id == task_id)
        ).all()
        for tag_link in existing_tags:
            session.delete(tag_link)
        
        # Add new tag associations
        for tag_id_str in tag_ids:
            try:
                tag_id = UUID(tag_id_str)
                task_tag = TaskTag(task_id=task_id, tag_id=tag_id)
                session.add(task_tag)
            except (ValueError, AttributeError):
                # Skip invalid tag IDs
                continue

    session.add(db_task)
    session.commit()
    session.refresh(db_task)

    # Publish event after successful update (non-blocking)
    try:
        await event_publisher.publish_task_updated(
            task_id=db_task.id,
            user_id=user_id,
            payload={
                "title": db_task.title,
                "description": db_task.description,
                "status": db_task.status,
                "priority": db_task.priority,
                "due_date": db_task.due_date.isoformat() if db_task.due_date else None,
                "recurrence_rule": db_task.recurrence_rule,
                "version": db_task.version,
            }
        )
    except Exception as e:
        logger.warning(f"[task_service] event publish failed: {e}")

    return db_task


async def delete_task(*, session: Session, task_id: UUID, user_id: str) -> bool:
    """Delete a task if it belongs to the user."""
    db_task = session.get(Task, task_id)
    if not db_task or str(db_task.user_id) != user_id:
        return False

    session.delete(db_task)
    session.commit()

    # Publish event after successful deletion (non-blocking)
    try:
        await event_publisher.publish_task_deleted(
            task_id=db_task.id,
            user_id=user_id,
            payload={
                "title": db_task.title,
                "status": db_task.status,
            }
        )
    except Exception as e:
        logger.warning(f"[task_service] event publish failed: {e}")

    return True


async def toggle_task_completion(*, session: Session, task_id: UUID, user_id: str) -> Optional[Task]:
    """Toggle the completion status of a task if it belongs to the user."""
    db_task = session.get(Task, task_id)
    if not db_task or str(db_task.user_id) != user_id:
        return None

    if db_task.status == "completed":
        db_task.status = "pending"
        db_task.completed = False
    else:
        db_task.status = "completed"
        db_task.completed = True

    session.add(db_task)
    session.commit()
    session.refresh(db_task)

    # Publish event after successful toggle (non-blocking)
    try:
        await event_publisher.publish_task_completed(
            task_id=db_task.id,
            user_id=user_id,
            payload={
                "title": db_task.title,
                "status": db_task.status,
                "completed": db_task.completed,
            }
        )
    except Exception as e:
        logger.warning(f"[task_service] event publish failed: {e}")

    return db_task
