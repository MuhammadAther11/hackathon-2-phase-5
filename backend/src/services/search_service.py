from sqlmodel import Session, select, col
from typing import List
from sqlalchemy import or_

from src.models.task import Task


def search_tasks(*, session: Session, user_id: str, query: str, limit: int = 20) -> List[Task]:
    """Search tasks by keyword in title and description using ILIKE."""
    pattern = f"%{query}%"
    statement = (
        select(Task)
        .where(Task.user_id == user_id)
        .where(
            or_(
                col(Task.title).ilike(pattern),
                col(Task.description).ilike(pattern),
            )
        )
        .limit(limit)
    )
    return list(session.exec(statement).all())
