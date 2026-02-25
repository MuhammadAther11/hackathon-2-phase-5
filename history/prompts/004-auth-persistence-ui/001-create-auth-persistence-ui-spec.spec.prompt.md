---
id: 001
title: Create auth-persistence-ui specification
stage: spec
date: 2026-01-12
surface: agent
model: claude-haiku-4-5-20251001
feature: 004-auth-persistence-ui
branch: 004-auth-persistence-ui
user: user
command: /sp.specify
labels: ["authentication", "persistence", "ui-design", "spec-generation"]
links:
  spec: specs/004-auth-persistence-ui/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/004-auth-persistence-ui/spec.md
  - specs/004-auth-persistence-ui/checklists/requirements.md
tests:
  - null
---

## Prompt

```
Spec: Working Authentication, Database Persistence & Clean UI

Objective:
- Fix broken signup and login on localhost
- Implement real authentication (no mock UI)
- Persist users and tasks in Neon PostgreSQL
- Issue and verify JWT correctly
- Replace poor UI with clean, responsive design

Authentication (MUST WORK):
- Use Better Auth for real signup and login
- Signup must create a user successfully
- Login must return valid session + JWT
- Show real auth errors (no generic message)
- JWT must include user_id
- Shared secret: BETTER_AUTH_SECRET

Backend (FastAPI):
- Verify JWT on every request
- Extract user_id from JWT (not from URL)
- Reject invalid or missing tokens with 401

Database (Neon PostgreSQL):
- Use SQLModel with Neon DB
- Tables:
  - users(id, email, created_at)
  - tasks(id, title, completed, user_id, created_at)
- Persist users on signup
- Persist tasks linked to authenticated user_id
- Data must survive refresh and restart

API Rules:
- All endpoints require JWT
- Users can access only their own tasks
- Enforce ownership in backend

Frontend Pages (REQUIRED):
- /signup → real signup form
- /login → real login form
- /dashboard → protected task UI
- Redirect to /login on 401
- Logout clears session

UI / UX:
- Clean, modern, responsive design
- Centered auth cards
- Dashboard with header + task list
- Clear completed vs active tasks
- Loading, empty, and error states
- Mobile-first layout

Constraints:
- No manual coding
- Must work on localhost
- All code via Claude Code

Success Criteria:
- Signup and login work
- JWT issued and verified
- Swagger unlocks with JWT
- Tasks save in Neon DB
- Users see only their own data
- UI looks professional and usable
```

## Response snapshot

Created comprehensive specification for working authentication, database persistence, and responsive UI feature. Generated:

1. **Feature Branch**: Created 004-auth-persistence-ui branch with initialized spec structure
2. **Specification Document**: 210-line spec.md with:
   - 6 prioritized user stories (P1: signup, login, tasks, protected routes; P2: logout, responsive UI)
   - Each story includes independent test criteria and Given/When/Then acceptance scenarios
   - 12 testable functional requirements (FR-001 through FR-012)
   - 3 key entities (User, Task, Session) with attributes and relationships
   - 10 measurable success criteria (SC-001 through SC-010) covering usability, performance, security, and persistence
   - Edge cases identified (duplicate signup, DB failures, orphaned JWT, 401 handling, offline)
   - Assumptions documented (email/password, JWT storage, user isolation, Neon configured, shared secret, no email verification, task scope limits)
   - Clear out-of-scope items (no password reset, RBAC, MFA, OAuth, task deletion, categories, profiles, real-time sync, audit logging, data export)
   - Dependencies & integration points identified

3. **Quality Checklist**: Created requirements.md validation checklist confirming:
   - All content quality items pass (no implementation leakage, business-focused, stakeholder-friendly)
   - All requirement completeness items pass (no NEEDS_CLARIFICATION markers, testable, measurable, technology-agnostic)
   - All feature readiness items pass (scenarios cover flows, success criteria meet outcomes)
   - Overall spec validated as PASS and ready for planning

4. **No Clarifications Needed**: All ambiguities resolved using informed defaults aligned with project architecture (Better Auth, Neon, SQLModel, Next.js App Router)

## Outcome

- ✅ Impact: Specification provides complete, unambiguous requirements for implementing production-ready authentication, persistence, and UI in 6 prioritized stories. Enables planning and task generation without further clarification.
- 🧪 Tests: Quality checklist validates spec against 16 criteria (content quality, requirement completeness, feature readiness). All items pass. Acceptance scenarios use GWT format, testable independently.
- 📁 Files: Created 2 files (spec.md: 210 lines; requirements.md: 147 lines checklist). Committed to 004-auth-persistence-ui branch.
- 🔁 Next prompts: Run `/sp.clarify` if any requirement needs refinement; run `/sp.plan` to design architecture; run `/sp.tasks` to generate implementation tasks.
- 🧠 Reflection: Spec balances comprehensiveness with clarity. User stories prioritized by business impact (P1 MVP flows, P2 polish). Functional requirements map to acceptance scenarios. Success criteria are measurable and user-focused (not implementation-focused). Assumptions document all defaults to unblock planning.

## Evaluation notes (flywheel)

- Failure modes observed: None. Specification generation succeeded on first iteration. No placeholder sections remain unfilled.
- Graders run and results (PASS/FAIL): PASS on all 16 quality checklist items. Spec ready for `/sp.plan`.
- Prompt variant (if applicable): Standard spec generation workflow with feature branch creation.
- Next experiment (smallest change to try): Proceed directly to `/sp.plan` to design API contracts and database migrations. No clarification iteration needed.
