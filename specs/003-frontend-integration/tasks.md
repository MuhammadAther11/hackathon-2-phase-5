# Tasks: Frontend Interface & Integration

**Input**: Design documents from `/specs/003-frontend-integration/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Playwright E2E tests are included for user stories as requested by the specification's "Independent Test" sections.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `frontend/src/`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Initialize Next.js 16 project in `frontend/` with App Router, Tailwind CSS, and TypeScript
- [x] T002 [P] Configure global layout and metadata in `frontend/src/app/layout.tsx`
- [x] T003 Setup React Query provider in `frontend/src/lib/providers.tsx`
- [x] T004 [P] Create `.env.local` and `.env.example` with `NEXT_PUBLIC_API_URL` and `BETTER_AUTH_SECRET` in `frontend/`

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 [P] Implement Better Auth client configuration in `frontend/src/lib/auth-client.ts`
- [x] T006 Implement centralized fetch utility with JWT injection in `frontend/src/lib/api-client.ts`
- [x] T007 Implement Next.js middleware for route protection in `frontend/src/middleware.ts`
- [x] T008 [P] Define `FrontendTask` and `AuthModel` TypeScript interfaces in `frontend/src/types/index.ts`
- [x] T009 [P] Configure Vitest and Playwright in `frontend/` for unit and E2E testing

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Secure Authentication Flow (Priority: P1) 🎯 MVP

**Goal**: Implement signup and login pages using Better Auth with route protection.

**Independent Test**: User can successfully navigate to `/signup`, create an account, be redirected to `/dashboard`, and see their active session state.

### Tests for User Story 1

- [x] T010 [P] [US1] Create Playwright E2E test for authentication flows in `frontend/tests/auth.spec.ts`

### Implementation for User Story 1

- [x] T011 [P] [US1] Implement `AuthForm` component in `frontend/src/components/AuthForm.tsx` (supports login/signup)
- [x] T012 [US1] Create login page at `frontend/src/app/login/page.tsx`
- [x] T013 [US1] Create signup page at `frontend/src/app/signup/page.tsx`
- [x] T014 [US1] Implement session-aware navigation (Logout button) in `frontend/src/components/NavBar.tsx`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently.

---

## Phase 4: User Story 2 - Integrated Task Management (Priority: P1)

**Goal**: Implement the task dashboard with CRUD operations integrated with the FastAPI backend.

**Independent Test**: User can create a task on the dashboard and see it reflect in the list without a full page reload.

### Tests for User Story 2

- [x] T015 [P] [US2] Create Playwright E2E test for task CRUD operations in `frontend/tests/tasks.spec.ts`

### Implementation for User Story 2

- [x] T016 [P] [US2] Create generic `Button` and `Input` UI components in `frontend/src/components/ui/`
- [x] T017 [US2] Implement `useTasks` hook for React Query in `frontend/src/hooks/useTasks.ts`
- [x] T018 [US2] Implement `TaskItem` component in `frontend/src/components/TaskItem.tsx`
- [x] T019 [US2] Implement `TaskDashboard` component in `frontend/src/components/TaskDashboard.tsx`
- [x] T020 [US2] Create dashboard page at `frontend/src/app/dashboard/page.tsx`
- [x] T021 [US2] Add empty state and loading skeletons to `TaskDashboard`

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently.

---

## Phase 5: User Story 3 - Mobile-First Task List (Priority: P2)

**Goal**: Optimize the UI for mobile devices using Tailwind's responsive utilities.

**Independent Test**: Resize browser to mobile width and verify that task actions are clickable and layout is single-column.

### Implementation for User Story 3

- [x] T022 [US3] Apply responsive single-column layout to `TaskDashboard` in `frontend/src/components/TaskDashboard.tsx`
- [x] T023 [US3] Optimize `TaskItem` click targets and spacing for touch devices
- [x] T024 [P] [US3] Verify Lighthouse accessibility and performance scores

**Checkpoint**: All user stories should now be independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T025 [P] Add global error toast notifications for API failures
- [x] T026 Code cleanup and removal of unused styles/types
- [x] T027 [P] Run final validation against `quickstart.md`
- [x] T028 Update `CLAUDE.md` with frontend architecture details

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately.
- **Foundational (Phase 2)**: Depends on Phase 1 completion - BLOCKS all user stories.
- **User Stories (Phase 3+)**: All depend on Phase 2 completion.
- **Polish (Phase 6)**: Depends on all user stories being complete.

### User Story Dependencies

- **User Story 1 (P1)**: Independent after Phase 2.
- **User Story 2 (P1)**: Independent after Phase 2, but requires US1 for E2E testing as a logged-in user.
- **User Story 3 (P2)**: Depends on US2 components for optimization.

---

## Parallel Opportunities

- T002, T004, T005, T008, T009 can run in parallel during early phases.
- Authentication E2E tests (T010) and Task Dashboard components (T016, T018) can proceed in parallel.
- Documentation (T028) and final verification (T027) can be done together.

---

## Implementation Strategy

### MVP First (User Story 1 & 2)

1. Complete Setup + Foundational.
2. Complete User Story 1 (Authentication).
3. Complete User Story 2 (Core Task Management).
4. **VALIDATE**: Ensure JWT is passed to backend and state updates are reactive.

### Incremental Delivery

1. Full Auth Flow -> Verified.
2. Task CRUD -> Verified.
3. Responsive Optimization -> Verified.
4. Final Polish -> Feature complete.
