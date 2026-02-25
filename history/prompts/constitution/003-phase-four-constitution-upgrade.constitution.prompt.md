---
id: 003
title: Phase Four Constitution Upgrade
stage: constitution
date: 2026-02-14
surface: agent
model: claude-opus-4-6
feature: none
branch: main
user: user
command: /sp.constitution (Phase-IV Upgrade)
labels: ["architecture","phase-4","constitution","cloud-native","kubernetes","docker","helm"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
  - .specify/templates/plan-template.md
tests:
  - null
---

## Prompt

# sp.constitution

## Purpose
Upgrade project from Phase-III to Phase-IV using Spec-Driven Infrastructure Automation.

## Update Instruction
- Replace Phase-III constitution with Phase-IV rules.
- Keep Phase-III app logic (Todo Chatbot).
- Add cloud-native deployment rules.

## Phase-IV Constitution Rules
- No manual coding allowed.
- All work must follow:
  spec -> plan -> tasks -> implementation
- Use AI agents for DevOps tasks.

## Infrastructure Policy
- Frontend and backend must be containerized.
- Use Docker (or Gordon if available).
- Deployment must use:
  - Minikube
  - Helm Charts
  - kubectl-ai
  - kagent

## AI Ops Rules
- Docker actions via Gordon or Claude Code.
- Kubernetes actions via kubectl-ai and kagent.
- Human only writes specs and reviews output.

## Deployment Goal
- App runs on local Minikube cluster.
- Helm manages releases.
- Chatbot from Phase-III works without change.

## Result
- Phase-III constitution updated to Phase-IV.
- Project becomes Cloud-Native.
- Infra controlled by specs, not manual commands.

## Response snapshot

Updated constitution from v1.0.0 to v2.0.0 (MAJOR version bump):

**Principles updated:**
- I. Security & Isolation: expanded for Kubernetes namespace access control and K8s Secrets
- II. Accuracy & State Integrity: added stateless container constraint
- III. Reliability -> Reliability & Operational Readiness: added health checks, liveness/readiness probes
- IV. Usability & Responsiveness: added ChatKit containerized deployment constraint
- V. Reproducibility -> Reproducibility & Infrastructure as Code: redefined for Dockerfiles, Helm charts, single helm install

**New sections added:**
- Phase IV: Cloud-Native Deployment Rules (Spec-Driven Infrastructure Automation, Containerization Standards, Kubernetes Deployment Standards, AI Ops Rules)
- Key Standards expanded with Containerization and Orchestration

**Template propagation:**
- plan-template.md Constitution Check updated to reflect all 5 Phase IV principles

**Constraints preserved:**
- All Phase III chatbot functionality (MCP tools, OpenAI Agent, ChatKit UI) carried forward unchanged

## Outcome

- Impact: Establishes Phase IV cloud-native governance; adds Docker, Minikube, Helm, kubectl-ai, kagent as mandatory infrastructure tooling; preserves Phase III chatbot functionality
- Tests: No code tests; constitution is a governance artifact
- Files: constitution.md updated (v2.0.0), plan-template.md Constitution Check updated
- Next prompts: `/sp.specify` for containerization feature spec; `/sp.plan` for Helm chart architecture
- Reflection: Clean upgrade path from Phase III to Phase IV; all app logic preserved while adding infrastructure-as-code mandate

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): n/a
- Prompt variant (if applicable): n/a
- Next experiment: Proceed to feature specification for Docker + Helm deployment
