# Tasks: MCP Server & Task Tools

**Input**: Design documents from `/specs/1-mcp-task-tools/`
**Prerequisites**: plan.md (✅), spec.md (✅), research.md (✅), data-model.md (✅), contracts/ (✅), quickstart.md (✅)

**Tests**: Integration and contract tests are INCLUDED in this task list (end-to-end validation of MCP tools).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story. All MCP tools are independently testable after implementation.

## Format: `- [ ] [ID] [P?] [Story?] Description with file path`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4, US5)
- Include exact file paths in descriptions

## Path Conventions

- **Backend project**: `backend/src/`, `backend/tests/` at repository root
- Schema and migrations use Alembic or SQLModel create_all()
- All imports relative to `backend/src/` (installed as package)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create project structure per implementation plan: `backend/src/models/`, `backend/src/services/`, `backend/src/mcp/`, `backend/src/schemas/`, `backend/src/api/`, `backend/src/db/`, `backend/tests/`
- [X] T002 Initialize Python project with pip, pyproject.toml, and requirements.txt per quickstart.md dependencies
- [X] T003 [P] Create .env.example with DATABASE_URL, BETTER_AUTH_SECRET, SERVER_HOST, SERVER_PORT, LOG_LEVEL
- [X] T004 [P] Configure pytest and pytest-asyncio in pyproject.toml with test paths and markers
- [X] T005 [P] Set up logging configuration in backend/src/config.py for INFO/DEBUG levels

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T006 Create Neon PostgreSQL database schema via SQLModel `create_all()` in backend/src/db/init.py for Task table (id, user_id, title, description, completed, created_at, updated_at) with indexes per data-model.md
- [X] T007 [P] Implement SQLModel Task entity in backend/src/models/task.py with validation rules (title 1-500 chars, description 0-5000 chars, completed boolean, timestamps)
- [X] T008 [P] Create Pydantic schemas for tool I/O in backend/src/schemas/task.py (TaskCreate, TaskUpdate, TaskResponse, TaskListResponse with user_id, title, description, completed, timestamps)
- [X] T009 [P] Configure SQLAlchemy async engine with asyncpg driver and connection pooling in backend/src/db/connection.py (pool_size=10, max_overflow=5, pool_pre_ping=True)
- [X] T010 [P] Implement JWT extraction middleware in backend/src/api/middleware.py to extract user_id from JWT `sub` claim and attach to request context
- [X] T011 [P] Create FastAPI app initialization in backend/src/main.py with JWT middleware, exception handlers, and MCP tool registration
- [X] T012 Setup FastAPI exception handlers in backend/src/api/exceptions.py for 400, 403, 404, 500 errors with structured JSON response format {status, error: {code, message, details}}
- [X] T013 [P] Create database session management in backend/src/db/session.py with AsyncSession dependency for FastAPI

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - AI Agent Retrieves User Tasks (Priority: P1) 🎯 MVP

**Goal**: Enable the AI agent to retrieve all tasks for a user, filtered by status (pending, completed, or all). This is the foundation for all agent-driven task management.

**Independent Test**: Invoke `list_tasks(user_id)` via MCP protocol and verify JSON response contains all tasks for that user, with optional status filtering. Can be tested independently without other MCP tools.

### Tests for User Story 1 ⚠️

- [X] T014 [P] [US1] Contract test for `list_tasks` tool schema in backend/tests/contract/test_tool_schemas.py (verify Pydantic models match tool I/O spec)
- [X] T015 [P] [US1] Unit test for `list_tasks_impl()` database query in backend/tests/unit/test_task_service_list.py (test with 0, 5, 100 tasks; verify ordering by created_at DESC)
- [X] T016 [P] [US1] Unit test for user isolation in list_tasks in backend/tests/unit/test_task_service_list.py (verify user_a tasks not visible to user_b)
- [X] T017 [US1] Integration test for `list_tasks` MCP tool end-to-end in backend/tests/integration/test_mcp_tools.py (create tasks, invoke tool, verify response format and status filtering)

### Implementation for User Story 1

- [X] T018 [P] [US1] Implement `list_tasks_impl(session, user_id, status=None)` in backend/src/services/task_service.py to query tasks filtered by user_id, optionally by completion status, ordered by created_at DESC
- [X] T019 [P] [US1] Create MCP tool definition for `list_tasks` in backend/src/mcp/tools.py with Pydantic input/output schemas matching contracts/tools-schema.json
- [X] T020 [US1] Implement error handling in list_tasks: return 400 for invalid status, 500 for database errors, with structured JSON error response
- [X] T021 [US1] Add logging for list_tasks tool invocations in backend/src/services/task_service.py (user_id, status filter, result count)

**Checkpoint**: User Story 1 functional and independently testable. Agent can retrieve tasks.

---

## Phase 4: User Story 2 - AI Agent Creates a New Task (Priority: P1)

**Goal**: Enable the AI agent to create new tasks with title and optional description. Core CRUD operation.

**Independent Test**: Call `add_task(user_id, "Buy groceries", "Milk, eggs, bread")` via MCP protocol and verify task persists in database with unique ID, correct user_id, and `completed: false`. Can be tested independently.

### Tests for User Story 2 ⚠️

- [X] T022 [P] [US2] Contract test for `add_task` tool schema in backend/tests/contract/test_tool_schemas.py (verify Pydantic models match I/O spec, required fields)
- [X] T023 [P] [US2] Unit test for `add_task_impl()` in backend/tests/unit/test_task_service_create.py (verify task created with ID, title, description, completed=false, timestamps)
- [X] T024 [P] [US2] Unit test for title validation in add_task in backend/tests/unit/test_task_service_create.py (test min/max length, empty title rejection)
- [X] T025 [US2] Integration test for `add_task` MCP tool in backend/tests/integration/test_mcp_tools.py (create task, verify response includes all fields, verify list_tasks shows new task)

### Implementation for User Story 2

- [X] T026 [P] [US2] Implement `add_task_impl(session, user_id, title, description=None)` in backend/src/services/task_service.py to create and persist new Task with UUID, user_id, timestamps
- [X] T027 [P] [US2] Create MCP tool definition for `add_task` in backend/src/mcp/tools.py with Pydantic input/output schemas
- [X] T028 [US2] Implement validation in add_task: title required (1-500 chars), description optional (0-5000 chars), return 400 for invalid input
- [X] T029 [US2] Add error handling for user isolation: reject add_task if user_id not authenticated (403 Forbidden)
- [X] T030 [US2] Add logging for add_task operations in backend/src/services/task_service.py (user_id, title, new task_id)

**Checkpoint**: User Stories 1 and 2 both functional. Agent can list and create tasks.

---

## Phase 5: User Story 3 - AI Agent Completes a Task (Priority: P1)

**Goal**: Enable the AI agent to mark tasks as completed. Core status update operation.

**Independent Test**: Create a task, call `complete_task(user_id, task_id)` via MCP protocol, verify response shows `completed: true`, verify list_tasks reflects the change, verify idempotency (calling again returns same result).

### Tests for User Story 3 ⚠️

- [X] T031 [P] [US3] Contract test for `complete_task` tool schema in backend/tests/contract/test_tool_schemas.py
- [X] T032 [P] [US3] Unit test for `complete_task_impl()` in backend/tests/unit/test_task_service_complete.py (verify completed flag set to true, updated_at changed)
- [X] T033 [P] [US3] Unit test for user ownership enforcement in complete_task in backend/tests/unit/test_task_service_complete.py (user_b cannot complete user_a task - 403)
- [X] T034 [US3] Integration test for `complete_task` MCP tool in backend/tests/integration/test_mcp_tools.py (complete task, verify list_tasks shows as completed, verify idempotency)

### Implementation for User Story 3

- [X] T035 [P] [US3] Implement `complete_task_impl(session, user_id, task_id)` in backend/src/services/task_service.py to set completed=true, update updated_at timestamp
- [X] T036 [P] [US3] Create MCP tool definition for `complete_task` in backend/src/mcp/tools.py with Pydantic input/output schemas
- [X] T037 [US3] Implement error handling: 404 if task not found, 403 if user does not own task, 500 for database errors
- [X] T038 [US3] Ensure idempotency: calling complete_task on already-completed task returns success with completed=true
- [X] T039 [US3] Add logging for complete_task operations (user_id, task_id, completion status)

**Checkpoint**: User Stories 1, 2, 3 functional. Agent can list, create, and complete tasks (MVP complete).

---

## Phase 6: User Story 4 - AI Agent Updates Task Metadata (Priority: P2)

**Goal**: Enable the AI agent to modify task title and/or description after creation. Refinement operation.

**Independent Test**: Create a task, call `update_task(user_id, task_id, title="New Title")` via MCP protocol, verify response reflects updated title, verify list_tasks shows updated task, verify description unchanged if not provided.

### Tests for User Story 4 ⚠️

- [X] T040 [P] [US4] Contract test for `update_task` tool schema in backend/tests/contract/test_tool_schemas.py
- [X] T041 [P] [US4] Unit test for `update_task_impl()` in backend/tests/unit/test_task_service_update.py (update title only, description only, both fields)
- [X] T042 [P] [US4] Unit test for validation in update_task in backend/tests/unit/test_task_service_update.py (title min/max length, description max length)
- [X] T043 [US4] Integration test for `update_task` MCP tool in backend/tests/integration/test_mcp_tools.py (update title, verify list_tasks reflects change, verify completed flag unchanged)

### Implementation for User Story 4

- [X] T044 [P] [US4] Implement `update_task_impl(session, user_id, task_id, title=None, description=None)` in backend/src/services/task_service.py to selectively update fields
- [X] T045 [P] [US4] Create MCP tool definition for `update_task` in backend/src/mcp/tools.py with optional title and description parameters
- [X] T046 [US4] Implement validation: title 1-500 chars if provided, description 0-5000 chars if provided, return 400 if no fields to update
- [X] T047 [US4] Implement error handling: 404 if task not found, 403 if user does not own task, update updated_at timestamp
- [X] T048 [US4] Add logging for update_task operations (user_id, task_id, fields updated)

**Checkpoint**: User Stories 1-4 functional. Agent can manage task metadata.

---

## Phase 7: User Story 5 - AI Agent Deletes a Task (Priority: P2)

**Goal**: Enable the AI agent to permanently remove tasks. User control operation.

**Independent Test**: Create a task, call `delete_task(user_id, task_id)` via MCP protocol, verify response is success, verify list_tasks no longer includes deleted task, verify calling delete again returns 404.

### Tests for User Story 5 ⚠️

- [X] T049 [P] [US5] Contract test for `delete_task` tool schema in backend/tests/contract/test_tool_schemas.py
- [X] T050 [P] [US5] Unit test for `delete_task_impl()` in backend/tests/unit/test_task_service_delete.py (verify task removed from database, idempotency returns 404)
- [X] T051 [P] [US5] Unit test for user ownership enforcement in delete_task in backend/tests/unit/test_task_service_delete.py (user_b cannot delete user_a task - 403)
- [X] T052 [US5] Integration test for `delete_task` MCP tool in backend/tests/integration/test_mcp_tools.py (delete task, verify not in list_tasks, verify 404 on second delete)

### Implementation for User Story 5

- [X] T053 [P] [US5] Implement `delete_task_impl(session, user_id, task_id)` in backend/src/services/task_service.py to permanently remove task from database
- [X] T054 [P] [US5] Create MCP tool definition for `delete_task` in backend/src/mcp/tools.py with task_id parameter
- [X] T055 [US5] Implement error handling: 404 if task not found, 403 if user does not own task, 500 for database errors, success returns {status: "success", data: {message: "Task deleted"}}
- [X] T056 [US5] Ensure deletion is terminal: calling list_tasks after delete does not return deleted task
- [X] T057 [US5] Add logging for delete_task operations (user_id, task_id, deletion timestamp)

**Checkpoint**: All user stories (1-5) functional and independently testable. Full CRUD via MCP tools complete.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Integration, performance validation, documentation, and production readiness

**Note**: Phase 8 tasks completed for full feature implementation. All CRUD tools, comprehensive tests, and documentation in place.

- [X] T058 [P] Run all unit tests: `pytest backend/tests/unit/ -v` and verify 100% pass rate
- [X] T058 [P] Run all contract tests: `pytest backend/tests/contract/ -v` and verify all tool schemas valid
- [X] T059 [P] Run all integration tests: `pytest backend/tests/integration/ -v` and verify end-to-end MCP tool execution
- [X] T060 [P] Performance testing: Measure p95 latency for each tool with 1000-task database (target <500ms)
- [X] T061 Run quickstart.md setup validation: Follow steps 1-8 from quickstart.md and verify MCP server starts correctly
- [X] T062 [P] Add comprehensive docstrings to all tool implementations in backend/src/services/task_service.py
- [X] T063 [P] Add comprehensive docstrings to all MCP tool definitions in backend/src/mcp/tools.py
- [X] T064 Update README.md with MCP tool documentation, tool contracts, and testing instructions
- [X] T065 Verify edge cases handled (invalid JWT, concurrent requests, database connection loss) per spec.md Edge Cases
- [X] T066 [P] Code review: Verify user isolation enforced in all queries (WHERE user_id = extracted_user_id)
- [X] T067 [P] Security audit: Verify no SQL injection, no token leakage, no cross-user data access
- [X] T068 Create deployment guide: Docker image, environment variables, Neon connection, database migration steps
- [X] T069 [P] Add observability: Structured logging for all tool calls with user_id, operation, latency, result
- [X] T070 Final integration test: Invoke all 5 tools in sequence (create, list, update, complete, delete) and verify data consistency

**Checkpoint**: Full feature complete, tested, documented, and production-ready. Ready for production deployment and OpenAI Agents SDK integration.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - **BLOCKS all user stories**
- **User Stories 1-5 (Phases 3-7)**: All depend on Foundational phase completion
  - All user stories can proceed in parallel after Foundational is complete
  - Or sequentially in priority order (US1 → US2 → US3 → US4 → US5)
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1 - List)**: No dependencies on other stories. Can start after Foundational (Phase 2)
- **User Story 2 (P1 - Create)**: No dependencies on other stories. Can start after Foundational
- **User Story 3 (P1 - Complete)**: No hard dependencies; benefits from US1 & US2 for testing (list, create, then complete)
- **User Story 4 (P2 - Update)**: No hard dependencies; benefits from US2 for testing (create, then update)
- **User Story 5 (P2 - Delete)**: No hard dependencies; benefits from US2 for testing (create, then delete)

**All user stories are independently implementable and testable after Foundational phase.**

### Within Each User Story

- Tests MUST be written first and FAIL before implementation
- Service layer implementation before MCP tool definition
- Core business logic before error handling
- Story complete before moving to next priority

### Parallel Opportunities

**Phase 1 Setup** (run all [P] tasks together):
- Create project structure
- Configure pytest, logging
- Create .env.example

**Phase 2 Foundational** (run all [P] tasks together after T006):
- SQLModel Task entity
- Pydantic schemas
- Async database engine
- JWT middleware
- FastAPI exception handlers
- Session management

**Phases 3-7 User Stories** (after Phase 2, run all [P] tasks within each story together):
- All contract tests for a story [P]
- All unit tests for a story [P]
- All service implementations [P] (each works on different models/operations)
- All MCP tool definitions [P] (each tool independent)

**Phase 8 Polish** (run all [P] tasks together):
- All test suites in parallel
- Performance testing
- Documentation
- Code review & security audit

---

## Parallel Example: Full Feature (After Foundational)

```bash
# Phase 3-7 can run in parallel (5 developers)
Developer 1: US1 (list_tasks) - T014-T021
Developer 2: US2 (add_task) - T022-T030
Developer 3: US3 (complete_task) - T031-T039
Developer 4: US4 (update_task) - T040-T048
Developer 5: US5 (delete_task) - T049-T057

# After all complete, Phase 8 testing (T058-T070) run in parallel
```

---

## Implementation Strategy

### MVP First (User Stories 1-3 Only)

**This is the minimum viable product for AI agent task management.**

1. Complete Phase 1: Setup (T001-T005)
2. Complete Phase 2: Foundational (T006-T013) ⚠️ **CRITICAL GATE**
3. Complete Phase 3: User Story 1 (T014-T021)
4. Complete Phase 4: User Story 2 (T022-T030)
5. Complete Phase 5: User Story 3 (T031-T039)
6. Complete Phase 8 tests (T058-T061)
7. **STOP and VALIDATE**: Test all 3 user stories independently
8. **Deploy/demo if ready**: Agent can list tasks, create tasks, mark complete

**Total MVP tasks: ~35 tasks (Phases 1, 2, 3, 4, 5, selected Phase 8)**

### Incremental Delivery

1. **Iteration 1**: Phases 1-5 (MVP - list, create, complete)
   - Deploy with 3 core MCP tools
   - Validate with OpenAI Agents SDK

2. **Iteration 2**: Phase 6 (User Story 4 - update)
   - Add task refinement capability
   - Extend agent workflow

3. **Iteration 3**: Phase 7 (User Story 5 - delete)
   - Add task deletion capability
   - Complete CRUD

4. **Iteration 4**: Phase 8 (Polish & production readiness)
   - Performance optimization
   - Production deployment
   - Full monitoring & observability

### Parallel Team Strategy

**With 5+ developers:**

1. All work together on Phase 1 Setup (4 tasks, 2 days)
2. All work together on Phase 2 Foundational (8 tasks, 3 days) ⚠️ **GATE**
3. Once Phase 2 complete, split into 5 teams:
   - Developer 1: US1 (List) - 8 tasks
   - Developer 2: US2 (Create) - 9 tasks
   - Developer 3: US3 (Complete) - 9 tasks
   - Developer 4: US4 (Update) - 9 tasks
   - Developer 5: US5 (Delete) - 9 tasks
4. All stories complete in parallel (~5 days)
5. Final Phase 8 Polish together (~3 days)

**Total: ~13 days for full feature with 5 developers**

---

## Task Checklist Validation

**Format verification** (all tasks follow `- [ ] [ID] [P?] [Story?] Description with file path`):

✅ All tasks have checkbox `- [ ]`
✅ All tasks have sequential ID (T001-T070)
✅ All parallelizable tasks marked `[P]`
✅ All user story phase tasks have `[US1]`, `[US2]`, `[US3]`, `[US4]`, or `[US5]` label
✅ All setup/foundational/polish tasks have NO story label
✅ All tasks include specific file path or location
✅ All tasks are independent (no circular dependencies)
✅ Total: 70 implementation tasks across 8 phases

---

## Notes

- [P] tasks = different files, no dependencies within the phase
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Verify tests fail before implementing (TDD approach)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Edge cases covered: user isolation, invalid input, database errors, concurrent requests
- Performance targets: <500ms p95 latency for all tools
- All tasks map to specific file locations in `backend/src/` and `backend/tests/`

