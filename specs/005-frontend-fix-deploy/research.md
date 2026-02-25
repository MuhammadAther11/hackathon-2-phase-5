# Research: Frontend Fix & Deployment Ready

**Date**: 2026-01-15 | **Feature**: 005-frontend-fix-deploy

## Phase 0 Clarifications Resolved

### Clarification 1: Better Auth Token Storage & Persistence

**Question**: How does Better Auth client store and persist JWT tokens across page reloads?

**Research Findings**:
- Better Auth React client typically stores tokens in localStorage or HTTP-only cookies (configurable)
- File `frontend/src/lib/auth-client.ts` uses Better Auth React hooks
- `middleware.ts` expects `auth_token` cookie for server-side validation
- Pattern: `authClient.getSession()` → retrieves from localStorage; `signOut()` clears it

**Decision**: Token is stored in localStorage by Better Auth client.

**Rationale**:
- localStorage persists across browser reloads without server-side session
- `middleware.ts` checks for auth cookie, which must be set by Better Auth or synced manually
- HTTP-only cookies are more secure but require backend coordination

**Verification Steps**:
1. Check `auth-client.ts` hook implementation
2. Verify localStorage key used by Better Auth
3. Test token persistence in browser DevTools Storage tab
4. Confirm cookie sync if middleware expects it

**Alternatives Considered**:
- HTTP-only cookies only: More secure but requires backend to issue them
- Session-based auth: More complex, doesn't fit JWT architecture

**Action**: Tasks will include verifying token storage mechanism during implementation phase.

---

### Clarification 2: API Response Format for Empty Bodies

**Question**: Do backend endpoints return 200 with empty body, 204 No Content, or JSON null?

**Research Findings**:
- FastAPI default: `DELETE` returns 200 by default (unless configured otherwise)
- Best practice: `DELETE` → 204 No Content (no body) or 200 with `{ "success": true }`
- Current `useTasks.ts` calls `response.json()` without null checks
- This will crash if response body is empty

**Decision**: Assume backend returns 204 No Content on DELETE. Frontend must handle it gracefully.

**Rationale**:
- 204 is semantically correct for DELETE
- Prevents payload waste (empty body is smaller than `{ "success": true }`)
- Frontend should not assume JSON body exists

**Verification Steps**:
1. Test DELETE request with backend (curl or Postman)
2. Capture response status and headers
3. If 204: Implement null-safe parsing
4. If 200 with JSON: Update `apiFetch` to handle both

**Alternatives Considered**:
- Backend returns 200 + empty JSON: Valid but wastes bytes
- Backend returns 200 + null: Valid but ambiguous
- Always 200 + object: Safest but verbose

**Action**: Implement null-safe JSON parsing in `apiFetch`:
```typescript
if (!response.ok) throw error;
if (response.status === 204 || !response.headers.get('content-length')) {
  return null;
}
return response.json();
```

---

### Clarification 3: Middleware Auth Cookie Mechanism

**Question**: How does `middleware.ts` detect authenticated state if token is in localStorage?

**Research Findings**:
- `middleware.ts` runs on server, cannot access browser localStorage
- Currently checks for `auth_token` cookie: `request.cookies.get("auth_token")?value`
- Better Auth must set this cookie during auth flow, or frontend must sync it
- If not set: Middleware cannot protect routes properly

**Decision**: Implement cookie sync in auth flow.

**Rationale**:
- Server-side route protection requires server-accessible token indicator
- Cookie is simplest mechanism (HTTP-only option protects from XSS)
- Frontend can set cookie when token obtained from localStorage

**Verification Steps**:
1. Check if Better Auth sets `auth_token` cookie automatically
2. If not: Implement sync in `auth-client.ts` or browser events
3. Verify cookie is sent with every subsequent request
4. Test middleware routes with and without auth

**Alternatives Considered**:
- Bearer token in Authorization header: Not sent automatically by browser to middleware
- Query parameter: Exposes token in URLs, security risk
- Always redirect-to-login on server: Worse UX, no middleware protection

**Action**: Tasks will include setting auth cookie when token is obtained.

---

### Clarification 4: Next.js Build Errors & TypeScript Issues

**Question**: What TypeScript or build errors exist in current codebase?

**Research Findings**:
- Cannot determine without running `next build`
- Common issues in Next.js 15:
  - Missing `"use client"` on components using hooks
  - Server/Client component boundary violations
  - Untyped component props
  - Missing return statements in Server Components
  - Incorrect async/await in Server vs Client contexts

**Decision**: Proceed with best practices; fix errors as they appear during build.

**Rationale**:
- Build errors are concrete once compilation is attempted
- Specification guarantees zero errors before deployment
- Tasks will include running build and capturing errors

**Verification Steps**:
1. Run `next build` in frontend directory
2. Capture all errors and warnings
3. Generate task for each error type
4. Test `next build` succeeds before Vercel deploy

**Alternatives Considered**:
- Run build now: Valid but delays planning. We'll do this in tasks phase.
- Ignore build errors: Violates success criteria

**Action**: Tasks will include `next build` execution and error fixing.

---

### Clarification 5: Responsive Design Breakpoints & Mobile Support

**Question**: What screen sizes must be supported and are Tailwind breakpoints correct?

**Research Findings**:
- Spec requires: 320px (mobile) to 1920px (desktop)
- Tailwind defaults: `sm: 640px, md: 768px, lg: 1024px, xl: 1280px, 2xl: 1536px`
- Current UI uses classes like `px-4 sm:px-0` (mobile-first)
- Mobile-first approach: Start with mobile, add `sm:`, `md:` for larger screens
- Not verified on actual mobile device

**Decision**: Use standard Tailwind breakpoints with mobile-first approach.

**Rationale**:
- Standard breakpoints match industry practices
- Mobile-first ensures base styles work on all devices
- Can test with browser DevTools responsive mode
- Real device testing deferred to QA phase

**Verification Steps**:
1. Open dashboard in browser DevTools responsive mode
2. Test at: 320px, 375px (mobile), 768px (tablet), 1024px, 1920px (desktop)
3. Verify no layout breaks, text readable, buttons clickable
4. Check grid/flexbox alignment on each breakpoint
5. Test form inputs (AuthForm) are usable on mobile

**Alternatives Considered**:
- Custom breakpoints: Adds complexity, standard breakpoints sufficient
- Ignore mobile: Violates spec requirement for 320px support

**Action**: Tasks include responsive testing on multiple breakpoints via DevTools.

---

### Clarification 6: Error Handling Strategy for User-Facing Errors

**Question**: What error messages should users see for different API failures?

**Research Findings**:
- Current: Generic error in `useTasks.ts` → `showToast(${err.message})`
- Good for debugging, poor UX (technical error messages confuse users)
- Backend returns `{ "detail": "..." }` for validation errors
- No standard error format defined

**Decision**: Implement user-friendly error messages with fallbacks.

**Rationale**:
- Users don't understand technical errors like "422 Unprocessable Entity"
- Simple mapping of status codes to human-readable messages
- Preserves technical details in logs for debugging

**Error Message Mapping**:
```
401 → "Your session expired. Please log in again."
400 → "Invalid input. Please check your entries."
404 → "Not found. The item may have been deleted."
409 → "This email is already in use. Try logging in instead."
422 → Show specific field error from backend
500 → "Server error. Please try again in a moment."
Network error → "Connection lost. Check your internet."
Timeout → "Request took too long. Try again."
```

**Action**: Tasks include implementing error message mapping function.

---

### Clarification 7: Input Bug: Enter Key Behavior

**Question**: What exactly is the "Enter per character" issue and how to fix it?

**Research Findings**:
- Current `AuthForm.tsx` has `handleKeyDown` that intercepts Enter key
- Logic: Enter moves focus to next field (name → email → password → submit)
- Issue: If input is not controlled properly, React state may not update on each keystroke
- Result: User types character, state doesn't update, Enter key doesn't work as expected

**Decision**: Replace keyboard navigation with standard form behavior.

**Rationale**:
- Users expect Enter to submit form or move to next field naturally
- Keyboard navigation logic is custom and brittle
- HTML form + tab key navigation is standard and reliable
- Can use `autoFocus` and `ref` to move focus after form submission

**Implementation Approach**:
1. Keep inputs as controlled components (state-driven)
2. Remove custom `handleKeyDown` logic
3. On form submit (Enter in password field), directly call `handleSubmit`
4. Use HTML5 form auto-validation
5. Ensure each input is a `<input type="email">` or `<input type="password">` for semantic HTML

**Example Fix**:
```tsx
// Before: Custom keyboard navigation
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === "Enter") nextInputRef?.focus();
};

// After: Standard form behavior
<form onSubmit={handleSubmit}>
  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
  <button type="submit">Submit</button>
</form>
```

**Action**: Tasks include refactoring AuthForm to use standard form patterns.

---

### Clarification 8: Landing Page Route & Behavior

**Question**: Should `/` (home) redirect authenticated users or show landing page?

**Research Findings**:
- Current `page.tsx` redirects authenticated users to `/dashboard`
- Spec requires: "public landing page" for unauthenticated users
- Best practice: Show landing page to all, with login/signup CTAs
- Authenticated users can choose to view dashboard or stay on landing page

**Decision**: Landing page for all; authenticated users see additional options.

**Rationale**:
- More user-friendly (no automatic redirects)
- Matches standard SPA pattern (landing → auth → dashboard)
- Users can navigate intentionally
- Spec says "public landing page with CTAs", not "automatic redirect"

**Implementation**:
1. Create landing page at `src/app/page.tsx` with description and CTAs
2. If authenticated: Show "Go to Dashboard" CTA in addition to "Login"/"Signup"
3. If not authenticated: Show "Login" and "Signup" CTAs only
4. Keep it simple and professional

**Action**: Tasks include creating landing page component.

---

## Best Practices & Patterns Verified

### React Query Usage

✅ **Current State**: `useTasks.ts` correctly uses React Query patterns:
- `useQuery` for fetching (stale-while-revalidate caching)
- `useMutation` for mutations (POST, PUT, PATCH, DELETE)
- `queryClient.invalidateQueries` after successful mutations
- Error boundary in hook (catches and toasts errors)

✅ **No Changes Needed**: React Query implementation is production-ready.

---

### Tailwind CSS Mobile-First

✅ **Current State**: Components use mobile-first approach:
- Base styles for mobile (no breakpoint)
- `sm:`, `md:`, `lg:` prefixes for larger screens
- Flexbox and grid for responsive layouts

⚠️ **Needs Verification**: Test on actual mobile viewport (320px) for layout breaks.

---

### Better Auth Integration

⚠️ **Current State**: `auth-client.ts` uses Better Auth hooks correctly:
- `signIn.email()` and `signUp.email()` for auth flows
- `useSession()` for session state
- `signOut()` for logout

❓ **Needs Verification**: Token storage mechanism (localStorage vs. cookies) and middleware integration.

---

### Error Handling & Toast Notifications

✅ **Current State**: Error handling pattern in place:
- `useToast()` provider for notifications
- Toast shown on mutations errors
- Generic error message passed through

⚠️ **Needs Improvement**: Error messages too technical; implement user-friendly mapping.

---

## Dependency Analysis

| Dependency | Version | Purpose | Status |
|------------|---------|---------|--------|
| `next` | 15+ | Web framework | ✅ Current |
| `react` | 19+ | UI library | ✅ Current |
| `@tanstack/react-query` | 5+ | State management | ✅ Current |
| `tailwindcss` | 3+ | Styling | ✅ Current |
| `lucide-react` | Latest | Icons | ✅ Current |
| `better-auth` | 1+ | JWT auth | ✅ Current |
| `@hookform/resolvers` | (if used) | Form validation | Check |
| `zod` (if used) | (if used) | Schema validation | Check |

---

## Summary: All Clarifications Resolved ✅

| # | Clarification | Status | Decision |
|---|---------------|--------|----------|
| 1 | Better Auth token storage | ✅ Resolved | localStorage, sync to cookie |
| 2 | Empty response handling | ✅ Resolved | Handle 204 No Content gracefully |
| 3 | Middleware auth cookie | ✅ Resolved | Set cookie when token obtained |
| 4 | Build errors | ✅ Resolved | Fix during task execution phase |
| 5 | Responsive design | ✅ Resolved | Mobile-first, standard breakpoints |
| 6 | Error messages | ✅ Resolved | User-friendly mapping |
| 7 | Input Enter key bug | ✅ Resolved | Use standard form behavior |
| 8 | Landing page routing | ✅ Resolved | Public page for all users |

---

**Phase 0 Complete**: All clarifications documented and decisions made. Proceeding to Phase 1 design and contract specification.

**Next**: `/sp.plan` (Phase 1) generates `data-model.md`, `contracts/`, and `quickstart.md`.
