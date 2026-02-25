# Architectural Research: Frontend Integration

## Decision 1: Better Auth JWT Handling
**Resolved**: Use Better Auth's `session` object to retrieve the `idToken` or `accessToken`. If the token is symmetric (HS256), the frontend will trust the cookie for session state but must rely on the backend for verification during API calls.
**Rationale**: Centralizing token extraction in a `getAuthToken` utility ensures consistency.
**Alternatives Considered**: Manual cookie parsing (error-prone).

## Decision 2: Centralized fetch utility with Interceptors
**Resolved**: Implement a wrapper around the native `fetch` API that automatically injects the `Authorization` header and scans for 401 response codes to trigger a logout redirect.
**Rationale**: Native fetch is lightweight and sufficient with a small wrapper, reducing dependency footprint.
**Alternatives Considered**: Axios (adds weight, but useful if complex retries are needed).

## Decision 3: Next.js Middleware for Route Protection
**Resolved**: Use `middleware.ts` to check for active session cookies before allowing access to `/dashboard/*`.
**Rationale**: Middleware prevents the flashing of protected content and provides a server-side redirect for better performance.
**Alternatives Considered**: Client-side `useEffect` checks (slower, prone to "layout shift" during redirects).

## Decision 4: Global State Management with React Query
**Resolved**: Use `@tanstack/react-query` for all server-side state (tasks).
**Rationale**: Provides built-in caching, optimistic updates, and automatic re-fetching on window focus.
**Alternatives Considered**: Redux (too much boilerplate), Context API (requires manual caching logic).
