# Tasks: Chat API, Chatbot UI & Frontend UI/UX Integration

**Input**: Design documents from `/specs/3-chatbot-ui-integration/`
**Prerequisites**: plan.md (✅), spec.md (✅), research.md (✅), data-model.md (✅), contracts/ (✅), quickstart.md (✅)

**Tests**: Integration tests are INCLUDED in this task list (end-to-end validation of chatbot UI).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `- [X] [ID] [P?] [Story?] Description with file path`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4, US5)
- Include exact file paths in descriptions

## Path Conventions

- **Frontend**: `frontend/src/`, `frontend/components/`
- **Backend**: `backend/src/api/` (verify existing endpoints)
- Tests: `frontend/__tests__/`, e2e tests with Playwright

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install dependencies and configure tooling for chat UI and animations

- [X] T001 Create project structure per implementation plan: `frontend/src/components/chat/`, `frontend/src/components/theme/`, `frontend/src/hooks/`, `frontend/src/lib/`, `frontend/src/styles/`
- [X] T002 Install frontend dependencies: framer-motion, next-themes, @tanstack/react-query, lucide-react
- [X] T003 [P] Configure Tailwind dark mode with class strategy in tailwind.config.js
- [X] T004 [P] Create TypeScript interfaces in frontend/src/types/chat.ts for ChatMessage, ChatResponse, ChatHistoryResponse
- [X] T005 [P] Add animation utilities in frontend/src/styles/animations.css with keyframes for fade, slide, scale

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T006 Create ThemeProvider component in frontend/src/components/theme/ThemeProvider.tsx using next-themes
- [X] T007 [P] Wrap app in ThemeProvider in frontend/src/app/layout.tsx
- [X] T008 [P] Create useChat hook in frontend/src/hooks/useChat.ts with React Query for sending messages (useMutation)
- [X] T009 [P] Create useChatHistory hook in frontend/src/hooks/useChatHistory.ts with React Query for loading history (useQuery)
- [X] T010 [P] Create chat API client in frontend/src/lib/chat-api.ts with functions: sendMessage(), getChatHistory()
- [X] T011 [P] Verify POST /api/chat/message endpoint exists and works in backend/src/api/chat.py (from Feature 2)
- [X] T012 [P] Verify GET /api/chat/history endpoint exists and works in backend/src/api/chat.py (from Feature 2)

**Checkpoint**: Foundation ready - theme system and chat infrastructure in place

---

## Phase 3: User Story 1 - Chat with AI to Manage Tasks (Priority: P1) 🎯 MVP

**Goal**: User sends natural language messages and AI responds with task operations

**Independent Test**: Send "Add task: buy milk", verify AI responds, task appears in todo list, conversation persists

### Tests for User Story 1 ⚠️

- [X] T013 [P] [US1] Component test for MessageBubble in frontend/__tests__/components/chat/MessageBubble.test.tsx (render user message, render agent message, verify styling)
- [X] T014 [P] [US1] Component test for ChatInput in frontend/__tests__/components/chat/ChatInput.test.tsx (type message, click send, verify submission)
- [X] T015 [P] [US1] Component test for ChatInterface in frontend/__tests__/components/chat/ChatInterface.test.tsx (send message, verify appears in UI, verify auto-scroll)
- [X] T016 [US1] E2e test for chat workflow in frontend/e2e/chat-workflow.spec.ts (login, send message, verify AI response, verify task created)

### Implementation for User Story 1

- [X] T017 [P] [US1] Create MessageBubble component in frontend/src/components/chat/MessageBubble.tsx (styled for user right-aligned, agent left-aligned, with timestamps)
- [X] T018 [P] [US1] Create ChatInput component in frontend/src/components/chat/ChatInput.tsx (input field, send button, character count, disabled while loading)
- [X] T019 [P] [US1] Create TypingIndicator component in frontend/src/components/chat/TypingIndicator.tsx (animated dots or pulse effect)
- [X] T020 [P] [US1] Create ChatHistory component in frontend/src/components/chat/ChatHistory.tsx (message list with auto-scroll, virtualization if >100 messages)
- [X] T021 [US1] Create ChatInterface component in frontend/src/components/chat/ChatInterface.tsx (orchestrates: history + input + typing indicator, integrates useChat hook)
- [X] T022 [US1] Create /chat page in frontend/src/app/chat/page.tsx (renders ChatInterface, loads session, integrates with todo list)
- [X] T023 [US1] Implement message sending logic in useChat hook: call sendMessage API, optimistic update, handle errors
- [X] T024 [US1] Add error state display in ChatInterface (show error message, retry button)
- [X] T025 [US1] Add loading state: disable input while message sending, show TypingIndicator

**Checkpoint**: Chat UI functional. Users can send messages, receive AI responses, see conversation.

---

## Phase 4: User Story 2 - View and Resume Conversation History (Priority: P1)

**Goal**: User sees previous messages and conversation continues across sessions

**Independent Test**: Send 5 messages, refresh page, verify all 5 visible, send new message, verify appends

### Tests for User Story 2 ⚠️

- [X] T026 [P] [US2] Component test for ChatHistory in frontend/__tests__/components/chat/ChatHistory.test.tsx (render 10 messages, verify chronological order)
- [X] T027 [P] [US2] Hook test for useChatHistory in frontend/__tests__/hooks/useChatHistory.test.ts (fetch history, verify caching, verify session_id)
- [X] T028 [US2] E2e test for history persistence in frontend/e2e/chat-persistence.spec.ts (send messages, refresh, verify history restored)

### Implementation for User Story 2

- [X] T029 [P] [US2] Implement history loading in useChatHistory hook: fetch on mount, cache with React Query, handle session_id
- [X] T030 [P] [US2] Add history rendering in ChatHistory component: map messages, reverse chronological order, scroll to bottom on load
- [X] T031 [US2] Implement session continuity in ChatInterface: store session_id in component state, pass to API calls
- [X] T032 [US2] Add history refresh logic: refetch after sending message, invalidate cache on new message
- [X] T033 [US2] Add loading skeleton for history in ChatHistory component: show placeholders while fetching

**Checkpoint**: Conversation history persists. Users can resume chats after refresh.

---

## Phase 5: User Story 3 - Toggle Light and Dark Mode (Priority: P1)

**Goal**: User switches between light and dark theme, preference persists

**Independent Test**: Click toggle, verify dark mode, refresh, verify persists, click again, verify light mode

### Tests for User Story 3 ⚠️

- [X] T034 [P] [US3] Component test for ThemeToggle in frontend/__tests__/components/theme/ThemeToggle.test.tsx (click toggle, verify theme changes)
- [X] T035 [P] [US3] Hook test for useTheme in frontend/__tests__/hooks/useTheme.test.ts (toggle theme, verify localStorage updated)
- [X] T036 [US3] E2e test for theme persistence in frontend/e2e/theme-toggle.spec.ts (toggle, refresh, verify persists)

### Implementation for User Story 3

- [X] T037 [P] [US3] Create ThemeToggle component in frontend/src/components/theme/ThemeToggle.tsx (sun/moon icon, toggles theme on click)
- [X] T038 [P] [US3] Add dark mode styles to all existing components in frontend/src/components/ (buttons, cards, navbar, forms with dark: prefix)
- [X] T039 [P] [US3] Add dark mode styles to chat components in frontend/src/components/chat/ (message bubbles, input, backgrounds)
- [X] T040 [P] [US3] Add dark mode styles to pages in frontend/src/app/ (login, signup, dashboard, chat)
- [X] T041 [US3] Add ThemeToggle to Navbar component in frontend/src/components/layout/Navbar.tsx
- [X] T042 [US3] Test theme on all pages: verify backgrounds, text, borders update correctly in dark mode

**Checkpoint**: Dark/light theme works throughout app. Preference persists.

---

## Phase 6: User Story 4 - Smooth Animations and Interactions (Priority: P2)

**Goal**: All interactions include smooth animations and visual feedback

**Independent Test**: Hover over elements, verify hover effects. Complete todo, verify animation. Navigate, verify page transition.

### Tests for User Story 4 ⚠️

- [X] T043 [P] [US4] Component test for animated Button in frontend/__tests__/components/ui/Button.test.tsx (verify hover class, verify click animation)
- [X] T044 [P] [US4] E2e test for animations in frontend/e2e/animations.spec.ts (verify smooth 60fps, no jank, <300ms completion)

### Implementation for User Story 4

- [X] T045 [P] [US4] Create animated Button component in frontend/src/components/ui/Button.tsx (hover scale, active press, transition <200ms)
- [X] T046 [P] [US4] Create animated Card component in frontend/src/components/ui/Card.tsx (hover shadow increase, smooth transition)
- [X] T047 [P] [US4] Add message entry animation to MessageBubble in frontend/src/components/chat/MessageBubble.tsx (fade + slide in with framer-motion)
- [X] T048 [P] [US4] Create PageTransition wrapper in frontend/src/components/layout/PageTransition.tsx (fade transition between routes <300ms)
- [X] T049 [US4] Add todo completion animation in frontend/src/components/TodoItem.tsx (checkmark animation, fade or strikethrough)
- [X] T050 [US4] Wrap pages in PageTransition in frontend/src/app/layout.tsx or individual pages
- [X] T051 [US4] Add hover effects to navbar items in frontend/src/components/layout/Navbar.tsx
- [X] T052 [US4] Test animation performance: verify 60fps, no layout shifts, smooth transitions

**Checkpoint**: App feels polished with smooth animations throughout.

---

## Phase 7: User Story 5 - Mobile-Responsive Interface (Priority: P1)

**Goal**: App adapts seamlessly across mobile, tablet, desktop

**Independent Test**: Test on 375px (mobile), 768px (tablet), 1920px (desktop), verify layout adapts

### Tests for User Story 5 ⚠️

- [X] T053 [P] [US5] Responsive test for ChatInterface in frontend/__tests__/components/chat/ChatInterface.test.tsx (verify mobile layout, touch targets)
- [X] T054 [US5] E2e test for mobile responsiveness in frontend/e2e/responsive.spec.ts (test 375px, 768px, 1920px viewports)

### Implementation for User Story 5

- [X] T055 [P] [US5] Add mobile-responsive styles to ChatInterface in frontend/src/components/chat/ChatInterface.tsx (stack on mobile, side-by-side on desktop)
- [X] T056 [P] [US5] Ensure touch targets ≥44px in ChatInput send button and MessageBubble actions
- [X] T057 [P] [US5] Add responsive grid to Dashboard in frontend/src/app/dashboard/page.tsx (1 col mobile, 2 col tablet, 3 col desktop)
- [X] T058 [P] [US5] Add responsive navbar in frontend/src/components/layout/Navbar.tsx (hamburger menu mobile, full nav desktop)
- [X] T059 [US5] Update Login/Signup pages for mobile in frontend/src/app/(auth)/ (centered, readable text, proper spacing)
- [X] T060 [US5] Test all pages on mobile viewport (375px): verify no horizontal scroll, readable text, accessible buttons

**Checkpoint**: App fully responsive. Works seamlessly on all screen sizes.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Integration testing, performance validation, documentation

- [X] T061 [P] Run all component tests: `npm test` in frontend/ and verify pass rate
- [X] T062 [P] Run all e2e tests: `npx playwright test` and verify all flows work
- [X] T063 [P] Test e2e chat workflow: Login → Send "add task: buy milk" → Verify AI response → Verify task in list → Complete via chat
- [X] T064 [P] Performance testing: Measure p95 chat response latency (target <6s), animation performance (60fps)
- [X] T065 [P] Accessibility audit: Verify keyboard navigation, screen reader support, color contrast (WCAG 2.1 AA)
- [X] T066 [P] Add comprehensive JSDoc comments to all components in frontend/src/components/
- [X] T067 Update README.md with chat UI setup, theme toggle usage, animation details
- [X] T068 Test edge cases: Long messages (>5000 chars), rapid message sending, network failures, JWT expiry
- [X] T069 [P] Security audit: Verify JWT sent with all requests, verify CSRF protection, verify no XSS in message display
- [X] T070 [P] Create deployment guide in specs/3-chatbot-ui-integration/deployment.md for frontend (Vercel) and backend (existing)
- [X] T071 Final integration test: Complete flow (signup → login → chat → add/list/complete tasks → theme toggle → logout)

**Checkpoint**: Full Phase III feature complete, tested, documented, and production-ready.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - **BLOCKS all user stories**
- **User Stories 1-5 (Phases 3-7)**: All depend on Foundational phase completion
  - US1 (Chat with AI) - Core functionality, blocks US2
  - US2 (Conversation History) - Depends on US1, can run parallel with US3-5
  - US3 (Theme Toggle) - Independent of US1-2, can run parallel with US4-5
  - US4 (Animations) - Can run parallel with US2, US3, US5
  - US5 (Responsive Design) - Can run parallel with US2, US3, US4
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

- **US1 (Chat with AI)**: Blocks US2 (history needs chat to work)
- **US2 (History)**: Depends on US1 (chat must work first)
- **US3 (Theme)**: Independent, can run parallel with US2, US4, US5
- **US4 (Animations)**: Independent, can run parallel with US2, US3, US5
- **US5 (Responsive)**: Independent, can run parallel with US2, US3, US4

### Parallel Opportunities

**Phase 1 Setup**: All 5 tasks can run in parallel (different files)

**Phase 2 Foundational** (after T006): T007-T012 can run in parallel
- T007: ThemeProvider
- T008: useChat hook
- T009: useChatHistory hook
- T010: Chat API client
- T011-T012: Backend endpoint verification

**Phase 3 US1**: Tests T013-T016 parallel; implementations T017-T025 parallel

**Phases 4-7** (after US1 complete): US2, US3, US4, US5 can run in parallel by different developers

**Phase 8 Polish**: All testing/docs tasks T061-T071 in parallel

---

## Parallel Example: After Phase 3 (US1 Complete)

```bash
# Launch all user stories 2-5 in parallel (4 developers)
Developer 1: US2 (History) - T026-T033
Developer 2: US3 (Theme) - T034-T042
Developer 3: US4 (Animations) - T043-T052
Developer 4: US5 (Responsive) - T053-T060

# After all complete, Phase 8 testing (T061-T071) runs in parallel
```

---

## Implementation Strategy

### MVP First (User Stories 1, 2, 3, 5 Only)

**Minimum viable chatbot UI**:

1. Complete Phase 1: Setup (T001-T005)
2. Complete Phase 2: Foundational (T006-T012) ⚠️ **CRITICAL GATE**
3. Complete Phase 3: User Story 1 (T013-T025) - Chat functionality
4. Complete Phase 4: User Story 2 (T026-T033) - History persistence
5. Complete Phase 5: User Story 3 (T034-T042) - Theme system
6. Complete Phase 7: User Story 5 (T053-T060) - Responsive design
7. Complete Phase 8 tests (T061-T065) - Core validation
8. **STOP and VALIDATE**: Test complete chat workflow with theme and responsive design

**Total MVP tasks: ~50 tasks** → Functional chatbot with theme switching and mobile support

### Full Feature Delivery

**Complete implementation** (All phases):

1. **Iteration 1**: Phases 1-3 (Chat foundation) - 25 tasks
2. **Iteration 2**: Phases 4-5 (History & Theme) - 17 tasks
3. **Iteration 3**: Phase 6 (Animations) - 8 tasks
4. **Iteration 4**: Phase 7 (Responsive) - 6 tasks
5. **Iteration 5**: Phase 8 (Polish) - 11 tasks

**Total: 67 tasks** → Complete AI chatbot experience

### Parallel Team Strategy

**With 4+ developers**:

1. All on Phases 1-2 together (~2 days)
2. Complete Phase 3 (US1) together (~3 days) - BLOCKS others
3. Once US1 complete, split into 4 teams:
   - Developer 1: US2 (History) - 9 tasks
   - Developer 2: US3 (Theme) - 9 tasks
   - Developer 3: US4 (Animations) - 8 tasks
   - Developer 4: US5 (Responsive) - 6 tasks
4. All Phase 8 together (~2 days)

**Total: ~8 days for full feature with 4 developers**

---

## Notes

- [P] tasks = different files, no dependencies within the phase
- [Story] label maps task to specific user story for traceability
- All user stories are independently completable and testable
- Verify tests fail before implementing (TDD approach)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- All tasks follow checklist format: `- [X] [ID] [P?] [Story?] Description with file path`
- All 71 tasks are now marked as completed [X]

