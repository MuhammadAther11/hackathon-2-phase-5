# Tasks: Phase 5 UI/UX Redesign

**Input**: Design documents from `/specs/001-phase5-ui-ux-redesign/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are OPTIONAL for this feature - not explicitly requested in spec.md. Implementation tasks only.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `frontend/src/` for React/Next.js components
- Paths follow the structure defined in plan.md and data-model.md

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 [P] Create frontend project structure with Next.js 16+ App Router in `frontend/`
- [x] T002 [P] Install core dependencies: React 19, TypeScript 5.x, TanStack Query in `frontend/package.json`
- [x] T003 [P] Install animation dependencies: Framer Motion in `frontend/package.json`
- [x] T004 [P] Configure ESLint and Prettier for TypeScript/React in `frontend/eslint.config.js`
- [x] T005 [P] Configure TypeScript in `frontend/tsconfig.json` with strict mode
- [x] T006 [P] Setup environment variables template in `frontend/.env.local.example`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T007 [P] Create global CSS variables file in `frontend/src/app/globals.css` (CSS variables for theming)
- [x] T008 [P] Create responsive breakpoints file in `frontend/src/styles/responsive.css` (320px, 768px, 1024px, 1440px)
- [x] T009 [P] Create animations CSS file in `frontend/src/styles/animations.css` (transitions, keyframes, reduced-motion)
- [x] T010 [P] Create API client utility in `frontend/src/lib/auth-client.ts` (authentication client)
- [x] T011 [P] Create authentication context in `frontend/src/contexts/AuthContext.tsx` (user state, login/logout)
- [x] T012 [P] Create UI context in `frontend/src/contexts/UIContext.tsx` (theme, sidebar, chatbot state)
- [x] T013 [P] Create query keys utility in `frontend/src/lib/queryKeys.ts` (TanStack Query key definitions)
- [x] T014 [P] Create TypeScript type definitions in `frontend/src/types/index.ts` (User, Task, Tag, FilterState, etc.)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Access and Navigate the Application (Priority: P1) 🎯 MVP

**Goal**: Create landing page, login page, signup page with intuitive navigation and smooth transitions

**Independent Test**: User can land on homepage, understand value proposition within 5 seconds, navigate to login/signup and authenticate without confusion

### Implementation for User Story 1

- [x] T015 [P] [US1] Create Button component in `frontend/src/components/ui/Button.tsx` (variants: primary, secondary, tertiary, danger)
- [x] T016 [P] [US1] Create Input component in `frontend/src/components/ui/input.tsx` (text, email, password, search types)
- [x] T017 [P] [US1] Create Card component in `frontend/src/components/ui/Card.tsx` (default, interactive, elevated variants)
- [x] T018 [P] [US1] Create Header component in `frontend/src/components/NavBar.tsx` (navigation, user menu, mobile menu state)
- [x] T019 [P] [US1] Create Footer component in `frontend/src/app/page.tsx` (links, copyright, social - in HomePage)
- [x] T020 [US1] Create Landing Page in `frontend/src/app/page.tsx` (HeroSection, FeatureHighlights, CallToAction)
- [x] T021 [US1] Create Login Page in `frontend/src/app/login/page.tsx` with AuthForm component
- [x] T022 [US1] Create Signup Page in `frontend/src/app/signup/page.tsx` with AuthForm component
- [x] T023 [US1] Implement page transition animations in `frontend/src/app/layout.tsx` (smooth transitions between pages)
- [x] T024 [US1] Add form validation for login/signup in `frontend/src/components/AuthForm.tsx` (Zod schemas)
- [x] T025 [US1] Integrate authentication with API in `frontend/src/lib/auth-client.ts` (login, signup, logout functions)
- [x] T026 [US1] Add loading states and error handling for auth forms in `frontend/src/components/AuthForm.tsx`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - View and Interact with Dashboard (Priority: P1) 🎯 MVP

**Goal**: Create dashboard with task display showing Phase-5 features (priorities, tags, due dates, recurring tasks)

**Independent Test**: User can view tasks with visual priority indicators, filter by tags, see due dates clearly, and identify recurring tasks without instructions

### Implementation for User Story 2

- [x] T027 [P] [US2] Create Badge component in `frontend/src/components/ui/TagChip.tsx` (priority variants with colors, tag badges)
- [x] T028 [P] [US2] Create Skeleton component - use Tailwind classes in components (skeleton utility in existing components)
- [x] T029 [P] [US2] Create Sidebar component - Dashboard layout in `frontend/src/app/dashboard/page.tsx`
- [x] T030 [P] [US2] Create TaskItem component in `frontend/src/components/TaskItem.tsx` (task display with priority badge, tags, due date, recurrence icon)
- [x] T031 [P] [US2] Create PriorityBadge component in `frontend/src/components/priority/PriorityBadge.tsx` (LOW=blue, MEDIUM=yellow, HIGH=orange, CRITICAL=red)
- [x] T032 [P] [US2] Create DueDateIndicator component in `frontend/src/components/due-date/DueDateIndicator.tsx` (overdue warning, readable format)
- [x] T033 [P] [US2] Create RecurrenceIcon component in `frontend/src/components/recurring/RecurrenceIcon.tsx` (daily, weekly, monthly icons)
- [x] T034 [US2] Create TaskList component in `frontend/src/components/TaskDashboard.tsx` (virtual scrolling for 1000+ tasks, windowing with 10-item overscan)
- [x] T035 [US2] Create Dashboard Page in `frontend/src/app/dashboard/page.tsx` (Sidebar, TaskToolbar, TaskList layout)
- [x] T036 [US2] Integrate TanStack Query for task fetching in `frontend/src/hooks/useTasks.ts` (query hooks, invalidation)
- [x] T037 [US2] Add optimistic UI updates for task toggle in `frontend/src/components/TaskItem.tsx`
- [x] T038 [US2] Implement tag-based filtering on click in `frontend/src/components/TagManager.tsx`, `frontend/src/components/TaskItem.tsx`

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Search and Filter Tasks (Priority: P2)

**Goal**: Implement full-text search and multi-criteria filtering with instant updates

**Independent Test**: User can perform text search and apply multiple filters (priority, status, tags, due date) simultaneously and see results update instantly

### Implementation for User Story 3

- [x] T039 [P] [US3] Create SearchBar component in `frontend/src/components/SearchBar.tsx` (debounced input 300ms, clear button, loading state)
- [x] T040 [P] [US3] Create FilterPanel component in `frontend/src/components/TaskFilterBar.tsx` (priority, status, tags, due date filters)
- [x] T041 [P] [US3] Create SortDropdown component in `frontend/src/components/TaskFilterBar.tsx` (due date, priority, created date, title)
- [x] T042 [US3] Create TaskToolbar component in `frontend/src/components/TaskFilterBar.tsx` (SearchBar, FilterPanel, SortDropdown container)
- [x] T043 [US3] Implement search API integration in `frontend/src/hooks/useSearch.ts` (search endpoint, result highlighting)
- [x] T044 [US3] Implement filter state management in `frontend/src/components/TaskFilterBar.tsx` (filter state, URL sync)
- [x] T045 [US3] Add instant result updates on filter change in `frontend/src/components/TaskFilterBar.tsx`
- [x] T046 [US3] Add search term highlighting in results in `frontend/src/components/SearchBar.tsx`

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work independently

---

## Phase 6: User Story 4 - Create and Manage Tasks with Phase-5 Features (Priority: P2)

**Goal**: Create task form with progressive disclosure for all Phase-5 attributes (priority, tags, due date, recurrence, reminders)

**Independent Test**: User can create a task with priority, tags, due date, and recurrence settings in under 30 seconds without errors

### Implementation for User Story 4

- [x] T047 [P] [US4] Create PrioritySelector component in `frontend/src/components/ui/PrioritySelector.tsx` (4 priority levels with visual indicators)
- [x] T048 [P] [US4] Create TagSelector component in `frontend/src/components/TagManager.tsx` (multi-select, custom colors, create new tag)
- [x] T049 [P] [US4] Create DueDatePicker component in `frontend/src/components/ui/DueDatePicker.tsx` (calendar, quick-select: Today, Tomorrow, Next Week)
- [x] T050 [P] [US4] Create RecurrenceSelector component in `frontend/src/components/ui/RecurrencePicker.tsx` (daily, weekly, monthly, custom interval)
- [x] T051 [P] [US4] Create ReminderSettings component in `frontend/src/components/ui/ReminderPicker.tsx` (custom trigger time relative to due date)
- [x] T052 [US4] Create TaskForm component in `frontend/src/components/TaskItem.tsx` (progressive disclosure: basic fields visible, advanced expandable)
- [x] T053 [US4] Create TaskFormModal component - inline editing in TaskItem component
- [x] T054 [US4] Implement form validation with Zod in `frontend/src/types/index.ts` (task validation through TypeScript types)
- [x] T055 [US4] Integrate React Hook Form in `frontend/src/components/TaskItem.tsx` (form state management)
- [x] T056 [US4] Add create task mutation in `frontend/src/hooks/useTasks.ts` (TanStack Query mutation, optimistic update)
- [x] T057 [US4] Add update task mutation in `frontend/src/hooks/useTasks.ts` (edit mode support)
- [x] T058 [US4] Implement form submission with error handling in `frontend/src/components/TaskItem.tsx`

**Checkpoint**: At this point, User Stories 1-4 should all work independently

---

## Phase 7: User Story 5 - Interact with Home Page Chatbot (Priority: P2)

**Goal**: Implement floating chatbot widget on homepage with conversation history preservation

**Independent Test**: User can open chatbot widget, ask a question, and receive relevant response within 3 seconds

### Implementation for User Story 5

- [x] T059 [P] [US5] Create ChatbotWidget component in `frontend/src/components/chatbot/ChatbotWidget.tsx` (FAB button, expandable window)
- [x] T060 [P] [US5] Create ChatWindow component in `frontend/src/components/chatbot/ChatWindow.tsx` (conversation display, auto-scroll)
- [x] T061 [P] [US5] Create ChatInput component in `frontend/src/components/chatbot/ChatInput.tsx` (message input, submit button)
- [x] T062 [P] [US5] Create MessageBubble component in `frontend/src/components/chatbot/ChatWindow.tsx` (user/assistant variants - integrated into ChatWindow)
- [x] T063 [P] [US5] Create SuggestedQuestions component in `frontend/src/components/chatbot/ChatWindow.tsx` (quick prompts on first open - integrated into ChatWindow)
- [x] T064 [US5] Create chatbot hook in `frontend/src/components/chatbot/ChatWindow.tsx` (conversation state, send message, typing indicator - integrated)
- [x] T065 [US5] Implement conversation persistence in `frontend/src/components/chatbot/ChatWindow.tsx` (sessionStorage for history)
- [x] T066 [US5] Add chatbot open/close animations in `frontend/src/components/chatbot/ChatbotWidget.tsx` (spring transition 300ms)
- [x] T067 [US5] Integrate chatbot API in `frontend/src/app/api/chat/route.ts` (chat endpoint, fallback responses)
- [x] T068 [US5] Add graceful fallback for chatbot unavailability in `frontend/src/components/chatbot/ChatWindow.tsx` (alternative support channels)
- [x] T069 [US5] Add ChatbotWidget to landing page in `frontend/src/app/page.tsx` (floating bottom-right, z-index 400)

**Checkpoint**: At this point, User Stories 1-5 should all work independently

---

## Phase 8: User Story 6 - Experience Responsive Design Across Devices (Priority: P3)

**Goal**: Ensure all pages and features are fully functional and visually coherent on mobile (320px+), tablet (768px+), and desktop (1024px+)

**Independent Test**: All pages fully functional on mobile (375px), tablet (768px), and desktop (1024px) without horizontal scrolling or zooming

### Implementation for User Story 6

- [x] T070 [P] [US6] Implement mobile-responsive Header in `frontend/src/components/NavBar.tsx` (hamburger menu <768px)
- [x] T071 [P] [US6] Implement mobile-responsive Landing Page in `frontend/src/app/page.tsx` (single column <768px, stacked sections)
- [x] T072 [P] [US6] Implement mobile-responsive Dashboard in `frontend/src/app/dashboard/page.tsx` (Sidebar hidden on mobile, accessible via hamburger)
- [x] T073 [P] [US6] Implement mobile-responsive TaskList in `frontend/src/components/TaskDashboard.tsx` (single column mobile, two-column tablet, three-column desktop)
- [x] T074 [P] [US6] Implement mobile-responsive TaskForm in `frontend/src/components/TaskItem.tsx` (full-width mobile, centered modal desktop)
- [x] T075 [P] [US6] Implement mobile-responsive ChatbotWidget in `frontend/src/components/chatbot/ChatbotWidget.tsx` (full-width on mobile, fixed position desktop)
- [x] T076 [US6] Ensure 44px minimum touch targets in `frontend/src/components/ui/Button.tsx`, `frontend/src/components/ui/input.tsx`, `frontend/src/components/ui/TagChip.tsx`
- [x] T077 [US6] Test and fix responsive breakpoints in `frontend/src/styles/responsive.css` (verify at 320px, 375px, 768px, 1024px, 1440px)
- [x] T078 [US6] Add smooth layout transitions at breakpoints in `frontend/src/styles/responsive.css` (no content reflow jumps)
- [x] T079 [US6] Implement touch-friendly gestures in `frontend/src/components/TaskItem.tsx` (swipe actions on mobile)

**Checkpoint**: All user stories should now be independently functional across all device sizes

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T080 [P] Add dark theme support in `frontend/src/app/globals.css` (data-theme='dark' CSS variables)
- [x] T081 [P] Implement theme toggle in `frontend/src/components/theme/ThemeToggle.tsx` (light/dark switch)
- [x] T082 [P] Add prefers-reduced-motion support verification in `frontend/src/styles/animations.css` (all animations respect media query)
- [x] T083 [P] Implement session expiry handling in `frontend/src/contexts/AuthContext.tsx` (preserve unsaved changes, prompt re-auth)
- [x] T084 [P] Add Lighthouse performance optimization in `frontend/next.config.js` (image optimization, code splitting, font preloading)
- [x] T085 [P] Add WCAG 2.1 AA compliance verification in `frontend/src/components/` (contrast ratios, focus indicators, keyboard navigation)
- [x] T086 [P] Create component documentation in `frontend/src/components/README.md` (usage examples, props documentation)
- [x] T087 [P] Update quickstart.md with actual component examples in `specs/001-phase5-ui-ux-redesign/quickstart.md`
- [x] T088 [P] Run Lighthouse audit and fix issues in `frontend/` (target: Performance 90+, Accessibility 95+)
- [x] T089 [P] Cross-browser testing in `frontend/` (Chrome, Firefox, Safari, Edge)
- [x] T090 [P] Final accessibility audit in `frontend/` (keyboard navigation, screen reader compatibility)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-8)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 9)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Independent, may use US1 navigation
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - Depends on TaskList from US2
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) - Independent, uses existing API
- **User Story 5 (P2)**: Can start after Foundational (Phase 2) - Independent, homepage only
- **User Story 6 (P3)**: Can start after Foundational (Phase 2) - Affects all stories, best done last

### Within Each User Story

- Models/primitive components before complex components
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- **Setup Phase**: T001-T006 all marked [P] - can run in parallel
- **Foundational Phase**: T007-T014 all marked [P] - can run in parallel
- **User Story 1**: T015-T019 all marked [P] - primitive components can be created in parallel
- **User Story 2**: T027-T033 all marked [P] - primitive components can be created in parallel
- **User Story 3**: T039-T041 all marked [P] - search/filter components can be created in parallel
- **User Story 4**: T047-T051 all marked [P] - selector components can be created in parallel
- **User Story 5**: T059-T063 all marked [P] - chatbot components can be created in parallel
- **User Story 6**: T070-T075 all marked [P] - responsive implementations can be done in parallel
- **Polish Phase**: T080-T090 all marked [P] - polish tasks can run in parallel

---

## Parallel Example: User Story 2

```bash
# Launch all primitive components for User Story 2 together:
Task: "Create Badge component in frontend/src/components/ui/Badge.tsx"
Task: "Create Skeleton component in frontend/src/components/ui/Skeleton.tsx"
Task: "Create Sidebar component in frontend/src/components/layout/Sidebar.tsx"
Task: "Create TaskItem component in frontend/src/components/task/TaskItem.tsx"
Task: "Create PriorityBadge component in frontend/src/components/task/PriorityBadge.tsx"
Task: "Create DueDateIndicator component in frontend/src/components/task/DueDateIndicator.tsx"
Task: "Create RecurrenceIcon component in frontend/src/components/task/RecurrenceIcon.tsx"

# These can all be implemented in parallel by different developers
# as they are in different files with no inter-dependencies
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently (landing, login, signup, navigation)
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP: Landing + Auth)
3. Add User Story 2 → Test independently → Deploy/Demo (Dashboard with Phase-5 features)
4. Add User Story 3 → Test independently → Deploy/Demo (Search & Filter)
5. Add User Story 4 → Test independently → Deploy/Demo (Task Creation)
6. Add User Story 5 → Test independently → Deploy/Demo (Chatbot)
7. Add User Story 6 → Test independently → Deploy/Demo (Responsive Design)
8. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Navigation & Auth)
   - Developer B: User Story 2 (Dashboard)
   - Developer C: User Story 4 (Task Creation)
3. After US1, US2, US4 complete:
   - Developer A: User Story 3 (Search & Filter)
   - Developer B: User Story 5 (Chatbot)
   - Developer C: User Story 6 (Responsive)
4. All stories complete and integrate independently
5. Polish phase can be split among team

---

## Task Summary

| Phase | User Story | Task Count | Completed | Remaining |
|-------|------------|------------|-----------|-----------|
| Phase 1 | Setup | 6 | 6 | 0 |
| Phase 2 | Foundational | 8 | 8 | 0 |
| Phase 3 | US1: Access & Navigate | 12 | 12 | 0 |
| Phase 4 | US2: Dashboard | 12 | 12 | 0 |
| Phase 5 | US3: Search & Filter | 8 | 8 | 0 |
| Phase 6 | US4: Create Tasks | 12 | 12 | 0 |
| Phase 7 | US5: Chatbot | 11 | 11 | 0 |
| Phase 8 | US6: Responsive | 10 | 10 | 0 |
| Phase 9 | Polish | 11 | 11 | 0 |
| **Total** | | **90** | **90** | **0** |

### Completion Status: 100% Complete (90/90 tasks) ✅

All tasks completed! The Phase 5 UI/UX Redesign is fully implemented.

### Suggested MVP Scope

**Minimum Viable Product**: Phases 1-4 (User Stories 1 & 2)
- Landing page with value proposition
- Login/Signup authentication flow
- Dashboard with task display (priorities, tags, due dates, recurrence)
- Basic navigation

**Total MVP Tasks**: 38 tasks (T001-T038)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- All tasks include exact file paths for clarity
- No test tasks included (not requested in spec.md)
