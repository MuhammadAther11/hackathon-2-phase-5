---
id: 1
title: Initialize Todo Project Constitution
stage: constitution
date: 2026-01-09
surface: agent
model: claude-sonnet-4-5-20250929
feature: none
branch: master
user: default
command: /sp.constitution
labels: [constitution, project-init, standards]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
 - .specify/memory/constitution.md
 - .specify/templates/plan-template.md
 - .specify/templates/spec-template.md
 - .specify/templates/tasks-template.md
tests:
 - none
---

## Prompt

Project: Todo Full-Stack Web Application

Core principles:
- Security: All authentication flows must ensure user isolation and JWT token integrity
- Accuracy: Backend operations must correctly reflect frontend actions and database state
- Reliability: APIs must handle errors gracefully and maintain consistent data
- Usability: Frontend interface must be responsive, intuitive, and user-friendly
- Reproducibility: All operations and configurations must be documented for setup and testing

Key standards:
- Authentication: All API calls require valid JWT token; unauthorized requests return 401
- API Compliance: Endpoints must follow REST conventions with proper HTTP methods
- Database Integrity: Task ownership enforced; data stored persistently in Neon PostgreSQL
- Frontend Integration: Next.js frontend must attach JWT to all requests and display responses accurately
- Coding & Documentation: Clear, readable code with comments and setup instructions; environment variables properly documented

Constraints:
- All 5 basic-level features fully implemented (list, create, update, delete, toggle task)
- Responsive frontend supporting desktop and mobile views
- JWT tokens configured with shared secret via environment variable BETTER_AUTH_SECRET
- Backend built with FastAPI + SQLModel ORM
- Frontend built with Next.js 16+ using App Router
- No manual coding outside Claude Code workflow; all implementation generated via specs

Success criteria:
- All API endpoints functional and secure
- User authentication flows fully operational
- Task operations correctly linked to authenticated users
- Responsive UI properly integrated with backend
- All code and configurations reproducible in a new environment
- Documentation complete for setup, JWT integration, and task management

## Response snapshot

Created the Todo Full-Stack Web Application Constitution (v1.0.0) based on user requirements. Propagated project-specific principles (Security, Accuracy, Reliability, Usability, Reproducibility) and technical constraints (FastAPI, Next.js, Neon DB, JWT) to dependent templates (spec, plan, tasks).

## Outcome

- ✅ Impact: Project principles and tech stack standards solidified and propagated to all SDD templates.
- 🧪 Tests: n/a
- 📁 Files: constitution.md, plan-template.md, spec-template.md, tasks-template.md
- 🔁 Next prompts: /sp.specify for initial features
- 🧠 Reflection: User provided a very detailed set of principles and success criteria which were used to replace generic placeholders and set specific technical standards for the project.

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): n/a
- Prompt variant (if applicable): null
- Next experiment (smallest change to try): n/a
