# Implementation Tasks: Frontend Fix & Deployment Ready

**Feature Branch**: `005-frontend-fix-deploy` | **Date**: 2026-01-15
**Spec**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md) | **Status**: Ready for Implementation

---

## Overview

Complete task breakdown for frontend fixes, bug resolutions, and deployment readiness. Tasks are organized by user story (P1 priorities first, then P2) to enable independent implementation and testing. Each task is specific, actionable, and includes file paths for direct implementation.

**Total Tasks**: 48 | **P1 Stories**: 2 | **P2 Stories**: 3 | **Estimated MVP Scope**: Complete US1 + US2 (foundation + core feature)

---

## Implementation Strategy

**MVP First Approach**:
1. **Phase 1 (Setup)**: Environment and foundational fixes (T001-T006)
2. **Phase 2 (Foundational)**: Centralized API, auth middleware (T007-T012)
3. **Phase 3 (US1 - Auth)**: Fix login/signup, error handling (T013-T022)
4. **Phase 4 (US2 - Tasks)**: Fix task CRUD, state sync (T023-T032)
5. **Phase 5 (US3 - UI Polish)**: Responsive design, transitions (T033-T038)
6. **Phase 6 (US4 - Landing Page)**: Public page with CTAs (T039-T042)
7. **Phase 7 (US5 - Error Handling)**: Global error strategy (T043-T045)
8. **Phase 8 (Polish)**: Build optimization, deployment (T046-T048)

**Parallelization**: Tasks marked `[P]` can run in parallel within the same phase (different files, no cross-dependencies).

---

## Dependency Graph

```
Phase 1 (Setup) ─→ Phase 2 (Foundational)
                           │
         ┌─────────────────┼─────────────────┐
         ↓                 ↓                 ↓
      Phase 3          Phase 5           Phase 6
     (US1-Auth)       (US3-UI)        (US4-Landing)
         │              │                   │
         └──────────────┼───────────────────┘
                        ↓
                   Phase 4 (US2-Tasks)
                        │
                        ↓
                  Phase 7 (US5-Errors)
                        │
                        ↓
                   Phase 8 (Polish)
```

**Note**: US3 (UI) and US6 (Landing) can start after Phase 2. US2 (Tasks) requires US1 (Auth) completion. US5 (Errors) benefits from US1-4 completion for comprehensive testing.

---

## Phase 1: Setup & Environment

### Goal
Initialize development environment, verify tooling, and document configuration for local development and Vercel deployment.

### Independent Test
Run `npm run build` and verify zero TypeScript/build errors in fresh environment.

---

- [ ] T001 Verify npm dependencies and Next.js version in `frontend/package.json` - ensure Next.js 15+, React 19+, @tanstack/react-query 5+
- [ ] T002 Create `.env.local` file in `frontend/` with `NEXT_PUBLIC_API_URL=http://localhost:8000` for local development
- [ ] T003 [P] Create `.env.example` in `frontend/` documenting all required environment variables (NEXT_PUBLIC_API_URL for local/staging/production)
- [ ] T004 [P] Update `frontend/tsconfig.json` to ensure strict mode enabled and path aliases configured (`@/*` → `src/*`)
- [ ] T005 [P] Add `"use client"` directive check task: Audit `frontend/src/app/`, `frontend/src/components/` for missing directives on interactive components
- [ ] T006 Run `npm run type-check` in `frontend/` and capture baseline TypeScript errors - create list of errors to fix in subsequent phases

---

## Phase 2: Foundational Infrastructure

### Goal
Establish centralized API client, auth middleware, error handling, and token management that all user stories depend on.

### Independent Test
Verify `apiFetch` function injects JWT and handles 401 redirects. Verify middleware protects `/dashboard` route.

---

- [ ] T007 [P] Verify token storage in `frontend/src/lib/auth-client.ts` - confirm Better Auth uses localStorage, add console log for debugging
- [ ] T008 [P] Implement token-to-cookie sync in `frontend/src/lib/auth-client.ts` - add `syncTokenToCookie()` function called after successful login/signup to set `auth_token` cookie for middleware
- [ ] T009 Verify centralized API client `frontend/src/lib/api-client.ts` - confirm `apiFetch` injects JWT from session and handles errors. Add null-safe JSON parsing for 204 responses
- [ ] T010 [P] Create error message mapping function in `frontend/src/lib/auth-errors.ts` - map HTTP status codes to user-friendly messages (401→"Session expired", 404→"Not found", etc.)
- [ ] T011 [P] Create error message mapping for task operations in `frontend/src/lib/task-errors.ts` - map HTTP status codes specific to task operations (400→"Title required", 422→validation errors, etc.)
- [ ] T012 Verify middleware route protection in `frontend/src/middleware.ts` - confirm it checks `auth_token` cookie and redirects to `/login` for unauthenticated `/dashboard` access. Test both authenticated and unauthenticated flows

---

## Phase 3: User Story 1 - Secure Login/Signup Flow (P1)

### Goal
Fix authentication input handling, establish stable auth state, enable reliable login/signup/logout flows.

### Why P1
Authentication is foundational. Without working login/signup, users cannot access any features. Critical for deployment readiness.

### Independent Test
1. Signup with new email → Account created → Redirect to login ✅
2. Login with valid credentials → Token stored → Redirect to dashboard ✅
3. Dashboard shows authenticated user info ✅
4. Logout clears token → Redirect to login ✅
5. Invalid credentials → Error message shown → Stay on form ✅
6. Refresh page while authenticated → Token persists → Still on dashboard ✅

---

- [ ] T013 [US1] [P] Fix AuthForm input handling in `frontend/src/components/AuthForm.tsx` - Replace custom keyboard navigation logic with standard form behavior. Use controlled inputs (email, password, name state). Remove `handleKeyDown` Enter key navigation
- [ ] T014 [US1] [P] Add `"use client"` directive to `frontend/src/components/AuthForm.tsx` - Component uses useState hooks and event handlers
- [ ] T015 [US1] Implement error message display in AuthForm - Use `getAuthErrorMessage()` from task T010 to show user-friendly errors. Display below form, also show in toast notification
- [ ] T016 [US1] [P] Add loading state feedback to AuthForm buttons - Disable submit button and show spinner while authentication in progress. Disable input fields during submission
- [ ] T017 [US1] [P] Implement token sync to cookie after successful signin - Call `syncTokenToCookie()` after `signIn.email()` succeeds (from task T008). Set `auth_token` cookie for middleware
- [ ] T018 [US1] [P] Implement token sync to cookie after successful signup - After account creation, redirect to login page with message. Explain that user must login with new credentials
- [ ] T019 [US1] Implement logout handler in `frontend/src/components/NavBar.tsx` - Call `signOut()` from auth-client, clear auth_token cookie, redirect to `/login` with success message
- [ ] T020 [US1] Add session state display to NavBar - Show logged-in user's email/name in navbar. Display logout button only when authenticated
- [ ] T021 [US1] [P] Fix login page at `frontend/src/app/login/page.tsx` - Add `"use client"` directive, render AuthForm component with type="login", add link to signup page
- [ ] T022 [US1] [P] Fix signup page at `frontend/src/app/signup/page.tsx` - Add `"use client"` directive, render AuthForm component with type="signup", add link to login page

---

## Phase 4: User Story 2 - Task Management Dashboard (P1)

### Goal
Fix task CRUD operations, ensure UI state syncs with backend, provide loading and error feedback for all task actions.

### Why P1
Task management is the core feature. All operations must work without errors. Necessary for deployment readiness.

### Independent Test
1. Create task → Appears in list → Query cache invalidated ✅
2. Edit task → Title updates → Backend persists ✅
3. Toggle task completion → Status flips → Persists ✅
4. Delete task → Removed from list → Backend confirms ✅
5. Empty response (204) → No crash on JSON parse ✅
6. Create + delete rapid fire → No race conditions ✅
7. Refresh page → Tasks persist and reload ✅

---

- [ ] T023 [US2] [P] Fix `useTasks` hook in `frontend/src/hooks/useTasks.ts` - Add null-safe JSON parsing for empty 204 responses in all mutations. Update `apiFetch` call to handle DELETE returning no body
- [ ] T023 [US2] [P] Verify createTask mutation in `frontend/src/hooks/useTasks.ts` - POST /tasks with title, invalidate cache on success, show loading state, handle error messages using task-errors mapping
- [ ] T024 [US2] [P] Verify updateTask mutation in `frontend/src/hooks/useTasks.ts` - PUT /tasks/{id} with title/description, invalidate cache on success, handle error messages
- [ ] T025 [US2] [P] Verify toggleTask mutation in `frontend/src/hooks/useTasks.ts` - PATCH /tasks/{id}/toggle with empty body, invalidate cache on success, handle error messages
- [ ] T026 [US2] [P] Verify deleteTask mutation in `frontend/src/hooks/useTasks.ts` - DELETE /tasks/{id}, handle 204 No Content response gracefully, invalidate cache, handle error messages
- [ ] T027 [US2] [P] Add `"use client"` directive to `frontend/src/components/TaskDashboard.tsx` - Component uses hooks (useTasks, useState)
- [ ] T028 [US2] [P] Improve TaskDashboard loading states in `frontend/src/components/TaskDashboard.tsx` - Show spinner while fetching tasks, disable input/button while creating, show loading indicator for edit/delete operations
- [ ] T029 [US2] [P] Add error handling to TaskDashboard - Catch mutation errors, display in toast using task-errors mapping, allow user to retry failed operations
- [ ] T030 [US2] [P] Add `"use client"` directive to `frontend/src/components/TaskItem.tsx` - Component has onClick handlers for toggle/delete
- [ ] T031 [US2] [P] Improve TaskItem button states in `frontend/src/components/TaskItem.tsx` - Disable toggle/delete buttons while operation in progress, show spinners on buttons during mutations
- [ ] T032 [US2] Fix dashboard page routing in `frontend/src/app/dashboard/page.tsx` - Ensure route is protected by middleware (check is done in Phase 2 T012). Add `"use client"` directive. Render TaskDashboard and NavBar components

---

## Phase 5: User Story 3 - Professional Responsive UI (P2)

### Goal
Ensure UI is clean, styled consistently, and responsive across all device sizes (320px-1920px). Add smooth transitions and clear loading states.

### Why P2
UI polish improves user confidence but is less critical than core functionality. Expected for production deployment.

### Independent Test
1. Dashboard responsive at 320px (mobile) ✅ - All elements visible, buttons clickable
2. Dashboard responsive at 768px (tablet) ✅ - Proper spacing, layout adapts
3. Dashboard responsive at 1920px (desktop) ✅ - No excessive width, centered content
4. Transitions smooth when toggling task completion ✅ - No jarring visual changes
5. Loading spinners visible and clear ✅ - Users know operation is in progress

---

- [ ] T033 [US3] [P] Audit Tailwind classes in `frontend/src/components/` - Verify mobile-first approach (base styles for mobile, `sm:`, `md:`, `lg:` for larger screens). Ensure no hardcoded widths preventing responsive layout
- [ ] T034 [US3] Test responsive layout at 320px mobile viewport - Open dashboard in DevTools responsive mode (375px width). Verify text readable, inputs clickable, no horizontal scroll. Fix any layout breaks
- [ ] T035 [US3] Test responsive layout at 768px tablet viewport - Resize DevTools to 768px. Verify grid/flexbox adapts, spacing appropriate, all elements visible. Fix layout issues
- [ ] T036 [US3] Test responsive layout at 1920px desktop viewport - Resize DevTools to 1920px. Verify content centered or constrained, no excessive width, readability maintained. Fix oversized layouts
- [ ] T037 [US3] Add smooth transitions to task operations in `frontend/src/components/TaskItem.tsx` - Add CSS transitions when task completion status toggles (opacity fade or subtle color change). Ensure transitions don't block interactions
- [ ] T038 [US3] [P] Review and improve component spacing/margins in `frontend/src/components/` - Ensure consistent padding/margin using Tailwind utilities. Check visual hierarchy, alignment, whitespace. Polish overall appearance

---

## Phase 6: User Story 4 - Public Landing Page (P2)

### Goal
Create professional landing page at `/` for unauthenticated users with clear login/signup CTAs. Allow authenticated users to navigate to dashboard or stay on landing page.

### Why P2
Discovery and first impression matter for user acquisition. Expected for public deployment but not critical to core functionality.

### Independent Test
1. Visit `/` without authentication → Landing page displays ✅ (no redirect to login)
2. Landing page has "Login" CTA button → Navigates to `/login` ✅
3. Landing page has "Signup" CTA button → Navigates to `/signup` ✅
4. Authenticated user visits `/` → Landing page shows "Go to Dashboard" option ✅
5. Landing page is responsive and styled professionally ✅

---

- [ ] T039 [US4] Create landing page component `frontend/src/components/LandingPage.tsx` - Display app title, description, benefit summary. Render login/signup CTAs as buttons or links. Use Tailwind for professional styling
- [ ] T040 [US4] [P] Add `"use client"` directive to landing page and update `frontend/src/app/page.tsx` - Remove automatic redirect logic. Render LandingPage component. Show authenticated user's name and "Go to Dashboard" link if logged in
- [ ] T041 [US4] [P] Add navigation links in LandingPage - Login button → `/login`, Signup button → `/signup`. Show "Go to Dashboard" link if user is authenticated
- [ ] T042 [US4] Ensure LandingPage is responsive and visually appealing - Test at 320px, 768px, 1920px. Verify buttons are clickable, text readable, styling consistent. Polish visual design

---

## Phase 7: User Story 5 - Auth Error Handling (P2)

### Goal
Ensure all authentication failures (invalid credentials, 401, network errors) are handled gracefully with clear user-friendly messages.

### Why P2
Robust error handling prevents crashes and poor UX. Critical for production stability but secondary to core functionality working.

### Independent Test
1. Invalid email/password → Specific error shown → Stay on form ✅
2. Expired token (401) → Redirect to login → Message shown ✅
3. Network timeout → "Connection lost" message ✅
4. Server error (500) → Generic friendly message ✅
5. Browser cookies cleared → Re-login required, no crash ✅

---

- [ ] T043 [US5] Implement 401 detection in `frontend/src/lib/api-client.ts` - On 401 response, call `authClient.signOut()`, clear auth_token cookie, redirect to `/login?message=Session expired`
- [ ] T044 [US5] [P] Add network error handling to apiFetch - Catch network timeouts and connection errors. Show user-friendly message: "Connection lost. Check your internet."
- [ ] T045 [US5] [P] Test error scenarios manually - Invalid credentials → Error shown. Disconnect internet → Error shown. Delete auth_token cookie → Redirect to login. Verify app doesn't crash

---

## Phase 8: Polish & Deployment

### Goal
Fix remaining build errors, optimize bundle, prepare for Vercel deployment, ensure zero runtime errors.

### Independent Test
Run `npm run build` → Zero errors ✅ | Deploy to Vercel → Zero build/runtime errors ✅ | All critical flows work on Vercel ✅

---

- [ ] T046 Run `npm run type-check` in `frontend/` and fix all TypeScript errors - Compare to baseline from T006. Fix type mismatches, missing imports, undefined variables. Iterate until zero errors
- [ ] T047 [P] Run `npm run build` in `frontend/` and fix all build errors - Resolve Next.js specific errors (Server/Client boundary, async component issues, etc.). Ensure build completes successfully
- [ ] T048 [P] Deploy to Vercel and verify zero errors - Set environment variables (NEXT_PUBLIC_API_URL). Trigger deployment. Monitor build logs. Test critical flows (login → create task → logout). Verify no runtime errors in DevTools

---

## Testing & Validation

### Test Matrix by User Story

#### US1: Secure Login/Signup (P1)
| Scenario | Expected | Status |
|----------|----------|--------|
| Signup with new email | Account created, redirect to login | [ ] |
| Login with valid credentials | Redirect to dashboard, token in localStorage | [ ] |
| Login with invalid credentials | Error message, stay on form | [ ] |
| Logout | Clear token, redirect to login | [ ] |
| Refresh after login | Token persists, still authenticated | [ ] |
| Token expires | Redirect to login on next action | [ ] |

#### US2: Task Management (P1)
| Scenario | Expected | Status |
|----------|----------|--------|
| Create task | Task appears in list | [ ] |
| Edit task title | Title updates, backend persists | [ ] |
| Toggle task completion | Status flips, persists | [ ] |
| Delete task | Removed from list and database | [ ] |
| 204 No Content response | App doesn't crash | [ ] |
| Rapid create/delete | No race conditions or cache issues | [ ] |

#### US3: Responsive UI (P2)
| Viewport | Expected | Status |
|----------|----------|--------|
| 320px (mobile) | All elements visible and clickable | [ ] |
| 768px (tablet) | Layout adapts, spacing appropriate | [ ] |
| 1920px (desktop) | Content centered, readable | [ ] |
| Transitions | Smooth, non-jarring | [ ] |

#### US4: Landing Page (P2)
| Scenario | Expected | Status |
|----------|----------|--------|
| Unauthenticated user visits `/` | Landing page displays | [ ] |
| Click "Login" CTA | Navigate to `/login` | [ ] |
| Click "Signup" CTA | Navigate to `/signup` | [ ] |
| Authenticated user visits `/` | Show "Go to Dashboard" option | [ ] |

#### US5: Error Handling (P2)
| Scenario | Expected | Status |
|----------|----------|--------|
| Invalid credentials | Specific error message shown | [ ] |
| 401 response | Redirect to login | [ ] |
| Network timeout | "Connection lost" message | [ ] |
| Server error (500) | Generic friendly message | [ ] |

---

## Parallel Execution Opportunities

### Phase 3 (US1) - Parallel Tasks
Tasks T013, T014, T016, T017, T021, T022 can run in parallel (different files, no cross-dependencies):
- T013, T014: AuthForm component fixes
- T016, T017: Button/loading state logic
- T021, T022: Login and signup page routes

### Phase 4 (US2) - Parallel Tasks
Tasks T023-T026, T027-T032 can run partially in parallel:
- T023-T026: Hook mutations (independent)
- T027-T032: Component updates (can start after hooks finalized)

### Phase 5 (US3) - Parallel Tasks
Tasks T033, T034, T036, T037, T038 can run in parallel (testing different viewports/features simultaneously).

### Phase 8 (Polish) - Parallel Tasks
Tasks T047, T048 can run together (build + deploy once build succeeds).

---

## Task Execution Guidelines

### Before Starting Each Task
1. Read the task description and file paths carefully
2. Check task dependencies (tasks marked with prerequisite task IDs)
3. Review relevant contract/design documentation (plan.md, contracts/, data-model.md)
4. If component needs `"use client"`, add directive FIRST before writing code

### During Task Implementation
1. Make smallest viable change (avoid unrelated refactoring)
2. Test locally: `npm run dev` and manual testing
3. Run type-check: `npm run type-check` - fix any new errors
4. Test responsive design at 320px, 768px, 1920px using DevTools
5. Commit after each task completes: `git add . && git commit -m "feat: T### description"`

### After All Tasks Complete
1. Run full build: `npm run build` - zero errors required
2. Deploy to Vercel: Trigger via GitHub or Vercel CLI
3. Test on production: Login → Create task → Logout
4. Verify DevTools console: No runtime errors
5. Run all test scenarios from Test Matrix

---

## Success Criteria (All Must Pass)

- ✅ All 5 user stories testable independently
- ✅ US1 (Auth) fully functional before US2 (Tasks)
- ✅ US2 (Tasks) fully functional before US3-5 (Polish/Landing/Errors)
- ✅ `npm run type-check` → Zero TypeScript errors
- ✅ `npm run build` → Zero build errors
- ✅ Deploy to Vercel → Successful deployment
- ✅ All critical user flows work on Vercel (login, create task, logout)
- ✅ No runtime errors in browser DevTools console
- ✅ Responsive layout confirmed at 320px, 768px, 1920px
- ✅ All task operations (create, read, update, delete, toggle) work reliably

---

## Rollback & Recovery

If task execution encounters critical blocker:
1. Identify failing task and its dependencies
2. Review error in browser DevTools or build logs
3. Check relevant contract/design documentation for correct approach
4. Fix or revert to last known working commit: `git reset --hard <commit>`
5. Restart task with corrected approach

---

**Created**: 2026-01-15 | **Phase**: Implementation Ready | **Next**: Execute Phase 1 setup tasks
