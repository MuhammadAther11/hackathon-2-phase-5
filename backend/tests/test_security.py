import pytest
from fastapi import status
from src.auth.jwt import get_current_user

def test_cross_user_isolation(client):
    user_a = "user_a"
    user_b = "user_b"

    # Create task for User A
    from src.main import app
    app.dependency_overrides[get_current_user] = lambda: user_a
    resp_a = client.post(
        f"/api/{user_a}/tasks",
        json={"title": "User A Task"}
    )
    task_a_id = resp_a.json()["id"]

    # Switch to User B
    app.dependency_overrides[get_current_user] = lambda: user_b

    # Attempt to read User A's task
    resp_get = client.get(f"/api/{user_a}/tasks/{task_a_id}")
    # The current implementation returns 403 because verify_user_match checks path param vs JWT
    assert resp_get.status_code == status.HTTP_403_FORBIDDEN

    # Attempt to access via user_b's path
    resp_get_b = client.get(f"/api/{user_b}/tasks/{task_a_id}")
    # Should be 404 because query filters by user_id
    assert resp_get_b.status_code == status.HTTP_404_NOT_FOUND

    # Attempt to delete User A's task
    resp_del = client.delete(f"/api/{user_b}/tasks/{task_a_id}")
    assert resp_del.status_code == status.HTTP_404_NOT_FOUND

def test_unauthorized_access(client):
    from src.main import app
    app.dependency_overrides.clear() # Remove mock
    response = client.get("/api/any_user/tasks")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
