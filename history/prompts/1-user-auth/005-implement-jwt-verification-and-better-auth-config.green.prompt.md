---
id: 5
title: "Implement JWT symmetric verification and Better Auth config"
stage: green
date: 2026-01-09
surface: agent
model: claude-sonnet-4-5-20250929
feature: 1-user-auth
branch: master
user: default-user
command: none
labels: ["auth", "jwt", "fastapi", "better-auth"]
links:
  spec: "specs/1-user-auth/spec.md"
  ticket: null
  adr: null
  pr: null
files:
  - backend/src/auth/jwt.py
  - frontend/src/auth.ts
  - backend/src/middleware/auth.py
tests:
  - none
---

## Prompt

I need to complete the remaining foundational tasks from Phase 2:
- T005: Implement JWT symmetric verification utility in backend/src/auth/jwt.py (using python-jose and BETTER_AUTH_SECRET)
- T006: Configure Better Auth JWT plugin with symmetric signing in frontend/src/auth.ts (refer to research.md for the snippet)
- T007: Implement FastAPI auth middleware to verify JWT in backend/src/middleware/auth.py (extract sub claim as user_id and provide to request state)

Check specs/1-user-auth/research.md for the planned implementation logic.
Ensure backend/src/auth/jwt.py and backend/src/middleware/auth.py are integrated.

## Response snapshot

Implemented JWT symmetric verification utility in `backend/src/auth/jwt.py` using `python-jose`. Configured Better Auth JWT plugin in `frontend/src/auth.ts` with symmetric signing. Implemented FastAPI authentication middleware in `backend/src/middleware/auth.py` to extract the `sub` claim and attach it to the request state.

## Outcome

- ✅ Impact: Established foundational JWT authentication bridge between Next.js frontend and FastAPI backend.
- 🧪 Tests: No tests run; implementation based on plan and research.
- 📁 Files: Created backend/src/auth/jwt.py, frontend/src/auth.ts, backend/src/middleware/auth.py.
- 🔁 Next prompts: Next steps include integrating the middleware into the main FastAPI application and implementing protected routes.
- 🧠 Reflection: Symmetric signing with a shared secret provides a straightforward and performant way to share authentication state between the two services.

## Evaluation notes (flywheel)

- Failure modes observed: Initial attempts to list directories used incorrect path separators/flags for the environment. Resolved by using absolute paths and `ls -R`.
- Graders run and results (PASS/FAIL): N/A
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Verify token exchange between frontend and backend.
