"""
MCP (Model Context Protocol) tool definitions for task operations.

Exposes five stateless tools (add_task, list_tasks, complete_task, update_task, delete_task)
for the OpenAI Agents SDK to call. All tools enforce user isolation via JWT-extracted user_id.

Tools follow the Official MCP SDK pattern and return structured JSON responses.
"""

from typing import Optional, List, Dict, Any
from uuid import UUID
from datetime import datetime, timezone, timedelta

# Pakistan Standard Time (UTC+5)
PKT = timezone(timedelta(hours=5))
import logging

logger = logging.getLogger(__name__)


def _parse_natural_language_date(date_str: str) -> Optional[datetime]:
    """Parse natural language date strings to datetime."""
    if not date_str:
        return None
    
    date_lower = date_str.lower().strip()
    now = datetime.now(PKT)
    
    # Today
    if date_lower == "today":
        return now.replace(hour=23, minute=59, second=0, microsecond=0)
    
    # Tomorrow
    if date_lower == "tomorrow":
        return (now + timedelta(days=1)).replace(hour=23, minute=59, second=0, microsecond=0)
    
    # Next week
    if date_lower == "next_week":
        days_until_monday = (7 - now.weekday()) % 7
        if days_until_monday == 0:
            days_until_monday = 7
        return (now + timedelta(days=days_until_monday)).replace(hour=9, minute=0, second=0, microsecond=0)
    
    # Next month
    if date_lower == "next_month":
        # Add ~30 days
        return (now + timedelta(days=30)).replace(hour=23, minute=59, second=0, microsecond=0)
    
    # Weekend
    if date_lower == "weekend":
        days_until_saturday = (5 - now.weekday()) % 7
        if days_until_saturday == 0:
            days_until_saturday = 7
        return (now + timedelta(days=days_until_saturday)).replace(hour=23, minute=59, second=0, microsecond=0)
    
    # Try to parse as MM/DD format
    import re
    date_match = re.search(r"(\d{1,2})/(\d{1,2})", date_str)
    if date_match:
        month, day = int(date_match.group(1)), int(date_match.group(2))
        year = now.year
        try:
            return datetime(year, month, day, 23, 59, 0, 0, tzinfo=PKT)
        except ValueError:
            pass
    
    return None


class TaskToolResponse:
    """Structured response format for all task tools."""

    @staticmethod
    def success(data: Any) -> Dict[str, Any]:
        """Return a success response."""
        return {"status": "success", "data": data}

    @staticmethod
    def error(code: str, message: str, details: Optional[Dict] = None) -> Dict[str, Any]:
        """Return an error response."""
        return {
            "status": "error",
            "error": {
                "code": code,
                "message": message,
                "details": details or {}
            }
        }

    @staticmethod
    def _to_pkt(dt: datetime) -> str:
        """Convert a datetime to Pakistan Standard Time (Asia/Karachi) ISO string."""
        if dt is None:
            return None
        # If naive, assume UTC
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.astimezone(PKT).isoformat()

    @staticmethod
    def task_to_dict(task, reminder=None) -> Dict[str, Any]:
        """Convert Task SQLModel to JSON-serializable dict with PKT timestamps."""
        if task is None:
            return None
        d = {
            "id": str(task.id),
            "user_id": task.user_id,
            "title": task.title,
            "description": task.description,
            "status": getattr(task, "status", "pending"),
            "priority": getattr(task, "priority", 2),
            "completed": task.completed,
            "due_date": TaskToolResponse._to_pkt(task.due_date) if getattr(task, "due_date", None) else None,
            "recurrence_rule": getattr(task, "recurrence_rule", None),
            "created_at": TaskToolResponse._to_pkt(task.created_at),
            "updated_at": TaskToolResponse._to_pkt(task.updated_at),
            "reminder": None,
        }
        if reminder:
            d["reminder"] = {
                "id": str(reminder.id),
                "trigger_time": TaskToolResponse._to_pkt(reminder.trigger_time),
                "delivered": reminder.delivered,
            }
        return d


async def list_tasks_tool(session, user_id: str, status: Optional[str] = None) -> Dict[str, Any]:
    """
    List all tasks for the user, optionally filtered by status.

    Args:
        session: AsyncSession for database access
        user_id: User ID from JWT (enforces user isolation)
        status: Optional filter - "pending", "completed", or "all" (default: all)

    Returns:
        {status: "success", data: [{task1}, {task2}, ...]}
        or {status: "error", error: {code, message, details}}
    """
    try:
        # Validate status parameter
        if status and status not in ["pending", "completed", "all"]:
            logger.warning(f"[list_tasks] user_id={user_id} invalid_status={status}")
            return TaskToolResponse.error(
                "INVALID_STATUS",
                f"Status must be 'pending', 'completed', or 'all', got '{status}'",
                {"received": status}
            )

        # Import here to avoid circular imports
        from src.services.task_service import get_user_tasks
        from src.models.task import Task
        from src.models.reminder import Reminder
        from sqlmodel import select

        # Get all tasks for user
        tasks = get_user_tasks(session=session, user_id=user_id)

        # Filter by status if requested
        if status == "pending":
            tasks = [t for t in tasks if not t.completed]
        elif status == "completed":
            tasks = [t for t in tasks if t.completed]

        # Fetch reminders for all tasks in one query
        task_ids = [t.id for t in tasks]
        reminders_by_task = {}
        if task_ids:
            reminder_rows = session.exec(
                select(Reminder)
                .where(Reminder.task_id.in_(task_ids))
                .where(Reminder.delivered == False)
                .order_by(Reminder.trigger_time.asc())
            ).all()
            for r in reminder_rows:
                # Keep only the earliest upcoming reminder per task
                if str(r.task_id) not in reminders_by_task:
                    reminders_by_task[str(r.task_id)] = r

        # Convert to JSON-serializable format
        result = [TaskToolResponse.task_to_dict(t, reminders_by_task.get(str(t.id))) for t in tasks]

        logger.info(f"[list_tasks] user_id={user_id} status={status} count={len(result)}")
        return TaskToolResponse.success(result)

    except Exception as e:
        logger.error(f"[list_tasks] user_id={user_id} error={str(e)}")
        try:
            session.rollback()
        except Exception:
            pass
        return TaskToolResponse.error(
            "INTERNAL_ERROR",
            "Failed to list tasks",
            {"error": str(e)}
        )


async def add_task_tool(session, user_id: str, title: str, description: Optional[str] = None, priority: Optional[int] = None, due_date: Optional[str] = None, tags: Optional[List[str]] = None) -> Dict[str, Any]:
    """
    Create a new task for the user.

    Args:
        session: AsyncSession for database access
        user_id: User ID from JWT (enforces user isolation)
        title: Task title (required, 1-500 characters)
        description: Task description (optional, 0-5000 characters)
        priority: Task priority (optional, 1=Low, 2=Medium, 3=High, 4=Critical)
        due_date: Due date in natural language (optional, e.g., "today", "tomorrow", "next_week")
        tags: List of tag names (optional)

    Returns:
        {status: "success", data: {id, user_id, title, description, completed: false, created_at, updated_at}}
        or {status: "error", error: {code, message, details}}
    """
    try:
        # Validate title
        if not title or not isinstance(title, str):
            logger.warning(f"[add_task] user_id={user_id} missing_title")
            return TaskToolResponse.error(
                "INVALID_TITLE",
                "Title is required and must be a string",
                {"received_type": type(title).__name__}
            )

        if len(title) < 1 or len(title) > 500:
            logger.warning(f"[add_task] user_id={user_id} invalid_title_length={len(title)}")
            return TaskToolResponse.error(
                "INVALID_TITLE",
                "Title must be 1-500 characters",
                {"received_length": len(title)}
            )

        # Validate description
        if description and len(description) > 5000:
            logger.warning(f"[add_task] user_id={user_id} invalid_description_length={len(description)}")
            return TaskToolResponse.error(
                "INVALID_DESCRIPTION",
                "Description must be 0-5000 characters",
                {"received_length": len(description)}
            )

        # Enforce user isolation
        if not user_id:
            logger.error(f"[add_task] missing_user_id")
            return TaskToolResponse.error(
                "UNAUTHORIZED",
                "User not authenticated",
                {}
            )

        # Import here to avoid circular imports
        from src.services.task_service import create_task
        from src.models.task import TaskCreate
        from src.services.tag_service import get_or_create_tags_by_names

        # Parse due date from natural language
        parsed_due_date = _parse_natural_language_date(due_date) if due_date else None

        # Create task
        task_create = TaskCreate(
            title=title,
            description=description,
            priority=priority if priority is not None else 2,
            due_date=parsed_due_date
        )
        
        # Get or create tags
        tag_ids = None
        if tags:
            tag_ids = [str(t.id) for t in get_or_create_tags_by_names(session=session, user_id=user_id, tag_names=tags)]

        task = await create_task(session=session, task_create=task_create, user_id=user_id, tag_ids=tag_ids)

        result = TaskToolResponse.task_to_dict(task)
        logger.info(f"[add_task] user_id={user_id} task_id={task.id}")
        return TaskToolResponse.success(result)

    except Exception as e:
        logger.error(f"[add_task] user_id={user_id} error={str(e)}")
        try:
            session.rollback()
        except Exception:
            pass
        return TaskToolResponse.error(
            "INTERNAL_ERROR",
            "Failed to create task",
            {"error": str(e)}
        )


async def complete_task_tool(session, user_id: str, task_id: str) -> Dict[str, Any]:
    """
    Mark a task as completed.

    Args:
        session: AsyncSession for database access
        user_id: User ID from JWT (enforces user isolation)
        task_id: UUID of the task to complete

    Returns:
        {status: "success", data: {id, ..., completed: true, updated_at}}
        or {status: "error", error: {code, message, details}}
    """
    try:
        # Parse task_id
        try:
            task_uuid = UUID(task_id)
        except (ValueError, TypeError):
            logger.warning(f"[complete_task] user_id={user_id} invalid_task_id={task_id}")
            return TaskToolResponse.error(
                "INVALID_TASK_ID",
                f"Invalid task ID format: {task_id}",
                {"received": task_id}
            )

        # Import here to avoid circular imports
        from src.services.task_service import toggle_task_completion

        # Get task and verify ownership
        task = await toggle_task_completion(session=session, task_id=task_uuid, user_id=user_id)

        if task is None:
            logger.warning(f"[complete_task] user_id={user_id} task_not_found_or_not_owned task_id={task_id}")
            return TaskToolResponse.error(
                "NOT_FOUND",
                "Task not found or user does not own this task",
                {"task_id": task_id}
            )

        # Ensure task is marked as completed
        if not task.completed:
            task.completed = True
            session.add(task)
            session.commit()
            session.refresh(task)

        result = TaskToolResponse.task_to_dict(task)
        logger.info(f"[complete_task] user_id={user_id} task_id={task_id} completed={task.completed}")
        return TaskToolResponse.success(result)

    except Exception as e:
        logger.error(f"[complete_task] user_id={user_id} task_id={task_id} error={str(e)}")
        try:
            session.rollback()
        except Exception:
            pass
        return TaskToolResponse.error(
            "INTERNAL_ERROR",
            "Failed to complete task",
            {"error": str(e)}
        )


async def update_task_tool(
    session, user_id: str, task_id: str, title: Optional[str] = None, description: Optional[str] = None,
    priority: Optional[int] = None, due_date: Optional[str] = None, recurrence_rule: Optional[Dict[str, Any]] = None,
    tags: Optional[List[str]] = None
) -> Dict[str, Any]:
    """
    Update a task's fields (title, description, priority, due_date, recurrence, tags).

    Args:
        session: AsyncSession for database access
        user_id: User ID from JWT (enforces user isolation)
        task_id: UUID of the task to update
        title: New title (optional, 1-500 characters)
        description: New description (optional, 0-5000 characters)
        priority: New priority (optional, 1=Low, 2=Medium, 3=High, 4=Critical)
        due_date: New due date in natural language (optional)
        recurrence_rule: Recurrence configuration (optional)
        tags: List of tag names (optional)

    Returns:
        {status: "success", data: {id, ..., title, description, updated_at}}
        or {status: "error", error: {code, message, details}}
    """
    try:
        # Check if at least one field to update
        if title is None and description is None and priority is None and due_date is None and recurrence_rule is None and tags is None:
            logger.warning(f"[update_task] user_id={user_id} task_id={task_id} no_fields_to_update")
            return TaskToolResponse.error(
                "NO_UPDATE_FIELDS",
                "Must provide at least one field to update (title, description, priority, due_date, recurrence, or tags)",
                {}
            )

        # Validate title if provided
        if title is not None:
            if len(title) < 1 or len(title) > 500:
                logger.warning(f"[update_task] user_id={user_id} task_id={task_id} invalid_title_length={len(title)}")
                return TaskToolResponse.error(
                    "INVALID_TITLE",
                    "Title must be 1-500 characters",
                    {"received_length": len(title)}
                )

        # Validate description if provided
        if description is not None and len(description) > 5000:
            logger.warning(f"[update_task] user_id={user_id} task_id={task_id} invalid_description_length={len(description)}")
            return TaskToolResponse.error(
                "INVALID_DESCRIPTION",
                "Description must be 0-5000 characters",
                {"received_length": len(description)}
            )

        # Validate priority if provided
        if priority is not None and priority not in [1, 2, 3, 4]:
            logger.warning(f"[update_task] user_id={user_id} task_id={task_id} invalid_priority={priority}")
            return TaskToolResponse.error(
                "INVALID_PRIORITY",
                "Priority must be 1 (Low), 2 (Medium), 3 (High), or 4 (Critical)",
                {"received": priority}
            )

        # Parse task_id
        try:
            task_uuid = UUID(task_id)
        except (ValueError, TypeError):
            logger.warning(f"[update_task] user_id={user_id} invalid_task_id={task_id}")
            return TaskToolResponse.error(
                "INVALID_TASK_ID",
                f"Invalid task ID format: {task_id}",
                {"received": task_id}
            )

        # Import here to avoid circular imports
        from src.services.task_service import update_task
        from src.models.task import TaskUpdate
        from src.services.tag_service import get_or_create_tags_by_names

        # Parse due date from natural language
        parsed_due_date = _parse_natural_language_date(due_date) if due_date else None

        # Only include fields that were explicitly provided so that
        # exclude_unset=True in task_service.update_task skips the rest.
        # Passing None explicitly would mark the field as "set" in Pydantic v2
        # and overwrite existing DB values with NULL, causing NOT NULL violations.
        update_fields: Dict[str, Any] = {}
        if title is not None:
            update_fields["title"] = title
        if description is not None:
            update_fields["description"] = description
        if priority is not None:
            update_fields["priority"] = priority
        if parsed_due_date is not None:
            update_fields["due_date"] = parsed_due_date
        if recurrence_rule is not None:
            update_fields["recurrence_rule"] = recurrence_rule

        if not update_fields and tags is None:
            return TaskToolResponse.error(
                "NO_UPDATE_FIELDS",
                "Please specify what to update (title, description, priority, due date, or tags).",
                {}
            )

        task_update = TaskUpdate(**update_fields)
        
        # Get tag IDs if tags provided
        tag_ids = None
        if tags is not None:
            tag_ids = [str(t.id) for t in get_or_create_tags_by_names(session=session, user_id=user_id, tag_names=tags)]
        
        task = await update_task(session=session, task_id=task_uuid, task_update=task_update, user_id=user_id, tag_ids=tag_ids)

        if task is None:
            logger.warning(f"[update_task] user_id={user_id} task_not_found_or_not_owned task_id={task_id}")
            return TaskToolResponse.error(
                "NOT_FOUND",
                "Task not found or user does not own this task",
                {"task_id": task_id}
            )

        result = TaskToolResponse.task_to_dict(task)
        logger.info(f"[update_task] user_id={user_id} task_id={task_id} updated")
        return TaskToolResponse.success(result)

    except Exception as e:
        logger.error(f"[update_task] user_id={user_id} task_id={task_id} error={str(e)}")
        try:
            session.rollback()
        except Exception:
            pass
        return TaskToolResponse.error(
            "INTERNAL_ERROR",
            "Failed to update task",
            {"error": str(e)}
        )


async def delete_task_tool(session, user_id: str, task_id: str) -> Dict[str, Any]:
    """
    Delete a task permanently.

    Args:
        session: AsyncSession for database access
        user_id: User ID from JWT (enforces user isolation)
        task_id: UUID of the task to delete

    Returns:
        {status: "success", data: {message: "Task deleted"}}
        or {status: "error", error: {code, message, details}}
    """
    try:
        # Parse task_id
        try:
            task_uuid = UUID(task_id)
        except (ValueError, TypeError):
            logger.warning(f"[delete_task] user_id={user_id} invalid_task_id={task_id}")
            return TaskToolResponse.error(
                "INVALID_TASK_ID",
                f"Invalid task ID format: {task_id}",
                {"received": task_id}
            )

        # Import here to avoid circular imports
        from src.services.task_service import delete_task

        # Delete task
        success = await delete_task(session=session, task_id=task_uuid, user_id=user_id)

        if not success:
            logger.warning(f"[delete_task] user_id={user_id} task_not_found_or_not_owned task_id={task_id}")
            return TaskToolResponse.error(
                "NOT_FOUND",
                "Task not found or user does not own this task",
                {"task_id": task_id}
            )

        logger.info(f"[delete_task] user_id={user_id} task_id={task_id}")
        return TaskToolResponse.success({"message": "Task deleted"})

    except Exception as e:
        logger.error(f"[delete_task] user_id={user_id} task_id={task_id} error={str(e)}")
        try:
            session.rollback()
        except Exception:
            pass
        return TaskToolResponse.error(
            "INTERNAL_ERROR",
            "Failed to delete task",
            {"error": str(e)}
        )


async def set_reminder_tool(
    session,
    user_id: str,
    task_id: str,
    trigger_time: str,
    update_due_date: bool = True
) -> Dict[str, Any]:
    """
    Set a reminder for a task at a specific time.
    Optionally also updates the task's due_date to match the reminder time.

    Args:
        session: AsyncSession for database access
        user_id: User ID from JWT (enforces user isolation)
        task_id: UUID of the task to set reminder for
        trigger_time: When to trigger the reminder (ISO datetime or natural language)
        update_due_date: If True, also update the task's due_date field

    Returns:
        {status: "success", data: {message: "Reminder set", reminder_id: "..."}}
        or {status: "error", error: {code, message, details}}
    """
    try:
        from sqlmodel import text
        from uuid import uuid4

        # Parse task_id
        try:
            task_uuid = UUID(task_id)
        except (ValueError, TypeError):
            logger.warning(f"[set_reminder] user_id={user_id} invalid_task_id={task_id}")
            return TaskToolResponse.error(
                "INVALID_TASK_ID",
                f"Invalid task ID format: {task_id}",
                {"received": task_id}
            )

        # Parse trigger_time - try ISO format first, then natural language
        trigger_dt: Optional[datetime] = None

        # Try parsing as ISO format
        try:
            # Handle both with and without timezone
            if "T" in trigger_time:
                trigger_dt = datetime.fromisoformat(trigger_time.replace("Z", "+00:00"))
            else:
                # Try natural language parsing
                trigger_dt = _parse_natural_language_date(trigger_time)
        except (ValueError, TypeError):
            # Try natural language parsing
            trigger_dt = _parse_natural_language_date(trigger_time)

        if trigger_dt is None:
            # Default to tomorrow if parsing fails
            trigger_dt = datetime.now(PKT) + timedelta(days=1)
            trigger_dt = trigger_dt.replace(hour=9, minute=0, second=0, microsecond=0)

        # Ensure trigger_dt has timezone info
        if trigger_dt.tzinfo is None:
            trigger_dt = trigger_dt.replace(tzinfo=PKT)

        # Verify task exists and belongs to user
        from src.models.task import Task
        task_result = session.execute(
            text("SELECT id, title FROM tasks WHERE id = :id AND user_id = :user_id"),
            {"id": str(task_uuid), "user_id": user_id}
        ).first()

        if not task_result:
            logger.warning(f"[set_reminder] user_id={user_id} task_not_found_or_not_owned task_id={task_id}")
            return TaskToolResponse.error(
                "NOT_FOUND",
                "Task not found or user does not own this task",
                {"task_id": task_id}
            )

        # Create reminder in the reminder table
        reminder_id = uuid4()
        session.execute(
            text("""
                INSERT INTO reminder (id, task_id, trigger_time, delivered, created_at)
                VALUES (:id, :task_id, :trigger_time, FALSE, :created_at)
            """),
            {
                "id": str(reminder_id),
                "task_id": str(task_uuid),
                "trigger_time": trigger_dt,
                "created_at": datetime.now(timezone.utc)
            }
        )

        # Optionally update the task's due_date to match the reminder
        if update_due_date:
            session.execute(
                text("""
                    UPDATE tasks SET due_date = :due_date, updated_at = :updated_at
                    WHERE id = :id AND user_id = :user_id
                """),
                {
                    "due_date": trigger_dt,
                    "updated_at": datetime.now(timezone.utc),
                    "id": str(task_uuid),
                    "user_id": user_id
                }
            )

        session.commit()

        task_title = task_result.title if task_result else None
        logger.info(f"[set_reminder] user_id={user_id} task_id={task_id} trigger_time={trigger_dt.isoformat()}")
        return TaskToolResponse.success({
            "message": "Reminder set successfully",
            "reminder_id": str(reminder_id),
            "trigger_time": TaskToolResponse._to_pkt(trigger_dt),
            "task_title": task_title,
        })

    except Exception as e:
        logger.error(f"[set_reminder] user_id={user_id} task_id={task_id} error={str(e)}")
        try:
            session.rollback()
        except Exception:
            pass
        return TaskToolResponse.error(
            "INTERNAL_ERROR",
            "Failed to set reminder",
            {"error": str(e)}
        )


# Tool registry for MCP server discovery
TASK_TOOLS = {
    "list_tasks": {
        "name": "list_tasks",
        "description": "List all tasks for the user, optionally filtered by status (pending, completed, or all)",
        "parameters": {
            "type": "object",
            "properties": {
                "user_id": {
                    "type": "string",
                    "description": "User ID from JWT token (automatically extracted)"
                },
                "status": {
                    "type": "string",
                    "enum": ["pending", "completed", "all"],
                    "description": "Filter tasks by status (default: all)"
                }
            },
            "required": ["user_id"]
        },
        "handler": list_tasks_tool
    },
    "add_task": {
        "name": "add_task",
        "description": "Create a new task",
        "parameters": {
            "type": "object",
            "properties": {
                "user_id": {
                    "type": "string",
                    "description": "User ID from JWT token (automatically extracted)"
                },
                "title": {
                    "type": "string",
                    "description": "Task title (1-500 characters)"
                },
                "description": {
                    "type": "string",
                    "description": "Optional task description (0-5000 characters)"
                }
            },
            "required": ["user_id", "title"]
        },
        "handler": add_task_tool
    },
    "complete_task": {
        "name": "complete_task",
        "description": "Mark a task as completed",
        "parameters": {
            "type": "object",
            "properties": {
                "user_id": {
                    "type": "string",
                    "description": "User ID from JWT token (automatically extracted)"
                },
                "task_id": {
                    "type": "string",
                    "description": "UUID of the task to complete"
                }
            },
            "required": ["user_id", "task_id"]
        },
        "handler": complete_task_tool
    },
    "update_task": {
        "name": "update_task",
        "description": "Update a task's title and/or description",
        "parameters": {
            "type": "object",
            "properties": {
                "user_id": {
                    "type": "string",
                    "description": "User ID from JWT token (automatically extracted)"
                },
                "task_id": {
                    "type": "string",
                    "description": "UUID of the task to update"
                },
                "title": {
                    "type": "string",
                    "description": "New title (optional, 1-500 characters)"
                },
                "description": {
                    "type": "string",
                    "description": "New description (optional, 0-5000 characters)"
                }
            },
            "required": ["user_id", "task_id"]
        },
        "handler": update_task_tool
    },
    "delete_task": {
        "name": "delete_task",
        "description": "Delete a task permanently",
        "parameters": {
            "type": "object",
            "properties": {
                "user_id": {
                    "type": "string",
                    "description": "User ID from JWT token (automatically extracted)"
                },
                "task_id": {
                    "type": "string",
                    "description": "UUID of the task to delete"
                }
            },
            "required": ["user_id", "task_id"]
        },
        "handler": delete_task_tool
    },
    "set_reminder": {
        "name": "set_reminder",
        "description": "Set a reminder for a task at a specific time. Also updates the task's due_date to match the reminder time.",
        "parameters": {
            "type": "object",
            "properties": {
                "user_id": {
                    "type": "string",
                    "description": "User ID from JWT token"
                },
                "task_id": {
                    "type": "string",
                    "description": "UUID of the task to set reminder for"
                },
                "trigger_time": {
                    "type": "string",
                    "description": "When to trigger reminder (ISO datetime or natural language)"
                },
                "update_due_date": {
                    "type": "boolean",
                    "description": "Whether to also update the task's due_date (default: true)"
                }
            },
            "required": ["user_id", "task_id", "trigger_time"]
        },
        "handler": set_reminder_tool
    }
}
