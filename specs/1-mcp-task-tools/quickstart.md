# Quickstart: MCP Server & Task Tools

**Date**: 2026-02-07
**Feature**: 1-mcp-task-tools
**Target**: Backend developers implementing MCP tool layer

---

## Overview

This guide walks through setting up the MCP task tools server, configuring it with Neon PostgreSQL, and testing tools locally.

---

## Prerequisites

- Python 3.11+
- PostgreSQL 14+ (or Neon account with serverless database)
- pip and virtualenv
- Git

---

## Step 1: Clone & Setup Environment

```bash
# Clone repository (or navigate to existing)
cd ~/projects/phase-3-todo-chatbot

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### requirements.txt

```
fastapi==0.104.1
sqlalchemy==2.0.23
sqlmodel==0.0.14
asyncpg==0.29.0
pydantic==2.5.0
python-multipart==0.0.6
pydantic-settings==2.1.0
python-jose==3.3.0
python-dotenv==1.0.0
pytest==7.4.3
pytest-asyncio==0.21.1
httpx==0.25.1
mcp==0.1.0  # Official MCP SDK (version TBD based on release)
```

---

## Step 2: Configure Environment Variables

Create a `.env` file in the project root:

```bash
# Database
DATABASE_URL=postgresql+asyncpg://user:password@host:port/dbname

# JWT / Better Auth
BETTER_AUTH_SECRET=your-secret-key-from-phase-ii

# Server
SERVER_HOST=0.0.0.0
SERVER_PORT=8000

# Logging
LOG_LEVEL=INFO
```

### Getting DATABASE_URL from Neon

1. Log in to https://console.neon.tech
2. Create a new project or use existing
3. Copy the connection string: `postgresql://user:password@host/dbname`
4. Replace with async driver: `postgresql+asyncpg://...`

### BETTER_AUTH_SECRET

Get this from Phase II configuration. It should match the key used to issue JWT tokens.

---

## Step 3: Run Database Migrations

```bash
# Using Alembic (if migrations are set up)
alembic upgrade head

# Or using SQLModel create_all() (manual)
python -c "
from backend.db.connection import engine
from backend.models.task import Task
from sqlalchemy import text
import asyncio

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Task.__table__.create, checkfirst=True)

asyncio.run(init_db())
"
```

---

## Step 4: Start the MCP Server

```bash
# Option A: Run as FastAPI application with MCP endpoint
python -m backend.main

# Output:
# INFO:     Uvicorn running on http://0.0.0.0:8000

# Option B: Run MCP server directly (stdio mode)
python -m backend.mcp.server

# Output will depend on client connecting via stdio
```

---

## Step 5: Test Tools Locally

### Test 1: Add a Task (Direct Function Call)

```python
# test_add_task.py
import asyncio
from backend.services.task_service import add_task_impl
from backend.db.connection import engine
from sqlalchemy.ext.asyncio import AsyncSession

async def test_add_task():
    async with AsyncSession(engine) as session:
        result = await add_task_impl(
            session=session,
            user_id="test-user-123",
            title="Buy groceries",
            description="Milk, eggs, bread"
        )

    print("Result:", result)
    assert result["status"] == "success"
    assert result["data"]["title"] == "Buy groceries"
    assert result["data"]["user_id"] == "test-user-123"

asyncio.run(test_add_task())
```

Run it:
```bash
python test_add_task.py
# Output:
# Result: {
#   'status': 'success',
#   'data': {
#     'id': '550e8400-e29b-41d4-a716-446655440000',
#     'user_id': 'test-user-123',
#     'title': 'Buy groceries',
#     'description': 'Milk, eggs, bread',
#     'completed': False,
#     'created_at': '2026-02-07T10:00:00Z',
#     'updated_at': '2026-02-07T10:00:00Z'
#   }
# }
```

### Test 2: List Tasks

```python
import asyncio
from backend.services.task_service import list_tasks_impl
from backend.db.connection import engine
from sqlalchemy.ext.asyncio import AsyncSession

async def test_list_tasks():
    async with AsyncSession(engine) as session:
        result = await list_tasks_impl(
            session=session,
            user_id="test-user-123",
            status=None  # Get all tasks
        )

    print("Result:", result)
    assert result["status"] == "success"
    assert len(result["data"]) >= 1

asyncio.run(test_list_tasks())
```

### Test 3: Complete a Task

```python
import asyncio
from backend.services.task_service import complete_task_impl
from backend.db.connection import engine
from sqlalchemy.ext.asyncio import AsyncSession

async def test_complete_task():
    async with AsyncSession(engine) as session:
        # First, add a task
        add_result = await add_task_impl(
            session=session,
            user_id="test-user-123",
            title="Test task"
        )
        task_id = add_result["data"]["id"]

        # Complete it
        complete_result = await complete_task_impl(
            session=session,
            user_id="test-user-123",
            task_id=task_id
        )

    print("Result:", complete_result)
    assert complete_result["data"]["completed"] is True

asyncio.run(test_complete_task())
```

---

## Step 6: Test Via MCP Protocol (If Running as Service)

### Using MCP Test Client

```python
# test_mcp_client.py
import asyncio
from mcp.client.stdio import StdioClientTransport
from mcp.client.session import ClientSession

async def test_mcp_tools():
    # Connect to MCP server via stdio
    transport = StdioClientTransport("python", ["-m", "backend.mcp.server"])

    async with ClientSession(transport):
        # Discover tools
        tools = await transport.list_tools()
        print(f"Available tools: {[t.name for t in tools]}")

        # Call add_task
        result = await transport.call_tool(
            "add_task",
            {
                "user_id": "test-user-456",
                "title": "Learn MCP",
                "description": "Understand MCP protocol"
            }
        )
        print("Tool result:", result)

asyncio.run(test_mcp_tools())
```

---

## Step 7: Run Unit & Integration Tests

```bash
# Run all tests
pytest tests/ -v

# Run specific test file
pytest tests/unit/test_task_service.py -v

# Run with coverage
pytest tests/ --cov=backend --cov-report=html

# Run integration tests only
pytest tests/integration/ -v -s
```

---

## Step 8: Deploy to Production

### Option A: Docker

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ backend/

ENV DATABASE_URL=postgresql+asyncpg://...
ENV BETTER_AUTH_SECRET=...

CMD ["python", "-m", "backend.main"]
```

Build and run:
```bash
docker build -t mcp-task-tools .
docker run -e DATABASE_URL=... -e BETTER_AUTH_SECRET=... -p 8000:8000 mcp-task-tools
```

### Option B: Direct FastAPI Deployment

Use Uvicorn with gunicorn on your server:
```bash
gunicorn backend.main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker
```

---

## Troubleshooting

### Issue: "DATABASE_URL not found"

**Solution**: Ensure `.env` file exists in project root and `python-dotenv` is imported:
```python
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()
```

### Issue: "Task not found" when completing/updating

**Solution**: Verify user_id matches. Task lookup filters by both task_id AND user_id:
```python
# This will fail (user_id doesn't match)
result = await complete_task_impl(
    session=session,
    user_id="different-user",  # Wrong user!
    task_id="550e8400-..."
)
```

### Issue: Slow tool response (>500ms)

**Solution**:
1. Check database connection: `asyncpg` should be used, not `psycopg2`
2. Verify indexes are created: `CREATE INDEX idx_user_tasks ON tasks(user_id, completed)`
3. Check database load: Run explain plan on slow queries

### Issue: "JWT validation failed"

**Solution**: Ensure BETTER_AUTH_SECRET matches Phase II configuration:
```bash
# Decode token to verify claims
python -c "
import jwt
token = 'eyJ0eX...'
decoded = jwt.decode(token, 'your-secret', algorithms=['HS256'])
print(decoded)  # Check 'sub' field for user_id
"
```

---

## Next Steps

1. **Phase 2 (Tasks)**: Break down implementation into:
   - Database schema migration
   - SQLModel Task model
   - Task service layer
   - MCP tool definitions
   - JWT middleware
   - Tests

2. **Implementation**: Follow Agentic Dev workflow
   - Use Backend Agent for FastAPI/MCP code
   - Use DB Agent for schema/migrations
   - Use Auth Agent for JWT validation

3. **Integration**: Connect with OpenAI Agents SDK (Phase III integration point)

---

## Reference Documentation

- [Official MCP SDK (Python)](https://github.com/modelcontextprotocol/python-sdk)
- [SQLModel Documentation](https://sqlmodel.tiangolo.com)
- [FastAPI Guide](https://fastapi.tiangolo.com)
- [asyncpg Documentation](https://magicstack.github.io/asyncpg)
- [Neon PostgreSQL Guide](https://neon.tech/docs)

