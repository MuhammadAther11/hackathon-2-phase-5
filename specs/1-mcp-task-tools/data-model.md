# Data Model: MCP Server & Task Tools

**Date**: 2026-02-07
**Feature**: 1-mcp-task-tools
**Status**: Phase 1 Design Complete

## Overview

This document defines the data entities, schemas, relationships, and state transitions for the MCP task tools layer. All data is persisted in Neon PostgreSQL via SQLModel ORM.

---

## Entity: Task

**Purpose**: Represents a to-do item owned by a user. Tasks are created, read, updated, and deleted via MCP tools.

### SQLModel Definition

```python
from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Optional
import uuid

class Task(SQLModel, table=True):
    """Task entity for MCP tool operations"""

    __tablename__ = "tasks"

    # Primary Key
    id: Optional[str] = Field(
        default_factory=lambda: str(uuid.uuid4()),
        primary_key=True,
        description="Unique task identifier (UUID)"
    )

    # Foreign Key
    user_id: str = Field(
        ...,
        index=True,
        description="Owner of the task (from JWT 'sub' claim)",
        max_length=256
    )

    # Core Fields
    title: str = Field(
        ...,
        min_length=1,
        max_length=500,
        description="Task title (required)"
    )
    description: Optional[str] = Field(
        default=None,
        max_length=5000,
        description="Task description (optional)"
    )

    # Status
    completed: bool = Field(
        default=False,
        description="Whether task is completed"
    )

    # Timestamps
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="UTC timestamp when task was created"
    )
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="UTC timestamp when task was last updated"
    )

    # Constraints
    class Config:
        # Enforce constraints at ORM level
        validate_assignment = True
```

### Validation Rules

| Field | Rule | Error Code |
|-------|------|-----------|
| id | Must be unique UUID | DUPLICATE_ID |
| user_id | Must match JWT claim; non-empty | INVALID_USER |
| title | Required; 1-500 chars | INVALID_TITLE |
| description | Optional; 0-5000 chars | INVALID_DESCRIPTION |
| completed | Boolean; must be true/false | INVALID_STATUS |
| created_at | Immutable; set on creation | IMMUTABLE_CREATED_AT |
| updated_at | Auto-updated on mutation | N/A |

### State Transitions

```
┌─────────────┐
│ New Task    │
│ created=F   │
└──────┬──────┘
       │ [complete_task called]
       ▼
┌─────────────┐
│ Completed   │
│ created=T   │
└─────────────┘
(Terminal state; cannot uncomplete)
```

**Allowed Transitions**:
- New task → Completed (via complete_task)
- Completed → Completed (idempotent; no change)
- Any → Any (title/description updates; completed status unchanged unless complete_task called)

**Forbidden Transitions**:
- Completed → New (uncomplete not allowed)
- Deleted tasks → Any (deletion is terminal)

---

## Entity: User (Reference)

**Purpose**: Represents an authenticated user. Tasks are owned by users via user_id foreign key.

### Reference Definition

```python
class User(SQLModel, table=False):
    """User entity (referenced, not directly managed by MCP tools)"""

    id: str = Field(..., primary_key=True)  # From JWT 'sub' claim
    email: str = Field(...)  # From Better Auth
    # Other user fields managed by Phase II authentication
```

**Note**: Users are managed by Phase II (Better Auth integration). MCP tools do NOT create or modify users. User_id is extracted from JWT token and used only for task ownership filtering.

---

## Database Schema

### Tasks Table

```sql
CREATE TABLE tasks (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(256) NOT NULL,
    title VARCHAR(500) NOT NULL,
    description VARCHAR(5000),
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CHECK (LENGTH(title) > 0),
    CHECK (LENGTH(description) <= 5000 OR description IS NULL),

    -- Indexes
    INDEX idx_user_tasks (user_id, completed),
    INDEX idx_user_created (user_id, created_at DESC),
    INDEX idx_updated (updated_at DESC)
);
```

### Indexes

| Index | Columns | Purpose |
|-------|---------|---------|
| PRIMARY | id | Unique task lookup |
| idx_user_tasks | (user_id, completed) | Filter tasks by user + status |
| idx_user_created | (user_id, created_at DESC) | Ordered task list by user |
| idx_updated | (updated_at DESC) | Recent updates query |

### Constraints

| Constraint | Type | Rule |
|-----------|------|------|
| PRIMARY KEY (id) | Unique | One task per ID |
| NOT NULL (user_id) | Domain | Every task has an owner |
| NOT NULL (title) | Domain | Tasks must have a title |
| NOT NULL (completed) | Domain | Status must be specified |
| CHECK title length | Domain | Title 1-500 chars |
| CHECK description length | Domain | Description 0-5000 chars |
| DEFAULT (completed=false) | Default | New tasks are pending |
| DEFAULT (created_at) | Default | Set to creation time |
| DEFAULT (updated_at) | Default | Set to creation time |

---

## Data Persistence & Durability

### Transaction Isolation

- **Isolation Level**: READ_COMMITTED (default for Neon PostgreSQL)
- **Conflict Resolution**: Optimistic (no locking; fail on conflict)
- **Retry Logic**: Application layer (MCP tools implement retry on conflict)

### Backup & Recovery

- **Backup Strategy**: Neon automatic snapshots (daily + transaction log)
- **Recovery RTO**: 24 hours (point-in-time restore)
- **Data Retention**: 7 days of snapshots

### Data Retention & Expiration

- **Task Retention**: Indefinite (unless explicitly deleted by user or admin)
- **Soft Delete**: Not used; hard delete only (deleted tasks removed from database)
- **Archive Strategy**: None (Phase III scope does not include archival)

---

## Query Patterns & Optimization

### Query 1: List Tasks by User

```python
# Pseudocode
async def list_tasks(session: AsyncSession, user_id: str, status: Optional[str] = None):
    query = select(Task).where(Task.user_id == user_id)

    if status == "completed":
        query = query.where(Task.completed == True)
    elif status == "pending":
        query = query.where(Task.completed == False)

    query = query.order_by(Task.created_at.desc())
    results = await session.execute(query)
    return results.scalars().all()
```

**Index Used**: idx_user_tasks (user_id, completed)
**Expected Rows**: 0 - N (all user's tasks)
**Latency**: <50ms with 1000 tasks

### Query 2: Create Task

```python
async def add_task(session: AsyncSession, user_id: str, title: str, description: Optional[str] = None):
    task = Task(user_id=user_id, title=title, description=description)
    session.add(task)
    await session.commit()
    return task
```

**Index Used**: None (insert)
**Latency**: <100ms (network + commit)

### Query 3: Get Task by ID & User

```python
async def get_task(session: AsyncSession, user_id: str, task_id: str):
    query = select(Task).where(
        (Task.id == task_id) & (Task.user_id == user_id)
    )
    result = await session.execute(query)
    return result.scalars().first()
```

**Index Used**: PRIMARY KEY (id) + filtering by user_id in application
**Latency**: <20ms

### Query 4: Update Task

```python
async def update_task(session: AsyncSession, user_id: str, task_id: str, **updates):
    task = await get_task(session, user_id, task_id)
    if not task:
        raise 404

    for key, value in updates.items():
        if value is not None:
            setattr(task, key, value)

    task.updated_at = datetime.utcnow()
    await session.commit()
    return task
```

**Index Used**: PRIMARY KEY (id)
**Latency**: <50ms

### Query 5: Delete Task

```python
async def delete_task(session: AsyncSession, user_id: str, task_id: str):
    task = await get_task(session, user_id, task_id)
    if not task:
        raise 404

    await session.delete(task)
    await session.commit()
```

**Index Used**: PRIMARY KEY (id)
**Latency**: <50ms

---

## Performance Targets & Benchmarks

| Operation | Expected p95 Latency | Benchmark Conditions |
|-----------|---------------------|----------------------|
| add_task | <100ms | Single task creation |
| list_tasks (10 tasks) | <50ms | Small list, indexed query |
| list_tasks (100 tasks) | <100ms | Medium list, indexed query |
| list_tasks (1000 tasks) | <200ms | Large list, indexed query |
| get_task | <20ms | Direct lookup by ID |
| update_task | <50ms | Single field update |
| complete_task | <50ms | Boolean toggle + timestamp |
| delete_task | <50ms | Hard delete |

**Total Tool Latency Budget**: <500ms p95 (includes network, serialization, database)

---

## Migration Strategy

### Initial Schema Creation

```sql
-- Run via Alembic or SQLModel create_all()
CREATE TABLE IF NOT EXISTS tasks (
    ... (see schema above)
);
```

### Schema Evolution (Future)

If new fields are needed:
1. Add column to schema
2. Create Alembic migration
3. Deploy migration (adds column with default)
4. Update SQLModel definition
5. Deploy application

**Rollback Strategy**: Alembic downgrade (remove column; recreate if reverting)

---

## Data Privacy & Security

### User Isolation

- **Access Control**: All queries filtered by user_id from JWT claim
- **Validation**: SQL WHERE clause ensures user_id match
- **Audit**: No audit logging in Phase III scope

### Sensitive Data

- **Encryption**: Task content is not encrypted (Phase III does not require it)
- **Secrets**: Database password stored in environment variable (DATABASE_URL)
- **PII**: Task descriptions may contain user data; no special handling

---

## Summary

The Task entity is simple and efficient:
- 7 fields (id, user_id, title, description, completed, created_at, updated_at)
- 4 indexes for optimal query performance
- User isolation enforced at query level
- State transitions limited (pending → completed only)
- All data persisted in Neon PostgreSQL with asyncpg

This design supports all MCP tool operations with <500ms p95 latency target.

