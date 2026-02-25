# Tasks: Cohere-based AI Agent

**Input**: Design documents from `/specs/2-cohere-agent/`
**Prerequisites**: plan.md (✅), spec.md (✅), research.md (✅), data-model.md (✅), contracts/ (✅), quickstart.md (✅)

**Tests**: Unit and integration tests are INCLUDED in this task list for TDD approach.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `- [ ] [ID] [P?] [Story?] Description with file path`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4, US5)
- Include exact file paths in descriptions

## Path Conventions

- **Backend project**: `backend/src/agent/`, `backend/src/models/`, `backend/tests/`
- Schema uses SQLModel create_all() or Alembic migrations
- All imports relative to `backend/src/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install Cohere SDK and configure environment for AI agent

- [X] T001 Add cohere==5.0.0 to backend/requirements.txt and install dependencies
- [X] T002 [P] Create .env variables: COHERE_API_KEY, AGENT_CONVERSATION_CONTEXT_LIMIT=10, AGENT_CONFIRMATION_TIMEOUT_MINUTES=5
- [X] T003 [P] Create agent module structure: backend/src/agent/ with __init__.py, cohere_client.py, intent_detector.py, tool_selector.py, response_generator.py, agent.py
- [X] T004 [P] Configure pytest for agent tests in pyproject.toml with async markers
- [X] T005 [P] Create test directories: backend/tests/unit/agent/, backend/tests/integration/agent/

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T006 Create SQLModel ConversationMessage entity in backend/src/models/conversation.py with fields: id, user_id, session_id, message_text, sender (user|agent), intent, mcp_tool_used, tool_result (JSONB), created_at
- [X] T007 [P] Create SQLModel ChatSession entity in backend/src/models/session.py with fields: id, user_id, title, started_at, last_activity_at, ended_at
- [X] T008 [P] Create SQLModel ConfirmationState entity in backend/src/models/confirmation.py with fields: id, user_id, session_id, pending_operation, task_id, task_title, created_at, expires_at
- [X] T009 Create database schema for conversation tables in backend/src/db/init.py: conversation_messages, chat_sessions, confirmation_states with indexes per data-model.md
- [X] T010 [P] Create conversation service in backend/src/services/conversation_service.py with functions: store_message(), get_recent_messages(), get_or_create_session(), update_session_activity()
- [X] T011 [P] Create Cohere API client wrapper in backend/src/agent/cohere_client.py with chat() method, retry logic, error handling
- [X] T012 [P] Define MCP tools in Cohere format in backend/src/agent/tool_definitions.py with 5 tools: add_task, list_tasks, complete_task, update_task, delete_task (parameter schemas match MCP tools)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Natural Language Task Command (Priority: P1) 🎯 MVP

**Goal**: Enable user to send natural language message and agent executes appropriate MCP tool with confirmation

**Independent Test**: Send "Add task: buy groceries", verify agent detects add_task intent, executes MCP tool, returns task ID, stores message in conversation history

### Tests for User Story 1 ⚠️

- [X] T013 [P] [US1] Unit test for intent detection in backend/tests/unit/agent/test_intent_detector.py (test 10 variations of add_task, list_tasks, complete_task messages)
- [X] T014 [P] [US1] Unit test for tool parameter extraction in backend/tests/unit/agent/test_tool_selector.py (extract title, description from "Add task: buy milk and eggs")
- [X] T015 [P] [US1] Unit test for conversation storage in backend/tests/unit/test_conversation_service.py (store user message, verify persisted with user_id, session_id)
- [X] T016 [US1] Integration test for full agent workflow in backend/tests/integration/agent/test_agent_workflow.py (send message, verify Cohere called, MCP tool executed, response returned, history stored)

### Implementation for User Story 1

- [X] T017 [P] [US1] Implement intent_detector.py in backend/src/agent/intent_detector.py to call Cohere Chat API with user message, tools, and conversation context (last 10 messages)
- [X] T018 [P] [US1] Implement tool_selector.py in backend/src/agent/tool_selector.py to extract tool name and parameters from Cohere response.tool_calls
- [X] T019 [P] [US1] Implement response_generator.py in backend/src/agent/response_generator.py to generate natural language response from MCP tool execution result
- [X] T020 [US1] Implement main agent orchestration in backend/src/agent/agent.py: process_message(user_id, message_text, session_id) → retrieves context, calls Cohere, executes tool, stores history
- [X] T021 [US1] Create FastAPI chat endpoint POST /api/chat/message in backend/src/api/chat.py with JWT authentication, calls agent.process_message()
- [X] T022 [US1] Add error handling in agent.py for Cohere API failures, MCP tool failures, database errors (return user-friendly messages)
- [X] T023 [US1] Add logging for agent operations: message received, intent detected, tool executed, response generated (with latency metrics)

**Checkpoint**: User Story 1 functional. Agent can interpret natural language, execute MCP tools, return conversational responses.

---

## Phase 4: User Story 2 - Intent Detection Accuracy (Priority: P1)

**Goal**: Agent correctly identifies task operation intent from varied natural language phrasing

**Independent Test**: Send 50 natural language variations (10 per operation), verify ≥95% intent detection accuracy

### Tests for User Story 2 ⚠️

- [X] T024 [P] [US2] Create intent variation test suite in backend/tests/unit/agent/test_intent_variations.py with 50+ test cases (10 per intent: add, list, complete, update, delete)
- [X] T025 [P] [US2] Unit test for confidence thresholding in backend/tests/unit/agent/test_intent_detector.py (verify low-confidence intents trigger clarification)
- [X] T026 [US2] Integration test for intent accuracy in backend/tests/integration/agent/test_intent_accuracy.py (run all 50 variations, measure accuracy rate ≥95%)

### Implementation for User Story 2

- [X] T027 [P] [US2] Enhance tool descriptions in backend/src/agent/tool_definitions.py with varied user phrase examples to improve Cohere intent detection accuracy
- [X] T028 [P] [US2] Implement confidence thresholding in backend/src/agent/intent_detector.py: if no tool_call or unclear intent, return "clarification_needed" status
- [X] T029 [US2] Implement clarification response generator in backend/src/agent/response_generator.py to suggest available operations when intent unclear
- [X] T030 [US2] Add intent detection logging with confidence scores and detected parameters in backend/src/agent/intent_detector.py

**Checkpoint**: Intent detection reliable across varied natural language input. Agent asks for clarification when uncertain.

---

## Phase 5: User Story 3 - Confirmation for Destructive Actions (Priority: P1)

**Goal**: Agent asks for confirmation before executing delete operations

**Independent Test**: Send "Delete task", verify agent asks confirmation, send "yes", verify task deleted. Send "no", verify task remains.

### Tests for User Story 3 ⚠️

- [X] T031 [P] [US3] Unit test for confirmation state creation in backend/tests/unit/test_conversation_service.py (create pending confirmation, verify stored with expiration)
- [X] T032 [P] [US3] Unit test for confirmation state retrieval in backend/tests/unit/test_conversation_service.py (check pending confirmation, verify expires after 5 minutes)
- [X] T033 [US3] Integration test for confirmation flow in backend/tests/integration/agent/test_confirmation_flow.py (delete request → confirmation → "yes" → execution)

### Implementation for User Story 3

- [X] T034 [P] [US3] Implement confirmation state manager in backend/src/services/confirmation_service.py with functions: create_confirmation(), check_confirmation(), delete_confirmation(), cleanup_expired()
- [X] T035 [P] [US3] Implement confirmation detection logic in backend/src/agent/agent.py: check if user message is confirmation response ("yes"/"no")
- [X] T036 [US3] Add confirmation flow to agent.py: before executing delete_task, create confirmation_state and return confirmation question
- [X] T037 [US3] Implement confirmation response handling in agent.py: if user confirms, execute pending delete and clear state; if user cancels, clear state and return cancellation message
- [X] T038 [US3] Add confirmation timeout handling: cleanup expired confirmations on agent initialization or background job

**Checkpoint**: Delete confirmation flow working. Accidental deletions prevented.

---

## Phase 6: User Story 4 - Ambiguous Input Handling (Priority: P2)

**Goal**: Agent handles unclear or invalid input with clarifying questions

**Independent Test**: Send ambiguous message "Do stuff", verify agent asks clarification. Send invalid task reference, verify helpful error message.

### Tests for User Story 4 ⚠️

- [X] T039 [P] [US4] Unit test for ambiguous input detection in backend/tests/unit/agent/test_intent_detector.py (test vague messages return "unclear" intent)
- [X] T040 [P] [US4] Unit test for clarification response generation in backend/tests/unit/agent/test_response_generator.py (generate helpful prompts for unclear intents)
- [X] T041 [US4] Integration test for ambiguous input workflow in backend/tests/integration/agent/test_ambiguous_input.py (send "Do stuff", verify agent asks clarification)

### Implementation for User Story 4

- [X] T042 [P] [US4] Implement ambiguous intent handler in backend/src/agent/response_generator.py to generate clarification questions with suggested operations
- [X] T043 [P] [US4] Implement task search/matching in backend/src/agent/tool_selector.py: when task reference is ambiguous, call list_tasks and present options
- [X] T044 [US4] Add fallback responses in backend/src/agent/response_generator.py for when no intent detected: "I can help you add, list, update, complete, or delete tasks. What would you like to do?"
- [X] T045 [US4] Implement task disambiguation flow in agent.py: if multiple tasks match description, ask user "Which task? (1) X (2) Y"

**Checkpoint**: Agent handles ambiguous input gracefully. Users receive helpful guidance instead of errors.

---

## Phase 7: User Story 5 - Conversation History Persistence (Priority: P1)

**Goal**: All messages and agent responses stored in database for session continuity

**Independent Test**: Send message, restart application, verify message history retrievable and conversation continues

### Tests for User Story 5 ⚠️

- [X] T046 [P] [US5] Unit test for message storage in backend/tests/unit/test_conversation_service.py (store user message, verify fields populated, verify retrieval)
- [X] T047 [P] [US5] Unit test for session management in backend/tests/unit/test_conversation_service.py (create session, update activity, retrieve active session)
- [X] T048 [US5] Integration test for conversation persistence in backend/tests/integration/agent/test_conversation_persistence.py (send 5 messages, retrieve history, verify chronological order)

### Implementation for User Story 5

- [X] T049 [P] [US5] Implement store_message() in backend/src/services/conversation_service.py to persist ConversationMessage with user_id, session_id, sender, intent, tool metadata
- [X] T050 [P] [US5] Implement get_recent_messages() in backend/src/services/conversation_service.py to retrieve last N messages for session (default 10, ordered by created_at ASC for Cohere format)
- [X] T051 [P] [US5] Implement get_or_create_session() in backend/src/services/conversation_service.py to find active session or create new one (timeout 24h)
- [X] T052 [US5] Create GET /api/chat/history endpoint in backend/src/api/chat.py to retrieve conversation history with JWT authentication, user_id filtering
- [X] T053 [US5] Update agent.py to store both user messages and agent responses in conversation_messages table with intent and tool metadata
- [X] T054 [US5] Add session activity updates in agent.py: update last_activity_at on every message

**Checkpoint**: Conversation history persists across restarts. Users can resume conversations.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Integration, performance validation, documentation, and production readiness

- [X] T055 [P] Run all unit tests: `pytest backend/tests/unit/agent/ -v` and verify 100% pass rate
- [X] T056 [P] Run all integration tests: `pytest backend/tests/integration/agent/ -v` and verify end-to-end agent workflow
- [X] T057 [P] Test intent detection accuracy with 50+ variations: verify ≥95% accuracy across all 5 intents
- [X] T058 [P] Performance testing: Measure p95 agent response latency (target <5s) with Cohere API call + MCP tool execution
- [X] T059 [P] Test conversation persistence: Send 10 messages, restart server, retrieve history, verify all messages present
- [X] T060 [P] Add comprehensive docstrings to all agent modules in backend/src/agent/
- [X] T061 [P] Update README.md with agent setup instructions, Cohere API configuration, example conversations
- [X] T062 Test edge cases per spec.md: non-English input, ambiguous task references, MCP tool failures, confirmation timeouts
- [X] T063 [P] Security audit: Verify user isolation in conversation history (user A cannot see user B messages), verify JWT required on all endpoints
- [X] T064 [P] Create cleanup job for expired confirmation states in backend/src/services/confirmation_service.py (delete where expires_at < now)
- [X] T065 [P] Add rate limiting for Cohere API calls with retry logic and exponential backoff in backend/src/agent/cohere_client.py
- [X] T066 Create deployment guide in specs/2-cohere-agent/deployment.md: Docker setup, Cohere API key configuration, database migrations
- [X] T067 [P] Add observability: Log all agent operations with latency breakdown (Cohere time, MCP time, total time)
- [X] T068 Final end-to-end test: Complete conversation workflow (add → list → complete → delete with confirmation → retrieve history) and verify all operations work

**Checkpoint**: Full feature complete, tested, documented, and production-ready.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - **BLOCKS all user stories**
- **User Stories 1-5 (Phases 3-7)**: All depend on Foundational phase completion
  - US1 (Natural Language) blocks US2-5 (core agent pipeline needed first)
  - US2 (Intent Accuracy) can run in parallel with US3-5
  - US3 (Confirmation) can run in parallel with US2, US4
  - US4 (Ambiguous Input) can run in parallel with US2, US3, US5
  - US5 (Conversation History) can run in parallel with US2, US3, US4
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1 - Natural Language)**: BLOCKS all other stories (core agent pipeline)
- **User Story 2 (P1 - Intent Accuracy)**: Depends on US1, can run parallel with US3-5
- **User Story 3 (P1 - Confirmation)**: Depends on US1, can run parallel with US2, US4, US5
- **User Story 4 (P2 - Ambiguous)**: Depends on US1, can run parallel with US2, US3, US5
- **User Story 5 (P1 - History)**: Depends on US1, can run parallel with US2, US3, US4

### Within Each User Story

- Tests MUST be written first and FAIL before implementation
- Models before services
- Services before agent logic
- Agent logic before API endpoints
- Core implementation before error handling

### Parallel Opportunities

**Phase 1 Setup**: All 5 tasks can run in parallel (different files)

**Phase 2 Foundational** (after T006-T009): T010-T012 can run in parallel
- T010: Conversation service
- T011: Cohere client
- T012: Tool definitions

**Phase 3 US1**: Tests T013-T016 can run in parallel; implementations T017-T019 can run in parallel

**Phases 4-7** (after US1): US2, US3, US4, US5 can all run in parallel by different developers

**Phase 8 Polish**: All testing and documentation tasks T055-T067 can run in parallel

---

## Parallel Example: After Phase 3 (US1 Complete)

```bash
# Launch all user stories 2-5 in parallel (4 developers)
Developer 1: US2 (Intent Accuracy) - T024-T030
Developer 2: US3 (Confirmation) - T031-T038
Developer 3: US4 (Ambiguous Input) - T039-T045
Developer 4: US5 (Conversation History) - T046-T054

# After all complete, Phase 8 testing (T055-T068) runs in parallel
```

---

## Implementation Strategy

### MVP First (User Stories 1, 2, 3 Only)

**Minimum viable product for natural language task management:**

1. Complete Phase 1: Setup (T001-T005)
2. Complete Phase 2: Foundational (T006-T012) ⚠️ **CRITICAL GATE**
3. Complete Phase 3: User Story 1 (T013-T023)
4. Complete Phase 4: User Story 2 (T024-T030)
5. Complete Phase 5: User Story 3 (T031-T038)
6. Complete Phase 8 tests (T055-T059)
7. **STOP and VALIDATE**: Test agent with 50+ natural language variations
8. **Deploy/demo if ready**: Users can manage tasks via chat

**Total MVP tasks: ~50 tasks**

### Incremental Delivery

1. **Iteration 1**: Phases 1-3 (Basic agent pipeline)
   - Deploy agent that executes MCP tools
   - Validate with simple commands

2. **Iteration 2**: Phase 4 (Intent accuracy)
   - Improve detection reliability
   - Test 50+ variations

3. **Iteration 3**: Phase 5 (Confirmation)
   - Add delete confirmation
   - Prevent accidental data loss

4. **Iteration 4**: Phases 6-7 (Ambiguous input + History)
   - Handle edge cases
   - Full conversation persistence

5. **Iteration 5**: Phase 8 (Polish & production)
   - Performance optimization
   - Production deployment

### Parallel Team Strategy

**With 4+ developers:**

1. All on Phases 1-2 together (~3 days)
2. Complete Phase 3 (US1) together (~5 days) - BLOCKS others
3. Once US1 complete, split into 4 teams:
   - Developer 1: US2 (Intent Accuracy) - 7 tasks
   - Developer 2: US3 (Confirmation) - 8 tasks
   - Developer 3: US4 (Ambiguous Input) - 7 tasks
   - Developer 4: US5 (Conversation History) - 9 tasks
4. All stories complete in parallel (~4 days)
5. Final Phase 8 together (~3 days)

**Total: ~15 days for full feature with 4 developers**

---

## Task Checklist Validation

**Format verification** (all tasks follow `- [ ] [ID] [P?] [Story?] Description with file path`):

✅ All tasks have checkbox `- [ ]`
✅ All tasks have sequential ID (T001-T068)
✅ All parallelizable tasks marked `[P]`
✅ All user story phase tasks have `[US1]`, `[US2]`, `[US3]`, `[US4]`, or `[US5]` label
✅ All setup/foundational/polish tasks have NO story label
✅ All tasks include specific file path or location
✅ Total: 68 implementation tasks across 8 phases

---

## Notes

- [P] tasks = different files, no dependencies within the phase
- [Story] label maps task to specific user story for traceability
- User Story 1 (Natural Language) blocks other stories - core agent pipeline required first
- After US1, stories 2-5 are independently completable and testable
- Verify tests fail before implementing (TDD approach)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently

