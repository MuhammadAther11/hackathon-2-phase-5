"""
Unit tests for add_task functionality.

Tests task creation, validation, and persistence.
"""

import pytest
from uuid import UUID
from sqlmodel import Session, create_engine
from sqlmodel.pool import StaticPool

from src.models.task import Task, TaskCreate
from src.services.task_service import create_task


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


class TestCreateTask:
    """Test create_task service function."""

    def test_create_task_with_title_and_description(self, session):
        """Test creating a task with title and description."""
        user_id = "user123"
        title = "Buy groceries"
        description = "Milk, eggs, bread"

        task_create = TaskCreate(title=title, description=description)
        task = create_task(session=session, task_create=task_create, user_id=user_id)

        assert task.id is not None
        assert isinstance(task.id, UUID)
        assert task.user_id == user_id
        assert task.title == title
        assert task.description == description
        assert task.completed is False
        assert task.created_at is not None
        assert task.updated_at is not None

    def test_create_task_title_only(self, session):
        """Test creating a task with title only (no description)."""
        user_id = "user123"
        title = "Complete project"

        task_create = TaskCreate(title=title)
        task = create_task(session=session, task_create=task_create, user_id=user_id)

        assert task.title == title
        assert task.description is None
        assert task.completed is False

    def test_created_task_persists_in_database(self, session):
        """Test that created task is persisted and can be retrieved."""
        user_id = "user123"
        title = "Test task"

        task_create = TaskCreate(title=title)
        task = create_task(session=session, task_create=task_create, user_id=user_id)
        task_id = task.id

        # Query database to verify persistence
        retrieved_task = session.get(Task, task_id)

        assert retrieved_task is not None
        assert retrieved_task.id == task_id
        assert retrieved_task.user_id == user_id
        assert retrieved_task.title == title

    def test_create_multiple_tasks_for_same_user(self, session):
        """Test creating multiple tasks for the same user."""
        user_id = "user123"

        task1 = create_task(
            session=session,
            task_create=TaskCreate(title="Task 1"),
            user_id=user_id
        )
        task2 = create_task(
            session=session,
            task_create=TaskCreate(title="Task 2"),
            user_id=user_id
        )

        assert task1.id != task2.id
        assert task1.user_id == task2.user_id == user_id

    def test_create_tasks_for_different_users(self, session):
        """Test creating tasks for different users."""
        task1 = create_task(
            session=session,
            task_create=TaskCreate(title="User A task"),
            user_id="user_a"
        )
        task2 = create_task(
            session=session,
            task_create=TaskCreate(title="User B task"),
            user_id="user_b"
        )

        assert task1.user_id == "user_a"
        assert task2.user_id == "user_b"
        assert task1.id != task2.id

    def test_create_task_title_validation_min_length(self, session):
        """Test that empty title is rejected by model validation."""
        user_id = "user123"

        with pytest.raises(ValueError):
            TaskCreate(title="")

    def test_create_task_title_validation_max_length(self, session):
        """Test that title exceeding max length is rejected."""
        user_id = "user123"
        long_title = "x" * 501  # Exceeds 500 char limit

        with pytest.raises(ValueError):
            TaskCreate(title=long_title)

    def test_create_task_description_validation_max_length(self, session):
        """Test that description exceeding max length is rejected."""
        long_description = "x" * 5001  # Exceeds 5000 char limit

        with pytest.raises(ValueError):
            TaskCreate(title="Valid title", description=long_description)

    def test_created_task_has_timestamps(self, session):
        """Test that created task has created_at and updated_at timestamps."""
        user_id = "user123"

        task_create = TaskCreate(title="Test task")
        task = create_task(session=session, task_create=task_create, user_id=user_id)

        assert task.created_at is not None
        assert task.updated_at is not None
        # Timestamps should be very close (within 1 second)
        assert abs((task.created_at - task.updated_at).total_seconds()) < 1

    def test_created_task_has_unique_id(self, session):
        """Test that each created task has a unique ID."""
        user_id = "user123"

        task1 = create_task(
            session=session,
            task_create=TaskCreate(title="Task 1"),
            user_id=user_id
        )
        task2 = create_task(
            session=session,
            task_create=TaskCreate(title="Task 2"),
            user_id=user_id
        )

        assert task1.id != task2.id
        assert isinstance(task1.id, UUID)
        assert isinstance(task2.id, UUID)
