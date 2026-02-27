"""
Event publisher service - saves task events to the task_event table in the database.
Falls back to logging if database save fails.
"""

from typing import Dict, Any, Optional
from uuid import UUID, uuid4
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)


class EventPublisher:
    """
    Saves task events to the task_event table.
    Falls back to logging if DB save fails.
    """

    async def _save_event(
        self,
        event_type: str,
        task_id: UUID,
        user_id: str,
        version: int,
        payload: Dict[str, Any],
        correlation_id: Optional[UUID] = None,
    ):
        """Save event to task_event table in the database."""
        try:
            from src.database import engine
            from sqlmodel import Session
            from sqlalchemy import text

            with Session(engine) as session:
                session.execute(
                    text(
                        """
                        INSERT INTO task_event (id, event_type, aggregate_id, user_id, version, payload, timestamp, correlation_id)
                        VALUES (:id, :event_type, :aggregate_id, :user_id, :version, CAST(:payload AS jsonb), :timestamp, :correlation_id)
                        """
                    ),
                    {
                        "id": str(uuid4()),
                        "event_type": event_type,
                        "aggregate_id": str(task_id),
                        "user_id": user_id,
                        "version": version,
                        "payload": __import__("json").dumps(payload),
                        "timestamp": datetime.now(timezone.utc),
                        "correlation_id": str(correlation_id) if correlation_id else None,
                    },
                )
                session.commit()
                logger.info(f"[EVENT] saved event_type={event_type} task_id={task_id}")
        except Exception as e:
            # Non-blocking: log and continue
            logger.warning(f"[EVENT] failed to save event event_type={event_type} error={e}")
            print(f"[EVENT] {event_type}: task_id={task_id} user_id={user_id} payload={payload}")

    async def publish_task_created(self, task_id: UUID, user_id: str, payload: Dict[str, Any]):
        """Publish task created event."""
        await self._save_event(
            event_type="task.created",
            task_id=task_id,
            user_id=user_id,
            version=payload.get("version", 1),
            payload=payload,
        )

    async def publish_task_updated(self, task_id: UUID, user_id: str, payload: Dict[str, Any]):
        """Publish task updated event."""
        await self._save_event(
            event_type="task.updated",
            task_id=task_id,
            user_id=user_id,
            version=payload.get("version", 1),
            payload=payload,
        )

    async def publish_task_deleted(self, task_id: UUID, user_id: str, payload: Dict[str, Any]):
        """Publish task deleted event."""
        await self._save_event(
            event_type="task.deleted",
            task_id=task_id,
            user_id=user_id,
            version=payload.get("version", 1),
            payload=payload,
        )

    async def publish_task_completed(self, task_id: UUID, user_id: str, payload: Dict[str, Any]):
        """Publish task completed event."""
        await self._save_event(
            event_type="task.completed",
            task_id=task_id,
            user_id=user_id,
            version=payload.get("version", 1),
            payload=payload,
        )


# Global instance
event_publisher = EventPublisher()
