# Research: MCP Server & Task Tools - Phase 0

**Date**: 2026-02-07
**Feature**: 1-mcp-task-tools
**Status**: Complete

## Overview

This document consolidates research findings on implementing the MCP (Model Context Protocol) tool layer for Phase III of the Todo AI Chatbot. All unknowns from the Technical Context have been resolved through research and best practices.

---

## Research Question 1: Official MCP SDK Python Bindings

**Unknown**: How to define tools in Python using the Official MCP SDK? What is the async support?

### Decision
Use the **Official MCP SDK** with Pydantic models for tool schemas.

### Rationale
- Production-ready Python bindings for MCP protocol
- Pydantic integration allows tool parameters to be defined as typed dataclasses
- Supports both sync and async tool execution
- Integrates cleanly with FastAPI and OpenAI SDK

### Alternatives Considered
1. **Custom tool protocol**: Build own JSON RPC wrapper
   - Rejected: No standardization; harder to debug; OpenAI SDK has native MCP support

2. **Anthropic MCP SDK**: Different protocol, Anthropic-specific
   - Rejected: Feature requires OpenAI Agents SDK, which expects Microsoft/Official MCP

### Implementation Details
```python
# Tool definition pattern (pseudocode)
from mcp.server.fastmcp import FastMCP
from pydantic import BaseModel

class AddTaskInput(BaseModel):
    user_id: str
    title: str
    description: Optional[str] = None

@mcp_server.tool()
def add_task(input: AddTaskInput) -> dict:
    # Implementation
    return {"status": "success", "data": {...}}
```

---

## Research Question 2: JWT Token Passing to MCP Tools

**Unknown**: How is the JWT token passed from the OpenAI Agent SDK to MCP tools? Can we extract user_id from it?

### Decision
JWT token is passed via **tool context/request headers**. User_id is extracted as a claim (`sub`) from the decoded token in a **middleware layer**.

### Rationale
- OpenAI Agents SDK wraps MCP tool calls with HTTP headers (if MCP runs as HTTP endpoint) or via context (if subprocess)
- Better Auth (Phase II integration) issues JWT with `sub` claim containing user_id
- Extraction at middleware level provides consistent user_id to all tool functions
- No need to pass token explicitly; middleware handles authentication

### Alternatives Considered
1. **Pass JWT as tool parameter**: Expose token to tool code
   - Rejected: Token handling belongs in middleware; tools should not handle secrets

2. **Use OpenAI SDK's built-in auth**: Rely on SDK to validate tokens
   - Rejected: Our phase III uses Better Auth (Phase II), not OpenAI's auth

### Implementation Details
```python
# Middleware pattern (pseudocode)
from fastapi import Request

async def extract_user_context(request: Request):
    auth_header = request.headers.get("Authorization")
    token = auth_header.split(" ")[1] if auth_header else None

    payload = jwt.decode(token, BETTER_AUTH_SECRET)
    user_id = payload.get("sub")

    request.state.user_id = user_id  # Available to tools
    return user_id
```

---

## Research Question 3: Neon PostgreSQL + SQLModel Async Compatibility

**Unknown**: Does SQLModel work with async database drivers for Neon? What driver should we use?

### Decision
Use **SQLAlchemy 2.0 async engine** with **asyncpg** driver. SQLModel 0.0.14+ supports async_sessionmaker.

### Rationale
- asyncpg is the fastest async PostgreSQL driver for Python
- SQLModel's async support allows non-blocking database queries
- Achieves <500ms p95 latency target for tool execution
- Neon supports asyncpg connection strings out of the box

### Alternatives Considered
1. **psycopg2 (sync driver)**: Traditional PostgreSQL driver
   - Rejected: Blocks event loop; tool latency unacceptable

2. **asyncpg directly** (skip SQLModel): Raw async SQL
   - Rejected: No ORM; more manual boilerplate; less maintainable

### Implementation Details
```python
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
import sqlmodel

DATABASE_URL = "postgresql+asyncpg://user:pass@host/db"

engine = create_async_engine(
    DATABASE_URL,
    echo=False,
    pool_pre_ping=True,  # Test connections before use
    pool_size=10,
    max_overflow=5,
)

async_session = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

async def get_session():
    async with async_session() as session:
        yield session
```

---

## Research Question 4: MCP Tool Error Handling & Response Format

**Unknown**: What is the standard JSON error response format for MCP tools? Should we follow a specific convention?

### Decision
Adopt **consistent JSON response format** across all tools:
- Success: `{ "status": "success", "data": {...} }`
- Error: `{ "status": "error", "error": { "code": "...", "message": "...", "details": {...} } }`

### Rationale
- Familiar pattern in REST APIs; consistent with OpenAI SDK expectations
- Includes HTTP status codes (200, 400, 403, 404, 500) for proper error semantics
- "data" field preserves response structure for optional fields (description, details)
- "code" field allows programmatic error handling by agents

### Alternatives Considered
1. **Raw exceptions**: Throw Python exceptions from tools
   - Rejected: MCP protocol expects JSON; exceptions don't serialize well

2. **HTTP status codes only**: No JSON wrapper
   - Rejected: Loses structured error information (field, validation details)

### Implementation Details
```python
# Success response
{
  "status": "success",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "user_id": "user123",
    "title": "Buy groceries",
    "description": "Milk, eggs, bread",
    "completed": false,
    "created_at": "2026-02-07T10:00:00Z",
    "updated_at": "2026-02-07T10:00:00Z"
  }
}

# Error response
{
  "status": "error",
  "error": {
    "code": "UNAUTHORIZED",
    "message": "User does not own this task",
    "details": { "task_id": "...", "owner": "user456" }
  }
}
```

---

## Research Question 5: OpenAI Agents SDK Tool Discovery & Invocation

**Unknown**: How does the OpenAI Agents SDK discover MCP tools? What does the tool registry look like?

### Decision
OpenAI Agents SDK discovers tools via **MCP server protocol**. Tools are registered using Official MCP SDK's `@mcp_server.tool()` decorator. Registry is queryable by the agent.

### Rationale
- MCP protocol includes tool discovery mechanism
- Official MCP SDK provides standardized registration
- OpenAI Agents SDK has native support for MCP protocol
- No manual registration needed; tools are auto-discoverable

### Alternatives Considered
1. **Manual tool JSON configuration**: Define tools in config file
   - Rejected: Extra maintenance; error-prone; SDK expects native registration

2. **Anthropic-style tool binding**: Use different protocol
   - Rejected: Feature requires OpenAI Agents SDK

### Implementation Details
```python
# Tool registration via Official MCP SDK
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("todo-tools")

@mcp.tool()
async def add_task(user_id: str, title: str, description: Optional[str] = None) -> dict:
    """Add a new task for the user"""
    # Implementation
    pass

@mcp.tool()
async def list_tasks(user_id: str, status: Optional[str] = None) -> dict:
    """List tasks for the user"""
    # Implementation
    pass

# Tools are auto-registered and discoverable via MCP protocol
# OpenAI Agent SDK queries this registry and populates available tools
```

---

## Research Question 6: Testing MCP Tools in Isolation

**Unknown**: How do we test MCP tools independently? Do we need a full MCP server running?

### Decision
**Unit tests** call tool functions directly (no MCP protocol). **Integration tests** invoke via MCP server. Both approaches used for comprehensive coverage.

### Rationale
- Unit tests are fast and focus on business logic
- Integration tests verify MCP protocol compliance
- Both needed to catch issues at different layers

### Alternatives Considered
1. **Integration tests only**: Test through MCP protocol always
   - Rejected: Slow; harder to debug; overkill for unit tests

2. **Unit tests only**: Mock database
   - Rejected: Misses integration issues (async, connection pooling)

### Implementation Details
```python
# Unit test (direct function call)
@pytest.mark.asyncio
async def test_add_task_creates_record():
    async with AsyncSession(engine) as session:
        result = await add_task_impl(
            session=session,
            user_id="user123",
            title="Test",
            description="Test task"
        )
    assert result["status"] == "success"
    assert result["data"]["title"] == "Test"

# Integration test (via MCP protocol)
@pytest.mark.asyncio
async def test_mcp_tool_add_task():
    # Start MCP server
    # Connect via MCP client
    # Invoke tool via protocol
    # Verify response matches contract
    pass
```

---

## Research Question 7: Database Connection Pooling & Latency

**Unknown**: What connection pool size and settings achieve <500ms p95 latency?

### Decision
Use **asyncpg connection pool** with:
- `pool_size=10` (base connections)
- `max_overflow=5` (overflow connections)
- `pool_pre_ping=True` (test connections)

### Rationale
- 10 base connections handles typical concurrent load
- 5 overflow allows burst load handling
- pre_ping eliminates stale connection errors
- asyncpg is optimized for PostgreSQL; minimal overhead

### Alternatives Considered
1. **pool_size=100**: Over-provisioning
   - Rejected: Wastes memory; Neon serverless has connection limits

2. **No pooling**: Direct connections
   - Rejected: Connection overhead makes latency unacceptable

### Implementation Details
```python
engine = create_async_engine(
    DATABASE_URL,
    pool_size=10,
    max_overflow=5,
    pool_pre_ping=True,
    echo=False,
)

# With 1000 tasks in DB and typical query patterns:
# Expected p95 latency: 200-400ms (database) + 50-100ms (network/serialization) = 250-500ms
```

---

## Summary: Key Architectural Decisions

| Decision | Choice | Why |
|----------|--------|-----|
| Tool Framework | Official MCP SDK | Production-ready, native OpenAI integration |
| JWT Extraction | Middleware + Better Auth claims | Centralized auth, no token leakage |
| Database Driver | asyncpg + SQLAlchemy async | Non-blocking, <500ms latency target |
| Response Format | Structured JSON {status, data, error} | Consistent, agent-friendly, semantic HTTP codes |
| Tool Registry | MCP protocol auto-discovery | Native OpenAI Agents SDK support |
| Testing | Unit + Integration | Comprehensive coverage of logic and protocol |
| Connection Pool | pool_size=10, max_overflow=5 | Handles concurrent load without over-provisioning |

---

## Next Steps

1. **Phase 1 Design**: Use these decisions to populate data-model.md, contracts/, and quickstart.md
2. **Implementation**: Follow MCP SDK documentation for tool definitions; use asyncpg + SQLAlchemy async patterns
3. **Testing**: Write unit tests for business logic; integration tests for MCP protocol compliance
4. **Performance Validation**: Measure p95 latency with 1000-task database under concurrent load

