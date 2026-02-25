# ADR 001: JWT Authentication Strategy

**Status**: ACCEPTED
**Date**: 2026-01-12
**Deciders**: Architecture Review Board
**Feature**: 004-auth-persistence-ui

---

## Context

The application needs to implement user authentication for a multi-user task management system. We must choose between:
1. **Session-based authentication** (server-side sessions)
2. **JWT (JSON Web Tokens)** (stateless tokens)
3. **OAuth2/OpenID Connect** (third-party providers)

### Requirements Driving This Decision
- Users need secure access to their own data only
- Frontend and backend are separate deployments (Next.js ↔ FastAPI)
- Serverless infrastructure (Neon PostgreSQL) preferred
- Session should persist across browser refreshes
- Implementation timeline: 6-7 days

---

## Decision

**We will use JWT (JSON Web Tokens) with Better Auth library for authentication.**

Specifically:
- JWT tokens with user_id claim stored in httpOnly cookies
- 24-hour token expiration
- BETTER_AUTH_SECRET shared between frontend and backend
- Automatic JWT injection on all frontend API requests
- JWT verification middleware on all backend protected endpoints

---

## Rationale

### Why JWT Over Sessions

| Aspect | JWT | Session |
|--------|-----|---------|
| Scalability | ✅ Stateless (works with serverless) | ❌ Requires session store |
| Cross-origin | ✅ Works with CORS easily | ⚠️ Cookie complexities |
| Mobile-friendly | ✅ Easy for mobile clients | ⚠️ Cookie management issues |
| Deployment | ✅ No backend state needed | ❌ Requires shared session store |
| Microservices | ✅ Easy service-to-service auth | ❌ Requires session replication |

**Chosen: JWT** because:
1. Stateless design aligns with Neon serverless PostgreSQL (no session persistence needed)
2. Next.js frontend can easily attach to all requests
3. Scales without additional infrastructure
4. Simpler deployment and testing

### Why httpOnly Cookies Over localStorage

| Storage | XSS Protection | CSRF Risk | Notes |
|---------|---|---|---|
| httpOnly Cookie | ✅ Protected | ⚠️ Mitigated with SameSite | Recommended |
| localStorage | ❌ Vulnerable | ✅ Safe | Accessible to JS (XSS risk) |

**Chosen: httpOnly Cookies** because:
1. Immune to XSS attacks (JS cannot access)
2. Automatically sent by browser (no manual attachment needed)
3. Industry standard for sensitive tokens
4. SameSite=Strict/Lax prevents CSRF

### Why Better Auth Library

**Alternatives Considered**:
1. Manual JWT with PyJWT + passlib (low-level)
2. Django REST Framework with JWT (heavy, not FastAPI native)
3. FastAPI-JWT (minimal, low-level)

**Chosen: Better Auth** because:
1. Purpose-built for this use case (email/password + JWT)
2. Handles password hashing, token generation, verification
3. Reduces implementation errors
4. Less code to maintain

---

## Consequences

### Positive
- ✅ Stateless authentication scales to serverless
- ✅ Simple implementation (Better Auth handles most details)
- ✅ Secure by default (httpOnly cookies prevent XSS)
- ✅ Works across frontend/backend language divide
- ✅ Easy to add more auth methods later (OAuth, MFA)

### Negative
- ⚠️ Token revocation requires blacklist (not implemented in MVP)
- ⚠️ Cannot easily invalidate all tokens for a user (logout doesn't clear server-side)
- ⚠️ Token size adds to each request (minor, usually ~1KB)

### Mitigations
- Token expiration set to 24 hours (reasonable for security)
- Short-lived tokens reduce damage from theft
- httpOnly cookies prevent most token theft scenarios
- Will add token blacklist in Phase 2 if needed

---

## Alternatives Rejected

### Session-Based Authentication
**Why rejected**:
- Requires server-side session store (adds complexity)
- Neon is stateless; session replication needed
- More infrastructure overhead

### OAuth2/OpenID Connect
**Why rejected**:
- Out of scope for MVP (no Google/GitHub OAuth setup needed)
- Adds external service dependency
- Can be added later if required

### No Authentication
**Why rejected**:
- Violates security requirement (user isolation mandatory)
- Invalid for multi-user system

---

## Implementation Details

### Frontend
- Store JWT in httpOnly cookie: `auth_token`
- Centralized API client automatically attaches `Authorization: Bearer <jwt>` header
- Frontend middleware checks cookie and redirects to `/login` if missing
- On 401 response, clear cookie and redirect to `/login`

### Backend
- FastAPI dependency `get_current_user_id` verifies JWT and extracts user_id
- All protected endpoints require this dependency
- Returns 401 if token missing, invalid, or expired
- Returns 403 if user accesses other user's resource

### Expiration & Refresh
- MVP: No refresh token (24-hour expiration)
- Future: Add refresh token mechanism if needed

---

## Verification

Implementation verified by:
- [ ] JWT generated on signup and login
- [ ] JWT verified on all protected endpoints
- [ ] 401 returned for missing/invalid JWT
- [ ] 403 returned for unauthorized access
- [ ] Session persists across browser refresh
- [ ] Logout clears cookie
- [ ] Integration test passes

---

## Related

- [FEATURE] 004-auth-persistence-ui
- [TASK] T008-T011 (Backend JWT implementation)
- [TASK] T016-T017 (Frontend Better Auth setup)
- [SPEC] Security requirements (FR-003, FR-004, FR-005)

---

## References

1. **JWT Best Practices**: https://tools.ietf.org/html/rfc7519
2. **OWASP**: https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html
3. **Better Auth Docs**: https://better-auth.com/
4. **httpOnly Cookies**: https://owasp.org/www-community/HttpOnly

---

**Approved By**: Architecture Review
**Implementation Status**: IN PROGRESS
