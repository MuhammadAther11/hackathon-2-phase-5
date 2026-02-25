"""
Integration tests for MCP tools.

Tests end-to-end tool execution with realistic scenarios.
"""

import pytest
import asyncio
from sqlmodel import Session, create_engine
from sqlmodel.pool import StaticPool

from src.models.task import TaskCreate
from src.services.task_service import create_task
from src.mcp.tools import (
    list_tasks_tool,
    add_task_tool,
    complete_task_tool,
)


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


@pytest.mark.asyncio
class TestMCPTools:
    """Test MCP tool functionality end-to-end."""

    async def test_list_tasks_tool_success(self, session):
        """Test list_tasks tool returns correct format."""
        user_id = "user123"

        # Create sample task
        task_create = TaskCreate(title="Test task")
        task = create_task(session=session, task_create=task_create, user_id=user_id)
        session.commit()

        # Call tool
        result = await list_tasks_tool(session=session, user_id=user_id)

        assert result["status"] == "success"
        assert "data" in result
        assert isinstance(result["data"], list)
        assert len(result["data"]) == 1

        # Verify task data
        task_data = result["data"][0]
        assert task_data["id"] == str(task.id)
        assert task_data["user_id"] == user_id
        assert task_data["title"] == "Test task"
        assert task_data["completed"] is False

    async def test_list_tasks_tool_with_status_filter(self, session):
        """Test list_tasks tool with status filtering."""
        user_id = "user123"

        # Create pending and completed tasks
        task1 = create_task(
            session=session,
            task_create=TaskCreate(title="Pending task"),
            user_id=user_id
        )
        task2 = create_task(
            session=session,
            task_create=TaskCreate(title="Completed task"),
            user_id=user_id
        )
        task2.completed = True
        session.add(task2)
        session.commit()

        # List pending tasks
        result = await list_tasks_tool(session=session, user_id=user_id, status="pending")

        assert result["status"] == "success"
        assert len(result["data"]) == 1
        assert result["data"][0]["title"] == "Pending task"

        # List completed tasks
        result = await list_tasks_tool(session=session, user_id=user_id, status="completed")

        assert len(result["data"]) == 1
        assert result["data"][0]["title"] == "Completed task"

    async def test_list_tasks_tool_invalid_status(self, session):
        """Test list_tasks tool with invalid status returns error."""
        user_id = "user123"

        result = await list_tasks_tool(session=session, user_id=user_id, status="invalid")

        assert result["status"] == "error"
        assert result["error"]["code"] == "INVALID_STATUS"

    async def test_add_task_tool_success(self, session):
        """Test add_task tool creates task correctly."""
        user_id = "user123"
        title = "Buy groceries"
        description = "Milk, eggs, bread"

        result = await add_task_tool(
            session=session,
            user_id=user_id,
            title=title,
            description=description
        )

        assert result["status"] == "success"
        assert result["data"]["title"] == title
        assert result["data"]["description"] == description
        assert result["data"]["completed"] is False
        assert result["data"]["user_id"] == user_id

    async def test_add_task_tool_title_only(self, session):
        """Test add_task tool with title only."""
        user_id = "user123"
        title = "Simple task"

        result = await add_task_tool(session=session, user_id=user_id, title=title)

        assert result["status"] == "success"
        assert result["data"]["title"] == title
        assert result["data"]["description"] is None

    async def test_add_task_tool_title_validation(self, session):
        """Test add_task tool validates title length."""
        user_id = "user123"
        long_title = "x" * 501

        result = await add_task_tool(session=session, user_id=user_id, title=long_title)

        assert result["status"] == "error"
        assert result["error"]["code"] == "INVALID_TITLE"

    async def test_add_task_tool_missing_title(self, session):
        """Test add_task tool requires title."""
        user_id = "user123"

        result = await add_task_tool(session=session, user_id=user_id, title="")

        assert result["status"] == "error"
        assert result["error"]["code"] == "INVALID_TITLE"

    async def test_complete_task_tool_success(self, session):
        """Test complete_task tool marks task complete."""
        user_id = "user123"

        # Create task
        add_result = await add_task_tool(session=session, user_id=user_id, title="Test task")
        task_id = add_result["data"]["id"]

        # Complete task
        result = await complete_task_tool(session=session, user_id=user_id, task_id=task_id)

        assert result["status"] == "success"
        assert result["data"]["completed"] is True
        assert result["data"]["id"] == task_id

    async def test_complete_task_tool_idempotent(self, session):
        """Test complete_task tool is idempotent."""
        user_id = "user123"

        # Create task
        add_result = await add_task_tool(session=session, user_id=user_id, title="Test task")
        task_id = add_result["data"]["id"]

        # Complete task
        result1 = await complete_task_tool(session=session, user_id=user_id, task_id=task_id)

        # Complete again
        result2 = await complete_task_tool(session=session, user_id=user_id, task_id=task_id)

        assert result1["status"] == "success"
        assert result2["status"] == "success"
        assert result1["data"]["completed"] is True
        assert result2["data"]["completed"] is True

    async def test_complete_task_tool_not_found(self, session):
        """Test complete_task tool with non-existent task."""
        user_id = "user123"
        fake_task_id = "00000000-0000-0000-0000-000000000000"

        result = await complete_task_tool(
            session=session, user_id=user_id, task_id=fake_task_id
        )

        assert result["status"] == "error"
        assert result["error"]["code"] == "NOT_FOUND"

    async def test_complete_task_tool_user_isolation(self, session):
        """Test complete_task tool enforces user isolation."""
        user_a = "user_a"
        user_b = "user_b"

        # Create task for user_a
        add_result = await add_task_tool(session=session, user_id=user_a, title="User A task")
        task_id = add_result["data"]["id"]

        # Try to complete as user_b
        result = await complete_task_tool(session=session, user_id=user_b, task_id=task_id)

        assert result["status"] == "error"
        assert result["error"]["code"] == "NOT_FOUND"

    async def test_end_to_end_workflow(self, session):
        """Test complete workflow: create -> list -> complete -> list."""
        user_id = "user123"

        # List empty
        list_result = await list_tasks_tool(session=session, user_id=user_id)
        assert len(list_result["data"]) == 0

        # Add task
        add_result = await add_task_tool(
            session=session,
            user_id=user_id,
            title="Buy milk",
            description="From supermarket"
        )
        task_id = add_result["data"]["id"]
        assert add_result["status"] == "success"

        # List pending
        list_result = await list_tasks_tool(
            session=session, user_id=user_id, status="pending"
        )
        assert len(list_result["data"]) == 1

        # Complete task
        complete_result = await complete_task_tool(
            session=session, user_id=user_id, task_id=task_id
        )
        assert complete_result["status"] == "success"

        # List completed
        list_result = await list_tasks_tool(
            session=session, user_id=user_id, status="completed"
        )
        assert len(list_result["data"]) == 1
        assert list_result["data"][0]["completed"] is True

        # List pending (should be empty)
        list_result = await list_tasks_tool(
            session=session, user_id=user_id, status="pending"
        )
        assert len(list_result["data"]) == 0

    async def test_multiple_users_isolation(self, session):
        """Test tool isolation between multiple users."""
        user_a = "user_a"
        user_b = "user_b"

        # User A creates tasks
        for i in range(3):
            await add_task_tool(session=session, user_id=user_a, title=f"Task A{i}")

        # User B creates tasks
        for i in range(2):
            await add_task_tool(session=session, user_id=user_b, title=f"Task B{i}")

        # List tasks
        list_a = await list_tasks_tool(session=session, user_id=user_a)
        list_b = await list_tasks_tool(session=session, user_id=user_b)

        assert len(list_a["data"]) == 3
        assert len(list_b["data"]) == 2

        # Verify no overlap
        ids_a = {t["id"] for t in list_a["data"]}
        ids_b = {t["id"] for t in list_b["data"]}
        assert ids_a.isdisjoint(ids_b)
