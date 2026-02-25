# Feature Specification: Task Management REST API

**Feature Branch**: `002-task-mgmt-api`
**Created**: 2026-01-10
**Status**: Draft
**Input**: User description: "Implement all task CRUD operations via FastAPI backend with Neon PostgreSQL and JWT authentication. Support task completion toggle. Ensure tasks are associated with authenticated users. Validate and handle errors in API requests."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Basic Task Management (Priority: P1)

As a registered user, I want to create, view, update, and delete my tasks so that I can organize my daily activities.

**Why this priority**: Core functionality of the application. Everything else builds on this.

**Independent Test**: Can be tested via REST clients by performing GET, POST, PUT, DELETE operations on the `/api/{user_id}/tasks` endpoints with a valid JWT.

**Acceptance Scenarios**:

1. **Given** an authenticated user, **When** they send a POST request to `/api/{user_id}/tasks` with task details, **Then** a new task is created and associated with their account.
2. **Given** an authenticated user with existing tasks, **When** they send a GET request to `/api/{user_id}/tasks`, **Then** they receive a list of only their tasks.
3. **Given** an existing task, **When** the owner sends a DELETE request to `/api/{user_id}/tasks/{id}`, **Then** the task is removed from the system.

---

### User Story 2 - Task Completion Workflow (Priority: P2)

As a user, I want to quickly toggle the completion status of a task so that I can track my progress.

**Why this priority**: Essential for the "management" aspect of the app; high user value for tracking.

**Independent Test**: Send a PATCH request to `/api/{user_id}/tasks/{id}/complete` and verify the `is_completed` field in the database.

**Acceptance Scenarios**:

1. **Given** an incomplete task, **When** the user toggles completion, **Then** the task state changes to "completed".
2. **Given** a completed task, **When** the user toggles completion, **Then** the task state changes to "incomplete".

---

### User Story 3 - Secure User Access (Priority: P1)

As a user, I want to ensure my tasks are private and only accessible by me even if others use the same system.

**Why this priority**: Critical security requirement to prevent data leaks between users.

**Independent Test**: Attempt to access or modify a task belonging to User A while authenticated as User B.

**Acceptance Scenarios**:

1. **Given** User A's task, **When** User B attempts to access it via GET `/api/{user_a_id}/tasks/{id}`, **Then** a 403 Forbidden or 404 Not Found error is returned.
2. **Given** an unauthenticated request, **When** any task endpoint is called, **Then** a 401 Unauthorized error is returned.

---

### Edge Cases

- **Task not found**: System handles requests for non-existent IDs with a descriptive 404 error.
- **Invalid Input**: System validates task titles (e.g., non-empty) and descriptions, returning 422 Unprocessable Entity for invalid data.
- **User ID mismatch**: System ensures the `user_id` in the URL matches the sub/id in the JWT token.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST ensure user isolation via JWT authentication (verified against Better Auth).
- **FR-002**: System MUST allow users to List, Create, Read, Update, and Delete (CRUD) tasks.
- **FR-003**: System MUST provide a PATCH endpoint specifically for toggling task completion status.
- **FR-004**: System MUST persist data in Neon PostgreSQL via SQLModel ORM.
- **FR-005**: All API calls MUST return appropriate HTTP status codes (200/201 Success, 401 Unauth, 403 Forbidden, 404 Not Found, 422 Validation Error).
- **FR-006**: System MUST filter all queries by `user_id` to ensure data privacy.

### Key Entities *(include if feature involves data)*

- **Task**: Represents a single to-do item.
  - Attributes: `id` (UUID/Int), `title` (String), `description` (String, optional), `is_completed` (Boolean), `created_at` (Timestamp), `updated_at` (Timestamp), `user_id` (String/Relation).
- **User**: (External Reference) The authenticated entity owning the tasks.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of task operations (CRUD) are successfully performed by authenticated users via API.
- **SC-002**: 0% of tasks are accessible by users other than their owner (Zero cross-user data leakage).
- **SC-003**: API response time for task listing stays under 500ms for up to 100 tasks per user.
- **SC-004**: All invalid or unauthorized requests result in correct HTTP 4xx status codes with JSON error bodies.
