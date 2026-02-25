"""
Dapr Pub/Sub client for event-driven architecture.

Provides publish_event method for publishing events to Kafka via Dapr Pub/Sub.
All task events are published to the 'task-events' topic for distribution to subscribers.
"""

import os
import json
from typing import Any, Dict, Optional
from uuid import UUID
from dapr.clients import DaprClient
from dapr.clients.grpc._request import PublishEventRequest
from dapr.clients.grpc._response import PublishEventResponse


class DaprPubSubClient:
    """
    Dapr Pub/Sub client for publishing events to Kafka.
    
    This client abstracts the Dapr Pub/Sub API for publishing events.
    Events are published to the 'task-events' topic which is backed by Kafka.
    
    Usage:
        pubsub = DaprPubSubClient()
        pubsub.publish_event("task.created", {"task_id": "...", "user_id": "..."})
    """
    
    def __init__(self):
        """Initialize Dapr Pub/Sub client"""
        self.pubsub_name = os.getenv("DAPR_PUBSUB_NAME", "pubsub")
        self.topic_name = os.getenv("DAPR_TOPIC_NAME", "task-events")
        self._client = None
    
    @property
    def client(self) -> DaprClient:
        """Lazy initialization of Dapr client"""
        if self._client is None:
            self._client = DaprClient()
        return self._client
    
    def publish_event(
        self,
        event_type: str,
        payload: Dict[str, Any],
        correlation_id: Optional[UUID] = None
    ) -> PublishEventResponse:
        """
        Publish an event to Dapr Pub/Sub.
        
        Args:
            event_type: Type of event (e.g., "task.created", "task.updated")
            payload: Event payload as dictionary
            correlation_id: Optional correlation ID for tracing
            
        Returns:
            PublishEventResponse from Dapr
            
        Raises:
            Exception: If publishing fails
        """
        # Build event envelope
        event_data = {
            "event_type": event_type,
            "payload": payload,
        }
        
        if correlation_id:
            event_data["correlation_id"] = str(correlation_id)
        
        # Create publish request
        request = PublishEventRequest(
            pubsub_name=self.pubsub_name,
            topic_name=self.topic_name,
            data=json.dumps(event_data),
            data_content_type="application/json"
        )
        
        # Publish event
        try:
            response = self.client.publish_event(request)
            print(f"[Dapr Pub/Sub] Published event: {event_type}")
            return response
        except Exception as e:
            print(f"[Dapr Pub/Sub] Failed to publish event {event_type}: {str(e)}")
            raise
    
    def close(self):
        """Close Dapr client connection"""
        if self._client:
            self._client.close()
            self._client = None
    
    def __enter__(self):
        """Context manager entry"""
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit"""
        self.close()


# Singleton instance for application-wide use
_pubsub_instance: Optional[DaprPubSubClient] = None


def get_pubsub_client() -> DaprPubSubClient:
    """Get or create singleton Dapr Pub/Sub client"""
    global _pubsub_instance
    if _pubsub_instance is None:
        _pubsub_instance = DaprPubSubClient()
    return _pubsub_instance
