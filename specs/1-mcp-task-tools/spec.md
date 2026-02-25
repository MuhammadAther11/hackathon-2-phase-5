# Feature Specification: MCP Server & Task Tools

**Feature Branch**: `1-mcp-task-tools`
**Created**: 2026-02-07
**Status**: Draft
**Input**: User description: "Spec 1: MCP Server & Task Tools (Phase III)"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - AI Agent Retrieves User Tasks (Priority: P1)

An AI agent needs to list all tasks for a user to provide context before suggesting task management actions.

**Why this priority**: This is the foundation for any agent-driven task management. Without the ability to retrieve tasks, the agent cannot provide informed responses or suggestions.

**Independent Test**: Can be tested by invoking the `list_tasks` MCP tool with a user_id and verifying that it returns all persisted tasks for that user, categorized by status.

**Acceptance Scenarios**:

1. **Given** a user with 5 completed tasks and 3 pending tasks, **When** the agent calls `list_tasks(user_id)`, **Then** the tool returns a JSON list containing all 8 tasks with their current status.
2. **Given** a user with no tasks, **When** the agent calls `list_tasks(user_id)`, **Then** the tool returns an empty JSON array.
3. **Given** a user with tasks from different days, **When** the agent calls `list_tasks(user_id, status="pending")`, **Then** the tool returns only pending tasks, ordered by creation date.

---

### User Story 2 - AI Agent Creates a New Task (Priority: P1)

An AI agent receives a natural language user request (e.g., "Add a task to buy groceries") and creates a new task in the system using the MCP tool.

**Why this priority**: Core CRUD functionality; enables the primary use case of task creation via chat.

**Independent Test**: Can be tested by calling `add_task(user_id, "Buy groceries", "Milk, eggs, bread")` and verifying the task is persisted in the database with a unique ID and can be retrieved.

**Acceptance Scenarios**:

1. **Given** a valid user_id and task title, **When** the agent calls `add_task`, **Then** the tool returns a JSON response with the new task ID, title, description, and `completed: false` status.
2. **Given** a task without a description, **When** the agent calls `add_task(user_id, title_only)`, **Then** the tool creates the task with an empty or null description field.
3. **Given** an invalid user_id, **When** the agent calls `add_task`, **Then** the tool returns a JSON error with a 403 Forbidden status (user ownership enforcement).

---

### User Story 3 - AI Agent Completes a Task (Priority: P1)

An AI agent marks a task as complete when the user confirms task completion (e.g., "I finished buying groceries").

**Why this priority**: Enables task status updates, a key part of task management workflow.

**Independent Test**: Can be tested by calling `complete_task(user_id, task_id)` and verifying the task status changes to `completed: true` and persists across requests.

**Acceptance Scenarios**:

1. **Given** a pending task with ID 42, **When** the agent calls `complete_task(user_id, 42)`, **Then** the tool returns JSON confirming `completed: true` and the task is persisted.
2. **Given** a task already marked as completed, **When** the agent calls `complete_task` again, **Then** the tool returns the task with `completed: true` (idempotent).
3. **Given** a task_id that does not belong to the user, **When** the agent calls `complete_task`, **Then** the tool returns a 403 Forbidden error.

---

### User Story 4 - AI Agent Updates Task Metadata (Priority: P2)

An AI agent modifies a task's title or description in response to user requests (e.g., "Change the due date of buying groceries to tomorrow" — description update).

**Why this priority**: Enables refinement of tasks after creation; less critical than CRUD basics but improves UX.

**Independent Test**: Can be tested by calling `update_task(user_id, task_id, title="New Title")` and verifying changes persist.

**Acceptance Scenarios**:

1. **Given** a task with title "Buy groceries" and description "Milk, eggs", **When** the agent calls `update_task(user_id, task_id, title="Buy groceries for dinner")`, **Then** the tool returns the updated task with the new title.
2. **Given** a task, **When** the agent calls `update_task` with only description (no title), **Then** the tool updates only the description and leaves the title unchanged.
3. **Given** a task_id that does not belong to the user, **When** the agent calls `update_task`, **Then** the tool returns a 403 Forbidden error.

---

### User Story 5 - AI Agent Deletes a Task (Priority: P2)

An AI agent removes a task from the system when the user explicitly requests deletion (e.g., "Remove the groceries task").

**Why this priority**: Important for user control but less frequently used than create/list/complete operations.

**Independent Test**: Can be tested by calling `delete_task(user_id, task_id)` and verifying the task no longer appears in list results.

**Acceptance Scenarios**:

1. **Given** a task with ID 42 owned by a user, **When** the agent calls `delete_task(user_id, 42)`, **Then** the tool returns a success JSON response and the task no longer appears in `list_tasks`.
2. **Given** a task that has already been deleted, **When** the agent calls `delete_task` again, **Then** the tool returns a 404 Not Found error.
3. **Given** a task_id that does not belong to the user, **When** the agent calls `delete_task`, **Then** the tool returns a 403 Forbidden error (user isolation).

---

### Edge Cases

- What happens when an agent calls a tool with an invalid user_id (malformed JWT)?
- How does the system handle concurrent requests to the same task from different agents?
- What happens when a tool is called after the database connection is lost?
- How does the system enforce user isolation when a user attempts to access another user's tasks?
- What is the maximum size of a task description, and how is overflow handled?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST enforce user isolation via user_id extracted from JWT token in all tool calls.
- **FR-002**: System MUST implement `add_task(user_id, title, description?)` tool that creates a task and persists it in the database.
- **FR-003**: System MUST implement `list_tasks(user_id, status?)` tool that retrieves all tasks for a user, optionally filtered by status.
- **FR-004**: System MUST implement `complete_task(user_id, task_id)` tool that marks a task as completed and persists the change.
- **FR-005**: System MUST implement `update_task(user_id, task_id, title?, description?)` tool that modifies task metadata.
- **FR-006**: System MUST implement `delete_task(user_id, task_id)` tool that removes a task from the database.
- **FR-007**: All tools MUST return structured JSON responses with consistent format: `{status: "success"|"error", data: {...}, error?: {...}}`.
- **FR-008**: All tools MUST return appropriate HTTP status codes: 200 (success), 400 (bad request), 403 (forbidden/unauthorized), 404 (not found), 500 (server error).
- **FR-009**: Tools MUST NOT retain state between calls (stateless design).
- **FR-010**: Tools MUST NOT contain AI logic; they are purely data access/mutation operations.
- **FR-011**: All tools MUST be discoverable and callable by the OpenAI Agents SDK via the Official MCP SDK protocol.
- **FR-012**: Task data MUST be persisted in Neon PostgreSQL and survive application restarts.

### Key Entities

- **Task**: Represents a to-do item owned by a user. Attributes: id (unique), user_id (owner), title (required), description (optional), completed (boolean, default false), created_at (timestamp), updated_at (timestamp).
- **User**: Represents an authenticated user. Attributes: id (unique), email, JWT token (for tool authentication).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Each tool call completes in under 500ms (p95 latency) with a 1000-task database.
- **SC-002**: All five tools (add, list, complete, update, delete) execute correctly and persist data; 100% of test cases pass.
- **SC-003**: The MCP server correctly enforces user isolation; no user can access or modify another user's tasks (0% unauthorized access).
- **SC-004**: Tasks persist across application restarts; querying a task ID after server restart returns the same task data unchanged.
- **SC-005**: The AI agent can invoke all five tools without errors using the Official MCP SDK protocol; agent receives properly formatted JSON responses.

## Assumptions

- Better Auth is already configured and issuing valid JWT tokens with embedded user_id claims.
- FastAPI backend is already set up with SQLModel ORM connected to Neon PostgreSQL.
- OpenAI Agents SDK is available and can discover MCP tools via the Official MCP SDK.
- Tool timeouts and retry logic are handled by the OpenAI Agents SDK and FastAPI middleware.
- Users are already authenticated; the focus of this feature is tool-driven data access, not authentication itself.

## Out of Scope

- Authentication/signup/signin (handled by Phase II and Better Auth integration).
- AI agent decision logic (agent selects tools; this feature provides the tools only).
- User interface or chat UI (frontend is separate).
- Real-time task synchronization or WebSocket support.
- Task scheduling or deadline enforcement.
- Collaboration or task sharing between users.
- Audit logging (basic logging only; no compliance audit trail).
