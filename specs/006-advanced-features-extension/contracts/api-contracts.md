# API Contracts: Advanced Features Extension

**Feature**: 006-advanced-features-extension  
**Date**: 2026-02-18  
**Version**: 1.0.0

---

## OpenAPI Specification (Excerpt)

### Tags Endpoints

#### GET /api/{user_id}/tags
**Description**: List all tags for the authenticated user  
**Authentication**: Bearer token required

**Parameters**:
- `user_id` (path, UUID): User identifier

**Response 200**:
```json
{
  "tags": [
    {
      "id": "uuid",
      "name": "work",
      "color": "#3B82F6",
      "task_count": 5,
      "created_at": "2026-02-18T12:00:00Z"
    }
  ]
}
```

---

#### POST /api/{user_id}/tags
**Description**: Create a new tag  
**Authentication**: Bearer token required

**Request Body**:
```json
{
  "name": "urgent",
  "color": "#EF4444"
}
```

**Response 201**:
```json
{
  "id": "uuid",
  "name": "urgent",
  "color": "#EF4444",
  "created_at": "2026-02-18T12:00:00Z"
}
```

**Response 409**: Tag with same name already exists

---

#### PUT /api/{user_id}/tags/{tag_id}
**Description**: Update a tag  
**Authentication**: Bearer token required

**Request Body**:
```json
{
  "name": "high-priority",
  "color": "#DC2626"
}
```

**Response 200**: Updated tag object  
**Response 404**: Tag not found  
**Response 409**: New name conflicts with existing tag

---

#### DELETE /api/{user_id}/tags/{tag_id}
**Description**: Delete a tag (cascade removes from all tasks)  
**Authentication**: Bearer token required

**Response 204**: Tag deleted successfully  
**Response 404**: Tag not found

---

### Task Endpoints (Extended)

#### GET /api/{user_id}/tasks
**Description**: List tasks with filtering, sorting, and pagination  
**Authentication**: Bearer token required

**Query Parameters**:
- `priority` (optional, integer): Filter by priority (1-4)
- `status` (optional, string): Filter by status (pending, in_progress, completed)
- `tag` (optional, string): Filter by tag name
- `due_date_from` (optional, ISO 8601): Filter tasks due on or after this date
- `due_date_to` (optional, ISO 8601): Filter tasks due on or before this date
- `sort` (optional, string): Sort field (priority, due_date, created_at, title)
- `order` (optional, string): Sort order (asc, desc)
- `limit` (optional, integer): Page size (default: 20, max: 100)
- `offset` (optional, integer): Page offset (default: 0)

**Response 200**:
```json
{
  "tasks": [
    {
      "id": "uuid",
      "title": "Complete report",
      "description": "Q4 financial report",
      "status": "in_progress",
      "priority": 3,
      "priority_label": "HIGH",
      "due_date": "2026-02-20T17:00:00Z",
      "is_overdue": false,
      "tags": ["work", "urgent"],
      "recurrence_rule": null,
      "created_at": "2026-02-15T10:00:00Z",
      "updated_at": "2026-02-18T14:30:00Z"
    }
  ],
  "total": 45,
  "limit": 20,
  "offset": 0
}
```

---

#### POST /api/{user_id}/tasks
**Description**: Create a new task with advanced features  
**Authentication**: Bearer token required

**Request Body**:
```json
{
  "title": "Weekly team meeting",
  "description": "Review sprint progress",
  "priority": 2,
  "due_date": "2026-02-22T14:00:00Z",
  "tags": ["work", "meeting"],
  "recurrence_rule": {
    "frequency": "weekly",
    "interval": 1,
    "days_of_week": [1]
  }
}
```

**Response 201**:
```json
{
  "id": "uuid",
  "title": "Weekly team meeting",
  "status": "pending",
  "priority": 2,
  "due_date": "2026-02-22T14:00:00Z",
  "tags": ["work", "meeting"],
  "recurrence_rule": {
    "frequency": "weekly",
    "interval": 1,
    "days_of_week": [1]
  },
  "created_at": "2026-02-18T12:00:00Z"
}
```

---

#### PUT /api/{user_id}/tasks/{task_id}
**Description**: Update a task with optimistic locking  
**Authentication**: Bearer token required

**Request Body**:
```json
{
  "title": "Updated title",
  "priority": 4,
  "due_date": "2026-02-25T10:00:00Z",
  "tags": ["work", "critical"],
  "version": 1
}
```

**Response 200**: Updated task object  
**Response 404**: Task not found  
**Response 409**: Version mismatch (conflict)
```json
{
  "error": "conflict",
  "message": "Task was modified by another request",
  "current_version": 2,
  "expected_version": 1,
  "current_task": { ... }
}
```

---

### Search Endpoint

#### GET /api/{user_id}/tasks/search
**Description**: Full-text search across tasks  
**Authentication**: Bearer token required

**Query Parameters**:
- `q` (required, string): Search query (min 3 characters)
- `limit` (optional, integer): Result limit (default: 20)

**Response 200**:
```json
{
  "query": "quarterly report",
  "results": [
    {
      "id": "uuid",
      "title": "Q4 Financial Report",
      "description": "Prepare quarterly financial summary",
      "priority": 3,
      "due_date": "2026-02-28T17:00:00Z",
      "tags": ["work", "finance"],
      "rank": 0.95
    }
  ],
  "total": 3
}
```

**Response 400**: Query too short or invalid

---

### Reminders Endpoints

#### GET /api/{user_id}/tasks/{task_id}/reminders
**Description**: List reminders for a task  
**Authentication**: Bearer token required

**Response 200**:
```json
{
  "reminders": [
    {
      "id": "uuid",
      "trigger_time": "2026-02-20T09:00:00Z",
      "delivered": false,
      "created_at": "2026-02-18T12:00:00Z"
    }
  ]
}
```

---

#### POST /api/{user_id}/tasks/{task_id}/reminders
**Description**: Create a reminder for a task  
**Authentication**: Bearer token required

**Request Body**:
```json
{
  "trigger_time": "2026-02-20T09:00:00Z"
}
```

**Response 201**:
```json
{
  "id": "uuid",
  "trigger_time": "2026-02-20T09:00:00Z",
  "delivered": false,
  "created_at": "2026-02-18T12:00:00Z"
}
```

**Response 400**: Trigger time in the past

---

#### DELETE /api/{user_id}/reminders/{reminder_id}
**Description**: Cancel a reminder  
**Authentication**: Bearer token required

**Response 204**: Reminder cancelled  
**Response 404**: Reminder not found

---

## Error Response Schema

All endpoints return errors in this format:

```json
{
  "error": "error_code",
  "message": "Human-readable message",
  "details": {
    "field": "reason"
  }
}
```

### Standard Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `unauthorized` | 401 | Missing or invalid JWT |
| `forbidden` | 403 | User doesn't own this resource |
| `not_found` | 404 | Resource doesn't exist |
| `validation_error` | 400 | Request validation failed |
| `conflict` | 409 | Version mismatch or duplicate |
| `server_error` | 500 | Internal server error |

---

## Event Schema (Dapr Pub/Sub)

### Task Events

All task actions publish events to `task-events` topic.

#### task.created
```json
{
  "event_id": "uuid",
  "event_type": "task.created",
  "aggregate_id": "task-uuid",
  "user_id": "user-uuid",
  "timestamp": "2026-02-18T12:00:00Z",
  "version": 1,
  "payload": {
    "after": {
      "id": "task-uuid",
      "title": "Task title",
      "priority": 2,
      "due_date": "2026-02-20T17:00:00Z"
    }
  }
}
```

#### task.updated
```json
{
  "event_id": "uuid",
  "event_type": "task.updated",
  "aggregate_id": "task-uuid",
  "user_id": "user-uuid",
  "timestamp": "2026-02-18T12:00:00Z",
  "version": 2,
  "payload": {
    "before": { "priority": 2, "due_date": null },
    "after": { "priority": 3, "due_date": "2026-02-20T17:00:00Z" },
    "changed_fields": ["priority", "due_date"]
  }
}
```

#### task.completed
```json
{
  "event_id": "uuid",
  "event_type": "task.completed",
  "aggregate_id": "task-uuid",
  "user_id": "user-uuid",
  "timestamp": "2026-02-18T12:00:00Z",
  "version": 3,
  "payload": {
    "before": { "status": "in_progress" },
    "after": { "status": "completed" }
  }
}
```

#### task.recurring_instance_created
```json
{
  "event_id": "uuid",
  "event_type": "task.recurring_instance_created",
  "aggregate_id": "new-task-uuid",
  "user_id": "user-uuid",
  "timestamp": "2026-02-18T12:00:00Z",
  "version": 1,
  "payload": {
    "after": {
      "id": "new-task-uuid",
      "title": "Weekly meeting",
      "recurrence_rule": { "frequency": "weekly" },
      "parent_task_id": "original-task-uuid"
    }
  }
}
```

---

## MCP Tool Extensions

### Existing Tools (Extended)

#### add_task (Extended)
**Input**:
```json
{
  "user_id": "uuid",
  "title": "Task title",
  "description": "Optional description",
  "priority": "high",
  "due_date": "2026-02-20",
  "tags": ["work", "urgent"],
  "recurrence": "weekly on Mondays"
}
```

#### list_tasks (Extended)
**Input**:
```json
{
  "user_id": "uuid",
  "filters": {
    "priority": "high",
    "tag": "work",
    "status": "pending",
    "due_before": "2026-02-28"
  },
  "sort": "due_date",
  "order": "asc"
}
```

### New MCP Tools

#### add_tag
**Input**:
```json
{
  "user_id": "uuid",
  "name": "work",
  "color": "#3B82F6"
}
```

#### set_reminder
**Input**:
```json
{
  "user_id": "uuid",
  "task_id": "uuid",
  "trigger_time": "2026-02-20T09:00:00Z"
}
```

---

## Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| POST /tasks | 100 | 1 minute |
| POST /reminders | 50 | 1 minute |
| GET /tasks/search | 30 | 1 minute |
| All other endpoints | 200 | 1 minute |

**Headers**:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1645180800
```

**Response 429** (Too Many Requests):
```json
{
  "error": "rate_limit_exceeded",
  "message": "Too many requests",
  "retry_after": 60
}
```
