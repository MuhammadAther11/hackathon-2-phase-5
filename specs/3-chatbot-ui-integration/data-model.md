# Data Model: Chat API, Chatbot UI & Frontend UI/UX Integration

**Date**: 2026-02-08
**Feature**: 3-chatbot-ui-integration
**Status**: Phase 1 Design Complete

## Overview

This document defines the data structures for the frontend-backend integration of the AI-powered chatbot UI. Since this is primarily a frontend integration feature, the focus is on frontend state models and API contracts with the existing backend.

---

## Entity: ChatMessage (Frontend State)

**Purpose**: Represents a single message in the chat interface (user or agent)

### TypeScript Interface

```typescript
interface ChatMessage {
  id: string;                    // Unique message identifier (UUID)
  message_text: string;          // The actual message content
  sender: 'user' | 'agent';      // Who sent the message
  timestamp: string;             // ISO datetime string (from backend)
  intent_detected?: string;      // Intent detected by agent (add_task, list_tasks, etc.)
  mcp_tool_used?: string;        // Tool executed by agent (if applicable)
  tool_result?: any;             // Result from MCP tool execution
  is_loading?: boolean;          // Temporary state for agent response
}
```

### Validation Rules

| Field | Validation | Error Code |
|-------|------------|------------|
| id | Required, UUID format | INVALID_ID |
| message_text | Required, 1-5000 chars | INVALID_MESSAGE_LENGTH |
| sender | Required, enum: 'user' \| 'agent' | INVALID_SENDER |
| timestamp | Required, ISO 8601 format | INVALID_TIMESTAMP |
| intent_detected | Optional, enum from MCP tools | INVALID_INTENT |
| is_loading | Optional, boolean | N/A |

### State Transitions

```
┌─────────────────┐
│ New Message     │
│ (user input)    │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ Sent to API     │
│ (waiting...)    │
└─────────┬───────┘
          │
    ┌─────▼─────┐
    │ Loading   │
    │ Indicator │
    │ (agent)   │
    └─────┬─────┘
          │
          ▼
┌─────────────────┐
│ Response        │
│ Received        │
└─────────────────┘
```

---

## Entity: ThemePreference (Frontend State)

**Purpose**: Stores user's theme preference (light/dark mode)

### TypeScript Interface

```typescript
type Theme = 'light' | 'dark' | 'system';

interface ThemePreference {
  theme: Theme;           // Current theme setting
  last_updated: string;   // Timestamp when preference last changed
  persist_across_sessions: boolean;  // Whether to save to localStorage
}
```

### Validation Rules

| Field | Validation | Error Code |
|-------|------------|------------|
| theme | Required, enum: 'light' \| 'dark' \| 'system' | INVALID_THEME |
| last_updated | Required, ISO 8601 format | INVALID_TIMESTAMP |
| persist_across_sessions | Required, boolean | INVALID_PERSISTENCE |

---

## Entity: ChatSession (Backend-Managed)

**Purpose**: Links conversation messages together (managed by backend from Feature 2)

### Backend SQLModel (from Feature 2)

```python
class ChatSession(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    user_id: str = Field(index=True)  # From JWT token
    title: Optional[str] = Field(default=None, max_length=200)  # Auto-generated from first message
    started_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    last_activity_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    ended_at: Optional[datetime] = Field(default=None)
```

**Note**: This entity is managed by the Cohere agent backend (Feature 2). Frontend only receives session_id in API responses.

---

## API Contract: Chat Endpoint

### POST /api/chat/message

**Purpose**: Send user message to AI agent and receive response

#### Request

```json
{
  "message_text": "Add a task to buy groceries",
  "session_id": "optional-session-id-if-continuing-conversation"
}
```

**Headers**:
- `Authorization: Bearer {jwt_token}` (required)
- `Content-Type: application/json`

#### Response (Success)

```json
{
  "status": "success",
  "data": {
    "session_id": "uuid-string",
    "agent_response": "I've added a task for 'Buy groceries'",
    "intent_detected": "add_task",
    "mcp_tool_executed": "add_task",
    "tool_result": {
      "id": "task-uuid",
      "user_id": "user-uuid",
      "title": "Buy groceries",
      "description": null,
      "completed": false,
      "created_at": "2026-02-08T10:00:00Z",
      "updated_at": "2026-02-08T10:00:00Z"
    }
  }
}
```

#### Response (Error)

```json
{
  "status": "error",
  "error": {
    "code": "INVALID_INPUT",
    "message": "Message text is required and must be less than 5000 characters",
    "details": {
      "received_length": 5001
    }
  }
}
```

#### Error Codes

| Code | HTTP Status | Reason |
|------|-------------|---------|
| UNAUTHORIZED | 401 | Missing or invalid JWT token |
| INVALID_INPUT | 400 | Message text missing or too long (>5000 chars) |
| FORBIDDEN | 403 | User does not have permission (shouldn't occur with valid JWT) |
| INTERNAL_ERROR | 500 | Cohere API failure, MCP tool failure, or database error |

---

## API Contract: Chat History Endpoint

### GET /api/chat/history

**Purpose**: Retrieve conversation history for a session

#### Request

```
GET /api/chat/history?session_id={session_id}&limit=50
```

**Headers**:
- `Authorization: Bearer {jwt_token}` (required)

#### Response (Success)

```json
{
  "status": "success",
  "data": {
    "session_id": "uuid-string",
    "messages": [
      {
        "id": "message-uuid",
        "message_text": "Add a task to buy groceries",
        "sender": "user",
        "created_at": "2026-02-08T10:00:00Z",
        "intent_detected": null
      },
      {
        "id": "message-uuid-2",
        "message_text": "I've added a task for 'Buy groceries'",
        "sender": "agent",
        "created_at": "2026-02-08T10:00:03Z",
        "intent_detected": "add_task",
        "mcp_tool_executed": "add_task",
        "tool_result": {
          "id": "task-uuid",
          "title": "Buy groceries",
          "completed": false
        }
      }
    ]
  }
}
```

#### Error Response

Same format as POST endpoint, with error codes:
- UNAUTHORIZED (401): Missing/invalid JWT
- NOT_FOUND (404): Session doesn't exist or user doesn't own it
- INTERNAL_ERROR (500): Database error

---

## Component State Models

### ChatInterface Component State

```typescript
interface ChatInterfaceState {
  messages: ChatMessage[];        // All messages in current conversation
  inputText: string;              // Current text in input box
  isLoading: boolean;             // Whether agent is processing
  error: string | null;           // Error message if any
  sessionId: string | null;       // Current chat session ID
  scrollToBottom: boolean;        // Whether to auto-scroll to new messages
}
```

### ThemeProvider Component State

```typescript
interface ThemeProviderState {
  theme: Theme;                   // Current theme (light/dark/system)
  toggleTheme: () => void;        // Function to switch theme
  isThemeLoaded: boolean;         // Whether theme preference loaded from storage
}
```

---

## Database Integration (Backend)

### Conversation Message Mapping

The frontend interacts with these backend entities from Feature 2:

**ConversationMessage** (backend/src/models/conversation.py):
- Maps to ChatMessage frontend state (with additional fields)
- user_id (from JWT) ensures user isolation
- session_id groups messages into conversations
- created_at ensures chronological ordering

**Relationships**:
- ChatSession (1) ←→ (Many) ConversationMessage
- User (1) ←→ (Many) ChatSession
- User (1) ←→ (Many) ConversationMessage (via user_id)

---

## Performance Targets

| Operation | Target p95 | Measurement Point |
|-----------|------------|-------------------|
| POST /api/chat/message | <6 seconds | From request to complete response |
| GET /api/chat/history (50 messages) | <500ms | From request to response |
| Theme toggle apply | <100ms | From click to DOM update |
| Page transition | <300ms | From navigation to rendered |
| Animation frame rate | 60fps | Smooth visual experience |
| Mobile touch response | <150ms | From touch to visual feedback |

---

## Security Considerations

### User Isolation

- **Frontend**: Never manipulate user_id; comes from JWT via backend
- **Backend**: All queries filtered by user_id from JWT token
- **Database**: WHERE clauses ensure user A cannot access user B's conversations

### Data Validation

- **Frontend**: Input length validation (message text <5000 chars)
- **Backend**: JWT validation on all requests, SQLModel validation
- **API**: Structured error responses prevent information disclosure

### Content Security

- **Frontend**: Sanitize message display to prevent XSS
- **Backend**: MCP tools handle all database operations safely
- **API**: JSON responses only, no raw HTML injection

---

## Integration Points

### With Feature 1 (MCP Tools)
- Chat API calls trigger MCP tools via Cohere agent
- Task operations (add, list, complete, update, delete) executed through MCP layer
- User isolation maintained through JWT → user_id → database WHERE clauses

### With Feature 2 (Cohere Agent)
- POST /api/chat/message → Cohere intent detection → MCP tool selection → tool execution
- Agent returns structured responses with intent and tool result metadata
- Conversation history stored in database for context preservation

### With Phase II (Better Auth)
- JWT tokens from Better Auth used for authentication
- user_id from JWT `sub` claim ensures user isolation
- All chat endpoints protected with JWT middleware

---

## Summary

The data model defines clear contracts between frontend and backend:
- **Frontend State**: ChatMessage, ThemePreference, component states
- **API Contracts**: Well-defined request/response formats with error handling
- **Backend Integration**: Leverages existing Feature 2 entities for persistence
- **Security**: JWT-based user isolation maintained throughout
- **Performance**: Targets defined for all operations

This model enables the complete chatbot experience: natural language task management with persistent history, theme switching, and responsive design while maintaining security and performance requirements.

