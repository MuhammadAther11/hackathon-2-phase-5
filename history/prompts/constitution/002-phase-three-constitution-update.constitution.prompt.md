---
id: 002
title: Phase III Constitution Update
stage: constitution
date: 2026-02-07
surface: agent
model: claude-haiku-4-5-20251001
feature: none
branch: main
user: user
command: /sp.constitution (Phase-III Update)
labels: ["architecture","phase-3","constitution","agentic-dev"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - CLAUDE.md
tests:
  - null
---

## Prompt

Update CLAUDE.md with Phase III details

Project: Phase III – Todo AI Chatbot (MCP + OpenAI Agents)

Core principles:
- Natural language task management
- Stateless server, state in database
- Tool-driven AI (no direct DB access)
- Clear separation: UI, API, Agent, MCP tools

Standards:
- All task actions via MCP tools
- Agent must select tools correctly
- Conversation stored in DB
- Structured JSON responses
- Graceful error handling

Architecture:
- Frontend: OpenAI ChatKit
- Backend: FastAPI
- AI: OpenAI Agents SDK
- MCP: Official MCP SDK
- ORM: SQLModel
- DB: Neon PostgreSQL
- Auth: Better Auth

Constraints:
- Follow Agentic Dev workflow (spec → plan → tasks → implement)
- No manual coding
- No hardcoded secrets
- Integrate with Phase-II backend

Success criteria:
- Users manage todos by chat
- Tools persist tasks correctly
- Agent behavior is correct
- Chat resumes after restart
- Frontend fully integrated

## Response snapshot

Updated CLAUDE.md with:
- Phase III project vision (Todo AI Chatbot with MCP + OpenAI Agents)
- Frontend Architecture: ChatKit UI integration
- Backend & AI Architecture: FastAPI, OpenAI Agent SDK, MCP tools, conversation persistence
- Specialized Agent Mandate updated with MCP tool integration guidance
- Phase III Constraints & Requirements section: core principles, architecture rules, Phase II integration
- Phase III Success Criteria: 8 testable checkpoints covering chat, MCP tools, persistence, auth, and agentic workflow

## Outcome

- ✅ Impact: Establishes Phase III architectural foundation; clarifies role of MCP tools, AI Agent, and database persistence in chatbot workflow
- 🧪 Tests: No code tests; constitution is governance artifact
- 📁 Files: CLAUDE.md updated; PHR created
- 🔁 Next prompts: `/sp.specify` for Phase III feature spec; `/sp.plan` for detailed architecture
- 🧠 Reflection: Constitution now clearly separates Phase II (web app) from Phase III (AI chatbot), specifying MCP-first tool execution pattern and stateless server design

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): n/a
- Prompt variant (if applicable): n/a
- Next experiment: Proceed to specification phase for Phase III feature breakdown
