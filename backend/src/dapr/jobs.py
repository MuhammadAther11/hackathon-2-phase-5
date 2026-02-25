"""
Dapr Jobs API client for scheduled operations.

Provides schedule_job and cancel_job methods for managing reminders
and recurring tasks via Dapr Jobs API (cron binding).
"""

import os
import json
from typing import Any, Dict, Optional
from datetime import datetime
from uuid import UUID
from dapr.clients import DaprClient
from dapr.clients.grpc._request import InvokeBindingRequest
from dapr.clients.grpc._response import InvokeBindingResponse


class DaprJobsClient:
    """
    Dapr Jobs API client for scheduling and canceling jobs.
    
    This client uses Dapr's cron binding to schedule jobs at specific times.
    Jobs are used for reminders and recurring task generation.
    
    Usage:
        jobs = DaprJobsClient()
        jobs.schedule_job("reminder-123", trigger_time, {"task_id": "...", "user_id": "..."})
        jobs.cancel_job("reminder-123")
    """
    
    def __init__(self):
        """Initialize Dapr Jobs API client"""
        self.binding_name = os.getenv("DAPR_JOBS_BINDING_NAME", "jobs")
        self._client = None
    
    @property
    def client(self) -> DaprClient:
        """Lazy initialization of Dapr client"""
        if self._client is None:
            self._client = DaprClient()
        return self._client
    
    def schedule_job(
        self,
        job_name: str,
        trigger_time: datetime,
        payload: Dict[str, Any]
    ) -> InvokeBindingResponse:
        """
        Schedule a job to trigger at a specific time.
        
        Args:
            job_name: Unique job identifier
            trigger_time: When to trigger the job (UTC)
            payload: Job payload (will be passed to callback)
            
        Returns:
            InvokeBindingResponse from Dapr
            
        Raises:
            Exception: If scheduling fails
        """
        # Build job data
        job_data = {
            "name": job_name,
            "schedule": trigger_time.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "data": json.dumps(payload),
            "callback": "/api/v1/jobs/trigger",  # Callback endpoint
        }
        
        # Create invoke request
        request = InvokeBindingRequest(
            binding_name=self.binding_name,
            operation="create",
            data=json.dumps(job_data),
            data_content_type="application/json"
        )
        
        # Schedule job
        try:
            response = self.client.invoke_binding(request)
            print(f"[Dapr Jobs] Scheduled job: {job_name} at {trigger_time}")
            return response
        except Exception as e:
            print(f"[Dapr Jobs] Failed to schedule job {job_name}: {str(e)}")
            raise
    
    def cancel_job(self, job_name: str) -> InvokeBindingResponse:
        """
        Cancel a scheduled job.
        
        Args:
            job_name: Unique job identifier to cancel
            
        Returns:
            InvokeBindingResponse from Dapr
            
        Raises:
            Exception: If cancellation fails
        """
        # Create invoke request
        request = InvokeBindingRequest(
            binding_name=self.binding_name,
            operation="delete",
            data=json.dumps({"name": job_name}),
            data_content_type="application/json"
        )
        
        # Cancel job
        try:
            response = self.client.invoke_binding(request)
            print(f"[Dapr Jobs] Cancelled job: {job_name}")
            return response
        except Exception as e:
            print(f"[Dapr Jobs] Failed to cancel job {job_name}: {str(e)}")
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
_jobs_instance: Optional[DaprJobsClient] = None


def get_jobs_client() -> DaprJobsClient:
    """Get or create singleton Dapr Jobs API client"""
    global _jobs_instance
    if _jobs_instance is None:
        _jobs_instance = DaprJobsClient()
    return _jobs_instance
