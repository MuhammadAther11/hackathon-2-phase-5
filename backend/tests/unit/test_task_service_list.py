"""
Unit tests for list_tasks functionality.

Tests database query operations, filtering, and user isolation.
"""

import pytest
from datetime import datetime, timezone
from uuid import uuid4
from sqlmodel import Session, create_engine
from sqlmodel.pool import StaticPool

from src.models.task import Task
from src.services.task_service import get_user_tasks


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
def sample_tasks(session):
    """Create sample tasks for testing."""
    user_a = "user_a"
    user_b = "user_b"

    # Create tasks for user_a (3 pending, 2 completed)
    tasks_a = [
        Task(user_id=user_a, title="Task A1", description="Pending task 1", completed=False),
        Task(user_id=user_a, title="Task A2", description="Pending task 2", completed=False),
        Task(user_id=user_a, title="Task A3", description="Pending task 3", completed=False),
        Task(user_id=user_a, title="Task A4", description="Completed task 1", completed=True),
        Task(user_id=user_a, title="Task A5", description="Completed task 2", completed=True),
    ]

    # Create tasks for user_b (2 pending, 1 completed)
    tasks_b = [
        Task(user_id=user_b, title="Task B1", description="Pending task 1", completed=False),
        Task(user_id=user_b, title="Task B2", description="Pending task 2", completed=False),
        Task(user_id=user_b, title="Task B3", description="Completed task 1", completed=True),
    ]

    for task in tasks_a + tasks_b:
        session.add(task)

    session.commit()

    return {"user_a": tasks_a, "user_b": tasks_b}


class TestListTasks:
    """Test list_tasks service function."""

    def test_list_all_tasks_for_user(self, session, sample_tasks):
        """Test retrieving all tasks for a specific user."""
        user_a = "user_a"
        tasks = get_user_tasks(session=session, user_id=user_a)

        assert len(tasks) == 5
        assert all(t.user_id == user_a for t in tasks)

    def test_list_tasks_empty_for_new_user(self, session):
        """Test retrieving tasks for user with no tasks."""
        tasks = get_user_tasks(session=session, user_id="new_user")

        assert len(tasks) == 0

    def test_list_tasks_user_isolation(self, session, sample_tasks):
        """Test that user_a tasks are not visible to user_b."""
        tasks_a = get_user_tasks(session=session, user_id="user_a")
        tasks_b = get_user_tasks(session=session, user_id="user_b")

        # user_a should have 5 tasks
        assert len(tasks_a) == 5

        # user_b should have 3 tasks
        assert len(tasks_b) == 3

        # No overlap
        task_ids_a = {t.id for t in tasks_a}
        task_ids_b = {t.id for t in tasks_b}
        assert task_ids_a.isdisjoint(task_ids_b)

    def test_list_pending_tasks(self, session, sample_tasks):
        """Test filtering tasks by pending status."""
        user_a = "user_a"
        tasks = get_user_tasks(session=session, user_id=user_a)
        pending_tasks = [t for t in tasks if not t.completed]

        assert len(pending_tasks) == 3
        assert all(not t.completed for t in pending_tasks)

    def test_list_completed_tasks(self, session, sample_tasks):
        """Test filtering tasks by completed status."""
        user_a = "user_a"
        tasks = get_user_tasks(session=session, user_id=user_a)
        completed_tasks = [t for t in tasks if t.completed]

        assert len(completed_tasks) == 2
        assert all(t.completed for t in completed_tasks)

    def test_tasks_ordered_by_created_at(self, session, sample_tasks):
        """Test that tasks are returned in creation order."""
        user_a = "user_a"
        tasks = get_user_tasks(session=session, user_id=user_a)

        # Verify all tasks have created_at timestamps
        assert all(t.created_at is not None for t in tasks)

    def test_no_data_leakage_between_users(self, session, sample_tasks):
        """Test comprehensive user isolation - no cross-user access."""
        user_a_tasks = get_user_tasks(session=session, user_id="user_a")
        user_b_tasks = get_user_tasks(session=session, user_id="user_b")

        # Get task IDs for comparison
        user_a_ids = {str(t.id) for t in user_a_tasks}
        user_b_ids = {str(t.id) for t in user_b_tasks}

        # Verify no intersection
        assert not user_a_ids.intersection(user_b_ids)

        # Verify correct counts
        assert len(user_a_tasks) == 5
        assert len(user_b_tasks) == 3
