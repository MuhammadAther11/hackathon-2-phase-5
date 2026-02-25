# API Contracts Reference

**Branch**: `001-phase5-ui-ux-redesign` | **Date**: 2026-02-21

## Purpose

This document references existing API contracts from Phase V that the UI/UX redesign will consume. No new API endpoints are required for this feature; all UI changes consume existing Phase-V APIs.

---

## Existing API Contracts (Phase V)

The following API contracts from Phase V are used by the Phase 5 UI/UX redesign:

### Task Management APIs

**Location**: `specs/006-advanced-features-extension/contracts/api-contracts.md`

| Endpoint | Method | Description | UI Component |
|----------|--------|-------------|--------------|
| `/api/{user_id}/tasks` | GET | List tasks with filters | TaskList, FilterPanel |
| `/api/{user_id}/tasks` | POST | Create task | TaskForm |
| `/api/{user_id}/tasks/{task_id}` | GET | Get task details | TaskItem, TaskForm |
| `/api/{user_id}/tasks/{task_id}` | PUT | Update task | TaskForm |
| `/api/{user_id}/tasks/{task_id}` | DELETE | Delete task | TaskItem actions |
| `/api/{user_id}/tasks/{task_id}/toggle` | POST | Toggle task status | TaskItem checkbox |

### Search & Filter APIs

| Endpoint | Method | Description | UI Component |
|----------|--------|-------------|--------------|
| `/api/{user_id}/tasks/search?q=...` | GET | Full-text search | SearchBar |

### Tag Management APIs

| Endpoint | Method | Description | UI Component |
|----------|--------|-------------|--------------|
| `/api/{user_id}/tags` | GET | List user tags | TagSelector, FilterPanel |
| `/api/{user_id}/tags` | POST | Create tag | TagSelector |
| `/api/{user_id}/tags/{tag_id}` | PUT | Update tag | TagSelector |
| `/api/{user_id}/tags/{tag_id}` | DELETE | Delete tag | TagSelector |

### Reminder APIs

| Endpoint | Method | Description | UI Component |
|----------|--------|-------------|--------------|
| `/api/{user_id}/tasks/{task_id}/reminders` | GET | List reminders | ReminderSettings |
| `/api/{user_id}/tasks/{task_id}/reminders` | POST | Create reminder | ReminderSettings |
| `/api/{user_id}/reminders/{reminder_id}` | DELETE | Cancel reminder | ReminderSettings |

### Authentication APIs

| Endpoint | Method | Description | UI Component |
|----------|--------|-------------|--------------|
| `/api/auth/signup` | POST | User registration | SignupForm |
| `/api/auth/login` | POST | User login | LoginForm |
| `/api/auth/logout` | POST | User logout | Header user menu |
| `/api/auth/me` | GET | Get current user | Header, Dashboard |

---

## API Usage Examples

### List Tasks with Filters

```typescript
// GET /api/{user_id}/tasks?priority=high&priority=critical&status=pending&tags=work
const response = await fetch(`/api/${userId}/tasks?priority=high&priority=critical&status=pending&tags=work`, {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
})
const tasks: Task[] = await response.json()
```

### Create Task

```typescript
// POST /api/{user_id}/tasks
const response = await fetch(`/api/${userId}/tasks`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    title: 'New Task',
    description: 'Task description',
    priority: 'high',
    due_date: '2026-02-28',
    tags: ['work', 'urgent'],
    recurrence_rule: {
      frequency: 'weekly',
      interval: 1,
    },
  }),
})
const task: Task = await response.json()
```

### Search Tasks

```typescript
// GET /api/{user_id}/tasks/search?q=meeting
const response = await fetch(`/api/${userId}/tasks/search?q=${encodeURIComponent('meeting')}`, {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
})
const results: Task[] = await response.json()
```

---

## WebSocket Events (Real-Time Sync)

**Location**: `specs/006-advanced-features-extension/contracts/api-contracts.md`

The UI subscribes to the following WebSocket events for real-time synchronization:

| Event | Payload | UI Action |
|-------|---------|-----------|
| `task.created` | Task | Add to task list |
| `task.updated` | Task | Update in task list |
| `task.deleted` | { taskId: string } | Remove from task list |
| `task.completed` | { taskId: string } | Mark as completed |
| `task.recurring_instance_created` | Task | Add new instance to list |

### WebSocket Connection

```typescript
const ws = new WebSocket(`${NEXT_PUBLIC_WS_URL}?token=${token}`)

ws.onmessage = (event) => {
  const message = JSON.parse(event.data)
  
  switch (message.type) {
    case 'task.created':
      queryClient.setQueryData(['tasks', 'list'], (old: Task[]) => [message.payload, ...old])
      break
    case 'task.updated':
      queryClient.setQueryData(['tasks', 'list'], (old: Task[]) =>
        old.map((task) => (task.id === message.payload.id ? message.payload : task))
      )
      break
    case 'task.deleted':
      queryClient.setQueryData(['tasks', 'list'], (old: Task[]) =>
        old.filter((task) => task.id !== message.payload.taskId)
      )
      break
  }
}
```

---

## Response Formats

### Task Response

```json
{
  "id": "task-123",
  "user_id": "user-456",
  "title": "Complete project",
  "description": "Finish the Phase 5 UI/UX redesign",
  "status": "pending",
  "priority": "high",
  "due_date": "2026-02-28T00:00:00Z",
  "recurrence_rule": {
    "frequency": "weekly",
    "interval": 1,
    "end_date": null
  },
  "tags": [
    { "id": "tag-1", "name": "work", "color": "#3B82F6" },
    { "id": "tag-2", "name": "urgent", "color": "#EF4444" }
  ],
  "version": 1,
  "created_at": "2026-02-21T09:00:00Z",
  "updated_at": "2026-02-21T09:00:00Z"
}
```

### Error Response

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Title is required",
    "details": [
      {
        "field": "title",
        "message": "Title is required"
      }
    ]
  }
}
```

---

## Rate Limiting

| Tier | Requests/minute | Headers |
|------|-----------------|---------|
| Default | 100 | `X-RateLimit-Limit: 100` |
| Authenticated | 500 | `X-RateLimit-Remaining: 499` |

When rate limited:
```json
{
  "error": {
    "code": "RATE_LIMITED",
    "message": "Too many requests",
    "retry_after": 60
  }
}
```

---

## Notes

- All API endpoints require JWT authentication via `Authorization: Bearer <token>` header
- Unauthorized requests return `401 Unauthorized`
- The UI/UX redesign does not introduce new API endpoints
- All Phase-V API contracts remain unchanged and fully compatible
