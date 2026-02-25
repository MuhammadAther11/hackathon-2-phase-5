---
id: 004
title: Update CLAUDE.md for Phase Four
stage: constitution
date: 2026-02-14
surface: agent
model: claude-opus-4-6
feature: none
branch: main
user: user
command: update CLAUDE.md for Phase IV + new agents
labels: ["claude-md","phase-4","constitution","agents","helm","kubectl","infrastructure"]
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

update claude.md file according to constitution for phase-4 and also add new agents in claude.md file

Context: Two new agents were created via /agents command:
- helm-chart-engineer
- kubectl-ai

## Response snapshot

Updated CLAUDE.md with the following Phase IV changes:

**Opening paragraph:** Phase III goal replaced with Phase IV: "containerize and deploy the Todo AI Chatbot to a local Kubernetes cluster"

**Tech stack table:** Added 4 new infrastructure layers:
- Containerization: Docker (multi-stage builds)
- Orchestration: Minikube (local Kubernetes)
- Package Manager: Helm Charts
- AI Ops: kubectl-ai, kagent, Gordon (Docker)

**New section — Infrastructure Architecture:** Covers containerization, orchestration, Helm, ConfigMaps/Secrets, resource management, AI Ops, security, and SDD workflow for infra.

**Backend & AI Architecture:** Updated State Management (no in-memory state survives container restarts), Conversation Persistence (persists across pod restarts), added Health Checks (`/health` endpoint).

**Specialized Agent Mandate:** Reorganized into:
- Phase III Agents (Application Layer) — 9 existing agents preserved
- Phase IV Agents (Infrastructure Layer) — 2 new agents added:
  - `helm-chart-engineer`: Helm chart generation/optimization/release management
  - `kubectl-ai`: Kubernetes cluster interaction via Minikube
- Usage Guidelines split into Application (Phase III) and Infrastructure (Phase IV) subsections

**Phase III Constraints:** Renamed to "Phase III Constraints (Preserved Application Layer)" — kept intact

**New section — Phase IV Constraints & Requirements:** Core Principles, Infrastructure Rules, AI Ops Rules, Integration with Phase III

**New section — Phase IV Success Criteria:** 10 testable checkpoints covering containerization, Helm deployment, K8s probes, secrets, AI Ops, persistence, and documentation

## Outcome

- Impact: CLAUDE.md now fully aligned with constitution v2.0.0; new agents integrated into agent mandate
- Tests: No code tests; governance artifact
- Files: CLAUDE.md updated
- Next prompts: `/sp.specify` for containerization feature; `/sp.plan` for Helm chart architecture
- Reflection: Clean separation maintained between Phase III (app) and Phase IV (infra) concerns in CLAUDE.md

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): n/a
- Prompt variant (if applicable): n/a
- Next experiment: Begin feature specification for Docker + Helm deployment
