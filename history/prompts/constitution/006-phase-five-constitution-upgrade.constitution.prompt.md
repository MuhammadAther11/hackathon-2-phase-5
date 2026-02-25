---
id: 006
title: Phase Five Constitution Upgrade
stage: constitution
date: 2026-02-17
surface: agent
model: claude-sonnet-4-5-20250929
feature: none
branch: main
user: us
command: /sp.constitution
labels: ["constitution", "phase-v", "event-driven", "dapr", "kafka", "cloud-deployment"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
  - .specify/templates/plan-template.md
tests:
  - none
---

## Prompt

for Phase-V You are an autonomous software engineering agent using the Agentic Dev Stack:
Spec → Plan → Tasks → Implement.
Manual coding by the user is not allowed.

All work must strictly follow Phase-5 requirements.

---

## Global Rules
- No manual coding by the user
- Always generate working code and configs
- Follow Spec → Plan → Tasks order
- Do not break Phase-4 deployment
- System must be cloud-ready and event-driven
- Prefer declarative configs (Helm, YAML, workflows)

---

## Phase V Scope

### Part A — Advanced Features
Implement:
- Priorities (high, medium, low)
- Tags (multiple per task)
- Search (title + description)
- Filter (status, priority, tag)
- Sort (due date, priority, created date, name)
- Recurring tasks (daily, weekly, monthly)
- Due dates and reminders

Architecture:
- All task actions publish events
- System must be event-driven

---

### Part B — Local Deployment (Minikube)

Integrate:
- Kafka (Redpanda or Strimzi)
- Dapr with:
  - Pub/Sub
  - State Store
  - Bindings / Jobs API
  - Secrets
  - Service Invocation

Rules:
- Kafka must be abstracted using Dapr Pub/Sub
- No direct Kafka client libraries after Dapr integration
- Dapr sidecar must run with backend services
- All components must work on Minikube first

Success:
- Events flow through Kafka via Dapr
- Reminders and recurring tasks trigger correctly
- System works fully on Minikube

---

### Part C — Cloud Deployment

Deploy to:
- AKS or GKE

Include:
- Dapr installed on cloud cluster
- Kafka via Redpanda / Confluent / Dapr PubSub
- Helm charts reused from Phase-4
- CI/CD via GitHub Actions
- Monitoring and logging enabled

Rules:
- No environment secrets in code
- Use Kubernetes or Dapr secrets
- Cloud deployment must mirror Minikube behavior

Success:
- App runs on cloud Kubernetes
- Kafka + Dapr operational
- CI/CD builds and deploys
- Logs and metrics available

---

## Architecture Rules
- Chat API publishes task events
- Recurring service consumes task events
- Notification service consumes reminders
- Services communicate via Dapr Pub/Sub
- No tight coupling between services

---

## Error Policy
- No hydration errors
- No broken API contracts
- No missing env variables
- No polling for reminders (use Dapr Jobs API)

---

## Output Rules
- Always stay inside Phase-5 scope
- Never re-implement Phase-4
- Always produce deployable output
- No speculative features
- Deterministic configs only

## Response snapshot

Updated constitution from v2.0.0 to v3.0.0 (MAJOR bump). Changes include:

1. **Core Principles expanded**: All five principles updated to incorporate event-driven architecture, Dapr integration, cloud deployment, and advanced task features.

2. **Key Standards expanded**: Added Event-Driven, Service Communication, and Declarative Config standards.

3. **Phase V section added** with subsections:
   - Advanced Task Features Standards (priorities, tags, search, filter, sort, recurring, due dates)
   - Event-Driven Architecture Standards (task events, Recurring Service, Notification Service)
   - Dapr Integration Standards (Pub/Sub, State Store, Jobs API, Secrets, Service Invocation)
   - Cloud Deployment Standards (AKS/GKE, Helm chart reuse, mirrored behavior)
   - CI/CD Standards (GitHub Actions, deterministic pipelines)

4. **Constraints expanded**: Added Event Stack and Cloud Stack constraints; Error Policy codified.

5. **Success Criteria expanded**: 20 criteria covering all Phase V requirements.

6. **Plan template updated**: Constitution Check now validates Phase V principles (Dapr, events, cloud, CI/CD).

## Outcome

- ✅ Impact: Constitution upgraded to v3.0.0 with full Phase V governance
- 🧪 Tests: N/A (governance document)
- 📁 Files: .specify/memory/constitution.md, .specify/templates/plan-template.md
- 🔁 Next prompts: Run `/sp.specify` for Phase V Part A features, then `/sp.plan`, then `/sp.tasks`
- 🧠 Reflection: Phase V introduces significant architectural complexity (event-driven + Dapr + cloud). Three-part implementation (A/B/C) mirrors spec scope well.

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): Manual review PASS — no unresolved placeholders, all principles testable
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Validate constitution alignment during /sp.specify for Part A features
