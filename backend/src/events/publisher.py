"""
Event publisher service for task events.

Publishes task events to Dapr Pub/Sub for real-time synchronization
and event-driven architecture. All task state changes are published as events.
"""

from typing import Any, Dict, Optional
from datetime import datetime, timezone
from uuid import UUID, uuid4

from src.dapr.pubsub import get_pubsub_client
from src.models.event import TaskEvent


class EventPublisher:
    """
    Event publisher for task events.
    
    Publishes events to Dapr Pub/Sub for distribution to:
    - WebSocket gateway (real-time UI updates)
    - Recurring service (recurring task generation)
    - Notification service (reminder delivery)
    - Audit trail (event sourcing)
    
    Event Types:
        - task.created: New task created
        - task.updated: Task modified
        - task.completed: Task marked as completed
        - task.deleted: Task removed
        - task.recurring_instance_created: New recurring instance generated
    """
    
    def __init__(self):
        """Initialize event publisher"""
        self._pubsub = None
    
    @property
    def pubsub(self):
        """Lazy initialization of Pub/Sub client"""
        if self._pubsub is None:
            self._pubsub = get_pubsub_client()
        return self._pubsub
    
    def publish_task_event(
        self,
        event_type: str,
        aggregate_id: UUID,
        user_id: UUID,
        version: int,
        payload: Dict[str, Any],
        correlation_id: Optional[UUID] = None
    ) -> None:
        """
        Publish a task event to Dapr Pub/Sub.
        
        Args:
            event_type: Type of event (e.g., "task.created")
            aggregate_id: Task ID (aggregate root)
            user_id: User who triggered the event
            version: Task version at time of event
            payload: Event payload with before/after snapshots
            correlation_id: Optional correlation ID for tracing
        """
        # Generate correlation ID if not provided
        if correlation_id is None:
            correlation_id = uuid4()
        
        # Build event payload
        event_payload = {
            "event_id": str(uuid4()),
            "event_type": event_type,
            "aggregate_id": str(aggregate_id),
            "user_id": str(user_id),
            "version": version,
            "payload": payload,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "correlation_id": str(correlation_id),
        }
        
        # Publish to Dapr Pub/Sub
        try:
            self.pubsub.publish_event(
                event_type=event_type,
                payload=event_payload,
                correlation_id=correlation_id
            )
            print(f"[EventPublisher] Published {event_type} for task {aggregate_id}")
        except Exception as e:
            print(f"[EventPublisher] Failed to publish {event_type}: {str(e)}")
            # Don't raise - event publishing is best-effort
    
    def publish_task_created(
        self,
        task_id: UUID,
        user_id: UUID,
        task_data: Dict[str, Any]
    ) -> None:
        """Publish task.created event"""
        self.publish_task_event(
            event_type="task.created",
            aggregate_id=task_id,
            user_id=user_id,
            version=1,
            payload={"after": task_data}
        )
    
    def publish_task_updated(
        self,
        task_id: UUID,
        user_id: UUID,
        version: int,
        before: Dict[str, Any],
        after: Dict[str, Any],
        changed_fields: list
    ) -> None:
        """Publish task.updated event"""
        self.publish_task_event(
            event_type="task.updated",
            aggregate_id=task_id,
            user_id=user_id,
            version=version,
            payload={
                "before": before,
                "after": after,
                "changed_fields": changed_fields
            }
        )
    
    def publish_task_completed(
        self,
        task_id: UUID,
        user_id: UUID,
        version: int,
        before: Dict[str, Any],
        after: Dict[str, Any]
    ) -> None:
        """Publish task.completed event"""
        self.publish_task_event(
            event_type="task.completed",
            aggregate_id=task_id,
            user_id=user_id,
            version=version,
            payload={
                "before": before,
                "after": after
            }
        )
    
    def publish_task_deleted(
        self,
        task_id: UUID,
        user_id: UUID,
        version: int,
        before: Dict[str, Any]
    ) -> None:
        """Publish task.deleted event"""
        self.publish_task_event(
            event_type="task.deleted",
            aggregate_id=task_id,
            user_id=user_id,
            version=version,
            payload={"before": before}
        )
    
    def publish_recurring_instance_created(
        self,
        new_task_id: UUID,
        user_id: UUID,
        parent_task_id: UUID,
        task_data: Dict[str, Any]
    ) -> None:
        """Publish task.recurring_instance_created event"""
        self.publish_task_event(
            event_type="task.recurring_instance_created",
            aggregate_id=new_task_id,
            user_id=user_id,
            version=1,
            payload={
                "after": task_data,
                "parent_task_id": str(parent_task_id)
            }
        )


# Singleton instance for application-wide use
_publisher_instance: Optional[EventPublisher] = None


def get_event_publisher() -> EventPublisher:
    """Get or create singleton event publisher"""
    global _publisher_instance
    if _publisher_instance is None:
        _publisher_instance = EventPublisher()
    return _publisher_instance
