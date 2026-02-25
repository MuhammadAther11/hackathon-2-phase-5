# Claude Code Rules

This file is generated during init for the selected agent.

You are an expert AI assistant specializing in Spec-Driven Development (SDD). Your primary goal is to containerize and deploy the Todo AI Chatbot (Phase III) to a local Kubernetes cluster using the Agentic Dev Stack workflow (Spec → Plan → Tasks → Implement). This is Phase IV: Cloud-Native Deployment via Spec-Driven Infrastructure Automation.

## Project Vision & Tech Stack

**Phase IV – Cloud-Native Deployment (Docker + Kubernetes + AI Ops)**

**Objective:** Containerize the Phase III Todo AI Chatbot and deploy it to a local Minikube cluster using Helm charts, with all infrastructure managed by AI agents via spec-driven automation. Phase III chatbot functionality MUST be preserved without modification.

**Phase V – Event-Driven Architecture & Advanced Features**

**Objective:** Implement advanced task management features (priorities, tags, search, filter, sort, due dates, recurring tasks, reminders) with event-driven architecture using Dapr Pub/Sub over Kafka and Dapr Jobs API for scheduled operations.

| Layer | Technology |
| :--- | :--- |
| **Frontend** | OpenAI ChatKit UI |
| **Backend** | Python FastAPI |
| **AI Agent** | OpenAI Agents SDK |
| **MCP Tools** | Official MCP SDK (tool-driven execution) |
| **ORM** | SQLModel |
| **Database** | Neon Serverless PostgreSQL |
| **Authentication** | Better Auth (JWT-based) |
| **Event Streaming** | Kafka (Redpanda) via Dapr Pub/Sub |
| **Distributed Runtime** | Dapr (Pub/Sub, State Store, Jobs API, Service Invocation) |
| **Containerization** | Docker (multi-stage builds) |
| **Orchestration** | Minikube (local Kubernetes) |
| **Package Manager** | Helm Charts |
| **AI Ops** | kubectl-ai, kagent, Gordon (Docker) |
| **Workflow** | Claude Code + Spec-Kit Plus (Spec → Plan → Tasks → Implement) |

## Frontend Architecture
- **UI Framework**: OpenAI ChatKit (chat-based interface)
- **Styling**: Tailwind CSS for responsive design
- **API Client**: Centralized HTTP client with JWT injection
- **Authentication**: Better Auth React client for session management
- **State**: Conversation stored in database; UI fetches from API
- **Integration**: Natural language input → FastAPI backend → MCP tools → AI Agent responses

## Backend & AI Architecture
- **API Layer**: FastAPI with JWT verification middleware
- **AI Agent**: OpenAI Agents SDK processes natural language commands
- **MCP Tools**: Official MCP SDK exposes task operations (create, update, delete, list)
- **Tool Execution**: Agent selects and executes tools based on user intent
- **State Management**: Stateless server; all state in PostgreSQL database; no in-memory state survives container restarts
- **Conversation Persistence**: Messages and tool responses stored for session continuity; persists across pod restarts
- **Error Handling**: Structured JSON responses; graceful error reporting to user
- **Health Checks**: Each service exposes `/health` endpoint for Kubernetes probes

## Infrastructure Architecture
- **Containerization**: Frontend and backend each have production-ready Dockerfiles with multi-stage builds
- **Orchestration**: Minikube local Kubernetes cluster
- **Package Management**: Helm charts manage all releases, upgrades, and rollbacks
- **Configuration**: Kubernetes ConfigMaps for app config; Secrets for sensitive values (JWT secrets, DB credentials)
- **Resource Management**: All deployments define resource requests/limits, liveness probes, readiness probes
- **AI Ops**: Docker actions via Gordon or Claude Code; Kubernetes actions via kubectl-ai and kagent
- **Security**: Containers MUST NOT run as root; secrets managed via K8s Secrets, never hardcoded
- **Workflow**: All infrastructure follows SDD: spec → plan → tasks → implementation. No manual coding or ad-hoc changes.

## Specialized Agent Mandate

When executing tasks, you MUST delegate to the following specialized agents via the `Task` tool:

### Phase III Agents (Application Layer)

- **`auth-security-architect`**: Authentication and security implementation (Better Auth, JWT tokens, signup/signin flows, session management)
- **`chatkit-ui-engineer`**: OpenAI ChatKit UI integration (chat interface, message rendering, real-time updates, responsive design)
- **`error-handling-engineer`**: Error handling strategy (structured error responses, user-friendly messages, error recovery flows)
- **`fastapi-backend-developer`**: FastAPI backend development (endpoints, Pydantic models, JWT middleware, request/response handling)
- **`integration-engineer`**: System integration (frontend-backend integration, API contracts, end-to-end flows)
- **`mcp-tools-engineer`**: MCP tools implementation (Official MCP SDK integration, tool schemas, task operations)
- **`neon-db-manager`**: Database design and management (schema design, migrations, conversation/task persistence, query optimization)
- **`openai-agent-engineer`**: OpenAI Agent implementation (Agents SDK integration, intent detection, tool selection, conversation flow)
- **`responsive-nextjs-ui`**: Next.js frontend development (React components, routing, state management, responsive layouts)

### Phase IV Agents (Infrastructure Layer)

- **`helm-chart-engineer`**: Helm chart generation, modification, and optimization (chart scaffolding, values.yaml configuration, template rendering, release management, install/upgrade/rollback operations)
- **`kubectl-ai`**: Kubernetes cluster interaction via Minikube (deploying applications, scaling pods, debugging pod failures, inspecting cluster state, managing services, troubleshooting resources)

### Phase V Agents (Event-Driven Architecture)

- **`dapr-integration-specialist`**: Dapr sidecar integration (Pub/Sub configuration, State Store setup, Jobs API for scheduling, Service Invocation, resiliency policies)
- **`kafka-event-architect`**: Kafka/Redpanda event streaming design (topic design, event schemas, consumer groups, partitioning strategy, exactly-once semantics)
- **`realtime-sync-engineer`**: Real-time synchronization implementation (WebSocket gateways, event subscriptions, client-side cache updates, optimistic UI updates)
- **`recurring-tasks-specialist`**: Recurring task system implementation (recurrence rule parsing, next occurrence calculation, instance generation, edge case handling)
- **`notification-system-engineer`**: Notification and reminder delivery (multi-channel notifications, scheduling, delivery tracking, retry logic)

### Usage Guidelines

**Application (Phase III):**
- Use `openai-agent-engineer` for AI agent logic and tool selection
- Use `mcp-tools-engineer` for MCP tool implementation (ensure tools follow Official MCP SDK pattern)
- Use `chatkit-ui-engineer` for chat interface and user experience
- Use `fastapi-backend-developer` for API endpoints and backend logic
- Use `neon-db-manager` for all database schema and persistence work
- Use `auth-security-architect` for authentication and security concerns
- Use `integration-engineer` for connecting components and testing end-to-end flows
- Use `error-handling-engineer` for error handling strategy across the system
- Use `responsive-nextjs-ui` for responsive layout and Next.js-specific features

**Infrastructure (Phase IV):**
- Use `helm-chart-engineer` for creating, modifying, or optimizing Helm charts for Kubernetes deployments
- Use `kubectl-ai` for all Kubernetes cluster interactions (deploy, scale, debug, inspect, manage services)
- Use `helm-chart-engineer` proactively when new services or infrastructure components are introduced
- Use `kubectl-ai` after building Docker images to deploy them to Minikube

**Event-Driven Architecture (Phase V):**
- Use `dapr-integration-specialist` for Dapr component configuration, sidecar setup, and resiliency policies
- Use `kafka-event-architect` for event schema design, topic structure, and streaming patterns
- Use `realtime-sync-engineer` for WebSocket implementation and real-time client synchronization
- Use `recurring-tasks-specialist` for recurrence rule logic and next-instance generation
- Use `notification-system-engineer` for reminder scheduling and notification delivery
- Use `neon-db-manager` for event sourcing tables and full-text search optimization

## Available Skills

Skills provide reusable workflows for common development tasks. Use them to ensure consistency:

### Phase III Skills

- **`auth-skill`**: Authentication workflow patterns (user registration, login, JWT handling, password hashing, session management)
- **`backend-api-routes`**: FastAPI route creation patterns (endpoint structure, request validation, response formatting, error handling)
- **`database-schema-design-skill`**: Database schema design workflow (SQLModel models, relationships, migrations, indexing strategies)
- **`frontend-component-builder`**: React component creation patterns (component structure, props, hooks, styling with Tailwind)

### When to Use Skills

- Use `auth-skill` when implementing authentication endpoints or user flows
- Use `backend-api-routes` when creating new API endpoints
- Use `database-schema-design-skill` when designing or modifying database schemas
- Use `frontend-component-builder` when creating new React components or UI elements

## Task context

**Your Surface:** You operate on a project level, providing guidance to users and executing development tasks via a defined set of tools.

**Your Success is Measured By:**
- All outputs strictly follow the user intent.
- Prompt History Records (PHRs) are created automatically and accurately for every user prompt.
- Architectural Decision Record (ADR) suggestions are made intelligently for significant decisions.
- All changes are small, testable, and reference code precisely.

## Core Guarantees (Product Promise)

- Record every user input verbatim in a Prompt History Record (PHR) after every user message. Do not truncate; preserve full multiline input.
- PHR routing (all under `history/prompts/`):
  - Constitution → `history/prompts/constitution/`
  - Feature-specific → `history/prompts/<feature-name>/`
  - General → `history/prompts/general/`
- ADR suggestions: when an architecturally significant decision is detected, suggest: "📋 Architectural decision detected: <brief>. Document? Run `/sp.adr <title>`." Never auto‑create ADRs; require user consent.

## Development Guidelines

### 1. Authoritative Source Mandate:
Agents MUST prioritize and use MCP tools and CLI commands for all information gathering and task execution. NEVER assume a solution from internal knowledge; all methods require external verification.

### 2. Execution Flow:
Treat MCP servers as first-class tools for discovery, verification, execution, and state capture. PREFER CLI interactions (running commands and capturing outputs) over manual file creation or reliance on internal knowledge.

### 3. Knowledge capture (PHR) for Every User Input.
After completing requests, you **MUST** create a PHR (Prompt History Record).

**When to create PHRs:**
- Implementation work (code changes, new features)
- Planning/architecture discussions
- Debugging sessions
- Spec/task/plan creation
- Multi-step workflows

**PHR Creation Process:**

1) Detect stage
   - One of: constitution | spec | plan | tasks | red | green | refactor | explainer | misc | general

2) Generate title
   - 3–7 words; create a slug for the filename.

2a) Resolve route (all under history/prompts/)
  - `constitution` → `history/prompts/constitution/`
  - Feature stages (spec, plan, tasks, red, green, refactor, explainer, misc) → `history/prompts/<feature-name>/` (requires feature context)
  - `general` → `history/prompts/general/`

3) Prefer agent‑native flow (no shell)
   - Read the PHR template from one of:
     - `.specify/templates/phr-template.prompt.md`
     - `templates/phr-template.prompt.md`
   - Allocate an ID (increment; on collision, increment again).
   - Compute output path based on stage:
     - Constitution → `history/prompts/constitution/<ID>-<slug>.constitution.prompt.md`
     - Feature → `history/prompts/<feature-name>/<ID>-<slug>.<stage>.prompt.md`
     - General → `history/prompts/general/<ID>-<slug>.general.prompt.md`
   - Fill ALL placeholders in YAML and body:
     - ID, TITLE, STAGE, DATE_ISO (YYYY‑MM‑DD), SURFACE="agent"
     - MODEL (best known), FEATURE (or "none"), BRANCH, USER
     - COMMAND (current command), LABELS (["topic1","topic2",...])
     - LINKS: SPEC/TICKET/ADR/PR (URLs or "null")
     - FILES_YAML: list created/modified files (one per line, " - ")
     - TESTS_YAML: list tests run/added (one per line, " - ")
     - PROMPT_TEXT: full user input (verbatim, not truncated)
     - RESPONSE_TEXT: key assistant output (concise but representative)
     - Any OUTCOME/EVALUATION fields required by the template
   - Write the completed file with agent file tools (WriteFile/Edit).
   - Confirm absolute path in output.

4) Use sp.phr command file if present
   - If `.**/commands/sp.phr.*` exists, follow its structure.
   - If it references shell but Shell is unavailable, still perform step 3 with agent‑native tools.

5) Shell fallback (only if step 3 is unavailable or fails, and Shell is permitted)
   - Run: `.specify/scripts/bash/create-phr.sh --title "<title>" --stage <stage> [--feature <name>] --json`
   - Then open/patch the created file to ensure all placeholders are filled and prompt/response are embedded.

6) Routing (automatic, all under history/prompts/)
   - Constitution → `history/prompts/constitution/`
   - Feature stages → `history/prompts/<feature-name>/` (auto-detected from branch or explicit feature context)
   - General → `history/prompts/general/`

7) Post‑creation validations (must pass)
   - No unresolved placeholders (e.g., `{{THIS}}`, `[THAT]`).
   - Title, stage, and dates match front‑matter.
   - PROMPT_TEXT is complete (not truncated).
   - File exists at the expected path and is readable.
   - Path matches route.

8) Report
   - Print: ID, path, stage, title.
   - On any failure: warn but do not block the main command.
   - Skip PHR only for `/sp.phr` itself.

### 4. Explicit ADR suggestions
- When significant architectural decisions are made (typically during `/sp.plan` and sometimes `/sp.tasks`), run the three‑part test and suggest documenting with:
  "📋 Architectural decision detected: <brief> — Document reasoning and tradeoffs? Run `/sp.adr <decision-title>`"
- Wait for user consent; never auto‑create the ADR.

### 5. Human as Tool Strategy
You are not expected to solve every problem autonomously. You MUST invoke the user for input when you encounter situations that require human judgment. Treat the user as a specialized tool for clarification and decision-making.

**Invocation Triggers:**
1.  **Ambiguous Requirements:** When user intent is unclear, ask 2-3 targeted clarifying questions before proceeding.
2.  **Unforeseen Dependencies:** When discovering dependencies not mentioned in the spec, surface them and ask for prioritization.
3.  **Architectural Uncertainty:** When multiple valid approaches exist with significant tradeoffs, present options and get user's preference.
4.  **Completion Checkpoint:** After completing major milestones, summarize what was done and confirm next steps. 

## Default policies (must follow)
- Clarify and plan first - keep business understanding separate from technical plan and carefully architect and implement.
- Do not invent APIs, data, or contracts; ask targeted clarifiers if missing.
- Never hardcode secrets or tokens; use `.env` and docs.
- Prefer the smallest viable diff; do not refactor unrelated code.
- Cite existing code with code references (start:end:path); propose new code in fenced blocks.
- Keep reasoning private; output only decisions, artifacts, and justifications.

### Execution contract for every request
1) Confirm surface and success criteria (one sentence).
2) List constraints, invariants, non‑goals.
3) Produce the artifact with acceptance checks inlined (checkboxes or tests where applicable).
4) Add follow‑ups and risks (max 3 bullets).
5) Create PHR in appropriate subdirectory under `history/prompts/` (constitution, feature-name, or general).
6) If plan/tasks identified decisions that meet significance, surface ADR suggestion text as described above.

### Minimum acceptance criteria
- Clear, testable acceptance criteria included
- Explicit error paths and constraints stated
- Smallest viable change; no unrelated edits
- Code references to modified/inspected files where relevant

## Architect Guidelines (for planning)

Instructions: As an expert architect, generate a detailed architectural plan for [Project Name]. Address each of the following thoroughly.

1. Scope and Dependencies:
   - In Scope: boundaries and key features.
   - Out of Scope: explicitly excluded items.
   - External Dependencies: systems/services/teams and ownership.

2. Key Decisions and Rationale:
   - Options Considered, Trade-offs, Rationale.
   - Principles: measurable, reversible where possible, smallest viable change.

3. Interfaces and API Contracts:
   - Public APIs: Inputs, Outputs, Errors.
   - Versioning Strategy.
   - Idempotency, Timeouts, Retries.
   - Error Taxonomy with status codes.

4. Non-Functional Requirements (NFRs) and Budgets:
   - Performance: p95 latency, throughput, resource caps.
   - Reliability: SLOs, error budgets, degradation strategy.
   - Security: AuthN/AuthZ, data handling, secrets, auditing.
   - Cost: unit economics.

5. Data Management and Migration:
   - Source of Truth, Schema Evolution, Migration and Rollback, Data Retention.

6. Operational Readiness:
   - Observability: logs, metrics, traces.
   - Alerting: thresholds and on-call owners.
   - Runbooks for common tasks.
   - Deployment and Rollback strategies.
   - Feature Flags and compatibility.

7. Risk Analysis and Mitigation:
   - Top 3 Risks, blast radius, kill switches/guardrails.

8. Evaluation and Validation:
   - Definition of Done (tests, scans).
   - Output Validation for format/requirements/safety.

9. Architectural Decision Record (ADR):
   - For each significant decision, create an ADR and link it.

### Architecture Decision Records (ADR) - Intelligent Suggestion

After design/architecture work, test for ADR significance:

- Impact: long-term consequences? (e.g., framework, data model, API, security, platform)
- Alternatives: multiple viable options considered?
- Scope: cross‑cutting and influences system design?

If ALL true, suggest:
📋 Architectural decision detected: [brief-description]
   Document reasoning and tradeoffs? Run `/sp.adr [decision-title]`

Wait for consent; never auto-create ADRs. Group related decisions (stacks, authentication, deployment) into one ADR when appropriate.

## Basic Project Structure

- `.specify/memory/constitution.md` — Project principles
- `specs/<feature>/spec.md` — Feature requirements
- `specs/<feature>/plan.md` — Architecture decisions
- `specs/<feature>/tasks.md` — Testable tasks with cases
- `history/prompts/` — Prompt History Records
- `history/adr/` — Architecture Decision Records
- `.specify/` — SpecKit Plus templates and scripts

## Code Standards
See `.specify/memory/constitution.md` for code quality, testing, performance, security, and architecture principles.

## Phase III Constraints (Preserved Application Layer)

**Core Principles:**
- Natural language task management via chatbot
- Stateless server; all state persisted in database
- Tool-driven AI (OpenAI Agent selects & executes MCP tools)
- Clear separation: ChatKit UI → FastAPI API → OpenAI Agent → MCP Tools → Database

**Architecture Rules:**
- ✅ All task actions execute via MCP tools (not direct DB queries)
- ✅ Agent must select correct tools based on user intent
- ✅ Conversation history stored in database
- ✅ Structured JSON responses from all endpoints
- ✅ No direct DB access from frontend
- ✅ JWT authentication on all API endpoints

## Phase IV Constraints & Requirements

**Core Principles:**
- All infrastructure defined as code (Dockerfiles, Helm charts, K8s manifests)
- No manual coding allowed; all work follows SDD workflow
- AI agents handle DevOps tasks; humans write specs and review output
- Phase III chatbot functionality MUST be preserved without modification

**Infrastructure Rules:**
- ✅ Frontend and backend MUST be containerized with Docker (multi-stage builds)
- ✅ Containers MUST NOT run as root
- ✅ Each service MUST expose a health check endpoint
- ✅ All resources MUST be managed via Helm charts
- ✅ Deployment target: local Minikube cluster
- ✅ Deployments MUST define resource requests/limits, liveness/readiness probes
- ✅ ConfigMaps and Secrets for environment configuration (no hardcoded secrets)
- ✅ Helm MUST manage all releases and upgrades

**AI Ops Rules:**
- ✅ Docker build/push/run: via Gordon or Claude Code agents
- ✅ Kubernetes apply/scale/rollout: via kubectl-ai and kagent
- ✅ Automated agents MUST NOT push to production without human approval

**Integration with Phase III:**
- Chatbot from Phase III MUST work without modification under containers
- Conversation history MUST persist across pod restarts
- Database connectivity via Neon PostgreSQL maintained through K8s Secrets

## Phase IV Success Criteria

- [ ] All Phase III chatbot functionality works under containerized deployment
- [ ] Frontend containerized with production-ready Dockerfile
- [ ] Backend containerized with production-ready Dockerfile
- [ ] Application deployable to Minikube via `helm install`
- [ ] Kubernetes deployments include health checks, resource limits, probes
- [ ] Secrets managed via K8s Secrets (no hardcoded credentials)
- [ ] AI agents (Gordon, kubectl-ai, kagent) used for all DevOps operations
- [ ] Conversation history persists across pod restarts
- [ ] Documentation complete for local Minikube deployment
- [ ] Agentic Dev workflow complete: Spec → Plan → Tasks → Implementation
