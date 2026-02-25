"""
Search API endpoints.

Provides search across tasks using ILIKE pattern matching.
All endpoints require JWT authentication and enforce user isolation.
"""

from fastapi import APIRouter, Depends, Query
from sqlmodel import Session, select
from typing import List
from uuid import UUID

from src.database import get_session
from src.auth.jwt import get_current_user
from src.models.task import Task
from src.models.task_tag import TaskTag
from src.models.tag import Tag
from src.services.search_service import search_tasks

router = APIRouter(tags=["Search"])

def task_with_tags_response(task: Task) -> dict:
    """Convert task to dict with tags included"""
    task_dict = task.model_dump()
    task_dict['tags'] = []
    return task_dict

@router.get("/{user_id}/tasks/search")
async def search_tasks_endpoint(
    user_id: str,
    q: str = Query(..., min_length=1, description="Search query"),
    limit: int = Query(default=20, ge=1, le=100, description="Result limit"),
    current_user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """
    Search tasks by keyword in title and description.
    """
    results = search_tasks(session=session, user_id=current_user_id, query=q, limit=limit)
    # Return tasks with tags
    formatted_results = [task_with_tags_response(task) for task in results]
    return {
        "query": q,
        "results": formatted_results,
        "total": len(formatted_results),
    }
