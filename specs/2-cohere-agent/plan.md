# Implementation Plan: Cohere-based AI Agent

**Branch**: `2-cohere-agent` | **Date**: 2026-02-08 | **Spec**: [specs/2-cohere-agent/spec.md](spec.md)
**Input**: Feature specification from `/specs/2-cohere-agent/spec.md`

**Note**: This plan implements Phase III AI agent layer that interprets natural language and controls MCP task tools via Cohere API.

## Summary

Build a Cohere-based AI agent that interprets natural language user messages, detects task operation intent, selects and executes appropriate MCP tools, and returns friendly conversational responses. The agent is stateless, stores all conversation history in PostgreSQL, and operates exclusively via MCP tools (no direct database access).

## Technical Context

**Language/Version**: Python 3.11+
**Primary Dependencies**: Cohere Python SDK, FastAPI, SQLModel, pydantic
**Storage**: Neon PostgreSQL (conversation history via SQLModel)
**Testing**: pytest, pytest-asyncio for async agent testing
**Target Platform**: Linux server (FastAPI backend)
**Project Type**: Backend agent service
**Performance Goals**: Agent response ≤5 seconds p95 (Cohere API call + MCP tool execution)
**Constraints**: Stateless agent; no direct DB access; MCP tools only
**Scale/Scope**: Multi-user chat; 5 task intents; conversation persistence

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] Security: Strict isolation and JWT integrity enforced?
  - User isolation via user_id from JWT (passed to MCP tools)
  - Conversation history filtered by user_id
  - No cross-user message access
- [x] Accuracy: Backend-Frontend-Database synchronization verified?
  - Agent uses MCP tools only (no direct DB)
  - MCP tools handle all data persistence
  - Conversation history stored separately from task data
- [x] Reliability: Error handling (401, 404, 500) and status codes defined?
  - MCP tool failures handled gracefully
  - Cohere API errors return user-friendly messages
  - 400: Invalid user input
  - 500: Agent/API/tool failures
- [x] Usability: Responsive layout and UX intuition planned?
  - Not applicable (backend agent only; UI separate)
  - Agent responses are conversational and friendly
  - Confirmation dialogs for delete operations
- [x] Reproducibility: Setup documentation and env vars defined?
  - Environment variables: COHERE_API_KEY, DATABASE_URL
  - Setup documented in quickstart.md (Phase 1)
  - Conversation schema defined in data-model.md

## Project Structure

### Documentation (this feature)

```text
specs/2-cohere-agent/
├── spec.md              # Feature specification (complete)
├── plan.md              # This file (implementation plan)
├── research.md          # Phase 0 (resolve unknowns)
├── data-model.md        # Phase 1 (conversation entities)
├── quickstart.md        # Phase 1 (agent setup)
├── contracts/           # Phase 1 (agent API schemas)
├── checklists/
│   └── requirements.md  # Quality checklist (complete)
└── tasks.md             # Phase 2 output (/sp.tasks)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── agent/
│   │   ├── __init__.py
│   │   ├── cohere_client.py          # Cohere API wrapper
│   │   ├── intent_detector.py        # Intent classification logic
│   │   ├── tool_selector.py          # MCP tool selection
│   │   ├── response_generator.py     # Natural language response generation
│   │   └── agent.py                  # Main agent orchestration
│   ├── models/
│   │   ├── conversation.py           # SQLModel ConversationMessage entity
│   │   └── session.py                # SQLModel ChatSession entity
│   ├── services/
│   │   └── conversation_service.py   # Store/retrieve conversation history
│   ├── api/
│   │   └── chat.py                   # FastAPI endpoint for chat messages
│   ├── schemas/
│   │   └── chat.py                   # Pydantic ChatRequest, ChatResponse
│   └── mcp/
│       └── tools.py                  # MCP tools (from feature 1)
├── tests/
│   ├── unit/
│   │   ├── test_intent_detector.py   # Intent detection tests
│   │   ├── test_tool_selector.py     # Tool selection tests
│   │   ├── test_response_generator.py # Response generation tests
│   │   └── test_conversation_service.py # History storage tests
│   └── integration/
│       └── test_agent_workflow.py    # End-to-end agent tests
└── .env.example
```

**Structure Decision**: Extend existing backend/ structure with agent/ module. Agent layer sits between FastAPI API and MCP tools. Conversation history stored in PostgreSQL alongside task data. All state managed in database.

## Complexity Tracking

No Constitution violations. Design follows all principles:
- Security: User isolation via JWT-extracted user_id
- Accuracy: Agent uses MCP tools only; no direct DB access
- Reliability: Cohere API errors and MCP tool failures handled gracefully
- Reproducibility: Conversation schema and agent setup fully documented

---

## Phase 0: Research & Unknowns Resolution

### Research Tasks

1. **Cohere API capabilities**: Text generation, intent classification, tool calling support
2. **Intent detection patterns**: How to map natural language → 5 task operations reliably
3. **Tool selection logic**: How to extract parameters (task_id, title, description) from natural language
4. **Conversation persistence**: How to store/retrieve message history efficiently
5. **Confirmation dialogs**: How to implement stateful confirmation flow in stateless agent

### Consolidated Research (research.md - Phase 0 output)

**Decision 1: Use Cohere's Chat API with Tool Calling**

Cohere's Chat API (v2) supports tool/function calling natively. We'll define MCP tools as Cohere "tools" and let the API select which tool to call based on user message.

**Rationale**: Cohere handles intent detection and parameter extraction automatically. More reliable than manual NLP parsing.

**Alternatives considered**:
- Manual intent classification: Regex patterns or keywords
  - Rejected: Brittle, doesn't handle varied phrasing well
- Cohere Classify API: Explicit intent classification endpoint
  - Rejected: Chat API with tools is more integrated

**Decision 2: Implement Confirmation State in Database**

Store pending confirmations (for delete operations) in a confirmation_state table with timeout.

**Rationale**: Agent is stateless, so confirmation state must be in database. Timeout ensures stale confirmations don't persist.

**Alternatives considered**:
- In-memory confirmation state: Store in Redis or memory
  - Rejected: Violates stateless design; requires additional infrastructure
- Skip confirmation: Assume user intends destructive action
  - Rejected: Poor UX; accidental deletions

**Decision 3: Conversation History with Session Grouping**

Store messages in conversation_messages table, grouped by session_id. Sessions created implicitly on first message, timeout after 24 hours of inactivity.

**Rationale**: Enables conversation continuity and history retrieval. Session grouping improves query performance.

**Alternatives considered**:
- Flat message storage without sessions: All messages in one table
  - Rejected: Harder to group conversations; poor query performance
- Redis for conversation cache: Fast access but requires sync
  - Rejected: Adds complexity; PostgreSQL sufficient for Phase III

---

## Phase 1: Design & Contracts

### 1a. Data Model (data-model.md - Phase 1 output)

**ConversationMessage Entity**:
- `id`: UUID primary key
- `user_id`: String (from JWT, indexed)
- `session_id`: UUID (foreign key to ChatSession)
- `message_text`: String (required, 1-5000 characters)
- `sender`: Enum ("user" | "agent")
- `intent`: String (optional: add_task, list_tasks, complete_task, update_task, delete_task, unclear)
- `mcp_tool_used`: String (optional: tool name if agent executed one)
- `tool_result`: JSONB (optional: tool execution result)
- `created_at`: Datetime (UTC)

**ChatSession Entity**:
- `id`: UUID primary key
- `user_id`: String (from JWT, indexed)
- `title`: String (optional, auto-generated from first message)
- `started_at`: Datetime (UTC)
- `last_activity_at`: Datetime (UTC, updated on every message)
- `ended_at`: Datetime (optional, set after 24h timeout)

**ConfirmationState Entity** (for delete confirmations):
- `id`: UUID primary key
- `user_id`: String (from JWT, indexed)
- `session_id`: UUID
- `pending_operation`: String (e.g., "delete_task")
- `task_id`: String (UUID of task to delete)
- `task_title`: String (for confirmation message)
- `created_at`: Datetime (UTC)
- `expires_at`: Datetime (UTC, timeout after 5 minutes)

**Indexes**:
- (user_id, session_id) on conversation_messages
- (user_id, last_activity_at DESC) on chat_sessions
- (user_id, created_at DESC) on conversation_messages
- (user_id, expires_at) on confirmation_state

### 1b. API Contracts (contracts/ - Phase 1 output)

**Agent Chat Endpoint**:
- **POST /api/chat/message**
- **Input**: { user_id (from JWT), session_id (optional), message_text }
- **Output**: { session_id, agent_response, intent_detected, mcp_tool_executed, tool_result }
- **Errors**: 400 (invalid input), 401 (no JWT), 500 (agent/Cohere/tool failure)

**Conversation History Endpoint**:
- **GET /api/chat/history**
- **Input**: user_id (from JWT), session_id (optional), limit (default 50)
- **Output**: { messages: [{ id, message_text, sender, created_at, intent }], session_id }
- **Errors**: 401 (no JWT), 500 (DB error)

**Agent Workflow**:
```
User message →
  1. Store user message in DB
  2. Send to Cohere Chat API with MCP tool definitions
  3. Cohere detects intent and selects tool
  4. If delete: Check confirmation_state
     - If no confirmation: Ask confirmation, store state, return
     - If confirmed: Execute delete_task MCP tool
  5. Execute selected MCP tool
  6. Generate natural language response from tool result
  7. Store agent response in DB
  8. Return to user
```

### 1c. Quickstart (quickstart.md - Phase 1 output)

**Setup Instructions**:
1. Set COHERE_API_KEY in .env
2. Run database migration for conversation_messages, chat_sessions, confirmation_state tables
3. Test agent: Send POST request to /api/chat/message
4. Verify conversation stored in DB

**Example Agent Usage**:
```python
# User sends message
POST /api/chat/message
{
  "message_text": "Add a task to buy milk"
}

# Response
{
  "session_id": "uuid",
  "agent_response": "I've added a task for 'Buy milk'. Would you like to add any details?",
  "intent_detected": "add_task",
  "mcp_tool_executed": "add_task",
  "tool_result": { "id": "task-uuid", "title": "Buy milk", ... }
}
```

---

## Phase 2: Task Generation

Task generation will occur in the `/sp.tasks` command and will break down Phase 1 design into:
- Conversation database schema and migrations
- Cohere API client wrapper
- Intent detection logic
- Tool selection and parameter extraction
- MCP tool execution layer
- Response generation from tool results
- Confirmation state management
- FastAPI chat endpoint
- Unit and integration tests

**Output**: tasks.md with step-by-step implementation tasks

---

## Key Architectural Decisions

### Decision 1: Cohere Chat API with Tool Calling

**Rationale**: Cohere's native tool calling eliminates need for manual intent detection and parameter extraction. More reliable and maintainable.

**Implication**: MCP tools must be converted to Cohere tool schema format. Cohere API decides which tool to call; agent just orchestrates execution.

### Decision 2: Stateless Agent + Database State

**Rationale**: Agent doesn't retain memory between requests. All state (conversation history, confirmation pending) stored in PostgreSQL.

**Implication**: Every request fetches conversation context from DB. Adds latency (~50-100ms) but enables horizontal scaling and crash recovery.

### Decision 3: Confirmation State with Timeout

**Rationale**: Delete confirmations stored in DB with 5-minute expiration. Prevents accidental deletions while keeping UX smooth.

**Implication**: Separate confirmation_state table required. Cleanup job needed to remove expired confirmations.

### Decision 4: Session-based Conversation History

**Rationale**: Group messages by session for better organization and query performance. Session created implicitly on first message.

**Implication**: Easier to retrieve recent conversation. Session timeout (24h) requires cleanup job.

---

## Validation Plan

### Test Coverage

1. **Unit Tests** (test_intent_detector.py):
   - Test intent detection for 50+ natural language variations (10 per operation)
   - Verify parameter extraction (task_id, title, description)
   - Test ambiguous input handling

2. **Unit Tests** (test_tool_selector.py):
   - Verify correct MCP tool selected for each intent
   - Test tool parameter mapping from Cohere response
   - Verify user_id passed to all tools

3. **Unit Tests** (test_response_generator.py):
   - Test natural language generation from tool results
   - Test error message formatting
   - Test confirmation dialog generation

4. **Integration Tests** (test_agent_workflow.py):
   - End-to-end: User message → Cohere → tool execution → response
   - Test all 5 task operations (add, list, complete, update, delete)
   - Test confirmation flow for delete
   - Verify conversation persistence across requests

### Validation Checklist

- [ ] Intent detection ≥95% accuracy across 50 test inputs
- [ ] Agent response time ≤5 seconds p95
- [ ] All user messages stored in database
- [ ] All agent responses stored with tool details
- [ ] Confirmation flow works for delete operations
- [ ] Ambiguous input triggers clarifying questions
- [ ] MCP tool failures return friendly errors
- [ ] Conversation retrieval works after restart

---

## Risk Analysis

### Risk 1: Cohere API Rate Limiting or Downtime

**Blast Radius**: All user messages blocked until API recovers

**Mitigation**:
- Implement retry logic with exponential backoff
- Cache common intent patterns locally as fallback
- Return "Service temporarily unavailable" message to user
- Log all Cohere API failures for monitoring

### Risk 2: Intent Detection Accuracy Below Target

**Blast Radius**: Wrong tool executed; poor user experience

**Mitigation**:
- Test with 50+ natural language variations per intent
- Use Cohere's confidence scores; ask for clarification if <0.8
- Provide "I'm not sure" fallback with suggested actions
- Log all intent detection results for analysis

### Risk 3: Conversation History Query Performance

**Blast Radius**: Slow agent responses (>5 seconds)

**Mitigation**:
- Index (user_id, session_id) for fast retrieval
- Limit conversation context to last 10 messages
- Use async queries to avoid blocking
- Measure p95 latency with 1000+ messages

### Risk 4: Stateless Confirmation Flow Complexity

**Blast Radius**: Confirmation state lost or inconsistent

**Mitigation**:
- Use database with expiration (5 min timeout)
- Cleanup job removes expired confirmations
- If confirmation not found: treat as new request
- Log all confirmation state transitions

---

## Next Steps

1. **Phase 0 (Research)**: Create `research.md` with consolidated findings on Cohere Chat API, tool calling, and conversation persistence
2. **Phase 1 (Design)**: Create `data-model.md`, `contracts/`, and `quickstart.md` with detailed schemas and agent workflow
3. **Phase 2 (Tasks)**: Run `/sp.tasks 2-cohere-agent` to generate implementation tasks
4. **Implementation**: Execute tasks using Backend Agent for FastAPI/agent logic, DB Agent for conversation schema
5. **Validation**: Test intent detection accuracy, response time, conversation persistence

