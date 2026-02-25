# Implementation Plan: MCP Server & Task Tools

**Branch**: `1-mcp-task-tools` | **Date**: 2026-02-07 | **Spec**: [specs/1-mcp-task-tools/spec.md](spec.md)
**Input**: Feature specification from `/specs/1-mcp-task-tools/spec.md`

**Note**: This plan implements Phase III tool layer for the Todo AI Chatbot. All task operations execute via MCP tools called by the OpenAI Agents SDK.

## Summary

Build an MCP (Model Context Protocol) server exposing five stateless tools (add_task, list_tasks, complete_task, update_task, delete_task) for the OpenAI Agents SDK to call. All tools enforce user isolation via JWT claims, persist data in Neon PostgreSQL via SQLModel, and return structured JSON responses. No state is retained by tools between calls; all mutations are captured in the database.

## Technical Context

**Language/Version**: Python 3.11+
**Primary Dependencies**: Official MCP SDK, FastAPI, SQLModel, Pydantic, Neon PostgreSQL driver
**Storage**: Neon Serverless PostgreSQL (via SQLModel ORM)
**Testing**: pytest, pytest-asyncio for async tool testing
**Target Platform**: Linux server (FastAPI backend)
**Project Type**: Backend-only (MCP server + API layer)
**Performance Goals**: Tools respond in <500ms (p95) with 1000-task database
**Constraints**: Stateless tool design; all state in database; zero cross-user data leakage
**Scale/Scope**: Multi-user support; 5 tools; task CRUD operations only

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] Security: Strict isolation and JWT integrity enforced?
  - User isolation enforced via `user_id` extracted from JWT token in each tool call
  - All tool operations filtered by `user_id`; no cross-user data access possible
  - Unauthorized access returns 403 Forbidden
- [x] Accuracy: Backend-Frontend-Database synchronization verified?
  - All mutations via MCP tools → SQLModel → Neon database
  - Stateless tools ensure no divergence; source of truth is always database
  - MCP tools confirm persistence via JSON response with created/updated task data
- [x] Reliability: Error handling (401, 404, 500) and status codes defined?
  - 200 OK: successful tool execution
  - 400 Bad Request: missing/invalid parameters
  - 403 Forbidden: user isolation violation
  - 404 Not Found: task or user not found
  - 500 Internal Server Error: database or server failure
- [x] Usability: Responsive layout and UX intuition planned?
  - Not applicable (backend-only feature; UI handled by separate ChatKit component)
  - API is clear: tool names mirror user intents (add_task, complete_task, etc.)
- [x] Reproducibility: Setup documentation and env vars defined?
  - Database schema defined in data-model.md (Phase 1)
  - Environment variables: DATABASE_URL (Neon connection), BETTER_AUTH_SECRET (JWT validation)
  - Setup documented in quickstart.md (Phase 1)

## Project Structure

### Documentation (this feature)

```text
specs/1-mcp-task-tools/
├── spec.md              # Feature specification (complete)
├── plan.md              # This file (implementation plan)
├── research.md          # Phase 0 (resolve unknowns)
├── data-model.md        # Phase 1 (database schema, entities)
├── quickstart.md        # Phase 1 (setup instructions)
├── contracts/           # Phase 1 (MCP tool schemas)
├── checklists/
│   └── requirements.md  # Quality checklist (complete)
└── tasks.md             # Phase 2 output (/sp.tasks - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── models/
│   │   ├── __init__.py
│   │   └── task.py                    # SQLModel Task entity
│   ├── services/
│   │   ├── __init__.py
│   │   └── task_service.py            # Database operations (list, create, update, delete, complete)
│   ├── mcp/
│   │   ├── __init__.py
│   │   ├── server.py                  # MCP server initialization
│   │   └── tools.py                   # Tool definitions (add_task, list_tasks, etc.)
│   ├── schemas/
│   │   ├── __init__.py
│   │   └── task.py                    # Pydantic schemas for tool I/O
│   ├── api/
│   │   ├── __init__.py
│   │   └── middleware.py              # JWT extraction middleware
│   ├── db/
│   │   ├── __init__.py
│   │   ├── connection.py              # Neon database session management
│   │   └── session.py                 # Dependency for FastAPI/tool context
│   └── main.py                        # FastAPI app (if MCP runs within FastAPI)
├── tests/
│   ├── unit/
│   │   ├── test_task_service.py      # Database operation tests
│   │   ├── test_task_model.py        # SQLModel validation tests
│   │   └── test_schemas.py           # Pydantic schema tests
│   ├── integration/
│   │   └── test_mcp_tools.py         # End-to-end tool execution tests
│   └── contract/
│       └── test_tool_contracts.py    # Verify tool schemas match MCP spec
├── .env.example
├── requirements.txt
└── pyproject.toml
```

**Structure Decision**: Backend-only monolith. MCP server runs as a subprocess or subprocess within the FastAPI application, exposing tools to the OpenAI Agents SDK via stdio or HTTP. All state managed in Neon PostgreSQL. Frontend (ChatKit) communicates with FastAPI API (not MCP directly); AI agent communicates with MCP tools.

## Complexity Tracking

No Constitution violations. Design follows all principles:
- Security: JWT-based user isolation at tool entry point
- Accuracy: Stateless tools + database as source of truth
- Reliability: Structured error responses with appropriate HTTP status codes
- Reproducibility: Schema, env vars, and setup fully documented

---

## Phase 0: Research & Unknowns Resolution

### Research Tasks

1. **Official MCP SDK Python bindings**: Verify tool definition format, async support, and integration with FastAPI/Pydantic
2. **JWT extraction in MCP context**: How to pass JWT token to MCP tools when called by OpenAI Agent SDK
3. **Neon PostgreSQL async drivers**: Verify SQLModel + asyncio compatibility with Neon
4. **Error handling patterns**: Standard JSON error response format for MCP tools
5. **Tool registry and discovery**: How OpenAI Agents SDK discovers and invokes MCP tools

### Consolidated Research (research.md - Phase 0 output)

**Decision**: Use Official MCP SDK with Pydantic models for tool schemas. JWT token passed via tool context (or extracted from request headers in FastAPI middleware). SQLModel + asyncpg for async database operations.

**Rationale**: Official SDK is production-ready; Pydantic integrates seamlessly with FastAPI and MCP; asyncpg provides non-blocking database access for tool responsiveness.

**Alternatives considered**:
- Custom tool protocol: Rejected (official SDK provides standardization and tooling)
- Synchronous database access: Rejected (blocks tool execution; async required for <500ms latency)
- Direct HTTP calls from agent: Rejected (MCP tools enforce isolation and simplify agent logic)

---

## Phase 1: Design & Contracts

### 1a. Data Model (data-model.md - Phase 1 output)

**Task Entity**:
- `id`: UUID primary key
- `user_id`: String (from JWT `sub` claim) - foreign key reference to user
- `title`: String (required, 1-500 characters)
- `description`: String (optional, 0-5000 characters)
- `completed`: Boolean (default false)
- `created_at`: Datetime (UTC, set on creation)
- `updated_at`: Datetime (UTC, updated on every modification)

**Indexes**:
- Primary: (id)
- Composite: (user_id, completed) for fast filtering by status
- Composite: (user_id, created_at DESC) for ordering

**State Transitions**:
- New task: `completed = false`
- After complete_task call: `completed = true`
- No reverse transition (once complete, stays complete; new task created for new work)

### 1b. API Contracts (contracts/ - Phase 1 output)

**Tool 1: add_task**
- **Input**: user_id (from JWT), title (string, required), description (string, optional)
- **Output**: { status: "success", data: { id, user_id, title, description, completed, created_at, updated_at } }
- **Errors**: 400 (missing title), 403 (invalid user_id), 500 (DB error)

**Tool 2: list_tasks**
- **Input**: user_id (from JWT), status (optional: "pending" | "completed" | all)
- **Output**: { status: "success", data: [ { id, user_id, title, description, completed, created_at, updated_at }, ... ] }
- **Errors**: 400 (invalid status), 500 (DB error)

**Tool 3: complete_task**
- **Input**: user_id (from JWT), task_id (UUID, required)
- **Output**: { status: "success", data: { id, user_id, title, description, completed: true, created_at, updated_at } }
- **Errors**: 403 (user not owner), 404 (task not found), 500 (DB error)

**Tool 4: update_task**
- **Input**: user_id (from JWT), task_id (UUID, required), title (optional), description (optional)
- **Output**: { status: "success", data: { id, user_id, title, description, completed, created_at, updated_at } }
- **Errors**: 400 (no fields to update), 403 (user not owner), 404 (task not found), 500 (DB error)

**Tool 5: delete_task**
- **Input**: user_id (from JWT), task_id (UUID, required)
- **Output**: { status: "success", data: { message: "Task deleted" } }
- **Errors**: 403 (user not owner), 404 (task not found), 500 (DB error)

### 1c. Quickstart (quickstart.md - Phase 1 output)

**Setup Instructions**:
1. Install dependencies: `pip install -r requirements.txt`
2. Set environment variables: `DATABASE_URL`, `BETTER_AUTH_SECRET`
3. Run Alembic migrations: `alembic upgrade head` (or use SQLModel direct if no migration tool)
4. Start MCP server: `python -m backend.mcp.server`
5. Verify tools: `python -c "from backend.mcp.server import list_tools; print(list_tools())"`

**Testing a Tool**:
```python
from backend.services.task_service import add_task_impl

result = add_task_impl(user_id="user123", title="Test task", description="Test")
print(result)  # { "status": "success", "data": { "id": "...", ... } }
```

---

## Phase 2: Task Generation

Task generation will occur in the `/sp.tasks` command and will break down Phase 1 design into:
- Database schema migration
- SQLModel Task model implementation
- Task service layer (database operations)
- MCP tool definitions and schemas
- JWT extraction and middleware
- Unit and integration tests
- Setup documentation

**Output**: tasks.md with step-by-step implementation tasks and acceptance criteria

---

## Key Architectural Decisions

### Decision 1: Stateless Tools + Database Persistence

**Rationale**: Tools must not hold state between calls. All state changes go through the database, ensuring durability and multi-agent consistency.

**Implication**: Every tool call must query the database; latency depends on database performance. Mitigation: indexed queries, async database access, connection pooling.

### Decision 2: User Isolation via JWT Claims

**Rationale**: Extract user_id from JWT token in each tool call (via middleware or context). All queries filtered by user_id at the service layer.

**Implication**: No configuration of user ownership at tool definition time; each call is independently authenticated. Simpler than RBAC but sufficient for Phase III.

### Decision 3: MCP Tools as Pure Data Functions

**Rationale**: Tools perform CRUD only; no AI logic, no decision-making, no side effects.

**Implication**: AI agent logic stays in OpenAI Agents SDK; tools are simple and testable.

### Decision 4: JSON-only Responses

**Rationale**: OpenAI Agents SDK expects structured JSON. Standardizes error reporting.

**Implication**: All tool responses (success and error) are JSON; no text or binary data.

---

## Validation Plan

### Test Coverage

1. **Unit Tests** (test_task_service.py):
   - Test each database operation in isolation (create, read, update, delete, filter by status)
   - Verify user isolation: task from user A is not visible to user B

2. **Integration Tests** (test_mcp_tools.py):
   - Test each tool end-to-end with real database connection
   - Verify tool invocation via MCP protocol
   - Verify response format matches contract

3. **Contract Tests** (test_tool_contracts.py):
   - Verify tool schemas are valid Pydantic models
   - Verify MCP tool registry is discoverable by OpenAI Agent SDK

### Validation Checklist

- [ ] Each tool performs its intended CRUD operation
- [ ] User isolation is enforced: no cross-user data leakage
- [ ] All error scenarios return appropriate HTTP status codes
- [ ] Tools respond in <500ms (p95) with 1000 tasks in database
- [ ] Data persists across application restarts
- [ ] Tools are discoverable and callable via MCP protocol
- [ ] JSON response format is consistent across all tools

---

## Risk Analysis

### Risk 1: Database Latency Under Load

**Blast Radius**: All tool calls blocked if database is slow

**Mitigation**:
- Index queries on (user_id, status) and (user_id, created_at)
- Use connection pooling to reduce overhead
- Measure p95 latency with production load test

### Risk 2: JWT Token Validation Failures

**Blast Radius**: All unauthenticated users get 403 errors

**Mitigation**:
- Centralize JWT validation in middleware
- Log all authentication failures
- Verify JWT_SECRET matches Better Auth configuration

### Risk 3: Tool Discovery Failure in MCP Protocol

**Blast Radius**: Agent cannot invoke tools

**Mitigation**:
- Test tool registry with official MCP SDK test suite
- Verify tool schemas are valid Pydantic models
- Use MCP protocol inspector to debug tool definitions

---

## Next Steps

1. **Phase 0 (Research)**: Create `research.md` with consolidated findings on MCP SDK, JWT handling, and async database patterns
2. **Phase 1 (Design)**: Create `data-model.md`, `contracts/`, and `quickstart.md` with detailed schemas and setup instructions
3. **Phase 2 (Tasks)**: Run `/sp.tasks 1-mcp-task-tools` to generate step-by-step implementation tasks
4. **Implementation**: Execute tasks using specialized agents (Backend Agent for FastAPI/MCP, DB Agent for schema/migrations, Auth Agent for JWT validation)
5. **Validation**: Run all tests in test suite; verify tools respond in <500ms and persist data correctly

