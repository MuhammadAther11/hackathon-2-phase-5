# Data Model: Cohere-based AI Agent

**Date**: 2026-02-08
**Feature**: 2-cohere-agent
**Status**: Phase 1 Design Complete

## Overview

This document defines the data entities for conversation history and confirmation state management. All data is persisted in Neon PostgreSQL via SQLModel ORM.

---

## Entity: ConversationMessage

**Purpose**: Represents a single message in a chat conversation (from user or agent).

### SQLModel Definition

```python
from sqlmodel import SQLModel, Field, Column, Text
from datetime import datetime
from typing import Optional
from enum import Enum
import uuid

class SenderType(str, Enum):
    USER = "user"
    AGENT = "agent"

class ConversationMessage(SQLModel, table=True):
    """Conversation message entity for chat history."""

    __tablename__ = "conversation_messages"

    # Primary Key
    id: Optional[str] = Field(
        default_factory=lambda: str(uuid.uuid4()),
        primary_key=True
    )

    # Foreign Keys
    user_id: str = Field(..., index=True, max_length=256)
    session_id: str = Field(..., index=True)

    # Message Content
    message_text: str = Field(..., min_length=1, max_length=5000, sa_column=Column(Text))
    sender: SenderType = Field(...)

    # Agent Metadata
    intent: Optional[str] = Field(
        default=None,
        max_length=100,
        description="Detected intent: add_task, list_tasks, complete_task, update_task, delete_task, unclear"
    )
    mcp_tool_used: Optional[str] = Field(default=None, max_length=100)
    tool_result: Optional[dict] = Field(default=None, sa_column=Column(JSON))

    # Timestamp
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
```

### Indexes

- PRIMARY (id)
- idx_user_session (user_id, session_id, created_at DESC)
- idx_user_created (user_id, created_at DESC)

---

## Entity: ChatSession

**Purpose**: Groups conversation messages into sessions for organization and efficient retrieval.

### SQLModel Definition

```python
class ChatSession(SQLModel, table=True):
    """Chat session entity for grouping conversations."""

    __tablename__ = "chat_sessions"

    # Primary Key
    id: Optional[str] = Field(
        default_factory=lambda: str(uuid.uuid4()),
        primary_key=True
    )

    # Foreign Key
    user_id: str = Field(..., index=True, max_length=256)

    # Session Metadata
    title: Optional[str] = Field(
        default=None,
        max_length=200,
        description="Auto-generated from first message"
    )

    # Timestamps
    started_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    last_activity_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    ended_at: Optional[datetime] = Field(default=None)
```

### Indexes

- PRIMARY (id)
- idx_user_activity (user_id, last_activity_at DESC)

---

## Entity: ConfirmationState

**Purpose**: Stores pending confirmation requests for destructive operations (delete).

### SQLModel Definition

```python
class ConfirmationState(SQLModel, table=True):
    """Pending confirmation state for destructive operations."""

    __tablename__ = "confirmation_states"

    # Primary Key
    id: Optional[str] = Field(
        default_factory=lambda: str(uuid.uuid4()),
        primary_key=True
    )

    # Foreign Keys
    user_id: str = Field(..., index=True, max_length=256)
    session_id: str = Field(...)

    # Confirmation Details
    pending_operation: str = Field(..., max_length=50)  # "delete_task"
    task_id: str = Field(..., max_length=36)
    task_title: str = Field(..., max_length=500)

    # Expiration
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    expires_at: datetime = Field(...)  # created_at + 5 minutes
```

### Indexes

- PRIMARY (id)
- idx_user_expiry (user_id, expires_at)

---

## Database Schema

### conversation_messages Table

```sql
CREATE TABLE conversation_messages (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(256) NOT NULL,
    session_id VARCHAR(36) NOT NULL,
    message_text TEXT NOT NULL,
    sender VARCHAR(20) NOT NULL CHECK (sender IN ('user', 'agent')),
    intent VARCHAR(100),
    mcp_tool_used VARCHAR(100),
    tool_result JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_user_session (user_id, session_id, created_at DESC),
    INDEX idx_user_created (user_id, created_at DESC)
);
```

### chat_sessions Table

```sql
CREATE TABLE chat_sessions (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(256) NOT NULL,
    title VARCHAR(200),
    started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_activity_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP,

    INDEX idx_user_activity (user_id, last_activity_at DESC)
);
```

### confirmation_states Table

```sql
CREATE TABLE confirmation_states (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(256) NOT NULL,
    session_id VARCHAR(36) NOT NULL,
    pending_operation VARCHAR(50) NOT NULL,
    task_id VARCHAR(36) NOT NULL,
    task_title VARCHAR(500) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,

    INDEX idx_user_expiry (user_id, expires_at)
);
```

---

## Agent Workflow

### Request Flow

```
1. User sends message via POST /api/chat/message
2. FastAPI extracts user_id from JWT
3. Agent retrieves/creates session:
   - If session_id provided: use existing
   - If no session_id: create new session
4. Agent retrieves last 10 messages for context
5. Store user message in conversation_messages
6. Check for pending confirmation:
   - If exists and user says "yes" → execute pending operation
   - If exists and user says "no" → cancel and delete confirmation
7. Send message + context + tools to Cohere API
8. Cohere returns response:
   - If tool_call: extract tool name and parameters
   - If no tool_call: general conversational response
9. If tool is delete_task:
   - Create confirmation_state (if no pending confirmation)
   - Return confirmation question
10. Execute MCP tool with user_id + parameters
11. Generate natural language response from tool result
12. Store agent response in conversation_messages
13. Update session last_activity_at
14. Return response to user
```

### State Transitions

**ChatSession**:
```
New message →
  If no session: Create session (started_at = now)
  Update last_activity_at = now
  If last_activity_at > 24h ago: Create new session
```

**ConfirmationState**:
```
Delete intent detected →
  Create confirmation_state (expires_at = now + 5 min)
  Ask user "Are you sure?"

User responds "yes" →
  Execute delete_task
  Delete confirmation_state

User responds "no" →
  Delete confirmation_state
  Return cancellation message

Timeout (expires_at passed) →
  Cleanup job deletes expired confirmations
```

---

## Query Patterns

### Query 1: Get Recent Conversation Context

```python
messages = session.exec(
    select(ConversationMessage)
    .where(
        (ConversationMessage.user_id == user_id) &
        (ConversationMessage.session_id == session_id)
    )
    .order_by(ConversationMessage.created_at.desc())
    .limit(10)
).all()
```

**Latency**: <20ms with proper index

### Query 2: Check Pending Confirmation

```python
confirmation = session.exec(
    select(ConfirmationState)
    .where(
        (ConfirmationState.user_id == user_id) &
        (ConfirmationState.session_id == session_id) &
        (ConfirmationState.expires_at > datetime.now(timezone.utc))
    )
).first()
```

**Latency**: <10ms

### Query 3: Get or Create Session

```python
# Get latest active session
session = session.exec(
    select(ChatSession)
    .where(
        (ChatSession.user_id == user_id) &
        (ChatSession.ended_at.is_(None))
    )
    .order_by(ChatSession.last_activity_at.desc())
).first()

# If no active session or last activity >24h ago, create new
if not session or (datetime.now(timezone.utc) - session.last_activity_at).total_seconds() > 86400:
    session = ChatSession(user_id=user_id, title="New conversation")
    session.add(session)
    session.commit()
```

**Latency**: <50ms

---

## Performance Targets

| Operation | Target p95 Latency | Components |
|-----------|-------------------|------------|
| Store user message | <50ms | DB insert |
| Retrieve context (10 msgs) | <50ms | Indexed query |
| Cohere API call | <3s | External API |
| MCP tool execution | <500ms | From feature 1 |
| Store agent response | <50ms | DB insert |
| **Total agent response** | **<5s** | All components |

---

## Summary

Three new entities support conversation persistence and agent state:
- **ConversationMessage**: Chat history with intent and tool metadata
- **ChatSession**: Session grouping with activity timestamps
- **ConfirmationState**: Pending delete confirmations with expiration

Agent workflow: Message → Context retrieval → Cohere intent detection → MCP tool execution → Response generation → History storage

All queries indexed for <100ms latency. Total agent response time <5s including Cohere API call.

