from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, select
from typing import List, Optional
from uuid import UUID

from src.database import get_session
from src.models.task import Task, TaskCreate, TaskUpdate
from src.models.task_tag import TaskTag
from src.models.tag import Tag
from src.auth.jwt import get_current_user
from src.services.task_service import (
    get_user_tasks,
    create_task,
    get_task_by_id,
    update_task,
    delete_task,
    toggle_task_completion
)

router = APIRouter(tags=["tasks"])

def load_task_with_tags(task: Task, session: Session) -> dict:
    """Load tags for a task and return as dict."""
    tags_statement = select(Tag).join(TaskTag, TaskTag.tag_id == Tag.id).where(TaskTag.task_id == task.id)
    tag_list = session.exec(tags_statement).all()
    task_dict = task.model_dump()
    task_dict['tags'] = [
        {
            'id': str(t.id),
            'user_id': str(t.user_id),
            'name': t.name,
            'color': t.color,
            'created_at': t.created_at.isoformat() if t.created_at else None,
            'task_count': 0
        }
        for t in tag_list
    ]
    return task_dict

@router.get("/{user_id}/tasks")
async def read_tasks(
    user_id: str,
    current_user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    # Get tasks with their tags
    statement = select(Task).where(Task.user_id == current_user_id)
    tasks = session.exec(statement).all()
    
    result = [load_task_with_tags(task, session) for task in tasks]
    return result

@router.post("/{user_id}/tasks", status_code=status.HTTP_201_CREATED)
async def create_task_endpoint(
    user_id: str,
    task: TaskCreate,
    current_user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session),
    tag_ids: Optional[List[UUID]] = Query(default=None)
):
    # Accept tag_ids from query params OR 'tags' list from request body
    body_tags = getattr(task, 'tags', None)  # TaskCreate.tags is List[str] (tag UUIDs as strings)
    query_tag_ids_str = [str(t) for t in tag_ids] if tag_ids else None
    final_tag_ids = query_tag_ids_str or body_tags or None

    db_task = await create_task(session=session, task_create=task, user_id=current_user_id, tag_ids=final_tag_ids)
    return load_task_with_tags(db_task, session)

@router.get("/{user_id}/tasks/{id}")
async def read_task(
    user_id: str,
    id: UUID,
    current_user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    if user_id != current_user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    task = get_task_by_id(session=session, task_id=id, user_id=current_user_id)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return load_task_with_tags(task, session)

@router.put("/{user_id}/tasks/{id}")
async def update_task_endpoint(
    user_id: str,
    id: UUID,
    task_update: TaskUpdate,
    current_user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session),
    tag_ids: Optional[List[UUID]] = Query(default=None)
):
    # Convert UUID list to str list; also accept tags from body
    body_tags = getattr(task_update, 'tags', None)
    query_tag_ids_str = [str(t) for t in tag_ids] if tag_ids else None
    final_tag_ids = query_tag_ids_str or body_tags  # None means "don't change tags"

    updated_task = await update_task(
        session=session,
        task_id=id,
        task_update=task_update,
        user_id=current_user_id,
        tag_ids=final_tag_ids
    )
    if not updated_task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return load_task_with_tags(updated_task, session)

@router.delete("/{user_id}/tasks/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task_endpoint(
    user_id: str,
    id: UUID,
    current_user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    success = await delete_task(session=session, task_id=id, user_id=current_user_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return None

@router.patch("/{user_id}/tasks/{id}/complete")
async def toggle_task_completion_endpoint(
    user_id: str,
    id: UUID,
    current_user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    toggled_task = await toggle_task_completion(session=session, task_id=id, user_id=current_user_id)
    if not toggled_task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return load_task_with_tags(toggled_task, session)
