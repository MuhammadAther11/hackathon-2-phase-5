# Phase V Features - Advanced Task Management

## Overview

Phase V adds comprehensive advanced task management features with event-driven architecture using Dapr and Kafka.

## New Features

### ✅ Task Priorities
- 4 priority levels: LOW, MEDIUM, HIGH, CRITICAL
- Visual indicators with color coding
- Filter and sort by priority

### ✅ Tags & Categorization
- User-defined tags with custom colors
- Multi-tag support per task
- Tag-based filtering and organization

### ✅ Search & Filter
- Full-text search across titles and descriptions
- Advanced filtering by priority, status, tags, due dates
- Multiple sort options (due date, priority, created date, title)

### ✅ Due Dates
- UTC timezone-aware date storage
- Visual overdue indicators
- Quick date selection (Today, Tomorrow, Next Week)

### ✅ Recurring Tasks
- Daily, weekly, monthly recurrence patterns
- Automatic next-instance generation
- Custom intervals and end conditions

### ✅ Reminders
- Dapr Jobs API scheduled notifications
- In-app notification delivery
- Custom trigger times

### ✅ Real-Time Synchronization
- WebSocket-based live updates
- Cross-tab/device synchronization
- Event-driven architecture with Kafka

### ✅ Optimistic Locking
- Conflict detection for simultaneous edits
- Version-based concurrency control
- User-friendly conflict resolution

## Technical Stack

| Component | Technology |
|-----------|------------|
| Event Streaming | Kafka (Redpanda) via Dapr Pub/Sub |
| Distributed Runtime | Dapr (Pub/Sub, Jobs API, State Store) |
| Database | Neon PostgreSQL |
| Backend | Python FastAPI + SQLModel |
| Frontend | Next.js 16 + React 19 |
| Real-Time | WebSocket + TanStack Query |
| Orchestration | Kubernetes (Minikube/AKS/GKE) |

## Database Migrations

8 migrations added:
1. `001_add_priority_to_task.sql` - Priority column
2. `002_add_due_date_to_task.sql` - Due date column
3. `003_add_recurrence_rule_to_task.sql` - Recurrence rule JSONB
4. `004_create_tag_tables.sql` - Tag and task_tag tables
5. `005_create_reminder_table.sql` - Reminder table
6. `006_create_task_event_table.sql` - Event sourcing table
7. `007_add_version_for_optimistic_locking.sql` - Version column
8. `008_add_full_text_search_index.sql` - Full-text search GIN index

## New Models

- `Task` (extended) - priority, due_date, recurrence_rule, version
- `Tag` - User-defined categorization labels
- `TaskTag` - Many-to-many junction table
- `Reminder` - Scheduled notifications
- `TaskEvent` - Event sourcing and audit trail

## New Services

- `TagService` - Tag CRUD operations
- `SearchService` - Full-text search
- `RecurringService` - Recurrence rule parsing and instance generation
- `ReminderService` - Reminder scheduling and delivery
- `NotificationService` - In-app notifications
- `EventPublisher` - Dapr Pub/Sub event publishing

## API Endpoints

### Tags
- `GET /api/{user_id}/tags` - List user tags
- `POST /api/{user_id}/tags` - Create tag
- `PUT /api/{user_id}/tags/{tag_id}` - Update tag
- `DELETE /api/{user_id}/tags/{tag_id}` - Delete tag

### Search
- `GET /api/{user_id}/tasks/search?q=...` - Full-text search

### Reminders
- `GET /api/{user_id}/tasks/{task_id}/reminders` - List reminders
- `POST /api/{user_id}/tasks/{task_id}/reminders` - Create reminder
- `DELETE /api/{user_id}/reminders/{reminder_id}` - Cancel reminder

### Tasks (Extended)
- `GET /api/{user_id}/tasks` - Added filters: priority, status, tag, due_date, sort, order
- `POST /api/{user_id}/tasks` - Added: priority, due_date, tags, recurrence_rule
- `PUT /api/{user_id}/tasks/{task_id}` - Added: priority, due_date, tags, recurrence_rule, version

## Dapr Components

### Pub/Sub (Kafka)
```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: pubsub
spec:
  type: pubsub.kafka
```

### Jobs API
```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: jobs
spec:
  type: bindings.cron
```

### State Store
```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: statestore
spec:
  type: state.postgresql
```

## Event Types

- `task.created` - New task created
- `task.updated` - Task modified
- `task.completed` - Task marked complete
- `task.deleted` - Task removed
- `task.recurring_instance_created` - New recurring instance generated

## Environment Variables

### Backend
```bash
DAPR_HTTP_ENDPOINT=http://localhost:3500
DAPR_GRPC_ENDPOINT=localhost:50001
KAFKA_BROKERS=redpanda-0.redpanda.taskflow.svc.cluster.local:9092
```

### Frontend
```bash
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
```

## Deployment

### Minikube
```bash
helm install taskflow ./helm/taskflow \
  --set redpanda.enabled=true \
  --set dapr.enabled=true
```

### Health Check
```bash
curl http://localhost:8000/health
```

## Testing

```bash
# Backend tests
pytest backend/tests/ -v

# Frontend tests
npm run test --prefix frontend

# E2E tests
npm run test:e2e --prefix frontend
```

## Success Criteria

- ✅ Users can create tasks with priority, tags, and due date in under 30 seconds
- ✅ Search returns results within 1 second for 95% of queries
- ✅ Real-time sync propagates changes within 2 seconds
- ✅ Recurring tasks generate next instance automatically
- ✅ Reminders delivered within 1 minute of scheduled time
- ✅ System supports 10,000 concurrent users
- ✅ Zero data loss during container restarts

## Migration from Phase IV

Phase IV chatbot functionality is preserved without modification. All new features are additive and backward compatible.

### Breaking Changes
None - all existing API endpoints remain functional.

### Database Migration
Run migrations on startup (automatic via `run_migrations()` in main.py).

## Documentation

- [Specification](../../specs/006-advanced-features-extension/spec.md)
- [Plan](../../specs/006-advanced-features-extension/plan.md)
- [Tasks](../../specs/006-advanced-features-extension/tasks.md)
- [Data Model](../../specs/006-advanced-features-extension/data-model.md)
- [API Contracts](../../specs/006-advanced-features-extension/contracts/api-contracts.md)
- [Quickstart](../../specs/006-advanced-features-extension/quickstart.md)
