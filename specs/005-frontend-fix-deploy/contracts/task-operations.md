# API Contract: Task Operations

**Date**: 2026-01-15 | **Feature**: 005-frontend-fix-deploy

## Overview

Frontend interacts with backend task CRUD endpoints. All requests require valid JWT token in Authorization header. Responses follow REST conventions with proper HTTP status codes.

---

## Endpoints

### 1. GET /tasks

**Purpose**: Fetch all tasks for the authenticated user.

**Frontend Call** (via React Query):
```typescript
const { data: tasks } = useQuery({
  queryKey: ["tasks"],
  queryFn: () => apiFetch<FrontendTask[]>("/tasks"),
});
```

**HTTP Request**:
```
GET /tasks/ HTTP/1.1
Host: api.example.com
Authorization: Bearer <JWT_TOKEN>
```

**HTTP Response (Success - 200 OK)**:
```json
[
  {
    "id": "task_123",
    "title": "Complete project report",
    "description": "Finish Q1 report and submit",
    "completed": false,
    "created_at": "2026-01-10T14:30:00Z",
    "updated_at": "2026-01-10T14:30:00Z"
  },
  {
    "id": "task_456",
    "title": "Review pull requests",
    "description": "",
    "completed": true,
    "created_at": "2026-01-09T10:00:00Z",
    "updated_at": "2026-01-15T16:45:00Z"
  }
]
```

**HTTP Response (No Tasks - 200 OK)**:
```json
[]
```

**HTTP Response (Unauthorized - 401 Unauthorized)**:
```json
{
  "detail": "Invalid or expired token"
}
```

**HTTP Response (Server Error - 500 Internal Server Error)**:
```json
{
  "detail": "Database error occurred"
}
```

**Frontend Handling**:
```typescript
const { data: tasks = [], isLoading, error } = useQuery<FrontendTask[]>({
  queryKey: ["tasks"],
  queryFn: () => apiFetch<FrontendTask[]>("/tasks"),
  onError: (err) => {
    if (err.status === 401) {
      // Handled by apiFetch middleware
    }
    showToast(`Failed to load tasks: ${err.message}`, "error");
  }
});

if (isLoading) return <Spinner />;
if (tasks.length === 0) return <EmptyState />;
return (
  <div>
    {tasks.map(task => (
      <TaskItem key={task.id} task={task} />
    ))}
  </div>
);
```

---

### 2. POST /tasks

**Purpose**: Create a new task for the authenticated user.

**Frontend Call** (via React Query mutation):
```typescript
const createTask = useMutation({
  mutationFn: (title: string) =>
    apiFetch("/tasks", {
      method: "POST",
      body: JSON.stringify({ title, description: "" }),
    }),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["tasks"] });
  },
});

// Usage
await createTask.mutateAsync("New task title");
```

**HTTP Request**:
```
POST /tasks/ HTTP/1.1
Host: api.example.com
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "title": "New task title",
  "description": "Optional description"
}
```

**HTTP Response (Success - 201 Created)**:
```json
{
  "id": "task_789",
  "title": "New task title",
  "description": "Optional description",
  "completed": false,
  "created_at": "2026-01-15T18:00:00Z",
  "updated_at": "2026-01-15T18:00:00Z"
}
```

**HTTP Response (Validation Error - 422 Unprocessable Entity)**:
```json
{
  "detail": [
    {
      "loc": ["body", "title"],
      "msg": "Title is required and cannot be empty",
      "type": "value_error"
    }
  ]
}
```

**HTTP Response (Unauthorized - 401 Unauthorized)**:
```json
{
  "detail": "Invalid or expired token"
}
```

**Frontend Handling**:
```typescript
const handleCreate = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!newTitle.trim()) return;

  try {
    await createTask.mutateAsync(newTitle);
    setNewTitle(""); // Clear input on success
    showToast("Task created successfully", "success");
  } catch (err: any) {
    if (err.status === 422) {
      showToast("Title is required", "error");
    } else if (err.status === 401) {
      // Handled by apiFetch middleware
    } else {
      showToast(`Failed to create task: ${err.message}`, "error");
    }
  }
};
```

---

### 3. PUT /tasks/{id}

**Purpose**: Update an existing task (title, description, or both).

**Frontend Call**:
```typescript
const updateTask = useMutation({
  mutationFn: ({ id, ...updates }: Partial<FrontendTask> & { id: string }) =>
    apiFetch(`/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    }),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["tasks"] });
  },
});

// Usage
await updateTask.mutateAsync({ id: "task_123", title: "Updated title" });
```

**HTTP Request**:
```
PUT /tasks/task_123 HTTP/1.1
Host: api.example.com
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "title": "Updated task title",
  "description": "Updated description"
}
```

**HTTP Response (Success - 200 OK)**:
```json
{
  "id": "task_123",
  "title": "Updated task title",
  "description": "Updated description",
  "completed": false,
  "created_at": "2026-01-10T14:30:00Z",
  "updated_at": "2026-01-15T18:15:00Z"
}
```

**HTTP Response (Not Found - 404 Not Found)**:
```json
{
  "detail": "Task not found"
}
```

**HTTP Response (Unauthorized - 401 Unauthorized)**:
```json
{
  "detail": "Invalid or expired token"
}
```

**Frontend Handling**:
```typescript
const handleEdit = async (id: string, newTitle: string) => {
  try {
    await updateTask.mutateAsync({ id, title: newTitle });
    showToast("Task updated", "success");
    setIsEditing(false);
  } catch (err: any) {
    if (err.status === 404) {
      showToast("Task no longer exists", "error");
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    } else if (err.status === 401) {
      // Handled by apiFetch
    } else {
      showToast(`Failed to update task: ${err.message}`, "error");
    }
  }
};
```

---

### 4. PATCH /tasks/{id}/toggle

**Purpose**: Toggle the completion status of a task.

**Frontend Call**:
```typescript
const toggleTask = useMutation({
  mutationFn: (id: string) =>
    apiFetch(`/tasks/${id}/toggle`, { method: "PATCH" }),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["tasks"] });
  },
});

// Usage
await toggleTask.mutateAsync("task_123");
```

**HTTP Request**:
```
PATCH /tasks/task_123/toggle HTTP/1.1
Host: api.example.com
Authorization: Bearer <JWT_TOKEN>

```

**Note**: Request body can be empty or contain `{}`.

**HTTP Response (Success - 200 OK)**:
```json
{
  "id": "task_123",
  "title": "Complete project report",
  "description": "Finish Q1 report and submit",
  "completed": true,
  "created_at": "2026-01-10T14:30:00Z",
  "updated_at": "2026-01-15T18:20:00Z"
}
```

**HTTP Response (Not Found - 404 Not Found)**:
```json
{
  "detail": "Task not found"
}
```

**Frontend Handling**:
```typescript
const handleToggle = async (id: string) => {
  try {
    await toggleTask.mutateAsync(id);
    // React Query cache invalidation updates UI automatically
    showToast("Task status updated", "success");
  } catch (err: any) {
    if (err.status === 404) {
      showToast("Task no longer exists", "error");
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    } else {
      showToast(`Failed to toggle task: ${err.message}`, "error");
    }
  }
};
```

---

### 5. DELETE /tasks/{id}

**Purpose**: Delete a task permanently.

**Frontend Call**:
```typescript
const deleteTask = useMutation({
  mutationFn: (id: string) =>
    apiFetch(`/tasks/${id}`, { method: "DELETE" }),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["tasks"] });
  },
});

// Usage
await deleteTask.mutateAsync("task_123");
```

**HTTP Request**:
```
DELETE /tasks/task_123 HTTP/1.1
Host: api.example.com
Authorization: Bearer <JWT_TOKEN>
```

**HTTP Response (Success - 204 No Content)**:
```
204 No Content

(empty body)
```

**Alternative Response (Success - 200 OK)**:
```json
{
  "success": true
}
```

**HTTP Response (Not Found - 404 Not Found)**:
```json
{
  "detail": "Task not found"
}
```

**HTTP Response (Unauthorized - 401 Unauthorized)**:
```json
{
  "detail": "Invalid or expired token"
}
```

**Frontend Handling**:
```typescript
// apiFetch must handle 204 No Content gracefully
export async function apiFetch<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    if (response.status === 401) {
      authClient.signOut();
      window.location.href = "/login";
    }
    throw new Error(await response.json());
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return null as any; // Return null for empty responses
  }

  return response.json();
}

// Component usage
const handleDelete = async (id: string) => {
  if (!confirm("Delete this task?")) return;

  try {
    await deleteTask.mutateAsync(id);
    showToast("Task deleted", "success");
    // React Query automatically refetches tasks
  } catch (err: any) {
    if (err.status === 404) {
      showToast("Task already deleted", "error");
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    } else {
      showToast(`Failed to delete task: ${err.message}`, "error");
    }
  }
};
```

---

## Authorization

### JWT Token Format

All endpoints require Authorization header with Bearer token:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Token Injection** (done by `apiFetch`):
```typescript
const session = authClient.getSession();
const token = session?.data?.token;
headers.set("Authorization", `Bearer ${token}`);
```

### Task Ownership

**Assumption**: Backend enforces user isolation at query level.

**Example (FastAPI)**:
```python
@router.get("/tasks")
async def get_tasks(current_user: User = Depends(get_current_user)):
    # Only return tasks owned by current_user
    return session.query(Task).filter(Task.owner_id == current_user.id).all()
```

**Frontend**: Trust backend isolation; no frontend-level filtering needed.

---

## Error Handling

### HTTP Status Code Mapping

| Status | Scenario | Frontend Action | Message |
|--------|----------|-----------------|---------|
| 200 | Operation succeeded | Update cache, show success | "Task created/updated" |
| 201 | Resource created | Update cache, show success | "Task created" |
| 204 | Delete succeeded (no content) | Update cache, show success | "Task deleted" |
| 400 | Bad request (malformed JSON) | Show generic error | "Invalid request" |
| 401 | Invalid/expired token | Redirect to login | (Handled by apiFetch) |
| 404 | Task not found | Refetch tasks, show error | "Task no longer exists" |
| 422 | Validation error (empty title) | Show field error | "Title is required" |
| 500 | Server error | Show generic error | "Server error. Try again." |
| Network | No internet / timeout | Show warning | "Connection lost" |

### Error Response Parsing

```typescript
const getTaskErrorMessage = (err: any): string => {
  const status = err?.status || err?.response?.status || 500;
  const detail = err?.detail || err?.response?.data?.detail || "";

  switch (status) {
    case 400:
      return "Invalid request. Please try again.";
    case 401:
      return "Your session expired. Please log in again."; // Handled by apiFetch
    case 404:
      return "Task not found. It may have been deleted.";
    case 422:
      return detail.includes("title") ? "Title is required" : "Invalid data";
    case 500:
      return "Server error. Please try again later.";
    default:
      return "An error occurred. Please try again.";
  }
};
```

---

## Request/Response Data Model

### Task Entity

```typescript
interface FrontendTask {
  id: string;                // UUID or unique ID
  title: string;             // Required, non-empty
  description?: string;      // Optional
  completed: boolean;        // Always present
  created_at: string;        // ISO 8601 timestamp
  updated_at: string;        // ISO 8601 timestamp
  // Note: owner_id not exposed to frontend (backend handles isolation)
}
```

### Create Request

```typescript
interface CreateTaskRequest {
  title: string;        // Required, must be non-empty
  description?: string; // Optional
}
```

### Update Request

```typescript
interface UpdateTaskRequest {
  title?: string;        // Optional, at least one field required
  description?: string;  // Optional
}
```

### Response Format

All success responses include the complete updated task object (not just ID).

---

## Loading States & UI Feedback

### Query Loading (Fetching tasks on mount)

```typescript
const { isLoading, isFetching } = useQuery({ ... });

// Show spinner while loading
if (isLoading) return <Spinner />;

// Show subtle indicator for background refetch
if (isFetching && !isLoading) return <SubtleSpinner />;
```

### Mutation Loading (Creating/updating/deleting)

```typescript
const createTask = useMutation({ ... });

<button
  type="submit"
  disabled={createTask.isPending}
>
  {createTask.isPending ? <Spinner /> : "Create"}
</button>
```

### Error States

```typescript
const { error } = useQuery({ ... });

if (error) {
  return <ErrorBanner message={getErrorMessage(error)} />;
}
```

---

## Caching & Invalidation Strategy

### Query Cache

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,           // Immediately stale after fetch
      gcTime: 5 * 60 * 1000,  // Keep in cache for 5 minutes
      retry: 3,               // Retry 3 times on failure
    },
  },
});
```

### Cache Invalidation

After any mutation succeeds, invalidate tasks query to refetch:

```typescript
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ["tasks"] });
  // Triggers automatic refetch from server
}
```

### Optimistic Updates (Optional Enhancement)

```typescript
useMutation({
  mutationFn: (updates) => apiFetch(`/tasks/${id}`, { method: "PUT", body: JSON.stringify(updates) }),
  onMutate: async (updates) => {
    // Cancel pending queries
    await queryClient.cancelQueries({ queryKey: ["tasks"] });

    // Snapshot previous data
    const previousTasks = queryClient.getQueryData(["tasks"]);

    // Optimistically update cache
    queryClient.setQueryData(["tasks"], (old: FrontendTask[]) =>
      old.map(t => t.id === id ? { ...t, ...updates } : t)
    );

    return { previousTasks };
  },
  onError: (err, newData, context) => {
    // Rollback on error
    if (context?.previousTasks) {
      queryClient.setQueryData(["tasks"], context.previousTasks);
    }
  },
  onSettled: () => {
    // Refetch to ensure consistency
    queryClient.invalidateQueries({ queryKey: ["tasks"] });
  },
});
```

---

## Testing Checklist

- [ ] GET /tasks returns all user's tasks
- [ ] GET /tasks on empty list returns []
- [ ] GET /tasks with 401 redirects to login
- [ ] POST /tasks with valid data creates task
- [ ] POST /tasks with empty title returns 422
- [ ] POST /tasks with 401 redirects to login
- [ ] PUT /tasks/{id} updates task
- [ ] PUT /tasks/{nonexistent} returns 404 error
- [ ] PATCH /tasks/{id}/toggle flips completed status
- [ ] DELETE /tasks/{id} removes task (returns 204)
- [ ] DELETE /tasks/{nonexistent} returns 404
- [ ] All mutations invalidate cache and refetch
- [ ] Error messages are user-friendly
- [ ] Loading states show spinners during operations
- [ ] Responses with 204 No Content don't crash JSON parser

---

**Next**: See `quickstart.md` for development environment setup.
