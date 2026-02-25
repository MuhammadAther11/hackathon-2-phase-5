---
description: "Implementation tasks for working authentication, database persistence, and responsive UI"
---

# Tasks: Working Authentication, Database Persistence & Clean UI

**Input**: Design documents from `/specs/004-auth-persistence-ui/`
**Prerequisites**: plan.md (required), spec.md (user stories), data-model.md, contracts/

**Organization**: Tasks are grouped by user story (US1-US6) to enable independent implementation and testing of each story. The foundation (Phase 1-2) must be completed first, then user stories can be developed in parallel (P1 stories before P2 stories).

---

## Implementation Strategy

**MVP Scope** (minimum viable product):
- Phase 1: Setup
- Phase 2: Foundation (JWT, database models, middleware)
- Phase 3: US1 + US2 + US3 + US4 (P1 stories - signup, login, tasks, protected routes)
- Phases 5+: US5 + US6 (P2 stories - logout, UI polish) can follow after MVP verification

**Incremental Delivery**:
1. Phase 1-2: Foundation setup (can parallelize database + auth infrastructure)
2. Phase 3-4: Simultaneous frontend (signup/login pages) + backend (auth endpoints)
3. Phase 5: Task management (backend CRUD + frontend dashboard)
4. Phase 6: Route protection (frontend middleware + backend 401 handling)
5. Phase 7: Logout + UI polish

**Parallel Opportunities**:
- T001-T003: Project setup tasks (can run in parallel: backend, frontend, config)
- T004-T009: Foundation infrastructure (can parallelize: database setup [T004] + JWT integration [T005-T006] + environment [T009])
- US1 Frontend (T017-T023) can run in parallel with US2 Backend (T024-T029) since they're independent layers
- US3 backend tasks (T030-T035) can start once foundation is complete (don't depend on US1/US2)
- US4 route protection (T036-T038) depends on US1-US3 being mostly complete

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create backend project structure per implementation plan in `backend/src/` with models/, api/, auth/, middleware/ directories
- [ ] T002 [P] Create frontend project structure per implementation plan in `frontend/src/` with app/, components/, lib/, hooks/, types/ directories
- [ ] T003 [P] Update requirements.txt for backend with FastAPI, SQLModel, Pydantic, PyJWT, python-jose, passlib, bcrypt dependencies

---

## Phase 2: Foundation (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story implementation

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Database & ORM Setup

- [ ] T004 Create User model in `backend/src/models/user.py` with UUID id, email (unique), password_hash, created_at fields and SQLModel table definition
- [ ] T005 [P] Create Task model in `backend/src/models/task.py` with UUID id, title, completed, user_id (FK to User), created_at fields and SQLModel relationship
- [ ] T006 [P] Configure database session factory in `backend/src/database.py` with SQLAlchemy engine for Neon PostgreSQL and create_all() on startup
- [ ] T007 Create database initialization script that runs SQLAlchemy create_all() to create users and task tables on backend startup

### Authentication Infrastructure

- [ ] T008 Implement JWT token generation in `backend/src/auth/jwt.py` with user_id claim, exp, iat using BETTER_AUTH_SECRET
- [ ] T009 [P] Implement JWT token verification in `backend/src/auth/jwt.py` with claims extraction and expiration validation
- [ ] T010 [P] Implement password hashing functions in `backend/src/auth/passwords.py` using passlib + bcrypt for signup
- [ ] T011 Implement JWT verification middleware in `backend/src/middleware/auth.py` as FastAPI dependency to extract user_id from token

### API & Environment Setup

- [ ] T012 Configure FastAPI app in `backend/src/main.py` with CORS middleware, JWT middleware registration, and exception handlers
- [ ] T013 Create global exception handlers in `backend/src/main.py` for 401 Unauthorized, 422 Unprocessable Entity, 400 Bad Request, 500 Internal Server Error with user-friendly messages
- [ ] T014 Update `.env.example` with DATABASE_URL (Neon), BETTER_AUTH_SECRET, BETTER_AUTH_URL, and API_SECRET_KEY variables
- [ ] T015 [P] Create frontend environment setup in `frontend/.env.local` with NEXT_PUBLIC_API_BASE_URL=http://localhost:8000 and NEXT_PUBLIC_BETTER_AUTH_SECRET matching backend
- [ ] T016 Configure Better Auth client in `frontend/src/lib/auth-client.ts` with JWT storage in httpOnly cookies and BETTER_AUTH_SECRET
- [ ] T017 [P] Create centralized API client in `frontend/src/lib/api-client.ts` that automatically injects JWT token from cookies to all requests

**Checkpoint**: Foundation complete - all user stories can now proceed independently

---

## Phase 3: User Story 1 - New User Signup (Priority: P1) 🎯 MVP

**Goal**: Enable new users to create accounts with email/password, persist in database, and receive JWT

**Independent Test**: Navigate to `/signup`, submit valid email/password, verify redirect to `/dashboard`, confirm user record in Neon database

### Backend Implementation for US1

- [ ] T018 [US1] Create signup request/response Pydantic models in `backend/src/api/schemas.py` (SignupRequest with email, password; SignupResponse with user_id, email, created_at)
- [ ] T019 [US1] Implement UserService.create_user() in `backend/src/services/user_service.py` that validates email format, checks for duplicates, hashes password, saves to database
- [ ] T020 [US1] Implement POST `/auth/signup` endpoint in `backend/src/api/auth.py` that calls UserService.create_user(), returns 201 with user data on success, 422 on validation error, 409 on duplicate email
- [ ] T021 [US1] Add JWT token issuance in signup endpoint: after user creation, call JWT generation to include in response headers as Set-Cookie with httpOnly flag
- [ ] T022 [US1] Add error handling in signup endpoint: catch duplicate email, invalid email format, password validation errors, database errors; return 422 with user-friendly message

### Frontend Implementation for US1

- [ ] T023 [P] [US1] Create signup page in `frontend/src/app/signup/page.tsx` with email and password input fields, submit button, error display
- [ ] T024 [P] [US1] Implement AuthForm component in `frontend/src/components/AuthForm.tsx` for signup/login with form validation, real-time error messages, loading state
- [ ] T025 [US1] Add form validation in AuthForm: email format validation, password ≥8 characters, required fields; display errors inline
- [ ] T026 [US1] Implement signup API call in `frontend/src/lib/api.ts` using centralized API client: POST to `/auth/signup` with email, password; handle 409 duplicate error
- [ ] T027 [US1] Add redirect logic in signup page: on success, redirect to `/dashboard`; on error, show error message in form
- [ ] T028 [US1] Test signup flow: fill form, submit, verify redirect to dashboard, verify JWT in cookies (browser DevTools)

**Checkpoint**: User Story 1 complete - new users can signup, accounts persist in database, users receive JWT and redirect to dashboard

---

## Phase 4: User Story 2 - Existing User Login (Priority: P1)

**Goal**: Enable existing users to authenticate with credentials and receive JWT for subsequent requests

**Independent Test**: Navigate to `/login`, submit valid existing user credentials, verify redirect to `/dashboard`, confirm JWT attached to API requests

### Backend Implementation for US2

- [ ] T029 [US2] Create login request/response Pydantic models in `backend/src/api/schemas.py` (LoginRequest with email, password; LoginResponse with user_id, email, created_at, jwt_token)
- [ ] T030 [US2] Implement UserService.authenticate_user() in `backend/src/services/user_service.py` that queries user by email, validates password hash against input, returns user or None
- [ ] T031 [US2] Implement POST `/auth/login` endpoint in `backend/src/api/auth.py` that calls UserService.authenticate_user(), returns 200 with user + JWT on success, 401 on invalid credentials
- [ ] T032 [US2] Add JWT token issuance in login endpoint: after successful authentication, call JWT generation with user_id, include in response headers as Set-Cookie httpOnly
- [ ] T033 [US2] Add error handling in login endpoint: invalid credentials, missing email/password, database errors; return 401 with message "Invalid email or password" (don't differentiate for security)

### Frontend Implementation for US2

- [ ] T034 [P] [US2] Create login page in `frontend/src/app/login/page.tsx` that reuses AuthForm component, includes "Don't have an account? Sign up" link
- [ ] T035 [US2] Implement login API call in `frontend/src/lib/api.ts` using centralized API client: POST to `/auth/login` with email, password; handle 401 response
- [ ] T036 [US2] Add redirect logic in login page: on success, redirect to `/dashboard`; on error, show "Invalid email or password" message
- [ ] T037 [US2] Test login flow: create user via signup, logout (clear cookies), login with same credentials, verify redirect and JWT in cookies

**Checkpoint**: User Stories 1 & 2 complete - users can signup and login, both flows persist to database and issue JWT

---

## Phase 5: User Story 3 - View and Manage Tasks (Priority: P1)

**Goal**: Logged-in users can view, create, update, delete, and toggle their tasks; data persists and is isolated per user

**Independent Test**: After login, user can create task, see it in list, toggle completion, refresh page, verify data persists; second user cannot see first user's tasks

### Backend Implementation for US3

- [ ] T038 [US3] Create task schemas in `backend/src/api/schemas.py` (TaskCreate with title; TaskUpdate with title, completed; TaskResponse with id, title, completed, user_id, created_at)
- [ ] T039 [US3] Implement TaskService in `backend/src/services/task_service.py` with methods: list_user_tasks(user_id), create_task(user_id, title), get_task(task_id, user_id), update_task(task_id, user_id, data), delete_task(task_id, user_id), toggle_task(task_id, user_id)
- [ ] T040 [US3] Implement TaskService.list_user_tasks() to query tasks filtered by user_id; return list of TaskResponse
- [ ] T041 [US3] Implement TaskService.create_task() to create task record with provided user_id from JWT, validate title non-empty, save to database
- [ ] T042 [US3] Implement TaskService.update_task() to verify user_id ownership before update; raise 403 Forbidden if unauthorized
- [ ] T043 [US3] Implement TaskService.delete_task() to verify user_id ownership before delete; raise 403 Forbidden if unauthorized
- [ ] T044 [US3] Implement TaskService.toggle_task() to toggle completed boolean for task; verify ownership
- [ ] T045 [US3] Implement GET `/tasks` endpoint in `backend/src/api/tasks.py` that requires JWT, calls TaskService.list_user_tasks(user_id_from_jwt), returns 200 with task list
- [ ] T046 [US3] Implement POST `/tasks` endpoint in `backend/src/api/tasks.py` that requires JWT, calls TaskService.create_task(), returns 201 with created task
- [ ] T047 [US3] Implement PUT `/tasks/{id}` endpoint in `backend/src/api/tasks.py` that requires JWT, calls TaskService.update_task(), returns 200 with updated task or 403 if unauthorized
- [ ] T048 [US3] Implement DELETE `/tasks/{id}` endpoint in `backend/src/api/tasks.py` that requires JWT, calls TaskService.delete_task(), returns 204 on success or 403 if unauthorized
- [ ] T049 [US3] Implement PATCH `/tasks/{id}/toggle` endpoint in `backend/src/api/tasks.py` that requires JWT, calls TaskService.toggle_task(), returns 200 with toggled task
- [ ] T050 [US3] Register task routes in FastAPI app in `backend/src/main.py` via `app.include_router(tasks_router)`
- [ ] T051 [US3] Add authorization checks: all task endpoints query tasks filtered by JWT user_id; reject requests for other users' tasks with 403

### Frontend Implementation for US3

- [ ] T052 [P] [US3] Create TaskDashboard component in `frontend/src/components/TaskDashboard.tsx` that displays list of user's tasks, differentiated between active and completed
- [ ] T053 [P] [US3] Create TaskItem component in `frontend/src/components/TaskItem.tsx` for individual task display with title, completion checkbox, delete button, edit capability
- [ ] T054 [US3] Implement useTasks hook in `frontend/src/hooks/useTasks.ts` using React Query to fetch, create, update, delete tasks; provides loading, error, data states
- [ ] T055 [US3] Implement TaskService in `frontend/src/lib/api.ts` with GET /tasks, POST /tasks, PUT /tasks/{id}, DELETE /tasks/{id}, PATCH /tasks/{id}/toggle using centralized API client
- [ ] T056 [US3] Create dashboard page in `frontend/src/app/dashboard/page.tsx` that uses TaskDashboard component, displays loading state during fetch, empty state if no tasks
- [ ] T057 [US3] Implement task creation form in TaskDashboard: input field, add button; on success, refetch tasks; on error, show error message
- [ ] T058 [US3] Implement task update (title edit) in TaskItem: edit mode with input field, save/cancel buttons; call update endpoint on save
- [ ] T059 [US3] Implement task completion toggle in TaskItem: checkbox that calls PATCH toggle endpoint on change
- [ ] T060 [US3] Implement task deletion in TaskItem: delete button that calls DELETE endpoint, confirms action, refetches list
- [ ] T061 [US3] Add empty state UI in TaskDashboard: show "No tasks yet" message with create task hint when list is empty
- [ ] T062 [US3] Add loading skeleton in TaskDashboard: show loading state while tasks are fetching (use React Query isLoading state)

**Checkpoint**: User Stories 1, 2, & 3 complete - users can signup, login, create and manage tasks; data persists per-user in database

---

## Phase 6: User Story 4 - Protected Routes and Unauthorized Access (Priority: P1)

**Goal**: Enforce authentication on protected routes; unauthenticated users redirected to login; 401 responses on API; invalid JWTs handled gracefully

**Independent Test**: Try accessing `/dashboard` without JWT, verify redirect to `/login`; make API call without JWT header, verify 401 response; use invalid JWT, verify frontend redirect to login

### Backend Implementation for US4

- [ ] T063 [US4] Update JWT middleware in `backend/src/middleware/auth.py` to check Authorization header for Bearer token, verify signature and expiration, extract user_id
- [ ] T064 [US4] Implement 401 response in middleware: if JWT missing, invalid, or expired, return 401 Unauthorized with message "Invalid or expired token"
- [ ] T065 [US4] Update all task endpoints to require JWT via FastAPI Depends() on middleware; endpoints receive user_id from token (not from request body/URL)
- [ ] T066 [US4] Implement 403 Forbidden responses: when user attempts to access another user's task (e.g., DELETE /tasks/{other_user_id}), return 403 with message "You do not have permission to access this resource"
- [ ] T067 [US4] Add logging for unauthorized attempts: log IP, endpoint, attempted user_id when 401 or 403 is returned (useful for debugging and security)

### Frontend Implementation for US4

- [ ] T068 [P] [US4] Update middleware.ts in `frontend/src/middleware.ts` to protect /dashboard route: check for JWT cookie, redirect to /login if missing
- [ ] T069 [P] [US4] Implement redirect on 401 in centralized API client `frontend/src/lib/api-client.ts`: if response is 401, clear cookies, redirect to /login
- [ ] T070 [US4] Update home page in `frontend/src/app/page.tsx` to redirect: if user has JWT, redirect to /dashboard; if not, redirect to /login
- [ ] T071 [US4] Add 401 error handling in useTasks hook: if API returns 401, redirect to /login via React Router
- [ ] T072 [US4] Test route protection: try accessing /dashboard via URL bar without cookies, verify redirect to /login; make API call without Authorization header, verify 401 response; try with invalid JWT, verify redirect
- [ ] T073 [US4] Test authorization: create 2 users, login as user1, try to access user2's tasks via API (DELETE /tasks/{user2_task_id}), verify 403 response

**Checkpoint**: All P1 stories complete - users can signup, login, manage tasks, and unauthorized access is blocked at all layers

---

## Phase 7: User Story 5 - Logout (Priority: P2)

**Goal**: Users can logout from any authenticated page; session tokens cleared; subsequent navigation redirects to login

**Independent Test**: Login to dashboard, click logout button, verify redirect to `/login`, attempt to access `/dashboard` directly, verify redirect to `/login`

### Backend Implementation for US5

- [ ] T074 [US5] Implement POST `/auth/logout` endpoint in `backend/src/api/auth.py` that clears session (if using sessions) or returns instruction to frontend to clear JWT cookie; return 200 OK

### Frontend Implementation for US5

- [ ] T075 [P] [US5] Create NavBar component in `frontend/src/components/NavBar.tsx` with user email display and logout button; appears on dashboard
- [ ] T076 [US5] Implement logout handler in NavBar: call POST /auth/logout, clear JWT cookie, redirect to /login
- [ ] T077 [US5] Add NavBar to dashboard page in `frontend/src/app/dashboard/page.tsx` so logout button is accessible from task list
- [ ] T078 [US5] Test logout flow: login, click logout, verify redirect to /login, verify JWT cookie cleared, attempt to access /dashboard, verify redirect

**Checkpoint**: User Story 5 complete - users can logout securely

---

## Phase 8: User Story 6 - Responsive UI and Professional Appearance (Priority: P2)

**Goal**: Clean, modern, responsive interface for desktop and mobile; loading, empty, error states; professional styling

**Independent Test**: View pages on desktop (1920px) and mobile (375px) breakpoints; verify layout adjusts, buttons clickable, forms readable; trigger error states (invalid signup, API failure) and verify error messages display

### UI Component Enhancements

- [ ] T079 [P] [US6] Create reusable UI component library in `frontend/src/components/ui/`: Button, Input, Card, Modal, Toast with Tailwind CSS
- [ ] T080 [P] [US6] Update AuthForm component to use new UI components; add loading spinner during submit, clear error display
- [ ] T081 [P] [US6] Update TaskDashboard to show loading skeleton while fetching tasks (use Lucide icons for placeholders)
- [ ] T082 [P] [US6] Update TaskItem to show loading state during edit/delete operations

### Responsive Design

- [ ] T083 [US6] Implement responsive layout for signup page: centered card (max-width 400px on mobile, 500px on desktop), full-width inputs on mobile, proper spacing
- [ ] T084 [US6] Implement responsive layout for login page: same card design as signup
- [ ] T085 [US6] Implement responsive layout for dashboard: full-width on mobile (<768px), sidebar on tablet (768px-1024px), expanded layout on desktop (>1024px)
- [ ] T086 [US6] Update TaskDashboard for responsive: single column on mobile, can switch to multi-column or side panel for desktop layout if needed
- [ ] T087 [US6] Ensure all interactive elements (buttons, inputs, checkboxes) are accessible on mobile (min 44px tap target)

### Error & Loading States

- [ ] T088 [US6] Update AuthForm error display: show validation errors inline below each field (e.g., "Email is required", "Password must be at least 8 characters")
- [ ] T089 [US6] Update AuthForm loading state: disable submit button and show spinner during API request
- [ ] T090 [US6] Update TaskDashboard to show "No tasks yet. Create your first task to get started!" when empty
- [ ] T091 [US6] Update TaskDashboard to show error toast when task create/update/delete fails: "Failed to [action] task. Please try again."
- [ ] T092 [US6] Add loading skeletons to TaskDashboard: show 3 placeholder task cards while loading
- [ ] T093 [US6] Implement global error boundary in `frontend/src/components/ErrorBoundary.tsx` to catch and display unexpected errors gracefully
- [ ] T094 [US6] Update layout.tsx to include global providers (QueryClientProvider, AuthProvider, error boundary)

### Visual Polish

- [ ] T095 [US6] Update globals.css with professional color scheme: use Tailwind default palette (blues, grays) for clean look
- [ ] T096 [US6] Add Lucide icons throughout: lock icon for password field, mail icon for email, check icon for completed tasks, trash icon for delete, plus icon for add task
- [ ] T097 [US6] Ensure consistent spacing and typography throughout app: use Tailwind spacing scale (4px base unit), consistent font sizes per component
- [ ] T098 [US6] Test dark mode (optional): add dark mode toggle in NavBar, ensure all components support dark theme via Tailwind dark: prefix

**Checkpoint**: User Story 6 complete - UI is responsive, professional, and handles all states gracefully

---

## Phase 9: Integration & Cross-Cutting Concerns

**Purpose**: End-to-end testing, documentation, and final polish

- [ ] T099 [P] Create integration test in `backend/tests/test_auth_integration.py`: signup user, login, create task, verify task in list, logout
- [ ] T100 [P] Create integration test in `frontend/tests/integration.test.ts`: signup flow end-to-end (fill form, submit, redirect, dashboard loads)
- [ ] T101 Update backend README in `backend/README.md` with setup instructions: clone, pip install, set .env variables, run `uvicorn src.main:app --reload`
- [ ] T102 Update frontend README in `frontend/README.md` with setup instructions: clone, npm install, set .env.local variables, run `npm run dev`
- [ ] T103 Create QUICKSTART.md in project root with 5-minute setup guide: clone, install backend/frontend, copy .env.example to .env.local, run both servers, open http://localhost:3000/signup
- [ ] T104 Verify all environment variables are documented in `.env.example` with descriptions
- [ ] T105 Run full end-to-end test flow: clear database, signup 2 users, each creates 3 tasks, verify each user sees only their tasks, logout both users, login as user1, verify tasks still there
- [ ] T106 Performance check: measure signup and login response times (should be <2 seconds on localhost); measure dashboard page load time (should be <1 second after login)
- [ ] T107 Security check: verify JWT tokens include user_id, have expiration; verify all API endpoints reject unauthenticated requests with 401; verify task endpoints reject cross-user access with 403

---

## Dependency Graph & Parallel Execution

### Critical Path (Must Complete in Order)

```
Phase 1: Setup (T001-T003)
    ↓
Phase 2: Foundation (T004-T017)
    ├─ T004-T007: Database setup (can parallelize)
    ├─ T008-T011: JWT infrastructure (can parallelize after DB)
    └─ T012-T017: FastAPI + environment (can parallelize)
    ↓
Phase 3-6: P1 User Stories (can parallelize at story level)
    ├─ US1 Backend (T018-T022) → US1 Frontend (T023-T028) [frontend can start after backend /auth/signup ready]
    ├─ US2 Backend (T029-T033) → US2 Frontend (T034-T037) [parallel with US1]
    ├─ US3 Backend (T038-T051) → US3 Frontend (T052-T062) [starts after Foundation complete]
    └─ US4 Backend (T063-T067) → US4 Frontend (T068-T073) [depends on US1-US3 mostly done]
    ↓
Phase 7-8: P2 User Stories (can parallelize)
    ├─ US5 Backend (T074) → US5 Frontend (T075-T078)
    └─ US6 Frontend (T079-T098)
    ↓
Phase 9: Integration & Cross-Cutting (T099-T107)
```

### Parallel Execution Examples

**Setup Phase (Day 1)**:
```
T001 (backend structure) | T002 (frontend structure) | T003 (dependencies)
```

**Foundation Phase (Day 1-2)**:
```
T004 (User model) | T005 (Task model) | T006 (database config)
T008 (JWT gen)     | T009 (JWT verify) | T010 (password hash)
                   T011 (middleware)
                   T012-T017 (API setup)
```

**P1 User Stories Phase (Day 2-4)**:
```
US1 Backend: T018→T019→T020→T021→T022
US1 Frontend: T023→T024→T025→T026→T027→T028 (starts after T020 complete)

US2 Backend: T029→T030→T031→T032→T033 (parallel with US1 Frontend)
US2 Frontend: T034→T035→T036→T037 (starts after T031 complete)

US3 Backend: T038→T039→T040→...→T051 (starts after Foundation complete, parallel with US1)
US3 Frontend: T052→T053→T054→...→T062 (starts after T045 complete)

US4 Backend: T063→T064→T065→T066→T067 (after US3 mostly done)
US4 Frontend: T068→T069→T070→T071→T072→T073 (after US3 frontend done)
```

**P2 User Stories Phase (Day 5)**:
```
US5 Backend: T074 (parallel with US6)
US5 Frontend: T075→T076→T077→T078

US6 Frontend: T079→T080→...→T098 (parallel with US5)
```

**Integration Phase (Day 5-6)**:
```
T099, T100 (integration tests - parallel)
T101, T102, T103, T104 (docs - parallel)
T105, T106, T107 (verification - sequential)
```

---

## Success Criteria

- ✅ All 107 tasks completed
- ✅ User can signup with email/password, data persists in Neon
- ✅ User can login with credentials, receives JWT valid for 24 hours
- ✅ User can create, view, update, delete, toggle tasks; only sees own tasks
- ✅ Unauthenticated requests return 401; cross-user access returns 403
- ✅ Routes protected: `/dashboard` redirects to `/login` if no JWT
- ✅ Logout clears session and redirects to `/login`
- ✅ UI responsive on desktop (1920px), tablet (768px), mobile (375px)
- ✅ All states handled: loading, empty, error (show user-friendly messages)
- ✅ Integration tests pass: signup→login→create task→logout→login flow
- ✅ Performance: signup/login <2s, dashboard load <1s

---

**Status**: ✅ Tasks generated. Ready for implementation via `/sp.implement`.
