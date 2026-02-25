---

description: "Task list for User Authentication & Security implementation"

---

# Tasks: User Authentication & Security

**Input**: Design documents from `/specs/1-user-auth/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create backend and frontend project structure per plan.md
- [x] T002 Initialize FastAPI project with SQLModel and python-jose in backend/
- [x] T003 [P] Initialize Next.js project with Better Auth and JWT plugin in frontend/

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Setup User and Task entities in backend/src/models/
- [x] T005 [P] Implement JWT symmetric verification utility in backend/src/auth/jwt.py
- [x] T006 [P] Configure Better Auth JWT plugin with symmetric signing in frontend/src/auth.ts
- [x] T007 Implement FastAPI auth middleware to verify JWT in backend/src/middleware/auth.py
- [x] T008 Configure database session and engine for Neon PostgreSQL in backend/src/db.py
- [x] T009 Setup .env.example with BETTER_AUTH_SECRET in root, backend/ and frontend/

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Secure Account Creation (Priority: P1) 🎯 MVP

**Goal**: Enable new users to register an account using email and password.

**Independent Test**: Successfully create a new user via frontend form and verify user record exists in Neon DB.

### Implementation for User Story 1

- [x] T010 [P] [US1] Create signup form component in frontend/src/components/SignupForm.tsx
- [x] T011 [US1] Implement signup route and logic in frontend/src/app/signup/page.tsx
- [x] T012 [US1] Add user creation validation and error handling (email exists check)
- [x] T013 [US1] verify signup flow redirects to login or dashboard

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Authenticated Access (Priority: P1)

**Goal**: Allow registered users to sign in and obtain a JWT for backend access.

**Independent Test**: Sign in with valid credentials, verify JWT is issued and stored, then successfully call a protected backend endpoint.

### Implementation for User Story 2

- [x] T014 [P] [US2] Create login form component in frontend/src/components/LoginForm.tsx
- [x] T015 [US2] Implement login route and logic in frontend/src/app/login/page.tsx
- [x] T016 [US2] Configure frontend API client to attach JWT to headers in frontend/src/lib/api.ts
- [x] T017 [US2] Implement "whoami" endpoint in backend/src/api/auth.py to verify token extraction

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Protected Task Management (Priority: P2)

**Goal**: Secure task operations so users only interact with their own data.

**Independent Test**: Create tasks as User A, then login as User B and verify User A's tasks are not visible/accessible.

### Implementation for User Story 3

- [x] T018 [P] [US3] Implement CRUD endpoints for tasks in backend/src/api/tasks.py with `user_id` filtering
- [x] T019 [US3] Add 401 Unauthorized handling for unauthenticated requests in backend tasks API
- [x] T020 [US3] Build task list UI with user context in frontend/src/app/tasks/page.tsx
- [x] T021 [US3] Update task creation/editing UI to handle auth token in frontend/src/components/TaskEditor.tsx

**Checkpoint**: All user stories should now be independently functional

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Documentation and final security checks

- [x] T022 [P] Document JWT authentication flow in specs/1-user-auth/quickstart.md
- [x] T023 Final security audit of token expiration and error paths
- [x] T024 Perform cross-browser testing for responsive auth forms

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Phase 2 completion

### User Story Dependencies

- **User Story 1 & 2**: High priority, can be done in parallel once Phase 2 is complete.
- **User Story 3**: Depends on User Story 2 (Login/JWT attachment) to be fully testable on frontend.

### Parallel Opportunities

- T002 and T003 can run in parallel.
- T005, T006, T007 can be developed in parallel as they deal with different files/layers of the JWT flow.
- T010 and T014 (Signup/Login forms) can be built in parallel.

---

## Implementation Strategy

### MVP First (User Story 1 & 2)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL)
3. Complete Phase 3 & 4: Signup and Signin
4. **STOP and VALIDATE**: Verify token issuance and verification
5. Move to Task isolation (User Story 3)
