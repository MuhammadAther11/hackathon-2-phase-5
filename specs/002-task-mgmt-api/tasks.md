# Tasks: Task Management REST API

**Input**: Design documents from `/specs/002-task-mgmt-api/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Unit tests requested in plan.md for each endpoint and ownership enforcement.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create backend project structure in `backend/src/`
- [x] T002 Initialize Python environment and install dependencies (FastAPI, SQLModel, psycopg2-binary, pyjwt) in `backend/`
- [x] T003 [P] Create `backend/.env.example` with `DATABASE_URL` and `BETTER_AUTH_SECRET`
- [x] T004 [P] Configure basic FastAPI app instance in `backend/src/main.py`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

- [x] T005 [P] Setup Neon PostgreSQL connection and engine in `backend/src/database.py`
- [x] T006 [P] Implement JWT validation logic and auth dependency in `backend/src/auth/jwt.py`
- [x] T007 Implement global exception handlers for REST error compliance in `backend/src/main.py`
- [x] T008 [P] Define base SQLModel `Task` and `TaskCreate/Update` schemas in `backend/src/models/task.py`
- [x] T009 Create reusable `get_session` dependency in `backend/src/database.py`

**Checkpoint**: Foundation ready - user story implementation can now begin.

---

## Phase 3: User Story 1 - Basic Task Management (Priority: P1) 🎯 MVP

**Goal**: Enable users to perform basic CRUD operations on their own tasks.

**Independent Test**: Use a REST client with a valid JWT to POST a task, GET the list, and DELETE the task.

### Tests for User Story 1
- [x] T010 [P] [US1] Create unit tests for CRUD operations in `backend/tests/test_tasks.py`
- [x] T011 [P] [US1] Create integration test for the full CRUD lifecycle in `backend/tests/test_integration.py`

### Implementation for User Story 1
- [x] T012 [US1] Implement POST `/api/{user_id}/tasks` endpoint in `backend/src/api/tasks.py`
- [x] T013 [US1] Implement GET `/api/{user_id}/tasks` endpoint (list) with user-id filtering in `backend/src/api/tasks.py`
- [x] T014 [US1] Implement GET `/api/{user_id}/tasks/{id}` endpoint with owner check in `backend/src/api/tasks.py`
- [x] T015 [US1] Implement PUT `/api/{user_id}/tasks/{id}` endpoint with owner check in `backend/src/api/tasks.py`
- [x] T016 [US1] Implement DELETE `/api/{user_id}/tasks/{id}` endpoint with owner check in `backend/src/api/tasks.py`
- [x] T017 [US1] Register tasks router in `backend/src/main.py`

**Checkpoint**: User Story 1 is functional and testable independently.

---

## Phase 4: User Story 2 - Task Completion Workflow (Priority: P2)

**Goal**: Allow users to toggle the completion status of a task accurately.

**Independent Test**: Send a PATCH request to the `/api/{user_id}/tasks/{id}/complete` endpoint and verify the `is_completed` field toggles.

### Tests for User Story 2
- [x] T018 [P] [US2] Add unit test for completion toggle in `backend/tests/test_tasks.py`

### Implementation for User Story 2
- [x] T019 [US2] Implement PATCH `/api/{user_id}/tasks/{id}/complete` toggle endpoint in `backend/src/api/tasks.py`
- [x] T020 [US2] Add logic to ensure only the owner can toggle a task in `backend/src/api/tasks.py`

**Checkpoint**: Completion workflow implemented and verified.

---

## Phase 5: User Story 3 - Secure User Access (Priority: P1)

**Goal**: Ensure users cannot access or modify tasks belonging to other users.

**Independent Test**: Use a JWT for User A to attempt a GET or DELETE on a task ID belonging to User B and verify a 403/404 response.

### Tests for User Story 3
- [x] T021 [P] [US3] Create security tests for cross-user isolation in `backend/tests/test_security.py`

### Implementation for User Story 3
- [x] T022 [US3] Verify JWT `sub` matches `user_id` in path-params for all endpoints in `backend/src/api/tasks.py`
- [x] T023 [US3] Ensure all database queries include strict `user_id` filtering in `backend/src/api/tasks.py`

**Checkpoint**: Security isolation verified against cross-user access attempts.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [x] T024 [P] Update API documentation (openapi.yaml) with final details in `specs/002-task-mgmt-api/contracts/api-v1.yaml`
- [x] T025 [P] Final validation of `quickstart.md` setup instructions
- [x] T026 Code cleanup (remove unused imports, docstrings)

---

## Dependencies & Execution Order

### Phase Dependencies
- **Setup (Phase 1)**: Must complete first.
- **Foundational (Phase 2)**: Depends on Phase 1 - BLOCKS all story implementation.
- **User Stories (Phase 3-5)**: Depend on Phase 2 completion. Can be worked on in parallel once endpoints are defined.

### User Story Dependencies
- **US1**: Foundation for US2 and US3.
- **US2 & US3**: Can proceed after US1 basic endpoints are in place.

### Parallel Opportunities
- T003/T004 (Setup variables/FastAPI structure)
- T005/T006 (Database setup/JWT logic)
- T010/T011 (Writing tests for CRUD)
- T024/T025 (Doc updates)

---

## Implementation Strategy

### MVP First (User Story 1 Only)
1. Complete Setup and Foundational phases.
2. Implement US1 CRUD endpoints.
3. Verify with tests and manual REST calls.

### Parallel Team Strategy
- Developer A: Implementation of CRUD endpoints (US1).
- Developer B: Implementation of security tests (US3).
- Developer C: Documentation and polish (Phase 6).
