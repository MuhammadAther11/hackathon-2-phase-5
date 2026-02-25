"""
Tags API endpoints.

Provides CRUD operations for user-defined tags.
All endpoints require JWT authentication and enforce user isolation.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from typing import List
from uuid import UUID

from src.database import get_session
from src.auth.jwt import get_current_user
# FIXED: Ensure we are importing the updated schemas
from src.models.tag import Tag, TagCreate, TagUpdate, TagResponse
from src.services.tag_service import (
    get_user_tags,
    create_tag,
    update_tag,
    delete_tag,
)

router = APIRouter(tags=["Tags"])


@router.get("/{user_id}/tags", response_model=List[TagResponse])
async def list_tags(
    user_id: str,
    current_user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """List all tags for the authenticated user"""
    # Note: user_id from path is usually ignored in favor of current_user_id for security
    return get_user_tags(session=session, user_id=current_user_id)


@router.post("/{user_id}/tags", response_model=TagResponse, status_code=status.HTTP_201_CREATED)
async def create_tag_endpoint(
    user_id: str,
    tag_data: TagCreate,
    current_user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Create a new tag"""
    return create_tag(session=session, tag_create=tag_data, user_id=current_user_id)


@router.put("/{user_id}/tags/{tag_id}", response_model=TagResponse)
async def update_tag_endpoint(
    user_id: str,
    tag_id: UUID,
    tag_data: TagUpdate,
    current_user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Update an existing tag"""
    updated = update_tag(session=session, tag_id=tag_id, tag_update=tag_data, user_id=current_user_id)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tag not found")
    return updated


@router.delete("/{user_id}/tags/{tag_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_tag_endpoint(
    user_id: str,
    tag_id: UUID,
    current_user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Delete a tag (cascade removes from all tasks)"""
    success = delete_tag(session=session, tag_id=tag_id, user_id=current_user_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tag not found")
    return None