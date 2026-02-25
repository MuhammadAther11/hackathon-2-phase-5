# Research: Advanced Features Extension

**Feature**: 006-advanced-features-extension  
**Date**: 2026-02-18  
**Purpose**: Resolve technical unknowns and establish best practices for implementation

---

## Technical Decisions

### Decision 1: Priority System Implementation

**What was chosen**: Enum-based priority levels (LOW=1, MEDIUM=2, HIGH=3, CRITICAL=4) stored as INTEGER in database with check constraint.

**Why chosen**: 
- Simple sorting (ORDER BY priority DESC)
- Database-level validation via CHECK constraint
- Easy to extend with new levels
- Efficient indexing for filter queries
- Maps cleanly to visual indicators (colors/icons)

**Alternatives considered**:
- String-based priorities (rejected: sorting complexity, typo risk)
- Bitmask priorities (rejected: overcomplicated for 4 levels)
- External priority configuration table (rejected: unnecessary complexity)

---

### Decision 2: Tag System Architecture

**What was chosen**: Many-to-many relationship with separate `tag` table and `task_tag` junction table. Tags are user-scoped (user_id foreign key).

**Why chosen**:
- Prevents tag pollution across users
- Enables tag autocomplete per user
- Supports tag renaming without data loss
- Efficient filtering via JOIN or EXISTS queries
- Allows tag metadata (color, icon) in future

**Alternatives considered**:
- Global tag pool (rejected: violates user isolation principle)
- JSON array of tags on task model (rejected: can't filter efficiently, no tag metadata)
- Single string with comma-separated tags (rejected: violates normalization, can't filter)

---

### Decision 3: Search Implementation Strategy

**What was chosen**: PostgreSQL full-text search with tsvector/tsquery on title, description, and tag names. GIN index for performance.

**Why chosen**:
- No external search infrastructure needed (Elasticsearch, etc.)
- Leverages existing Neon PostgreSQL
- Sub-second performance for 10k-100k tasks
- Supports ranking/relevance scoring
- Constitution compliance: no new infrastructure beyond DB

**Alternatives considered**:
- Elasticsearch (rejected: overkill for 10k users, adds infrastructure complexity)
- Simple LIKE queries (rejected: poor performance, no relevance ranking)
- Meilisearch (rejected: additional service to maintain, violates "no new infrastructure")

---

### Decision 4: Filter and Sort Architecture

**What was chosen**: Query parameter-based filtering with dynamic query building in service layer. Sort via ORDER BY mapping.

**Why chosen**:
- RESTful API design (GET /tasks?priority=high&tag=work&sort=due_date)
- Composable filters (AND logic via WHERE clauses)
- Efficient with proper indexing
- Easy to extend with new filter dimensions
- Frontend controls all filter state

**Alternatives considered**:
- GraphQL (rejected: overkill, requires schema changes)
- POST-based filter queries (rejected: violates REST principles)
- Predefined filter presets (rejected: inflexible, doesn't support combinations)

---

### Decision 5: Due Date Storage and Timezone Handling

**What was chosen**: TIMESTAMP WITH TIMEZONE (timestamptz) stored in UTC. Frontend converts to user's local timezone for display.

**Why chosen**:
- Constitution compliance: timezone-aware date storage
- Handles daylight saving time automatically
- Supports users traveling across timezones
- Database-level timezone conversion
- Unambiguous storage (always UTC)

**Alternatives considered**:
- DATE only (no time component) (rejected: reminders need specific times)
- Store in user's local timezone (rejected: ambiguous during DST transitions)
- Separate date and timezone fields (rejected: timestamptz handles this better)

---

### Decision 6: Recurring Task Implementation Pattern

**What was chosen**: Recurrence rule stored as JSONB with fields: frequency (daily/weekly/monthly), interval, days_of_week, day_of_month, end_date, end_count. Next instance generated on completion via service layer.

**Why chosen**:
- Flexible: supports all common patterns (daily, weekly, monthly)
- Extensible: can add yearly, custom intervals later
- JSONB allows schema evolution without migrations
- Generation on completion ensures accurate next dates
- Handles edge cases (month 31st → next month's last day)

**Alternatives considered**:
- RRULE (iCalendar standard) (rejected: overkill, complex parsing)
- Separate recurrence configuration table (rejected: unnecessary normalization)
- Pre-generate all instances (rejected: infinite recurrences impossible, storage waste)

**Edge Case Resolution**: Monthly on 31st in February → Use "last day of month" logic via PostgreSQL DATE_TRUNC + INTERVAL arithmetic.

---

### Decision 7: Reminder Scheduling via Dapr Jobs API

**What was chosen**: Dapr Jobs API for scheduled reminder triggers. Each reminder creates a job with scheduled_time = reminder_time. Job callback triggers notification delivery.

**Why chosen**:
- Constitution mandate: "No polling for reminders; Dapr Jobs API MUST be used"
- No custom scheduler infrastructure needed
- Scales with Dapr sidecar
- Handles timezone conversions in job payload
- Automatic retry on failure
- Jobs persist across pod restarts

**Alternatives considered**:
- Polling database every minute (rejected: explicitly prohibited by constitution)
- Celery Beat / APScheduler (rejected: adds infrastructure, violates constitution)
- Kubernetes CronJobs (rejected: not fine-grained enough for per-reminder scheduling)
- Redis sorted sets (rejected: polling required, violates constitution)

---

### Decision 8: Real-Time Synchronization via Dapr Pub/Sub

**What was chosen**: All task actions publish events to Dapr Pub/Sub (pubsub.kafka topic: task-events). Frontend subscribes via WebSocket gateway. Services consume events for side effects (notifications, recurring).

**Why chosen**:
- Constitution mandate: "All task actions MUST publish events via Dapr Pub/Sub"
- Decouples services (publisher doesn't know consumers)
- Enables real-time sync across clients
- Kafka provides durability and replay capability
- Dapr abstraction allows Kafka replacement without code changes

**Alternatives considered**:
- WebSocket direct (rejected: tight coupling, no event persistence)
- Server-Sent Events (rejected: one-way, no event sourcing)
- Polling with last-modified timestamp (rejected: violates real-time requirement)
- Direct Kafka clients (rejected: constitution requires Dapr abstraction)

---

### Decision 9: Event Sourcing for Task Changes

**What was chosen**: TaskEvent model stores all changes (created, updated, completed, deleted) with before/after snapshots. Events published to Dapr Pub/Sub asynchronously.

**Why chosen**:
- Audit trail for all changes
- Enables event replay for debugging
- Supports real-time sync (events broadcast to clients)
- Constitution compliance: "All task actions MUST publish events"
- Enables conflict resolution (last-write-wins with timestamps)

**Alternatives considered**:
- No event logging (rejected: can't support real-time sync or audit)
- Synchronous event publishing (rejected: blocks API response)
- Only publish external events (rejected: need internal events for sync)

---

### Decision 10: Conflict Resolution Strategy

**What was chosen**: Optimistic locking with version field (INTEGER) on task model. Last-write-wins within 5-second window; reject with 409 Conflict if version mismatch, include both versions for client resolution.

**Why chosen**:
- Constitution compliance: "handle task conflicts when simultaneous edits occur"
- Optimistic locking fits low-conflict use case (users rarely edit same task twice simultaneously)
- Version field enables detection of concurrent modifications
- 409 response allows client to prompt user for resolution

**Alternatives considered**:
- Pessimistic locking (row-level locks) (rejected: poor UX, deadlocks)
- Last-write-wins silently (rejected: data loss risk)
- Manual merge (rejected: overkill for task management)

---

### Decision 11: Dapr Component Configuration

**What was chosen**: Dapr components defined as Kubernetes CRDs (Custom Resource Definitions) in Helm chart templates. Components: pubsub.kafka (Kafka-backed), statestore.postgresql (ephemeral state), jobs.api (reminder scheduling).

**Why chosen**:
- Constitution mandate: "All Dapr component definitions MUST be declarative YAML managed via Helm charts"
- CRDs are Kubernetes-native
- Helm manages lifecycle (install, upgrade, rollback)
- Components automatically discovered by Dapr sidecars
- Environment-specific overrides via values.yaml

**Alternatives considered**:
- Imperative component registration (rejected: violates "declarative config" principle)
- Manual kubectl apply (rejected: violates "no manual infrastructure" principle)
- ConfigMaps for components (rejected: Dapr requires CRDs)

---

### Decision 12: Kafka Deployment Strategy

**What was chosen**: Redpanda (Kafka-compatible) deployed via Helm chart as StatefulSet with 3 replicas for HA. Single-node configuration for Minikube, multi-node for cloud.

**Why chosen**:
- Constitution compliance: "Kafka MUST be deployed via Redpanda or Strimzi"
- Redpanda is lighter weight than Kafka (no Zookeeper dependency)
- Kafka protocol compatibility ensures Dapr Pub/Sub works unchanged
- StatefulSet ensures persistent storage across pod restarts
- Single-node for Minikube reduces resource requirements

**Alternatives considered**:
- Apache Kafka with Zookeeper (rejected: heavier, more complex)
- Strimzi Kafka operator (rejected: more complex than Redpanda for this use case)
- Managed Kafka (Confluent Cloud, etc.) (rejected: Minikube must work offline)

---

## Best Practices

### Database Indexing Strategy

**Finding**: Proper indexing critical for filter/sort performance.

**Recommended indexes**:
```sql
-- Priority and status filtering
CREATE INDEX idx_tasks_priority ON tasks(priority DESC);
CREATE INDEX idx_tasks_status ON tasks(status);

-- Tag filtering (junction table)
CREATE INDEX idx_task_tag_task_id ON task_tag(task_id);
CREATE INDEX idx_task_tag_tag_id ON task_tag(tag_id);

-- Due date sorting and filtering
CREATE INDEX idx_tasks_due_date ON tasks(due_date);

-- Full-text search
CREATE INDEX idx_tasks_search ON tasks USING GIN(to_tsvector('english', title || ' ' || description));

-- User isolation (all queries filtered by user_id)
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
```

---

### API Design Patterns

**Finding**: RESTful design with consistent patterns improves discoverability.

**Recommended patterns**:
- Collection resources: `GET /api/{user_id}/tasks`
- Item resources: `GET /api/{user_id}/tasks/{id}`
- Filtering: `GET /api/{user_id}/tasks?priority=high&tag=work&status=in_progress`
- Sorting: `GET /api/{user_id}/tasks?sort=due_date&order=asc`
- Search: `GET /api/{user_id}/tasks/search?q=groceries`
- Bulk operations: `POST /api/{user_id}/tasks/bulk` (future)

---

### Event Schema Design

**Finding**: Consistent event schema enables generic handlers and replay.

**Recommended schema**:
```json
{
  "event_id": "uuid",
  "event_type": "task.created|task.updated|task.completed|task.deleted",
  "aggregate_id": "task-uuid",
  "aggregate_type": "task",
  "user_id": "user-uuid",
  "timestamp": "2026-02-18T12:00:00Z",
  "version": 1,
  "metadata": {
    "source": "api|chat|recurring-service",
    "correlation_id": "uuid"
  },
  "payload": {
    "before": { ... },  // null for created
    "after": { ... }    // null for deleted
  }
}
```

---

### Dapr Resiliency Configuration

**Finding**: Resiliency policies prevent cascading failures.

**Recommended configuration**:
```yaml
apiVersion: resiliency.dapr.io/v1alpha
kind: Resiliency
metadata:
  name: taskflow-resiliency
spec:
  policies:
    retries:
      retryForever:
        policy: exponential
        initialInterval: 1s
        maxInterval: 30s
        maxRetries: -1  # forever
    circuitBreakers:
      fastBreak:
        timeout: 30s
        trip: consecutiveFailures >= 5
    timeouts:
      fastTimeout: 5s
  targets:
    publishers:
      pubsub.kafka:
        retry: retryForever
        circuitBreaker: fastBreak
        timeout: fastTimeout
```

---

## Compliance Summary

| Constitution Principle | Implementation Approach | Status |
|------------------------|------------------------|--------|
| Security & Isolation | JWT auth, user-scoped tags, K8s namespaces | ✅ Compliant |
| Accuracy & State Integrity | SQLModel, idempotent consumers, DB as source of truth | ✅ Compliant |
| Reliability & Operational Readiness | Health checks, probes, resiliency policies, dead-letter queues | ✅ Compliant |
| Usability & Responsiveness | Responsive UI, chat integration, real-time sync | ✅ Compliant |
| Reproducibility & IaC | Dockerfiles, Helm charts, Dapr YAML, GitHub Actions | ✅ Compliant |
| Event-Driven Architecture | Dapr Pub/Sub, task events, event sourcing | ✅ Compliant |
| Dapr Integration | Pub/Sub, State Store, Jobs API, Service Invocation | ✅ Compliant |
| No Polling for Reminders | Dapr Jobs API for all scheduled operations | ✅ Compliant |
| Cloud Deployment | Helm charts with env overrides, Minikube first | ✅ Compliant |

---

## References

- Dapr Documentation: https://docs.dapr.io/
- Dapr Jobs API: https://docs.dapr.io/developing-applications/building-blocks/jobs/jobs-overview/
- Dapr Pub/Sub: https://docs.dapr.io/developing-applications/building-blocks/pubsub/
- Redpanda Documentation: https://docs.redpanda.com/
- PostgreSQL Full-Text Search: https://www.postgresql.org/docs/current/textsearch.html
- Optimistic Locking Pattern: https://martinfowler.com/eaaCatalog/optimisticOfflineLock.html
