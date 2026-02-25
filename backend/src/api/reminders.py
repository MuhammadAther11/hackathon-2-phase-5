"""
Reminders API endpoints.

Provides CRUD operations for task reminders.
All endpoints require JWT authentication and enforce user isolation.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from typing import List
from uuid import UUID
from datetime import datetime

from src.database import get_session
from src.auth.jwt import get_current_user
from src.models.reminder import ReminderResponse, ReminderCreate, ReminderUpdate
from src.services.reminder_service import (
    get_task_reminders,
    create_reminder,
    update_reminder,
    delete_reminder,
    mark_reminder_delivered,
)

router = APIRouter(prefix="/tasks", tags=["Reminders"])


@router.get("/{task_id}/reminders", response_model=List[ReminderResponse])
async def list_reminders(
    task_id: UUID,
    current_user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """List all reminders for a specific task"""
    reminders = get_task_reminders(session=session, task_id=task_id, user_id=current_user_id)
    return reminders


@router.post("/{task_id}/reminders", response_model=ReminderResponse, status_code=status.HTTP_201_CREATED)
async def create_reminder_endpoint(
    task_id: UUID,
    reminder_data: ReminderCreate,
    current_user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Create a new reminder for a task"""
    # Override task_id from the path parameter to prevent mismatch
    reminder_data.task_id = task_id
    reminder = await create_reminder(session=session, reminder_create=reminder_data, user_id=current_user_id)
    if not reminder:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found or access denied")
    return reminder


@router.put("/reminders/{reminder_id}", response_model=ReminderResponse)
async def update_reminder_endpoint(
    reminder_id: UUID,
    reminder_data: ReminderUpdate,
    current_user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Update an existing reminder"""
    updated = await update_reminder(
        session=session,
        reminder_id=reminder_id,
        reminder_update=reminder_data,
        user_id=current_user_id
    )
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reminder not found or access denied")
    return updated


@router.delete("/reminders/{reminder_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_reminder_endpoint(
    reminder_id: UUID,
    current_user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Cancel a reminder"""
    success = await delete_reminder(session=session, reminder_id=reminder_id, user_id=current_user_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reminder not found or access denied")
    return None


@router.post("/reminders/trigger")
async def trigger_reminder_endpoint(
    reminder_id: UUID,
    current_user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """
    Dapr Jobs API callback endpoint.
    Called by Dapr Jobs API when a reminder trigger time arrives.
    """
    success = mark_reminder_delivered(session=session, reminder_id=reminder_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reminder not found")

    return {"status": "success", "message": "Reminder marked as delivered"}
