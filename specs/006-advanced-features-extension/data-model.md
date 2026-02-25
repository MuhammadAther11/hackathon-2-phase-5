# Data Model: Advanced Features Extension

**Feature**: 006-advanced-features-extension  
**Date**: 2026-02-18  
**Source**: [spec.md](./spec.md) + [research.md](./research.md)

---

## Entity Relationship Diagram

```
┌─────────────────┐
│     User        │
│─────────────────│
│ id (PK)         │
│ email           │
│ password_hash   │
│ created_at      │
└────────┬────────┘
         │
         │ 1:N
         │
         ▼
┌─────────────────┐       ┌───────────────────┐
│     Task        │───────│   TaskTag         │
│─────────────────│  N:N  │───────────────────│
│ id (PK)         │       │ id (PK)           │
│ user_id (FK)    │       │ task_id (FK)      │
│ title           │       │ tag_id (FK)       │
│ description     │       │ created_at        │
│ status          │       └─────────┬─────────┘
│ priority        │                 │
│ due_date        │                 │ 1:N
│ recurrence_rule │                 │
│ created_at      │                 ▼
│ updated_at      │       ┌───────────────────┐
│ version         │       │      Tag          │
└────────┬────────┘       │───────────────────│
         │                │ id (PK)           │
         │ 1:N            │ user_id (FK)      │
         │                │ name              │
         ▼                │ color             │
┌─────────────────┐       │ created_at        │
│    Reminder     │       └───────────────────┘
│─────────────────│
│ id (PK)         │
│ task_id (FK)    │
│ trigger_time    │
│ delivered       │
│ created_at      │
└─────────────────┘

┌─────────────────┐
│    TaskEvent    │
│─────────────────│
│ id (PK)         │
│ event_type      │
│ aggregate_id    │
│ user_id (FK)    │
│ version         │
│ payload         │
│ timestamp       │
└─────────────────┘
```

---

## Entity Definitions

### User (Existing - No Changes)

**Purpose**: System user with authenticated session  
**Table**: `user`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, NOT NULL | Unique user identifier |
| email | VARCHAR(255) | UNIQUE, NOT NULL | User email for authentication |
| password_hash | VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Account creation timestamp |

**Relationships**: 
- 1:N Tasks (user_id foreign key)
- 1:N Tags (user_id foreign key)

---

### Task (Extended)

**Purpose**: Core work item with advanced features  
**Table**: `task`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, NOT NULL | Unique task identifier |
| user_id | UUID | FK → user.id, NOT NULL | Task owner (user isolation) |
| title | VARCHAR(500) | NOT NULL | Task title |
| description | TEXT | NULLABLE | Detailed description |
| status | VARCHAR(20) | CHECK (in_progress, completed, pending), NOT NULL | Current task state |
| priority | INTEGER | CHECK (1-4), DEFAULT 2 | 1=LOW, 2=MEDIUM, 3=HIGH, 4=CRITICAL |
| due_date | TIMESTAMP WITH TIMEZONE | NULLABLE | Deadline in UTC |
| recurrence_rule | JSONB | NULLABLE | Recurrence configuration |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation timestamp (UTC) |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update timestamp (UTC) |
| version | INTEGER | NOT NULL, DEFAULT 1 | Optimistic locking version |

**Recurrence Rule JSONB Schema**:
```json
{
  "frequency": "daily|weekly|monthly",
  "interval": 1,              // Every N days/weeks/months
  "days_of_week": [1, 3, 5],  // Optional: Mon, Wed, Fri (1=Monday)
  "day_of_month": 31,         // Optional: Day of month (1-31)
  "end_date": "2026-12-31",   // Optional: Stop recurring after
  "end_count": 10             // Optional: Stop after N occurrences
}
```

**Relationships**:
- N:1 User (user_id)
- N:M Tag (via task_tag junction)
- 1:N Reminder (task_id)
- 1:N TaskEvent (aggregate_id)

**Indexes**:
```sql
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_priority ON tasks(priority DESC);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_updated_at ON tasks(updated_at DESC);
CREATE INDEX idx_tasks_search ON tasks USING GIN(to_tsvector('english', title || ' ' || description));
```

**Validation Rules**:
- User isolation: All queries MUST filter by user_id
- Priority: CHECK (priority BETWEEN 1 AND 4)
- Status: CHECK (status IN ('pending', 'in_progress', 'completed'))
- Version: MUST increment on every update (optimistic locking)

---

### Tag (New)

**Purpose**: User-defined categorization labels  
**Table**: `tag`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, NOT NULL | Unique tag identifier |
| user_id | UUID | FK → user.id, NOT NULL | Tag owner (user isolation) |
| name | VARCHAR(50) | NOT NULL | Tag name (e.g., "work", "urgent") |
| color | VARCHAR(7) | DEFAULT '#6B7280' | Hex color for UI (e.g., #EF4444) |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation timestamp |

**Relationships**:
- N:1 User (user_id)
- N:M Task (via task_tag)

**Indexes**:
```sql
CREATE INDEX idx_tags_user_id ON tags(user_id);
CREATE INDEX idx_tags_name ON tags(user_id, name);  // Composite for user tag lookup
```

**Validation Rules**:
- User isolation: Tags visible only to owner
- Unique names per user: UNIQUE (user_id, name)
- Color format: CHECK (color ~ '^#[0-9A-Fa-f]{6}$')

---

### TaskTag (Junction Table)

**Purpose**: Many-to-many relationship between tasks and tags  
**Table**: `task_tag`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, NOT NULL | Unique junction identifier |
| task_id | UUID | FK → task.id, NOT NULL | Task reference |
| tag_id | UUID | FK → tag.id, NOT NULL | Tag reference |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Association timestamp |

**Relationships**:
- N:1 Task (task_id)
- N:1 Tag (tag_id)

**Indexes**:
```sql
CREATE UNIQUE INDEX idx_task_tag_unique ON task_tag(task_id, tag_id);  -- Prevent duplicates
CREATE INDEX idx_task_tag_task_id ON task_tag(task_id);
CREATE INDEX idx_task_tag_tag_id ON task_tag(tag_id);
```

**Validation Rules**:
- Unique pairs: UNIQUE (task_id, tag_id) prevents duplicate associations
- Cascade delete: ON DELETE CASCADE when task or tag deleted

---

### Reminder (New)

**Purpose**: Scheduled notifications for tasks  
**Table**: `reminder`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, NOT NULL | Unique reminder identifier |
| task_id | UUID | FK → task.id, NOT NULL | Associated task |
| trigger_time | TIMESTAMP WITH TIMEZONE | NOT NULL | When to trigger (UTC) |
| delivered | BOOLEAN | DEFAULT FALSE | Delivery status |
| delivered_at | TIMESTAMP | NULLABLE | Actual delivery timestamp |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation timestamp |

**Relationships**:
- N:1 Task (task_id)

**Indexes**:
```sql
CREATE INDEX idx_reminders_task_id ON reminders(task_id);
CREATE INDEX idx_reminders_trigger_time ON reminders(trigger_time) WHERE delivered = FALSE;
```

**Validation Rules**:
- Trigger time must be in future: CHECK (trigger_time > NOW())
- One-time reminders only (recurring reminders generated from recurrence rule)

---

### TaskEvent (New)

**Purpose**: Event sourcing for audit trail and real-time sync  
**Table**: `task_event`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, NOT NULL | Unique event identifier |
| event_type | VARCHAR(50) | NOT NULL | task.created, task.updated, task.completed, task.deleted |
| aggregate_id | UUID | NOT NULL | Task ID (aggregate root) |
| user_id | UUID | FK → user.id, NOT NULL | User who triggered event |
| version | INTEGER | NOT NULL | Task version at time of event |
| payload | JSONB | NOT NULL | Before/after snapshots |
| timestamp | TIMESTAMP | NOT NULL, DEFAULT NOW() | Event timestamp (UTC) |
| correlation_id | UUID | NULLABLE | Groups related events |

**Payload JSONB Schema**:
```json
{
  "before": { ... },  // Null for task.created
  "after": { ... },   // Null for task.deleted
  "changed_fields": ["title", "priority"]
}
```

**Relationships**:
- N:1 User (user_id)

**Indexes**:
```sql
CREATE INDEX idx_task_events_aggregate ON task_events(aggregate_id, version);
CREATE INDEX idx_task_events_timestamp ON task_events(timestamp DESC);
CREATE INDEX idx_task_events_user ON task_events(user_id);
```

**Validation Rules**:
- Immutable: Events are append-only (no UPDATE/DELETE)
- Ordering: version MUST be sequential per aggregate_id

---

## State Transitions

### Task Status Lifecycle

```
┌─────────────┐
│   PENDING   │
└──────┬──────┘
       │
       │ user starts
       │
       ▼
┌─────────────┐     ┌─────────────┐
│ IN_PROGRESS │────▶│  COMPLETED  │
└─────────────┘     └─────────────┘
       │                   │
       │ user reopens      │ user reopens
       │                   │
       └───────────────────┘
```

**Transition Rules**:
- PENDING → IN_PROGRESS: Allowed
- IN_PROGRESS → COMPLETED: Allowed (triggers recurring task generation if applicable)
- COMPLETED → IN_PROGRESS: Allowed (reopens task)
- Any → DELETED: Allowed (soft delete or hard delete based on policy)

### Recurring Task Generation Flow

```
1. Task marked COMPLETED
2. Check recurrence_rule exists
3. If exists:
   - Calculate next occurrence date
   - Create new task instance with:
     * Same title, description, priority, tags
     * New due_date = calculated next date
     * Same recurrence_rule
     * status = PENDING
   - Publish event: task.recurring_instance_created
```

---

## Database Migrations

### Migration 001: Add Priority to Task

```sql
ALTER TABLE task 
ADD COLUMN priority INTEGER DEFAULT 2 NOT NULL,
ADD CONSTRAINT chk_task_priority CHECK (priority BETWEEN 1 AND 4);

CREATE INDEX idx_tasks_priority ON tasks(priority DESC);
```

### Migration 002: Add Due Date to Task

```sql
ALTER TABLE task 
ADD COLUMN due_date TIMESTAMP WITH TIMEZONE NULLABLE;

CREATE INDEX idx_tasks_due_date ON tasks(due_date);
```

### Migration 003: Add Recurrence Rule to Task

```sql
ALTER TABLE task 
ADD COLUMN recurrence_rule JSONB NULLABLE;
```

### Migration 004: Create Tag Tables

```sql
CREATE TABLE tag (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    color VARCHAR(7) DEFAULT '#6B7280',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, name),
    CHECK (color ~ '^#[0-9A-Fa-f]{6}$')
);

CREATE TABLE task_tag (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES task(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tag(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (task_id, tag_id)
);

CREATE INDEX idx_tags_user_id ON tags(user_id);
CREATE INDEX idx_tags_name ON tags(user_id, name);
CREATE INDEX idx_task_tag_task_id ON task_tag(task_id);
CREATE INDEX idx_task_tag_tag_id ON task_tag(tag_id);
```

### Migration 005: Create Reminder Table

```sql
CREATE TABLE reminder (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES task(id) ON DELETE CASCADE,
    trigger_time TIMESTAMP WITH TIMEZONE NOT NULL,
    delivered BOOLEAN DEFAULT FALSE,
    delivered_at TIMESTAMP NULLABLE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CHECK (trigger_time > NOW())
);

CREATE INDEX idx_reminders_task_id ON reminders(task_id);
CREATE INDEX idx_reminders_trigger_time ON reminders(trigger_time) WHERE delivered = FALSE;
```

### Migration 006: Create TaskEvent Table

```sql
CREATE TABLE task_event (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(50) NOT NULL,
    aggregate_id UUID NOT NULL,
    user_id UUID NOT NULL REFERENCES "user"(id),
    version INTEGER NOT NULL,
    payload JSONB NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
    correlation_id UUID NULLABLE
);

CREATE INDEX idx_task_events_aggregate ON task_events(aggregate_id, version);
CREATE INDEX idx_task_events_timestamp ON task_events(timestamp DESC);
CREATE INDEX idx_task_events_user ON task_events(user_id);
```

### Migration 007: Add Version for Optimistic Locking

```sql
ALTER TABLE task 
ADD COLUMN version INTEGER DEFAULT 1 NOT NULL,
ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT NOW();

CREATE INDEX idx_tasks_updated_at ON tasks(updated_at DESC);
```

### Migration 008: Add Full-Text Search Index

```sql
CREATE INDEX idx_tasks_search ON tasks 
USING GIN(to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(description, '')));
```

---

## Query Patterns

### Get Tasks with Filters

```sql
SELECT t.*, array_agg(tag.name) as tags
FROM task t
LEFT JOIN task_tag tt ON t.id = tt.task_id
LEFT JOIN tag ON tt.tag_id = tag.id
WHERE t.user_id = :user_id
  AND (:priority IS NULL OR t.priority = :priority)
  AND (:status IS NULL OR t.status = :status)
  AND (:tag IS NULL OR tag.name = :tag)
  AND (:due_date_from IS NULL OR t.due_date >= :due_date_from)
  AND (:due_date_to IS NULL OR t.due_date <= :due_date_to)
GROUP BY t.id
ORDER BY 
  CASE WHEN :sort = 'priority' THEN t.priority END DESC,
  CASE WHEN :sort = 'due_date' THEN t.due_date END ASC,
  CASE WHEN :sort = 'created_at' THEN t.created_at END DESC,
  CASE WHEN :sort = 'title' THEN t.title END ASC
LIMIT :limit OFFSET :offset;
```

### Search Tasks

```sql
SELECT t.*, ts_rank(to_tsvector('english', title || ' ' || description), query) as rank
FROM task t, to_tsquery('english', :search_query) query
WHERE t.user_id = :user_id
  AND to_tsvector('english', title || ' ' || description) @@ query
ORDER BY rank DESC
LIMIT 20;
```

### Get Overdue Tasks

```sql
SELECT * FROM task
WHERE user_id = :user_id
  AND status != 'completed'
  AND due_date < NOW()
ORDER BY due_date ASC;
```

### Get Pending Reminders

```sql
SELECT r.*, t.title as task_title
FROM reminder r
JOIN task t ON r.task_id = t.id
WHERE r.delivered = FALSE
  AND r.trigger_time <= NOW()
ORDER BY r.trigger_time ASC;
```

---

## Validation Rules Summary

| Entity | Rule | Enforcement |
|--------|------|-------------|
| Task | User isolation | WHERE user_id = :current_user |
| Task | Priority range | CHECK (priority BETWEEN 1 AND 4) |
| Task | Status values | CHECK (status IN (...)) |
| Task | Optimistic locking | version = :expected_version in UPDATE |
| Tag | Unique per user | UNIQUE (user_id, name) |
| Tag | Color format | CHECK (color ~ '^#...$') |
| TaskTag | No duplicates | UNIQUE (task_id, tag_id) |
| Reminder | Future trigger | CHECK (trigger_time > NOW()) |
| TaskEvent | Immutable | No UPDATE/DELETE permissions |
