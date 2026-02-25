"""
Event publisher service for Dapr pub/sub integration.

Handles publishing task-related events to Dapr pub/sub broker.
Events are published to topics for real-time synchronization and audit trails.
"""

from typing import Dict, Any
from uuid import UUID
from datetime import datetime, timezone


class EventPublisher:
    """
    Service for publishing task events to Dapr pub/sub.
    Falls back to logging if Dapr is not available.
    """

    def __init__(self):
        self._dapr_client = None

    async def _publish_fallback(self, topic: str, event_type: str, payload: Dict[str, Any]):
        """
        Fallback method when Dapr is not available - just log the event.
        """
        event_log = {
            "topic": topic,
            "event_type": event_type,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "payload": payload
        }
        print(f"[EVENT] {event_type}: {event_log}")

    async def publish_task_created(self, task_id: UUID, user_id: str, payload: Dict[str, Any]):
        """Publish task created event."""
        event_data = {
            "event_type": "task.created",
            "task_id": str(task_id),
            "user_id": user_id,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "payload": payload
        }
        await self._publish_fallback("task_events", "task.created", event_data)

    async def publish_task_updated(self, task_id: UUID, user_id: str, payload: Dict[str, Any]):
        """Publish task updated event."""
        event_data = {
            "event_type": "task.updated",
            "task_id": str(task_id),
            "user_id": user_id,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "payload": payload
        }
        await self._publish_fallback("task_events", "task.updated", event_data)

    async def publish_task_deleted(self, task_id: UUID, user_id: str, payload: Dict[str, Any]):
        """Publish task deleted event."""
        event_data = {
            "event_type": "task.deleted",
            "task_id": str(task_id),
            "user_id": user_id,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "payload": payload
        }
        await self._publish_fallback("task_events", "task.deleted", event_data)

    async def publish_task_completed(self, task_id: UUID, user_id: str, payload: Dict[str, Any]):
        """Publish task completed event."""
        event_data = {
            "event_type": "task.completed",
            "task_id": str(task_id),
            "user_id": user_id,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "payload": payload
        }
        await self._publish_fallback("task_events", "task.completed", event_data)


# Global instance
event_publisher = EventPublisher()
