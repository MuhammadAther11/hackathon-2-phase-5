# Data Model: Frontend State & Component Architecture

**Date**: 2026-01-15 | **Feature**: 005-frontend-fix-deploy

## Overview

Frontend state is managed through three layers:
1. **Auth State** (Better Auth client) → localStorage + cookie
2. **Task State** (React Query) → server-backed cache
3. **UI State** (React component local state) → loading, errors, form inputs

---

## Component Hierarchy

```
RootLayout (app/layout.tsx)
  └─ Server Component boundary (providers added here)
     │
     ├─ QueryClientProvider (React Query cache)
     │
     ├─ ToastProvider (Toast context)
     │
     ├─ Navbar (Client) — user info, logout
     │
     └─ Page (route-specific)
         │
         ├─ HomePage (/) — Landing page
         │   ├─ CTA button: "Login"
         │   └─ CTA button: "Signup"
         │
         ├─ LoginPage (/login) — Auth form
         │   └─ AuthForm (type="login")
         │       ├─ Input: email (controlled)
         │       ├─ Input: password (controlled)
         │       ├─ Button: submit
         │       └─ Error message (state)
         │
         ├─ SignupPage (/signup) — Auth form
         │   └─ AuthForm (type="signup")
         │       ├─ Input: name (controlled)
         │       ├─ Input: email (controlled)
         │       ├─ Input: password (controlled)
         │       ├─ Button: submit
         │       └─ Error message (state)
         │
         └─ DashboardPage (/dashboard) — Protected route
             ├─ Middleware: Redirects to /login if no auth_token cookie
             │
             └─ TaskDashboard (Client)
                 ├─ Input: newTitle (controlled state)
                 ├─ Button: Create task
                 │
                 └─ TaskList
                     └─ TaskItem × N (Client) — per-task operations
                         ├─ Checkbox: toggle (calls useMutation)
                         ├─ Button: edit (modal or inline)
                         ├─ Button: delete (calls useMutation)
                         └─ Status: loading/error feedback
```

---

## State Management Patterns

### 1. Auth State (Better Auth)

**Storage**: localStorage (persisted across reloads)

**Key**:
```typescript
// In localStorage:
localStorage.getItem("auth.session") // Better Auth session JSON
```

**Flow**:
```
User submits LoginForm
  → AuthForm calls signIn.email({ email, password })
  → Better Auth makes API call to backend
  → Backend returns JWT token
  → Better Auth stores token in localStorage
  → Browser needs to sync to cookie for middleware
  → Redirect to /dashboard
  → Middleware checks auth_token cookie → allows access
```

**Data Shape**:
```typescript
interface AuthSession {
  user: {
    id: string;
    email: string;
    name: string;
  };
  token?: string; // JWT token
  expiresAt?: number; // Timestamp
}
```

**Component Access**:
```typescript
const { data: session, isLoading } = useSession(); // Better Auth hook
// or
const session = authClient.getSession(); // Direct access
```

---

### 2. Task State (React Query)

**Cache Key**: `["tasks"]`

**Query**:
```typescript
const { data: tasks = [], isLoading, error } = useQuery<FrontendTask[]>({
  queryKey: ["tasks"],
  queryFn: () => apiFetch<FrontendTask[]>("/tasks"),
  // Stale time: default (immediately considered stale)
  // Retry: 3 times on failure
});
```

**Data Shape**:
```typescript
interface FrontendTask {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
}
```

**Mutations**:

**Create**:
```typescript
useMutation({
  mutationFn: (title: string) =>
    apiFetch("/tasks", {
      method: "POST",
      body: JSON.stringify({ title }),
    }),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["tasks"] });
    // Refetch tasks from backend
  },
  onError: (err) => {
    showToast(`Failed: ${err.message}`, "error");
  }
});
```

**Update**:
```typescript
useMutation({
  mutationFn: ({ id, title, description }: Partial<FrontendTask> & { id: string }) =>
    apiFetch(`/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify({ title, description }),
    }),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["tasks"] });
  }
});
```

**Toggle**:
```typescript
useMutation({
  mutationFn: (id: string) =>
    apiFetch(`/tasks/${id}/toggle`, { method: "PATCH" }),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["tasks"] });
  }
});
```

**Delete**:
```typescript
useMutation({
  mutationFn: (id: string) =>
    apiFetch(`/tasks/${id}`, { method: "DELETE" }),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["tasks"] });
  }
});
```

---

### 3. UI State (React Component Local)

**AuthForm**:
```typescript
// email, password, name inputs (controlled)
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [name, setName] = useState("");

// Async state
const [loading, setLoading] = useState(false);
const [error, setError] = useState("");

// Form submission
const handleSubmit = async (e: FormEvent) => {
  setLoading(true);
  try {
    if (isLogin) {
      await signIn.email({ email, password });
    } else {
      await signUp.email({ email, password, name });
    }
    // Success → redirect (toast shown by provider)
  } catch (err) {
    setError(err.message);
    // Error → show to user
  } finally {
    setLoading(false);
  }
};
```

**TaskDashboard**:
```typescript
const [newTitle, setNewTitle] = useState("");

const handleCreate = async (e: FormEvent) => {
  e.preventDefault();
  if (!newTitle.trim()) return;

  // Mutation handles loading/error states
  await createTask.mutateAsync(newTitle);
  setNewTitle(""); // Clear input after success
};

// useMutation provides:
// - isPending (loading state)
// - isError (error occurred)
// - error (error object)
```

**TaskItem**:
```typescript
const [isEditing, setIsEditing] = useState(false);
const [editTitle, setEditTitle] = useState(task.title);

// Mutations handle loading/error for individual task
const handleToggle = () => {
  toggleTask.mutate(task.id);
  // UI updates via React Query cache invalidation
};
```

---

## Data Flow: Complete User Journey

### 1. User Navigates to Login

```
GET /login
  ↓ (Middleware check)
  ├─ Has auth_token cookie? NO → Allow access
  │  ├─ If YES → Redirect to /dashboard
  │
  ↓ Render LoginPage
  ├─ AuthForm (type="login")
  ├─ Controlled inputs: email, password
  └─ Button: "Sign in"
```

### 2. User Submits Login

```
onClick "Sign in"
  ↓ handleSubmit()
  ├─ Set loading = true
  ├─ Call signIn.email({ email, password })
  │  ├─ Makes POST /auth/login to backend (via Better Auth)
  │  ├─ Backend returns { token, user }
  │  ├─ Better Auth stores token in localStorage
  │  └─ (Frontend must sync to auth_token cookie)
  │
  ├─ Success → showToast("Welcome back!")
  ├─ Redirect to /dashboard
  │  ├─ Browser makes GET /dashboard
  │  ├─ Middleware checks auth_token cookie
  │  ├─ Cookie exists → Allow access
  │  ├─ DashboardPage renders
  │  ├─ Navbar shows user info from session
  │  ├─ TaskDashboard mounts
  │     └─ useQuery("tasks") fires
  │        ├─ apiFetch("/tasks") with JWT in header
  │        ├─ Backend returns task list
  │        └─ React Query caches result
  │
  └─ Error → setError(message) → showToast(error) → Stay on login
```

### 3. User Creates Task

```
Click input "What needs to be done?"
  ↓ setNewTitle(value) — Controlled input updates
  ↓ Click "Create" button
  ↓ handleCreate(e)
  ├─ e.preventDefault()
  ├─ createTask.mutate(newTitle)
  │  ├─ Loading: true (button disabled, spinner shows)
  │  ├─ POST /tasks { title: newTitle }
  │  ├─ apiFetch injects JWT token in header
  │  ├─ Backend creates task, returns { id, title, ... }
  │  ├─ onSuccess fires:
  │  │  ├─ queryClient.invalidateQueries({ queryKey: ["tasks"] })
  │  │  └─ React Query refetches /tasks
  │  │     ├─ Tasks array updated in cache
  │  │     ├─ Components re-render with new task
  │  │     └─ showToast("Task created", "success")
  │  │
  │  └─ setNewTitle("") — Clear input
  │
  └─ Error → onError fires:
     └─ showToast(`Failed: ${err.message}`, "error")
        ├─ Loading state cleared
        └─ Input retains value (user can retry)
```

### 4. User Logs Out

```
Click "Logout" in Navbar
  ↓ handleLogout()
  ├─ Call signOut()
  │  ├─ Better Auth clears localStorage
  │  └─ (Frontend must clear auth_token cookie)
  │
  ├─ Redirect to /login
  ├─ Browser makes GET /login
  ├─ Middleware checks auth_token cookie
  ├─ Cookie missing → Allow access (public route)
  ├─ LoginPage renders
  └─ showToast("Logged out", "success")
```

---

## Error Handling State

**HTTP Error Status** → **User-Friendly Message**:

```typescript
const getErrorMessage = (status: number, detail?: string) => {
  switch (status) {
    case 400: return "Invalid input. Please check your entries.";
    case 401: return "Your session expired. Please log in again.";
    case 404: return "Not found. The item may have been deleted.";
    case 409: return "This email is already in use. Try logging in instead.";
    case 422: return detail || "Invalid data format. Please try again.";
    case 500: return "Server error. Please try again in a moment.";
    default: return detail || "An error occurred. Please try again.";
  }
};
```

**In Components**:
```typescript
try {
  await mutation();
} catch (err: any) {
  const status = err.response?.status || 500;
  const detail = err.response?.data?.detail;
  const message = getErrorMessage(status, detail);
  showToast(message, "error");
}
```

---

## Loading States

**Query Loading** (fetching tasks on mount):
```
isLoading = true
  → Show spinner: <Loader2 className="animate-spin" />
  → Disable input: disabled={isLoading}

isLoading = false
  → Show tasks or empty state
```

**Mutation Loading** (creating/updating/deleting task):
```
createTask.isPending = true
  → Button disabled: disabled={isPending}
  → Button shows spinner inside
  → Input disabled: disabled={isPending}

createTask.isPending = false
  → Button enabled
  → Input enabled
```

---

## Type Definitions

**File**: `src/types/index.ts`

```typescript
export interface FrontendTask {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthSession {
  user: User;
  token?: string;
}

export interface AuthError {
  message: string;
  code?: string;
  status?: number;
}
```

---

## API Client Integration

**File**: `src/lib/api-client.ts`

```typescript
export async function apiFetch<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  // 1. Get auth token from Better Auth session
  const session = authClient.getSession();
  const token = session?.data?.token;

  // 2. Prepare headers
  const headers = new Headers(options.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  // 3. Make request
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, { ...options, headers });

  // 4. Handle errors
  if (!response.ok) {
    if (response.status === 401) {
      // Token invalid/expired
      authClient.signOut();
      window.location.href = "/login";
    }
    throw new Error(await response.json());
  }

  // 5. Parse response (handle empty body)
  if (response.status === 204) return null as any;
  return response.json();
}
```

---

## Middleware Protection

**File**: `src/middleware.ts`

```typescript
export function middleware(request: NextRequest) {
  const authToken = request.cookies.get("auth_token")?.value;
  const { pathname } = request.nextUrl;

  // Protected routes
  if (pathname.startsWith("/dashboard")) {
    if (!authToken) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Public routes (redirect to dashboard if logged in)
  if (pathname === "/login" || pathname === "/signup") {
    if (authToken) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}
```

---

**Summary**: This data model ensures clean separation of concerns, predictable state updates, and reliable error handling throughout the frontend.

Next: See `contracts/` for detailed API specifications.
