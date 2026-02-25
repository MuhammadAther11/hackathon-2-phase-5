# Quickstart Guide: Advanced Features Extension

**Feature**: 006-advanced-features-extension  
**Date**: 2026-02-18  
**Audience**: Developers implementing this feature

---

## Overview

This guide provides a quick start for implementing advanced task management features (priorities, tags, search, filter, sort, due dates, recurring tasks, reminders) with event-driven architecture using Dapr and Kafka.

---

## Prerequisites

Before starting implementation, ensure you have:

- [ ] Phase III chatbot fully functional
- [ ] Phase IV Kubernetes deployment working (Minikube + Helm)
- [ ] Python 3.11+ and Node.js 18+ installed
- [ ] Docker and Minikube running
- [ ] Helm 3.x installed
- [ ] Dapr CLI installed (`dapr init`)
- [ ] Database migrations tool ready (Alembic or similar)

---

## Implementation Order

Follow this sequence to minimize rework and ensure dependencies are met:

### Phase 1: Core Data Model (Days 1-2)

1. **Run database migrations** in order:
   ```bash
   # Navigate to backend directory
   cd backend
   
   # Apply migrations (example with Alembic)
   alembic upgrade head
   ```

2. **Update SQLModel models**:
   - `backend/src/models/task.py` - Add priority, due_date, recurrence_rule, version
   - `backend/src/models/tag.py` - New Tag model
   - `backend/src/models/task_tag.py` - New junction table
   - `backend/src/models/reminder.py` - New Reminder model
   - `backend/src/models/event.py` - New TaskEvent model

3. **Update existing services**:
   - `backend/src/services/task_service.py` - Add priority, tags, due date support

**Validation**: Run unit tests for model creation and basic CRUD operations.

---

### Phase 2: Tag System (Days 3-4)

1. **Create tag service**: `backend/src/services/tag_service.py`
   - create_tag(user_id, name, color)
   - list_tags(user_id)
   - update_tag(tag_id, name, color)
   - delete_tag(tag_id)

2. **Create API endpoints**: `backend/src/api/tags.py`
   - POST /api/{user_id}/tags
   - GET /api/{user_id}/tags
   - PUT /api/{user_id}/tags/{tag_id}
   - DELETE /api/{user_id}/tags/{tag_id}

3. **Update task endpoints** to support tags:
   - POST /api/{user_id}/tasks - Accept tags array
   - GET /api/{user_id}/tasks - Return tags with tasks

**Validation**: Test tag CRUD via API, verify user isolation.

---

### Phase 3: Priority & Due Dates (Days 5-6)

1. **Extend task service** with priority and due date logic:
   - Priority validation (1-4)
   - Due date timezone handling (UTC storage)
   - Overdue detection logic

2. **Update MCP tools**:
   - `add_task` - Accept priority and due_date parameters
   - `list_tasks` - Support priority filtering

3. **Update frontend components**:
   - `TaskItem.tsx` - Priority badges, due date indicators
   - `TaskDashboard.tsx - Priority selector, date picker

**Validation**: Create tasks with priorities and due dates, verify sorting.

---

### Phase 4: Search, Filter, Sort (Days 7-9)

1. **Create search service**: `backend/src/services/search_service.py`
   - Full-text search with PostgreSQL tsvector
   - Relevance ranking

2. **Extend task list endpoint** with query parameters:
   - Filter: priority, status, tag, due_date range
   - Sort: priority, due_date, created_at, title
   - Pagination: limit, offset

3. **Create search endpoint**: `backend/src/api/search.py`
   - GET /api/{user_id}/tasks/search?q=...

4. **Frontend filter/sort UI**:
   - Filter dropdowns (priority, status, tags)
   - Sort selector
   - Search bar with debounce

**Validation**: Test all filter combinations, verify sort orders, measure search performance (<1s).

---

### Phase 5: Recurring Tasks (Days 10-12)

1. **Extend task model** with recurrence_rule (JSONB)

2. **Create recurrence service**: `backend/src/services/recurring_service.py`
   - parse_recurrence_rule(rule_json)
   - calculate_next_occurrence(rule, current_date)
   - generate_next_instance(task_id)

3. **Update task completion flow**:
   - On task.completed event → check recurrence_rule
   - If recurring → generate next instance automatically

4. **Frontend recurrence selector**:
   - Frequency dropdown (daily, weekly, monthly)
   - Interval input (every N days/weeks/months)
   - Day selection (for weekly)
   - End condition (never, after date, after count)

**Validation**: Create recurring task, complete it, verify next instance generated correctly.

---

### Phase 6: Reminders with Dapr Jobs API (Days 13-15)

1. **Set up Dapr Jobs API component**:
   ```yaml
   # helm/taskflow/templates/dapr-components/jobs-api.yaml
   apiVersion: dapr.io/v1alpha1
   kind: Component
   metadata:
     name: jobs
   spec:
     type: bindings.cron
     version: v1
   ```

2. **Create reminder service**: `backend/src/services/reminder_service.py`
   - create_reminder(task_id, trigger_time)
   - cancel_reminder(reminder_id)
   - deliver_reminder(reminder_id) - callback from Dapr Jobs

3. **Create Dapr Jobs API integration**: `backend/src/dapr/jobs.py`
   - schedule_job(job_name, trigger_time, payload)
   - cancel_job(job_name)

4. **Create reminder endpoints**:
   - POST /api/{user_id}/tasks/{task_id}/reminders
   - GET /api/{user_id}/tasks/{task_id}/reminders
   - DELETE /api/{user_id}/reminders/{reminder_id}

5. **Frontend reminder UI**:
   - Reminder selector (15 min before, 1 hour before, 1 day before, custom)
   - Custom date/time picker

**Validation**: Set reminder for 1 minute in future, verify notification delivered.

---

### Phase 7: Event-Driven Architecture (Days 16-18)

1. **Deploy Kafka/Redpanda** via Helm:
   ```bash
   helm install redpanda redpanda/redpanda --namespace taskflow
   ```

2. **Configure Dapr Pub/Sub component**:
   ```yaml
   # helm/taskflow/templates/dapr-components/pubsub-kafka.yaml
   apiVersion: dapr.io/v1alpha1
   kind: Component
   metadata:
     name: pubsub
   spec:
     type: pubsub.kafka
     version: v1
   ```

3. **Create event publisher**: `backend/src/events/publisher.py`
   - publish_event(event_type, aggregate_id, payload)

4. **Create event handlers**: `backend/src/events/handlers.py`
   - handle_task_completed (for recurring task generation)
   - handle_reminder_triggered (for notification delivery)

5. **Deploy Recurring Service** (separate deployment with Dapr sidecar):
   - Subscribes to task-events topic
   - Consumes task.completed events
   - Triggers recurring task generation

6. **Deploy Notification Service** (separate deployment with Dapr sidecar):
   - Subscribes to reminder-events topic
   - Consumes reminder.triggered events
   - Delivers notifications (in-app, email future)

**Validation**: Complete task in one browser tab, verify real-time update in another tab.

---

### Phase 8: Real-Time Synchronization (Days 19-20)

1. **Create WebSocket gateway** for frontend subscriptions:
   - `backend/src/api/websocket.py`
   - WebSocket endpoint for event subscriptions

2. **Frontend real-time sync hook**: `frontend/src/hooks/useRealtimeSync.ts`
   - Connect to WebSocket
   - Subscribe to task-events
   - Update TanStack Query cache on events

3. **Event-to-cache mapping**:
   - task.created → add to task list
   - task.updated → update task in cache
   - task.deleted → remove from cache
   - task.completed → update status, trigger optimistic UI update

**Validation**: Open app in two tabs, make change in one, verify update appears in other within 2 seconds.

---

### Phase 9: Optimistic Locking (Days 21-22)

1. **Add version field to task model** (already in migration)

2. **Update task service** with version checking:
   ```python
   def update_task(task_id, updates, expected_version):
       task = get_task(task_id)
       if task.version != expected_version:
           raise ConflictError(...)
       task.version += 1
       ...
   ```

3. **Update API endpoint** to accept and return version:
   - Request: `{ ..., version: 1 }`
   - Response: `{ ..., version: 2 }`

4. **Frontend conflict handling**:
   - Include version in update requests
   - On 409 Conflict → show merge UI or auto-retry

**Validation**: Edit same task in two tabs simultaneously, verify conflict detected and handled.

---

### Phase 10: Testing & Polish (Days 23-25)

1. **Unit tests** for all new services
2. **Integration tests** for API endpoints
3. **Contract tests** for MCP tools
4. **E2E tests** (Playwright) for user flows:
   - Create task with priority, tags, due date
   - Filter and sort tasks
   - Set reminder and verify delivery
   - Create recurring task and verify next instance
   - Real-time sync across tabs

5. **Performance testing**:
   - Search performance with 10k tasks
   - Filter/sort performance
   - Real-time sync latency

6. **Documentation updates**:
   - API documentation
   - User guide for new features
   - Deployment guide for Dapr/Kafka

---

## Dapr Component Definitions

### Pub/Sub (Kafka)

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: pubsub
  namespace: taskflow
spec:
  type: pubsub.kafka
  version: v1
  metadata:
  - name: brokers
    value: "redpanda-0.redpanda.taskflow.svc.cluster.local:9092"
  - name: authType
    value: "none"
```

### State Store (PostgreSQL - Ephemeral Only)

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: statestore
  namespace: taskflow
spec:
  type: state.postgresql
  version: v1
  metadata:
  - name: connectionString
    secretKeyRef:
      name: postgres-secret
      key: connection-string
```

### Jobs API (Cron Binding for Reminders)

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: jobs
  namespace: taskflow
spec:
  type: bindings.cron
  version: v1
  metadata:
  - name: schedule
    value: "@every 1m"  # Check every minute
```

---

## Helm Chart Updates

Add to `helm/taskflow/values.yaml`:

```yaml
recurringService:
  enabled: true
  replicaCount: 1
  resources:
    limits:
      cpu: 200m
      memory: 256Mi
    requests:
      cpu: 100m
      memory: 128Mi

notificationService:
  enabled: true
  replicaCount: 1
  resources:
    limits:
      cpu: 200m
      memory: 256Mi
    requests:
      cpu: 100m
      memory: 128Mi

redpanda:
  enabled: true
  replicas: 1  # 3 for production
```

---

## Environment Variables

### Backend (.env)

```bash
# Existing
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=...
OPENAI_API_KEY=...

# New for Dapr
DAPR_HTTP_ENDPOINT=http://localhost:3500
DAPR_GRPC_ENDPOINT=localhost:50001

# New for Kafka (via Dapr)
KAFKA_BROKERS=redpanda-0.redpanda.taskflow.svc.cluster.local:9092
```

### Frontend (.env.local)

```bash
# Existing
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000

# New for real-time
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
```

---

## Testing Checklist

- [ ] Create task with priority (LOW, MEDIUM, HIGH, CRITICAL)
- [ ] Add multiple tags to task
- [ ] Filter tasks by priority, tag, status
- [ ] Sort tasks by due date, priority, created date
- [ ] Search tasks by keyword
- [ ] Set due date and verify overdue indicator
- [ ] Create recurring task (daily, weekly, monthly)
- [ ] Complete recurring task and verify next instance
- [ ] Set reminder and verify delivery at trigger time
- [ ] Real-time sync: edit in tab A, see update in tab B
- [ ] Conflict detection: simultaneous edits in two tabs
- [ ] User isolation: User A cannot see User B's tasks/tags
- [ ] JWT auth: 401 on unauthenticated requests
- [ ] Performance: search returns in <1s with 10k tasks
- [ ] Dapr sidecars running with all services
- [ ] Events flowing through Kafka
- [ ] Health checks passing for all deployments

---

## Common Issues & Solutions

### Issue: Dapr sidecar not starting

**Solution**: Check Dapr component YAML for syntax errors, verify Dapr operator running:
```bash
kubectl get pods -n dapr-system
kubectl logs -n dapr-system dapr-operator-...
```

### Issue: Kafka connection refused

**Solution**: Verify Redpanda service running and accessible:
```bash
kubectl get svc -n taskflow redpanda
kubectl run test --image=bitnami/kafka --namespace taskflow --rm -it -- bash
# Inside pod: kafka-topics.sh --bootstrap-server redpanda:9092 --list
```

### Issue: Reminders not triggering

**Solution**: Check Dapr Jobs API component configuration, verify callback endpoint accessible:
```bash
dapr components --namespace taskflow
kubectl logs <recurring-service-pod> -c daprd
```

### Issue: Real-time sync not working

**Solution**: Verify WebSocket endpoint accessible, check event publisher:
```bash
# Test WebSocket connection
wscat -c ws://localhost:8000/ws
# Check events published
kubectl logs <backend-pod> | grep "event published"
```

---

## Next Steps

After completing implementation:

1. Run full test suite: `pytest && npm test`
2. Deploy to Minikube: `helm install taskflow ./helm/taskflow`
3. Verify all features in browser
4. Run Lighthouse performance audit
5. Create PHR for implementation phase
6. Proceed to `/sp.tasks` for task breakdown (if not already done)

---

## References

- [Data Model](./data-model.md) - Complete entity definitions
- [API Contracts](./contracts/api-contracts.md) - Endpoint specifications
- [Research](./research.md) - Technical decisions and rationale
- [Dapr Documentation](https://docs.dapr.io/)
- [Redpanda Documentation](https://docs.redpanda.com/)
