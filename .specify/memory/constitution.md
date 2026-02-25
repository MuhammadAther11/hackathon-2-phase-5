<!--
Sync Impact Report:
Version change: 2.0.0 -> 3.0.0
Bump rationale: MAJOR — backward-incompatible governance redefinition;
  Phase IV principles extended with Phase V event-driven architecture;
  new mandatory Kafka + Dapr policies, cloud deployment rules, and
  advanced feature requirements added; new microservice boundaries
  (recurring service, notification service) introduced.

List of modified principles:
- I. Security & Isolation -> I. Security & Isolation (expanded for Dapr
  secrets, cloud IAM, multi-cluster)
- II. Accuracy & State Integrity -> II. Accuracy & State Integrity
  (expanded for event consistency and Dapr state store)
- III. Reliability & Operational Readiness -> III. Reliability &
  Operational Readiness (expanded for event-driven fault tolerance,
  Dapr resiliency)
- IV. Usability & Responsiveness -> IV. Usability & Responsiveness
  (expanded for advanced task features: priorities, tags, search,
  filter, sort, due dates)
- V. Reproducibility & Infrastructure as Code -> V. Reproducibility &
  Infrastructure as Code (expanded for cloud deployment, CI/CD,
  Dapr component YAML)

Added sections:
- Phase V: Event-Driven Architecture & Cloud Deployment Rules
- Event-Driven Architecture Standards
- Dapr Integration Standards
- Cloud Deployment Standards
- Advanced Task Features Standards
- CI/CD Standards

Removed sections: none (Phase III + IV rules preserved)

Templates requiring updates:
- .specify/templates/plan-template.md — Constitution Check ✅ updated
- .specify/templates/spec-template.md — FR references (no change needed)
- .specify/templates/tasks-template.md — Phase structure (no change needed)

Follow-up TODOs: none
-->

# Todo Full-Stack Web Application Constitution

## Core Principles

### I. Security & Isolation
All authentication flows MUST ensure strict user isolation and JWT
token integrity. Access control MUST be enforced at every layer —
application, API gateway, Kubernetes namespace, and Dapr component
scope — to prevent unauthorized data access or modification. Secrets
MUST be managed via environment variables, Kubernetes Secrets, or
Dapr Secrets components; hardcoded credentials are prohibited. Cloud
deployments MUST use platform-native secret stores (Azure Key Vault,
GCP Secret Manager) via Dapr Secrets bindings. No environment secrets
in code; all sensitive values MUST be injected at runtime.

### II. Accuracy & State Integrity
Backend operations MUST correctly reflect frontend actions and
synchronize with the database state. Data consistency is
non-negotiable across all system boundaries. The stateless server
design MUST persist all state in the database; no in-memory state
may survive container restarts. Event-driven operations MUST
guarantee at-least-once delivery; consumers MUST be idempotent.
Dapr State Store usage MUST NOT replace the database as source of
truth; the database (Neon PostgreSQL) remains the authoritative
store for all task and conversation data.

### III. Reliability & Operational Readiness
APIs MUST handle errors gracefully, return appropriate HTTP status
codes, and maintain consistent data even under failure conditions.
Containers MUST include health check endpoints. Kubernetes
deployments MUST define liveness and readiness probes. System
stability across pod restarts, scaling events, and event replay
is a primary goal. Event consumers MUST handle poison messages
gracefully (dead-letter or skip after retry). Dapr resiliency
policies MUST be configured for all pub/sub and service invocation
components. No polling for reminders; the Dapr Jobs API MUST be
used for scheduled operations (recurring tasks, due date reminders).

### IV. Usability & Responsiveness
The frontend interface MUST be responsive, intuitive, and
user-friendly across both desktop and mobile views. User experience
MUST be consistent and logical. The ChatKit UI from Phase III MUST
work without modification under containerized deployment. Advanced
task features (priorities, tags, search, filter, sort, due dates)
MUST integrate seamlessly into the existing natural language chat
interface without breaking existing task management workflows.

### V. Reproducibility & Infrastructure as Code
All operations, configurations, and environment setups MUST be
defined as code (Dockerfiles, Helm charts, YAML manifests, Dapr
component definitions, GitHub Actions workflows). The project MUST
be deployable to a fresh Minikube cluster with a single
`helm install` command. Cloud deployment MUST mirror Minikube
behavior with environment-specific overrides only. Manual
infrastructure steps are prohibited; all infrastructure MUST be
spec-driven. CI/CD pipelines MUST be declarative (GitHub Actions
YAML) and produce deterministic, reproducible builds.

## Key Standards

- **Authentication**: All API calls require a valid JWT token;
  unauthorized requests MUST return 401.
- **API Compliance**: Endpoints MUST follow REST conventions with
  proper HTTP methods and status codes.
- **Database Integrity**: Task ownership MUST be enforced at the
  schema/query level; data stored persistently in Neon PostgreSQL.
- **Frontend Integration**: Next.js frontend MUST attach JWT to all
  requests and display server responses accurately.
- **Coding & Documentation**: Clear, readable code with purposeful
  comments; environment variables MUST be documented in
  `.env.example`.
- **Containerization**: Frontend and backend MUST each have a
  production-ready Dockerfile with multi-stage builds.
- **Orchestration**: All services MUST be deployable via Helm charts
  to Minikube and cloud Kubernetes clusters.
- **Event-Driven**: All task actions MUST publish events via Dapr
  Pub/Sub; no direct Kafka client libraries after Dapr integration.
- **Service Communication**: Services MUST communicate via Dapr
  Pub/Sub and Service Invocation; no tight coupling between services.
- **Declarative Config**: Prefer Helm, YAML, and workflow definitions
  over imperative scripts.

## Phase IV: Cloud-Native Deployment Rules

### Spec-Driven Infrastructure Automation
All infrastructure work MUST follow the SDD workflow:
spec -> plan -> tasks -> implementation. No manual coding or
ad-hoc infrastructure changes are permitted. AI agents handle
DevOps tasks; humans write specs and review output.

### Containerization Standards
- Frontend and backend MUST be containerized with Docker.
- Docker actions MUST be executed via Gordon (if available) or
  Claude Code agents.
- Images MUST use minimal base images and multi-stage builds.
- Containers MUST NOT run as root.
- Each container MUST expose a health check endpoint.

### Kubernetes Deployment Standards
- Deployment target: local Minikube cluster and cloud Kubernetes.
- All resources MUST be managed via Helm charts.
- Kubernetes actions MUST be executed via `kubectl-ai` and `kagent`.
- Deployments MUST define resource requests/limits, liveness probes,
  and readiness probes.
- ConfigMaps and Secrets MUST be used for environment configuration.
- Helm MUST manage all releases and upgrades.

### AI Ops Rules
- Docker build/push/run actions: via Gordon or Claude Code.
- Kubernetes apply/scale/rollout actions: via `kubectl-ai` and
  `kagent`.
- Human role: write specifications, review output, approve releases.
- Automated agents MUST NOT push to production without human
  approval.

## Phase V: Event-Driven Architecture & Cloud Deployment Rules

### Advanced Task Features Standards
- Tasks MUST support priorities (high, medium, low).
- Tasks MUST support multiple tags per task.
- Search MUST operate on title and description fields.
- Filter MUST support status, priority, and tag dimensions.
- Sort MUST support due date, priority, created date, and name.
- Recurring tasks MUST support daily, weekly, and monthly schedules.
- Due dates and reminders MUST be implemented via Dapr Jobs API;
  no polling-based approaches are permitted.
- All advanced features MUST be accessible via natural language
  commands through the existing chat interface.

### Event-Driven Architecture Standards
- All task actions (create, update, delete, toggle, recurring
  trigger) MUST publish events.
- The Chat API MUST publish task events to Dapr Pub/Sub.
- A dedicated Recurring Service MUST consume task events and
  manage recurring task scheduling.
- A dedicated Notification Service MUST consume reminder events
  and deliver due date notifications.
- Events MUST flow through Kafka via Dapr Pub/Sub abstraction.
- No direct Kafka client libraries are permitted after Dapr
  integration; all messaging MUST use Dapr Pub/Sub APIs.
- Services MUST NOT be tightly coupled; communication MUST use
  Dapr Pub/Sub or Dapr Service Invocation exclusively.

### Dapr Integration Standards
- Dapr MUST be integrated with the following building blocks:
  - **Pub/Sub**: Kafka-backed message broker for all event routing.
  - **State Store**: For ephemeral/operational state (NOT replacing
    the database as source of truth).
  - **Bindings / Jobs API**: For scheduled operations (recurring
    tasks, due date reminders).
  - **Secrets**: For runtime secret injection from platform-native
    stores.
  - **Service Invocation**: For synchronous inter-service
    communication where required.
- Dapr sidecars MUST run alongside all backend services.
- Kafka MUST be deployed via Redpanda or Strimzi on Kubernetes.
- Kafka MUST be abstracted entirely behind Dapr Pub/Sub; no
  service may use a Kafka client library directly.
- All Dapr component definitions MUST be declarative YAML managed
  via Helm charts.

### Cloud Deployment Standards
- Cloud deployment target: AKS or GKE.
- Dapr MUST be installed on the cloud cluster.
- Kafka MUST be available via Redpanda, Confluent, or Dapr
  PubSub-compatible provider.
- Helm charts from Phase IV MUST be reused and extended for cloud
  deployment with environment-specific value overrides.
- Cloud deployment MUST mirror Minikube behavior; no
  environment-specific application code changes are permitted.
- Monitoring and logging MUST be enabled in cloud deployments.
- All components MUST work on Minikube first before cloud
  deployment.

### CI/CD Standards
- CI/CD MUST be implemented via GitHub Actions.
- Pipelines MUST build, test, and deploy deterministically.
- No environment secrets in workflow files; use GitHub Secrets
  and Kubernetes/Dapr Secrets.
- Deployments MUST be automated but require human approval for
  production releases.

## Constraints

- **Feature Set**: Phase III chatbot functionality MUST be preserved:
  task listing, creation, updating, deletion, and toggle status via
  natural language chat. Phase V adds priorities, tags, search,
  filter, sort, recurring tasks, due dates, and reminders.
- **Viewport Support**: Responsive frontend supporting desktop and
  mobile views.
- **Security Config**: JWT tokens configured with shared secret via
  `BETTER_AUTH_SECRET`.
- **Backend Stack**: FastAPI + SQLModel ORM.
- **Frontend Stack**: Next.js 16+ using App Router with ChatKit UI.
- **AI Stack**: OpenAI Agents SDK + Official MCP SDK.
- **Infrastructure Stack**: Docker + Minikube + Helm + kubectl-ai +
  kagent.
- **Event Stack**: Kafka (Redpanda or Strimzi) + Dapr (Pub/Sub,
  State Store, Bindings/Jobs API, Secrets, Service Invocation).
- **Cloud Stack**: AKS or GKE + Dapr + Kafka + GitHub Actions CI/CD.
- **Workflow**: 100% of implementation MUST be generated via
  Spec-Driven Development (SDD) workflow. No manual coding allowed.
- **Error Policy**: No hydration errors, no broken API contracts,
  no missing env variables, no polling for reminders.

## Success Criteria

- All Phase III chatbot functionality works without modification
  under containerized deployment.
- All Phase IV deployment infrastructure (Docker, Helm, Minikube)
  remains operational and unbroken.
- Frontend and backend containerized with production-ready
  Dockerfiles.
- Application deployable to Minikube via `helm install`.
- Application deployable to cloud Kubernetes (AKS or GKE).
- Kubernetes deployments include health checks, resource limits,
  and proper secret management.
- All infrastructure defined as code (no manual kubectl commands
  outside of AI agent execution).
- AI agents (Gordon, kubectl-ai, kagent) used for all DevOps
  operations.
- All API endpoints functional and secure against unauthorized
  access.
- Conversation history persists across pod restarts.
- Advanced task features (priorities, tags, search, filter, sort,
  recurring, due dates, reminders) fully operational via chat.
- Events flow through Kafka via Dapr Pub/Sub for all task actions.
- Recurring tasks trigger correctly on schedule via Dapr Jobs API.
- Reminders and notifications delivered without polling.
- Dapr sidecars run with all backend services.
- System works fully on Minikube before cloud deployment.
- Cloud deployment mirrors Minikube behavior.
- CI/CD pipeline builds and deploys via GitHub Actions.
- Monitoring and logging enabled in cloud deployments.
- Documentation complete for both Minikube and cloud deployment.
- Agentic Dev workflow complete: Spec -> Plan -> Tasks ->
  Implementation.

## Governance

- This constitution supersedes all other project practices.
- Amendments require a version bump and rationale in the Sync
  Impact Report.
- All implementation tasks MUST verify compliance with these
  principles.
- Version changes follow semantic versioning:
  - MAJOR: Backward-incompatible governance/principle changes.
  - MINOR: New principle/section added or materially expanded.
  - PATCH: Clarifications, wording, non-semantic refinements.
- Compliance reviews MUST occur at each SDD phase gate
  (spec, plan, tasks, implementation).

**Version**: 3.0.0 | **Ratified**: 2026-01-09 | **Last Amended**: 2026-02-17
