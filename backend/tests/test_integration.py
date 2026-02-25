import pytest
from fastapi import status

def test_full_crud_lifecycle(client):
    user_id = "user_456"
    from src.auth.jwt import get_current_user
    app = client.app
    app.dependency_overrides[get_current_user] = lambda: user_id

    # 1. Create
    resp = client.post(
        f"/api/{user_id}/tasks",
        json={"title": "Integration Task", "description": "Full lifecycle"}
    )
    assert resp.status_code == status.HTTP_201_CREATED
    task_id = resp.json()["id"]

    # 2. Read All
    resp = client.get(f"/api/{user_id}/tasks")
    assert resp.status_code == status.HTTP_200_OK
    assert any(t["id"] == task_id for t in resp.json())

    # 3. Read One
    resp = client.get(f"/api/{user_id}/tasks/{task_id}")
    assert resp.status_code == status.HTTP_200_OK
    assert resp.json()["title"] == "Integration Task"

    # 4. Update
    resp = client.put(
        f"/api/{user_id}/tasks/{task_id}",
        json={"title": "Updated Integration Task"}
    )
    assert resp.status_code == status.HTTP_200_OK
    assert resp.json()["title"] == "Updated Integration Task"

    # 5. Delete
    resp = client.delete(f"/api/{user_id}/tasks/{task_id}")
    assert resp.status_code == status.HTTP_204_NO_CONTENT

    # 6. Verify Delete
    resp = client.get(f"/api/{user_id}/tasks/{task_id}")
    assert resp.status_code == status.HTTP_404_NOT_FOUND
