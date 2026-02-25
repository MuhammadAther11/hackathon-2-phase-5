from sqlmodel import Session, select, func
from typing import List, Optional
from uuid import UUID

from src.models.tag import Tag, TagCreate, TagUpdate, TagResponse
from src.models.task_tag import TaskTag


def get_user_tags(*, session: Session, user_id: str) -> List[TagResponse]:
    """Get all tags for a user with task counts."""
    tags = session.exec(
        select(Tag).where(Tag.user_id == user_id)
    ).all()

    result = []
    for tag in tags:
        count = session.exec(
            select(func.count()).where(TaskTag.tag_id == tag.id)
        ).one()
        result.append(TagResponse(
            id=tag.id,
            user_id=tag.user_id,
            name=tag.name,
            color=tag.color,
            created_at=tag.created_at,
            task_count=count,
        ))
    return result


def create_tag(*, session: Session, tag_create: TagCreate, user_id: str) -> TagResponse:
    """Create a new tag for a user."""
    tag = Tag(**tag_create.model_dump(), user_id=user_id)
    session.add(tag)
    session.commit()
    session.refresh(tag)
    return TagResponse(
        id=tag.id,
        user_id=tag.user_id,
        name=tag.name,
        color=tag.color,
        created_at=tag.created_at,
        task_count=0,
    )


def get_tag_by_id(*, session: Session, tag_id: UUID, user_id: str) -> Optional[Tag]:
    """Get a tag by ID if it belongs to the user."""
    tag = session.get(Tag, tag_id)
    if tag and tag.user_id == user_id:
        return tag
    return None


def update_tag(*, session: Session, tag_id: UUID, tag_update: TagUpdate, user_id: str) -> Optional[TagResponse]:
    """Update a tag if it belongs to the user."""
    tag = session.get(Tag, tag_id)
    if not tag or tag.user_id != user_id:
        return None

    for key, value in tag_update.model_dump(exclude_unset=True).items():
        setattr(tag, key, value)

    session.add(tag)
    session.commit()
    session.refresh(tag)

    count = session.exec(
        select(func.count()).where(TaskTag.tag_id == tag.id)
    ).one()
    return TagResponse(
        id=tag.id,
        user_id=tag.user_id,
        name=tag.name,
        color=tag.color,
        created_at=tag.created_at,
        task_count=count,
    )


def delete_tag(*, session: Session, tag_id: UUID, user_id: str) -> bool:
    """Delete a tag if it belongs to the user. Cascade removes task_tag associations."""
    tag = session.get(Tag, tag_id)
    if not tag or tag.user_id != user_id:
        return False

    session.delete(tag)
    session.commit()
    return True


def add_tag_to_task(*, session: Session, task_id: UUID, tag_id: UUID, user_id: str) -> bool:
    """Assign a tag to a task. Both must belong to the user."""
    tag = session.get(Tag, tag_id)
    if not tag or tag.user_id != user_id:
        return False

    existing = session.exec(
        select(TaskTag).where(TaskTag.task_id == task_id, TaskTag.tag_id == tag_id)
    ).first()
    if existing:
        return True  # Already assigned

    task_tag = TaskTag(task_id=task_id, tag_id=tag_id)
    session.add(task_tag)
    session.commit()
    return True


def remove_tag_from_task(*, session: Session, task_id: UUID, tag_id: UUID) -> bool:
    """Remove a tag from a task."""
    task_tag = session.exec(
        select(TaskTag).where(TaskTag.task_id == task_id, TaskTag.tag_id == tag_id)
    ).first()
    if not task_tag:
        return False

    session.delete(task_tag)
    session.commit()
    return True


def get_or_create_tags_by_names(*, session: Session, user_id: str, tag_names: List[str]) -> List[Tag]:
    """
    Get existing tags by names or create new ones if they don't exist.
    Returns list of Tag objects.
    """
    from src.models.tag import TagCreate
    from src.services.tag_service import create_tag
    import re
    
    tags = []
    for name in tag_names:
        # Clean tag name
        name = name.strip()
        if not name:
            continue
        
        # Check if tag already exists for this user
        existing_tag = session.exec(
            select(Tag).where(Tag.user_id == user_id, func.lower(Tag.name) == name.lower())
        ).first()
        
        if existing_tag:
            tags.append(existing_tag)
        else:
            # Create new tag with random color
            import random
            colors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#06B6D4", "#84CC16"]
            color = random.choice(colors)
            
            try:
                tag_create = TagCreate(name=name, color=color)
                new_tag = create_tag(session=session, tag_create=tag_create, user_id=user_id)
                # Convert TagResponse to Tag
                tag = Tag(id=new_tag.id, user_id=new_tag.user_id, name=new_tag.name, color=new_tag.color)
                tags.append(tag)
            except Exception as e:
                # Skip tag creation on error
                continue
    
    return tags
