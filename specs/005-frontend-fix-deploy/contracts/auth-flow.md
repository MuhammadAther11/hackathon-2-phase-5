# API Contract: Authentication Flow

**Date**: 2026-01-15 | **Feature**: 005-frontend-fix-deploy

## Overview

Frontend interacts with backend via Better Auth client. These contracts define request/response formats and error handling for auth operations.

---

## Endpoints

### 1. POST /auth/signup

**Purpose**: Create a new user account and return JWT token.

**Frontend Call** (via Better Auth):
```typescript
const { error } = await signUp.email({
  email: "user@example.com",
  password: "SecurePass123",
  name: "John Doe"
});
```

**HTTP Request**:
```
POST /auth/signup HTTP/1.1
Host: api.example.com
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123",
  "name": "John Doe"
}
```

**HTTP Response (Success - 200 OK)**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**HTTP Response (Already Exists - 409 Conflict)**:
```json
{
  "detail": "User with this email already exists"
}
```

**HTTP Response (Validation Error - 422 Unprocessable Entity)**:
```json
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "Invalid email format",
      "type": "value_error.email"
    }
  ]
}
```

**Frontend Handling**:
```typescript
try {
  const { error } = await signUp.email({ email, password, name });
  if (error) throw error;
  // Success: Redirect to login
  showToast("Account created! Please log in.", "success");
  router.push("/login?message=Please log in with your credentials");
} catch (err: any) {
  if (err.status === 409) {
    setError("Email already in use. Try logging in.");
  } else if (err.status === 422) {
    setError("Invalid email or weak password.");
  } else {
    setError(err.message || "Signup failed. Try again.");
  }
}
```

---

### 2. POST /auth/login

**Purpose**: Authenticate user and return JWT token.

**Frontend Call** (via Better Auth):
```typescript
const { error } = await signIn.email({
  email: "user@example.com",
  password: "SecurePass123"
});
```

**HTTP Request**:
```
POST /auth/login HTTP/1.1
Host: api.example.com
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**HTTP Response (Success - 200 OK)**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**HTTP Response (Invalid Credentials - 401 Unauthorized)**:
```json
{
  "detail": "Invalid email or password"
}
```

**HTTP Response (User Not Found - 404 Not Found)**:
```json
{
  "detail": "User not found"
}
```

**Frontend Handling**:
```typescript
try {
  const { error } = await signIn.email({ email, password });
  if (error) throw error;
  // Success: Token stored in localStorage by Better Auth
  // Middleware will check cookie on next navigation
  showToast("Welcome back! Redirecting to dashboard...", "success");
  // Sync token to auth_token cookie
  document.cookie = `auth_token=${token}; path=/; max-age=${maxAge}`;
  setTimeout(() => router.push("/dashboard"), 800);
} catch (err: any) {
  if (err.status === 401 || err.status === 404) {
    setError("Invalid email or password");
  } else {
    setError(err.message || "Login failed. Try again.");
  }
}
```

---

### 3. POST /auth/logout (if exists)

**Purpose**: Invalidate session on backend (optional, frontend can handle locally).

**Frontend Call**:
```typescript
const handleLogout = async () => {
  try {
    // Option 1: Backend logout (if endpoint exists)
    // await apiFetch("/auth/logout", { method: "POST" });

    // Option 2: Frontend-only logout (recommended for JWT)
    await signOut();
    // Better Auth clears localStorage
    // Clear auth_token cookie
    document.cookie = "auth_token=; path=/; max-age=0";
    // Redirect to login
    router.push("/login");
  } catch (err) {
    // Even on error, clear local state and redirect
    router.push("/login");
  }
};
```

---

## Token Storage & Synchronization

### Better Auth Default

**File**: `src/lib/auth-client.ts`

```typescript
export const authClient = createBetterAuthClient({
  // Token is stored in localStorage automatically
  // Key: "auth.session" or configured key
});
```

**localStorage Content**:
```javascript
localStorage.getItem("auth.session")
// Returns: { "user": {...}, "token": "eyJ..." }
```

### Middleware Cookie Sync

**Problem**: Middleware runs on server and cannot access localStorage.

**Solution**: Sync token to HTTP-only cookie when obtained.

**File**: `src/lib/auth-client.ts` (after signIn or signUp)

```typescript
const syncTokenToCookie = (token: string) => {
  // Set cookie that middleware can read
  // Use httpOnly=false for client-side access, but in production prefer secure setup
  document.cookie = `auth_token=${token}; path=/; max-age=${7*24*60*60}; SameSite=Lax`;
};

// After successful signIn or signUp
const { error, data } = await signIn.email({ ... });
if (data?.token) {
  syncTokenToCookie(data.token);
}
```

### Logout Cleanup

```typescript
const clearAuthState = () => {
  // Clear Better Auth localStorage
  localStorage.removeItem("auth.session");
  // Clear auth_token cookie
  document.cookie = "auth_token=; path=/; max-age=0";
};
```

---

## Error Handling Strategy

### HTTP Status Code Mapping

| Status | Scenario | Frontend Action | Message |
|--------|----------|-----------------|---------|
| 200 | Success | Store token, redirect | "Welcome back!" or "Account created!" |
| 400 | Bad request (malformed data) | Show generic error | "Invalid input. Please check your entries." |
| 401 | Invalid credentials / Expired token | Redirect to login, clear token | "Invalid email or password" or "Session expired" |
| 404 | User not found | Suggest signup | "Account not found. Create an account?" |
| 409 | Email already exists | Suggest login | "Email already in use. Try logging in." |
| 422 | Validation error (weak password, etc.) | Show field error | "Password must be at least 8 characters." |
| 500 | Server error | Suggest retry | "Server error. Please try again later." |
| Network | No internet / timeout | Show warning | "Connection lost. Check your internet." |

### Error Message Mapping

```typescript
const getAuthErrorMessage = (err: any): string => {
  const status = err?.status || err?.response?.status || 500;
  const detail = err?.detail || err?.response?.data?.detail || "";

  if (status === 400) {
    return "Invalid input. Please check your entries.";
  }
  if (status === 401) {
    return "Invalid email or password";
  }
  if (status === 404) {
    return "Account not found. Create an account?";
  }
  if (status === 409) {
    return "Email already in use. Try logging in.";
  }
  if (status === 422) {
    // Parse validation error details
    if (detail.includes("password")) return "Password must be at least 8 characters.";
    if (detail.includes("email")) return "Invalid email format.";
    return "Invalid data. Please check your entries.";
  }
  if (status === 500) {
    return "Server error. Please try again later.";
  }
  return "An error occurred. Please try again.";
};
```

---

## Security Considerations

### 1. Token Expiration

**Assumption**: Backend issues JWT with `exp` claim (expiration time).

**Frontend Handling**:
```typescript
// Check token expiration
const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = JSON.parse(atob(token.split('.')[1]));
    return decoded.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

// On app load, check if token expired
if (isTokenExpired(storedToken)) {
  signOut();
  router.push("/login?message=Session expired");
}
```

### 2. HTTP-Only Cookies (Recommended for Production)

**Current Setup**: Token in localStorage (accessible to JavaScript).

**Recommended**: Use HTTP-only cookies set by backend.

```
Set-Cookie: auth_token=<JWT>; HttpOnly; Secure; SameSite=Lax; Max-Age=604800
```

**Migration Path**:
1. Backend sets HTTP-only cookie in auth response
2. Middleware reads from cookie (works as-is)
3. Frontend cannot access token (OK, only backend needs it)
4. Frontend only needs session data (user info, etc.)

### 3. CSRF Protection

**Current Setup**: No CSRF token (SPA with JWT is generally safe).

**If Needed**: Backend can add CSRF token header.

### 4. Password Handling

**Requirement**: Never log or expose passwords.

**Frontend**:
```typescript
// Never console.log password
console.log({ email, password }); // ❌ Bad

// Use secure form submission
const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();
  // Password only sent via HTTPS to backend
  const { error } = await signIn.email({ email, password });
  setPassword(""); // Clear password from state after use
};
```

---

## Integration with Frontend Components

### AuthForm Component

**File**: `src/components/AuthForm.tsx`

```typescript
"use client";

import { useState } from "react";
import { signIn, signUp } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast-provider";
import { getAuthErrorMessage } from "@/lib/auth-errors";

interface AuthFormProps {
  type: "login" | "signup";
}

export function AuthForm({ type }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { showToast } = useToast();
  const isLogin = type === "login";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        const { error: authError } = await signIn.email({ email, password });
        if (authError) throw authError;

        // Sync token to cookie for middleware
        const session = authClient.getSession();
        if (session?.data?.token) {
          syncTokenToCookie(session.data.token);
        }

        showToast("Welcome back! Redirecting to dashboard...", "success");
        setTimeout(() => router.push("/dashboard"), 800);
      } else {
        const { error: authError } = await signUp.email({
          email,
          password,
          name,
        });
        if (authError) throw authError;

        showToast("Account created! Redirecting to login...", "success");
        setTimeout(() => router.push("/login?message=Signup successful. Please log in."), 800);
      }
    } catch (err: any) {
      const message = getAuthErrorMessage(err);
      setError(message);
      showToast(message, "error");
    } finally {
      setLoading(false);
      if (isLogin) setPassword(""); // Clear password after submission
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {!isLogin && (
        <input
          type="text"
          placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      )}
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      {error && <p className="text-red-500">{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? "Loading..." : isLogin ? "Sign in" : "Create account"}
      </button>
    </form>
  );
}
```

---

## Testing Checklist

- [ ] Signup with valid email → Success, redirect to login
- [ ] Signup with existing email → 409 error message
- [ ] Signup with weak password → 422 error message
- [ ] Login with valid credentials → Success, token stored, redirect to dashboard
- [ ] Login with invalid credentials → 401 error message
- [ ] Token persisted in localStorage across page reload
- [ ] auth_token cookie set for middleware
- [ ] Logout clears token and redirects to login
- [ ] Session expired triggers redirect to login
- [ ] 401 on API call triggers re-login flow

---

**Next**: See `task-operations.md` for task CRUD contracts.
