"""
Unit tests for complete_task functionality.

Tests task completion, idempotency, and user ownership enforcement.
"""

import pytest
from sqlmodel import Session, create_engine
from sqlmodel.pool import StaticPool

from src.models.task import Task, TaskCreate
from src.services.task_service import create_task, toggle_task_completion, get_task_by_id


@pytest.fixture
def session():
    """Create in-memory SQLite database for testing."""
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )

    # Create tables
    from sqlmodel import SQLModel
    SQLModel.metadata.create_all(engine)

    with Session(engine) as session:
        yield session


@pytest.fixture
def created_task(session):
    """Create a sample task for testing."""
    user_id = "user123"
    task_create = TaskCreate(title="Test task", description="Test description")
    task = create_task(session=session, task_create=task_create, user_id=user_id)
    session.commit()
    return task


class TestCompleteTask:
    """Test complete_task functionality."""

    def test_complete_pending_task(self, session, created_task):
        """Test marking a pending task as completed."""
        user_id = "user123"
        task_id = created_task.id

        # Verify task is initially pending
        assert created_task.completed is False

        # Complete the task
        completed_task = toggle_task_completion(
            session=session, task_id=task_id, user_id=user_id
        )

        assert completed_task is not None
        assert completed_task.completed is True
        assert completed_task.id == task_id

    def test_complete_task_updates_timestamp(self, session, created_task):
        """Test that completing a task updates the updated_at timestamp."""
        user_id = "user123"
        task_id = created_task.id
        original_updated_at = created_task.updated_at

        # Complete the task
        completed_task = toggle_task_completion(
            session=session, task_id=task_id, user_id=user_id
        )

        assert completed_task.updated_at >= original_updated_at

    def test_complete_task_persists_to_database(self, session, created_task):
        """Test that task completion is persisted to the database."""
        user_id = "user123"
        task_id = created_task.id

        # Complete the task
        toggle_task_completion(session=session, task_id=task_id, user_id=user_id)

        # Retrieve from database to verify persistence
        retrieved_task = session.get(Task, task_id)

        assert retrieved_task is not None
        assert retrieved_task.completed is True

    def test_complete_task_wrong_user_returns_none(self, session, created_task):
        """Test that completing a task with wrong user returns None (user ownership enforcement)."""
        task_id = created_task.id
        wrong_user_id = "wrong_user"

        # Try to complete with wrong user
        result = toggle_task_completion(
            session=session, task_id=task_id, user_id=wrong_user_id
        )

        assert result is None

    def test_complete_already_completed_task(self, session, created_task):
        """Test completing an already completed task (toggle behavior)."""
        user_id = "user123"
        task_id = created_task.id

        # Complete the task (toggle: False -> True)
        completed_task = toggle_task_completion(session=session, task_id=task_id, user_id=user_id)
        assert completed_task.completed is True

        # Toggle again (toggle: True -> False)
        toggled_again = toggle_task_completion(
            session=session, task_id=task_id, user_id=user_id
        )

        assert toggled_again is not None
        assert toggled_again.completed is False  # Toggled back to pending

    def test_complete_nonexistent_task_returns_none(self, session):
        """Test completing a non-existent task returns None."""
        from uuid import uuid4

        user_id = "user123"
        nonexistent_id = uuid4()

        result = toggle_task_completion(
            session=session, task_id=nonexistent_id, user_id=user_id
        )

        assert result is None

    def test_user_cannot_complete_another_users_task(self, session):
        """Test that user A cannot complete user B's task."""
        user_a = "user_a"
        user_b = "user_b"

        # Create task for user_a
        task_create = TaskCreate(title="User A task")
        task = create_task(session=session, task_create=task_create, user_id=user_a)
        session.commit()

        # Try to complete as user_b
        result = toggle_task_completion(
            session=session, task_id=task.id, user_id=user_b
        )

        assert result is None

        # Verify task still pending for user_a
        task_check = get_task_by_id(session=session, task_id=task.id, user_id=user_a)
        assert task_check is not None
        assert task_check.completed is False

    def test_complete_task_preserves_other_fields(self, session, created_task):
        """Test that completing a task preserves title and description."""
        user_id = "user123"
        task_id = created_task.id
        original_title = created_task.title
        original_description = created_task.description

        # Complete the task
        completed_task = toggle_task_completion(
            session=session, task_id=task_id, user_id=user_id
        )

        assert completed_task.title == original_title
        assert completed_task.description == original_description
        assert completed_task.user_id == user_id
