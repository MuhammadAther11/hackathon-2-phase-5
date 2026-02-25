import pytest
from uuid import uuid4
from fastapi import status
from src.auth.jwt import get_current_user

# Mocking get_current_user
def mock_get_current_user():
    return "test_user_123"

@pytest.fixture(autouse=True)
def override_auth(client):
    from src.main import app
    app.dependency_overrides[get_current_user] = mock_get_current_user
    yield
    app.dependency_overrides.clear()

def test_create_task(client):
    response = client.post(
        "/api/test_user_123/tasks",
        json={"title": "Test Task", "description": "Test Description"}
    )
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["title"] == "Test Task"
    assert data["user_id"] == "test_user_123"

def test_read_tasks(client):
    # First create a task
    client.post(
        "/api/test_user_123/tasks",
        json={"title": "Task 1"}
    )
    response = client.get("/api/test_user_123/tasks")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) >= 1
    assert data[0]["title"] == "Task 1"

def test_delete_task(client):
    # Create task
    resp = client.post(
        "/api/test_user_123/tasks",
        json={"title": "Delete Me"}
    )
    task_id = resp.json()["id"]

    # Delete task
    response = client.delete(f"/api/test_user_123/tasks/{task_id}")
    assert response.status_code == status.HTTP_204_NO_CONTENT

    # Verify gone
    resp_get = client.get(f"/api/test_user_123/tasks/{task_id}")
    assert resp_get.status_code == status.HTTP_404_NOT_FOUND

def test_toggle_task_completion(client):
    # Create incomplete task
    resp = client.post(
        "/api/test_user_123/tasks",
        json={"title": "Toggle Task", "is_completed": False}
    )
    task_id = resp.json()["id"]

    # Toggle to complete
    response = client.patch(f"/api/test_user_123/tasks/{task_id}/complete")
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["completed"] is True

    # Toggle back to incomplete
    response = client.patch(f"/api/test_user_123/tasks/{task_id}/complete")
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["completed"] is False
