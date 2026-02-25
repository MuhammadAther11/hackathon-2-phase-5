# Tasks: Advanced Features Extension

**Feature**: 006-advanced-features-extension  
**Input**: Design documents from `/specs/006-advanced-features-extension/`  
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/api-contracts.md, quickstart.md, research.md

**Tests**: Tests are OPTIONAL and NOT included in this task list. Add test tasks if TDD approach is requested or if explicitly required by the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/src/`, `frontend/src/`, `helm/taskflow/`
- Paths shown below follow the project structure from plan.md

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create project structure per implementation plan (backend/src/models/, backend/src/services/, backend/src/api/, backend/src/events/, backend/src/dapr/, frontend/src/components/tags/, frontend/src/components/priority/, frontend/src/components/due-date/, frontend/src/components/recurring/, frontend/src/components/search/, frontend/src/hooks/)
- [X] T002 [P] Add Python dependencies to backend/pyproject.toml (dapr, psycopg2-binary, asyncpg)
- [X] T003 [P] Add Node.js dependencies to frontend/package.json (no new deps needed - using existing TanStack Query)
- [X] T004 [P] Update backend/.env.example with DAPR_HTTP_ENDPOINT, DAPR_GRPC_ENDPOINT, KAFKA_BROKERS
- [X] T005 [P] Update frontend/.env.local.example with NEXT_PUBLIC_WS_URL

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T006 Create database migration 001_add_priority_to_task.sql in backend/src/db/migrations/ (adds priority INTEGER column with CHECK constraint)
- [X] T007 Create database migration 002_add_due_date_to_task.sql in backend/src/db/migrations/ (adds due_date TIMESTAMPTZ column)
- [X] T008 Create database migration 003_add_recurrence_rule_to_task.sql in backend/src/db/migrations/ (adds recurrence_rule JSONB column)
- [X] T009 Create database migration 004_create_tag_tables.sql in backend/src/db/migrations/ (creates tag and task_tag tables)
- [X] T010 Create database migration 005_create_reminder_table.sql in backend/src/db/migrations/ (creates reminder table)
- [X] T011 Create database migration 006_create_task_event_table.sql in backend/src/db/migrations/ (creates task_event table)
- [X] T012 Create database migration 007_add_version_for_optimistic_locking.sql in backend/src/db/migrations/ (adds version and updated_at columns)
- [X] T013 Create database migration 008_add_full_text_search_index.sql in backend/src/db/migrations/ (adds GIN index for search)
- [X] T014 [P] Extend Task SQLModel in backend/src/models/task.py (add priority, due_date, recurrence_rule, version, updated_at fields)
- [X] T015 [P] Create Tag SQLModel in backend/src/models/tag.py (id, user_id, name, color, created_at)
- [X] T016 [P] Create TaskTag SQLModel in backend/src/models/task_tag.py (junction table with task_id, tag_id)
- [X] T017 [P] Create Reminder SQLModel in backend/src/models/reminder.py (id, task_id, trigger_time, delivered, delivered_at, created_at)
- [X] T018 [P] Create TaskEvent SQLModel in backend/src/models/event.py (id, event_type, aggregate_id, user_id, version, payload, timestamp, correlation_id)
- [X] T019 Update backend/src/database.py to run migrations on startup (alembic upgrade head)
- [X] T020 [P] Create Dapr Pub/Sub client in backend/src/dapr/pubsub.py (publish_event method using dapr-pubsub)
- [X] T021 [P] Create Dapr Jobs API client in backend/src/dapr/jobs.py (schedule_job, cancel_job methods)
- [X] T022 Create event publisher service in backend/src/events/publisher.py (publish_task_event function with event_type, aggregate_id, payload)
- [X] T023 Update FastAPI main.py to include Dapr sidecar configuration and health check endpoint /health

**Checkpoint**: ✅ Foundation ready - user story implementation can now begin in parallel

**Phase 2 Summary**: 18/18 tasks complete
- Database migrations: 8/8 ✓
- SQLModel entities: 5/5 ✓ (Task extended, Tag, TaskTag, Reminder, TaskEvent)
- Dapr clients: 2/2 ✓ (Pub/Sub, Jobs API)
- Event publisher: 1/1 ✓
- Main.py updates: 1/1 ✓
- API router stubs: 3/3 ✓ (tags, search, reminders)

---

## Phase 3: User Story 1 - Task Priority Management (Priority: P1) 🎯 MVP

**Goal**: Users can assign priority levels (LOW, MEDIUM, HIGH, CRITICAL) to tasks and visually distinguish them

**Independent Test**: Can be fully tested by creating tasks with different priority levels and verifying they display correctly and can be filtered by priority

### Implementation for User Story 1

- [X] T024 [P] [US1] Extend TaskService in backend/src/services/task_service.py (add priority parameter to create_task, update_task methods)
- [X] T025 [P] [US1] Update POST /api/{user_id}/tasks endpoint in backend/src/api/tasks.py (accept priority field, validate 1-4)
- [X] T026 [P] [US1] Update PUT /api/{user_id}/tasks/{task_id} endpoint in backend/src/api/tasks.py (accept priority field, optimistic locking)
- [X] T027 [US1] Update GET /api/{user_id}/tasks endpoint in backend/src/api/tasks.py (return priority in response, add priority sorting)
- [X] T028 [US1] Extend MCP add_task tool in backend/src/mcp/tools.py (accept priority parameter: "low", "medium", "high", "critical")
- [X] T029 [US1] Extend MCP list_tasks tool in backend/src/mcp/tools.py (support priority filter parameter)
- [X] T030 [US1] Create PrioritySelector component in frontend/src/components/priority/PrioritySelector.tsx (dropdown with 4 priority levels, color-coded)
- [X] T031 [US1] Update TaskItem component in frontend/src/components/TaskItem.tsx (display priority badge with color: LOW=gray, MEDIUM=blue, HIGH=orange, CRITICAL=red)
- [X] T032 [US1] Update TaskDashboard component in frontend/src/components/TaskDashboard.tsx (include PrioritySelector in task form)
- [X] T033 [US1] Extend useTasks hook in frontend/src/hooks/useTasks.ts (add priority to task creation/update mutations)

**Checkpoint**: ✅ User Story 1 complete - users can create tasks with priorities and see visual indicators

---

## Phase 4: User Story 2 - Task Tagging System (Priority: P2)

**Goal**: Users can assign multiple tags to tasks for flexible categorization and filter by tag combinations

**Independent Test**: Can be fully tested by creating tags, assigning them to tasks, and verifying tasks can be filtered by tag

### Implementation for User Story 2

- [X] T034 [P] [US2] Create TagService in backend/src/services/tag_service.py (create_tag, list_tags, update_tag, delete_tag methods)
- [X] T035 [P] [US2] Create POST /api/{user_id}/tags endpoint in backend/src/api/tags.py (create new tag with name, color)
- [X] T036 [P] [US2] Create GET /api/{user_id}/tags endpoint in backend/src/api/tags.py (list all user tags with task_count)
- [X] T037 [P] [US2] Create PUT /api/{user_id}/tags/{tag_id} endpoint in backend/src/api/tags.py (update tag name, color)
- [X] T038 [P] [US2] Create DELETE /api/{user_id}/tags/{tag_id} endpoint in backend/src/api/tags.py (delete tag, cascade from tasks)
- [X] T039 [US2] Update TaskService in backend/src/services/task_service.py (add_tags_to_task, remove_tag_from_task methods)
- [X] T040 [US2] Update POST /api/{user_id}/tasks endpoint in backend/src/api/tasks.py (accept tags array, create task_tag associations)
- [X] T041 [US2] Update GET /api/{user_id}/tasks endpoint in backend/src/api/tasks.py (return tags array with each task, support tag filter)
- [X] T042 [US2] Extend MCP add_task tool in backend/src/mcp/tools.py (accept tags array parameter)
- [X] T043 [US2] Extend MCP list_tasks tool in backend/src/mcp/tools.py (support tag filter parameter)
- [X] T044 [P] [US2] Create TagInput component in frontend/src/components/tags/TagInput.tsx (multi-select with autocomplete from existing tags, create new)
- [X] T045 [P] [US2] Create TagFilter component in frontend/src/components/tags/TagFilter.tsx (checkbox list of tags for filtering)
- [X] T046 [US2] Update TaskItem component in frontend/src/components/TaskItem.tsx (display tag pills with colors)
- [X] T047 [US2] Update TaskDashboard component in frontend/src/components/TaskDashboard.tsx (include TagInput in task form, TagFilter in sidebar)
- [X] T048 [US2] Create useTags hook in frontend/src/hooks/useTags.ts (CRUD operations for tags, TanStack Query)

**Checkpoint**: ✅ User Story 2 complete - users can create tags, assign to tasks, and filter by tags

---

## Phase 5: User Story 3 - Task Search Functionality (Priority: P3)

**Goal**: Users can search across all tasks using keywords to quickly find specific items

**Independent Test**: Can be fully tested by entering search terms and verifying matching tasks are returned from title, description, or tags

### Implementation for User Story 3

- [X] T049 [P] [US3] Create SearchService in backend/src/services/search_service.py (search_tasks method using PostgreSQL full-text search with tsvector/tsquery)
- [X] T050 [P] [US3] Create GET /api/{user_id}/tasks/search endpoint in backend/src/api/search.py (query param q, limit, return rank-ordered results)
- [X] T051 [US3] Add validation to search endpoint in backend/src/api/search.py (min 3 chars, max 200 chars, sanitize input)
- [X] T052 [US3] Extend MCP list_tasks tool in backend/src/mcp/tools.py (add search_query parameter)
- [X] T053 [P] [US3] Create SearchBar component in frontend/src/components/search/SearchBar.tsx (input with debounce 300ms, clear button, search icon)
- [X] T054 [US3] Update TaskDashboard component in frontend/src/components/TaskDashboard.tsx (integrate SearchBar above task list)
- [X] T055 [US3] Create useSearch hook in frontend/src/hooks/useSearch.ts (debounced search query, TanStack Query with staleTime)
- [X] T056 [US3] Add empty state to search results in frontend/src/components/search/SearchBar.tsx ("No results found" message with suggestions)

**Checkpoint**: ✅ User Story 3 complete - users can search tasks by keyword with relevance ranking

---

## Phase 6: User Story 4 - Task Filtering and Sorting (Priority: P4)

**Goal**: Users can filter tasks by attributes and sort by various criteria to view tasks in useful order

**Independent Test**: Can be fully tested by applying filter combinations and sort orders, verifying correct task subsets in expected order

### Implementation for User Story 4

- [X] T057 [P] [US4] Update GET /api/{user_id}/tasks endpoint in backend/src/api/tasks.py (add query params: priority, status, tag, due_date_from, due_date_to, sort, order, limit, offset)
- [X] T058 [P] [US4] Extend TaskService in backend/src/services/task_service.py (add filter_tasks method with dynamic WHERE clause building)
- [X] T059 [US4] Add sorting logic to TaskService in backend/src/services/task_service.py (ORDER BY priority DESC, due_date ASC, created_at DESC, title ASC)
- [X] T060 [US4] Add pagination to TaskService in backend/src/services/task_service.py (LIMIT/OFFSET with total count)
- [X] T061 [US4] Extend MCP list_tasks tool in backend/src/mcp/tools.py (add filters object with priority, status, tag, due_date_range; add sort, order params)
- [X] T062 [P] [US4] Create FilterSidebar component in frontend/src/components/FilterSidebar.tsx (dropdowns for priority, status, tag; date range picker)
- [X] T063 [P] [US4] Create SortSelector component in frontend/src/components/SortSelector.tsx (dropdown: Due Date, Priority, Created Date, Title; asc/desc toggle)
- [X] T064 [US4] Update TaskDashboard component in frontend/src/components/TaskDashboard.tsx (integrate FilterSidebar and SortSelector, apply filters to query)
- [X] T065 [US4] Extend useTasks hook in frontend/src/hooks/useTasks.ts (add filters and sort params to query, invalidate on filter change)

**Checkpoint**: ✅ User Story 4 complete - users can filter by multiple attributes and sort by any field

---

## Phase 7: User Story 5 - Due Date Management (Priority: P5)

**Goal**: Users can assign due dates to tasks with visual indicators for overdue, today, upcoming, and future

**Independent Test**: Can be fully tested by creating tasks with various due dates and verifying visual indicators change appropriately

### Implementation for User Story 5

- [X] T066 [P] [US5] Extend TaskService in backend/src/services/task_service.py (add due_date parameter to create_task, update_task; add get_overdue_tasks method)
- [X] T067 [P] [US5] Update POST /api/{user_id}/tasks endpoint in backend/src/api/tasks.py (accept due_date in ISO 8601 format, store as UTC)
- [X] T068 [P] [US5] Update PUT /api/{user_id}/tasks/{task_id} endpoint in backend/src/api/tasks.py (accept due_date, allow null to remove)
- [X] T069 [US5] Update GET /api/{user_id}/tasks endpoint in backend/src/api/tasks.py (add is_overdue computed field in response)
- [X] T070 [US5] Extend MCP add_task tool in backend/src/mcp/tools.py (accept due_date parameter: "tomorrow", "next week", or ISO date)
- [X] T071 [US5] Extend MCP list_tasks tool in backend/src/mcp/tools.py (add due_before, due_after filter parameters)
- [X] T072 [P] [US5] Create DueDatePicker component in frontend/src/components/due-date/DueDatePicker.tsx (react-datepicker with quick options: Today, Tomorrow, Next Week, Next Month)
- [X] T073 [P] [US5] Create DueDateIndicator component in frontend/src/components/due-date/DueDateIndicator.tsx (badge with color: overdue=red, today=orange, upcoming=yellow, future=gray)
- [X] T074 [US5] Update TaskItem component in frontend/src/components/TaskItem.tsx (display DueDateIndicator next to task title)
- [X] T075 [US5] Update TaskDashboard component in frontend/src/components/TaskDashboard.tsx (include DueDatePicker in task form)
- [X] T076 [US5] Extend useTasks hook in frontend/src/hooks/useTasks.ts (add due_date to mutations, format dates for display)

**Checkpoint**: ✅ User Story 5 complete - users can set due dates and see visual overdue indicators

---

## Phase 8: User Story 6 - Recurring Task Automation (Priority: P6)

**Goal**: Users can configure tasks to recur on schedules; next instance auto-generated on completion

**Independent Test**: Can be fully tested by creating a recurring task, completing it, and verifying new instance is generated with correct next due date

### Implementation for User Story 6

- [X] T077 [P] [US6] Create RecurringService in backend/src/services/recurring_service.py (parse_recurrence_rule, calculate_next_occurrence, generate_next_instance methods)
- [X] T078 [P] [US6] Create event handler in backend/src/events/handlers.py (handle_task_completed: check recurrence_rule, call generate_next_instance if recurring)
- [X] T079 [US6] Update POST /api/{user_id}/tasks endpoint in backend/src/api/tasks.py (accept recurrence_rule JSON object)
- [X] T080 [US6] Update PUT /api/{user_id}/tasks/{task_id} endpoint in backend/src/api/tasks.py (accept recurrence_rule updates)
- [X] T081 [US6] Update GET /api/{user_id}/tasks endpoint in backend/src/api/tasks.py (return recurrence_rule in response, add is_recurring computed field)
- [X] T082 [US6] Extend MCP add_task tool in backend/src/mcp/tools.py (accept recurrence parameter: "daily", "weekly", "monthly", or JSON rule)
- [X] T083 [US6] Extend MCP complete_task tool in backend/src/mcp/tools.py (trigger event handler for recurring generation after marking complete)
- [X] T084 [P] [US6] Create RecurrenceSelector component in frontend/src/components/recurring/RecurrenceSelector.tsx (frequency dropdown, interval input, day selection for weekly, end condition options)
- [X] T085 [US6] Update TaskItem component in frontend/src/components/TaskItem.tsx (display recurring icon if is_recurring)
- [X] T086 [US6] Update TaskDashboard component in frontend/src/components/TaskDashboard.tsx (include RecurrenceSelector in task form)
- [X] T087 [US6] Handle edge case in RecurringService (monthly on 31st → use last day of month for Feb, Apr, etc.)

**Checkpoint**: ✅ User Story 6 complete - recurring tasks auto-generate next instance on completion

---

## Phase 9: User Story 7 - Task Reminders (Priority: P7)

**Goal**: Users can set reminders for tasks to receive notifications before due dates or at specific times

**Independent Test**: Can be fully tested by setting a reminder with near-future trigger time and verifying notification is delivered at expected time

### Implementation for User Story 7

- [X] T088 [P] [US7] Create ReminderService in backend/src/services/reminder_service.py (create_reminder, cancel_reminder, deliver_reminder methods)
- [X] T089 [P] [US7] Create POST /api/{user_id}/tasks/{task_id}/reminders endpoint in backend/src/api/reminders.py (accept trigger_time, schedule via Dapr Jobs API)
- [X] T090 [P] [US7] Create GET /api/{user_id}/tasks/{task_id}/reminders endpoint in backend/src/api/reminders.py (list reminders for task)
- [X] T091 [P] [US7] Create DELETE /api/{user_id}/reminders/{reminder_id} endpoint in backend/src/api/reminders.py (cancel reminder, cancel Dapr job)
- [X] T092 [US7] Create Dapr job callback endpoint in backend/src/api/reminders.py (POST /reminders/trigger callback from Dapr Jobs API)
- [X] T093 [US7] Update deliver_reminder in backend/src/services/reminder_service.py (publish in-app notification, mark delivered=true)
- [X] T094 [US7] Create notification service in backend/src/services/notification_service.py (send_in_app_notification method)
- [X] T095 [US7] Extend MCP set_reminder tool in backend/src/mcp/tools.py (accept trigger_time or relative: "15 minutes before", "1 hour before", "1 day before")
- [X] T096 [P] [US7] Create ReminderSelector component in frontend/src/components/reminder/ReminderSelector.tsx (quick options + custom datetime picker)
- [X] T097 [US7] Update TaskItem component in frontend/src/components/TaskItem.tsx (display reminder icon if has reminders)
- [X] T098 [US7] Update TaskDashboard component in frontend/src/components/TaskDashboard.tsx (include ReminderSelector in task detail panel)
- [X] T099 [US7] Create notification toast in frontend/src/components/notification/NotificationToast.tsx (display in-app notifications with sound)

**Checkpoint**: ✅ User Story 7 complete - users can set reminders and receive notifications at trigger time

---

## Phase 10: User Story 8 - Real-Time Task Synchronization (Priority: P8)

**Goal**: Users experience instant synchronization of task changes across multiple devices/browser tabs

**Independent Test**: Can be fully tested by opening app in two tabs, making change in one, verifying it appears in other within 2 seconds without refresh

### Implementation for User Story 8

- [X] T100 [P] [US8] Create WebSocket endpoint in backend/src/api/websocket.py (WebSocket /ws endpoint with JWT authentication)
- [X] T101 [P] [US8] Create WebSocket manager in backend/src/api/websocket.py (manage connections per user_id, broadcast to user's connections)
- [X] T102 [US8] Update event publisher in backend/src/events/publisher.py (publish to WebSocket manager on task.created, task.updated, task.deleted)
- [X] T103 [US8] Create Dapr Pub/Sub subscriber in backend/src/events/handlers.py (subscribe to task-events topic, forward to WebSocket manager)
- [X] T104 [US8] Deploy Recurring Service as separate Kubernetes deployment in helm/taskflow/templates/recurring-deployment.yaml (with Dapr sidecar, subscribes to task-events)
- [X] T105 [US8] Deploy Notification Service as separate Kubernetes deployment in helm/taskflow/templates/notification-deployment.yaml (with Dapr sidecar, subscribes to reminder-events)
- [X] T106 [P] [US8] Create useRealtimeSync hook in frontend/src/hooks/useRealtimeSync.ts (WebSocket connection, subscribe to task-events, update TanStack Query cache on events)
- [X] T107 [US8] Update TaskDashboard component in frontend/src/components/TaskDashboard.tsx (integrate useRealtimeSync, handle optimistic updates)
- [X] T108 [US8] Handle event-to-cache mapping in useRealtimeSync hook (task.created → add to list, task.updated → update in cache, task.deleted → remove from cache)
- [X] T109 [US8] Add reconnection logic to useRealtimeSync hook (reconnect on disconnect with exponential backoff)
- [X] T110 [US8] Configure Dapr Pub/Sub component in helm/taskflow/templates/dapr-components/pubsub-kafka.yaml (Kafka broker config, topic: task-events)

**Checkpoint**: ✅ User Story 8 complete - real-time sync across tabs/devices within 2 seconds

---

## Phase 11: Optimistic Locking & Conflict Resolution

**Goal**: Handle simultaneous edits gracefully with optimistic locking

**Independent Test**: Edit same task in two tabs simultaneously, verify conflict detected and handled

### Implementation

- [X] T111 [P] Update TaskService in backend/src/services/task_service.py (add version check in update_task, raise ConflictError if version mismatch)
- [X] T112 [P] Update PUT /api/{user_id}/tasks/{task_id} endpoint in backend/src/api/tasks.py (accept version in request, return 409 with current version on conflict)
- [X] T113 [US1] Update frontend useTasks hook in frontend/src/hooks/useTasks.ts (include version in update mutations, handle 409 response)
- [X] T114 Create ConflictDialog component in frontend/src/components/ConflictDialog.tsx (show both versions, let user choose or merge)

**Checkpoint**: Optimistic locking complete - conflicts detected and user can resolve

---

## Phase 12: Event-Driven Infrastructure (Dapr + Kafka)

**Goal**: Deploy and configure Dapr Pub/Sub over Kafka for event streaming

**Independent Test**: Complete task in one tab, verify event published to Kafka and consumed by services

### Implementation

- [X] T115 [P] Deploy Redpanda via Helm in helm/taskflow/values.yaml (redpanda.enabled: true, replicas: 1 for Minikube)
- [X] T116 [P] Create Dapr State Store component in helm/taskflow/templates/dapr-components/statestore.yaml (PostgreSQL-backed for ephemeral state)
- [X] T117 [P] Create Dapr Resiliency policy in helm/taskflow/templates/dapr-components/resiliency.yaml (retry, circuit breaker, timeout for pubsub)
- [X] T118 [US8] Update backend main.py to publish events via Dapr Pub/Sub (daprClient.publish_event on task actions)
- [X] T119 [US8] Configure Kafka topic in Redpanda (task-events topic with 3 partitions)
- [X] T120 [US8] Test event flow: create task → event published → WebSocket broadcast → UI update

**Checkpoint**: Event-driven infrastructure operational - events flow through Kafka via Dapr

---

## Phase 13: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T121 [P] Update API documentation in specs/006-advanced-features-extension/contracts/api-contracts.md (verify all endpoints documented)
- [X] T122 [P] Update quickstart guide in specs/006-advanced-features-extension/quickstart.md (add troubleshooting section)
- [X] T123 [P] Run backend unit tests: pytest backend/tests/ -v
- [X] T124 [P] Run frontend unit tests: npm run test --prefix frontend
- [X] T125 [P] Run E2E tests with Playwright: npm run test:e2e --prefix frontend
- [X] T126 [P] Performance test search with 10k tasks (verify <1s response)
- [X] T127 [P] Performance test real-time sync latency (verify <2s propagation)
- [X] T128 [P] Security audit: verify JWT auth on all endpoints, no hardcoded secrets
- [X] T129 [P] Deploy to Minikube: helm install taskflow ./helm/taskflow
- [X] T130 [P] Verify all health checks: kubectl get pods -n taskflow, all Running
- [X] T131 [P] Create PHR for implementation phase in history/prompts/advanced-features-extension/
- [X] T132 [P] Update README.md with Phase V features section

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - **BLOCKS all user stories**
- **User Stories (Phases 3-10)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3...)
- **Optimistic Locking (Phase 11)**: Depends on all task-related user stories
- **Event Infrastructure (Phase 12)**: Depends on Phase 2 + at least US1 complete
- **Polish (Phase 13)**: Depends on all desired user stories being complete

### User Story Dependencies

- **US1 (P1) - Priorities**: Can start after Foundational - No dependencies on other stories
- **US2 (P2) - Tags**: Can start after Foundational - Independent of US1
- **US3 (P3) - Search**: Can start after Foundational - Independent, but benefits from US1/US2
- **US4 (P4) - Filter/Sort**: Can start after Foundational - Depends on US1 (priority), US2 (tags)
- **US5 (P5) - Due Dates**: Can start after Foundational - Independent
- **US6 (P6) - Recurring**: Depends on US5 (due dates must exist first)
- **US7 (P7) - Reminders**: Depends on US5 (due dates), requires Dapr Jobs API (Phase 2)
- **US8 (P8) - Real-Time Sync**: Depends on Phase 2 (Dapr Pub/Sub), can parallelize with other stories

### Within Each User Story

1. Models (marked [P]) can run in parallel
2. Services depend on models
3. Endpoints depend on services
4. Frontend components depend on endpoints
5. Integration tasks depend on all above

### Parallel Opportunities

- **Phase 1 (Setup)**: T002, T003, T004, T005 can all run in parallel
- **Phase 2 (Foundational)**: T014-T018 (models) can run in parallel; T020, T021 (Dapr clients) can run in parallel
- **After Phase 2**: All user stories can start in parallel if team capacity allows
- **Within stories**: Model tasks marked [P] can run in parallel; endpoint tasks marked [P] can run in parallel
- **Frontend components**: T030, T044, T045, T053, T062, T063, T072, T073, T084 can run in parallel once backend endpoints ready

---

## Parallel Example: User Story 1

```bash
# Launch all models for User Story 1 together:
Task: "Extend Task SQLModel in backend/src/models/task.py"

# Launch all endpoints for User Story 1 together (after services ready):
Task: "Update POST /api/{user_id}/tasks endpoint"
Task: "Update PUT /api/{user_id}/tasks/{task_id} endpoint"
Task: "Update GET /api/{user_id}/tasks endpoint"

# Launch all frontend components for User Story 1 together (after endpoints ready):
Task: "Create PrioritySelector component"
Task: "Update TaskItem component"
Task: "Update TaskDashboard component"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T005)
2. Complete Phase 2: Foundational (T006-T023) - **CRITICAL BLOCKER**
3. Complete Phase 3: User Story 1 (T024-T033)
4. **STOP and VALIDATE**: Test priority management independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add US1 (Priorities) → Test independently → Deploy/Demo (MVP!)
3. Add US2 (Tags) → Test independently → Deploy/Demo
4. Add US3 (Search) → Test independently → Deploy/Demo
5. Add US4 (Filter/Sort) → Test independently → Deploy/Demo
6. Continue with US5-US8...
7. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Priorities)
   - Developer B: User Story 2 (Tags)
   - Developer C: User Story 5 (Due Dates)
3. Stories complete and integrate independently
4. Reconvene for dependent stories (US6 after US5, US7 after US5)

---

## Notes

- [P] tasks = different files, no dependencies within phase
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- **CRITICAL**: Phase 2 (Foundational) MUST complete before ANY user story work
- US6 (Recurring) depends on US5 (Due Dates) - do not start US6 before US5 complete
- US7 (Reminders) depends on Dapr Jobs API (Phase 2) and US5 (Due Dates)
- US8 (Real-Time Sync) can proceed in parallel once Dapr Pub/Sub configured (Phase 2)

---

## Task Summary

| Phase | Description | Task Count |
|-------|-------------|------------|
| Phase 1 | Setup | 5 |
| Phase 2 | Foundational | 18 |
| Phase 3 | US1 - Priorities | 10 |
| Phase 4 | US2 - Tags | 15 |
| Phase 5 | US3 - Search | 8 |
| Phase 6 | US4 - Filter/Sort | 9 |
| Phase 7 | US5 - Due Dates | 11 |
| Phase 8 | US6 - Recurring | 11 |
| Phase 9 | US7 - Reminders | 12 |
| Phase 10 | US8 - Real-Time Sync | 11 |
| Phase 11 | Optimistic Locking | 4 |
| Phase 12 | Event Infrastructure | 6 |
| Phase 13 | Polish | 12 |
| **Total** | | **132 tasks** |

**MVP Scope**: Phases 1-2 + Phase 3 (US1) = 33 tasks  
**Full Feature**: All 132 tasks
