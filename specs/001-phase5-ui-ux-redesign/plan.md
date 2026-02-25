# Implementation Plan: Phase 5 UI/UX Redesign

**Branch**: `001-phase5-ui-ux-redesign` | **Date**: 2026-02-21 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-phase5-ui-ux-redesign/spec.md`

## Summary

Redesign the UI/UX for all Phase-5 pages (Landing, Login, Signup, Dashboard, Home with chatbot) to create a fully responsive, visually polished interface with smooth transitions and animations. Implement all Phase-5 mandatory features (priorities, tags, search, due dates, recurring tasks, reminders) in the design while preserving existing Phase-III chatbot functionality. Add a chatbot widget to the homepage for user assistance.

## Technical Context

**Language/Version**: TypeScript 5.x (Frontend), Python 3.11 (Backend)
**Primary Dependencies**: Next.js 16+, React 19, TanStack Query, FastAPI, SQLModel
**Storage**: Neon PostgreSQL (existing), no new storage requirements
**Testing**: Jest, React Testing Library (Frontend), pytest (Backend)
**Target Platform**: Web (Desktop, Tablet, Mobile browsers)
**Project Type**: Web application (frontend + backend)
**Performance Goals**: Page transitions <300ms, Lighthouse performance >90, CLS <0.1
**Constraints**: Must preserve Phase-III chatbot functionality, respect prefers-reduced-motion, support 320px+ viewports
**Scale/Scope**: 6 pages (Landing, Login, Signup, Dashboard, Home, Chatbot), 20 functional requirements, 12 success criteria

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] Security: Strict isolation, JWT integrity, K8s namespace, and
  Dapr component scope access control enforced? Secrets via env vars,
  K8s Secrets, or Dapr Secrets (cloud: platform-native stores)?
- [x] Accuracy: Backend-Frontend-Database synchronization verified?
  Stateless server; no in-memory state survives container restarts?
  Event consumers idempotent? Dapr State Store not replacing DB?
- [x] Reliability: Error handling (401, 404, 500), health checks,
  liveness/readiness probes defined? Poison message handling for
  event consumers? Dapr resiliency policies configured? No polling
  for reminders (Dapr Jobs API)?
- [x] Usability: Responsive layout and UX intuition planned?
  ChatKit UI works under containerized deployment? Advanced features
  (priorities, tags, search, filter, sort, due dates) integrate
  seamlessly into chat interface?
- [x] Reproducibility: All infra as code (Dockerfiles, Helm charts,
  Dapr components, GitHub Actions)? Deployable via `helm install`?
  Cloud mirrors Minikube? CI/CD deterministic? No manual infra?

## Project Structure

### Documentation (this feature)

```text
specs/001-phase5-ui-ux-redesign/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output (UI component model, not DB)
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (API contracts reference)
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Landing/Home page with chatbot
│   │   ├── login/
│   │   │   └── page.tsx          # Login page
│   │   ├── signup/
│   │   │   └── page.tsx          # Signup page
│   │   └── dashboard/
│   │       └── page.tsx          # Dashboard page
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx        # Reusable button component
│   │   │   ├── Input.tsx         # Reusable input component
│   │   │   ├── Card.tsx          # Task card component
│   │   │   ├── Badge.tsx         # Priority/tag badge component
│   │   │   └── Skeleton.tsx      # Loading skeleton component
│   │   ├── layout/
│   │   │   ├── Header.tsx        # Navigation header
│   │   │   ├── Footer.tsx        # Page footer
│   │   │   └── Sidebar.tsx       # Responsive sidebar
│   │   ├── task/
│   │   │   ├── TaskList.tsx      # Task list container
│   │   │   ├── TaskItem.tsx      # Individual task display
│   │   │   ├── TaskForm.tsx      # Create/edit task form
│   │   │   ├── PrioritySelector.tsx
│   │   │   ├── TagSelector.tsx
│   │   │   ├── DueDatePicker.tsx
│   │   │   └── RecurrenceSelector.tsx
│   │   ├── search/
│   │   │   ├── SearchBar.tsx     # Full-text search input
│   │   │   └── FilterPanel.tsx   # Multi-criteria filters
│   │   └── chatbot/
│   │       ├── ChatbotWidget.tsx # Homepage chatbot widget
│   │       ├── ChatWindow.tsx    # Chat conversation display
│   │       └── ChatInput.tsx     # Message input
│   ├── hooks/
│   │   ├── useResponsive.ts      # Responsive breakpoint hooks
│   │   ├── useAnimations.ts      # Animation preference hooks
│   │   └── useChatbot.ts         # Chatbot interaction hook
│   ├── styles/
│   │   ├── globals.css           # Global styles with CSS variables
│   │   ├── animations.css        # Transition and animation definitions
│   │   └── responsive.css        # Media query breakpoints
│   └── lib/
│       ├── api.ts                # API client
│       └── utils.ts              # Utility functions
└── tests/
    ├── components/               # Component unit tests
    ├── pages/                    # Page integration tests
    └── e2e/                      # End-to-end tests
```

**Structure Decision**: Using Option 2 (Web application) with frontend/ directory structure. Backend remains unchanged from Phase-III/Phase-V as this feature focuses on UI/UX redesign. New components organized by domain (ui, layout, task, search, chatbot) for maintainability.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | All constitution principles satisfied | N/A - UI/UX changes do not violate security, accuracy, reliability, usability, or reproducibility principles |

## Phase 0: Research Plan

### Unknowns to Resolve

1. **Animation libraries**: Research best practices for smooth transitions in Next.js 16+ with React 19
2. **Responsive design patterns**: Research mobile-first breakpoints for task management interfaces
3. **Chatbot integration patterns**: Research widget patterns for homepage chatbot without disrupting existing Phase-III chat functionality
4. **Accessibility compliance**: Research WCAG 2.1 AA requirements for animations, contrast, and touch targets
5. **Performance optimization**: Research techniques for achieving Lighthouse 90+ with animations

### Research Tasks

- [ ] Task: Research animation libraries compatible with Next.js 16+ and prefers-reduced-motion
- [ ] Task: Research responsive breakpoint patterns for productivity applications
- [ ] Task: Research chatbot widget UX patterns that preserve existing chat functionality
- [ ] Task: Research WCAG 2.1 AA compliance checklist for animations and transitions
- [ ] Task: Research Lighthouse performance optimization techniques for animated UIs

## Phase 1: Design & Contracts

### Deliverables

1. **data-model.md**: UI component model, state management approach, styling system
2. **contracts/**: Reference to existing API contracts (no new endpoints expected)
3. **quickstart.md**: Development setup, styling guidelines, component usage examples

### Agent Context Update

- Run `.specify/scripts/powershell/update-agent-context.ps1 -AgentType qwen`
- Add new UI technologies: Next.js 16, React 19, TanStack Query, animation libraries
- Preserve existing backend context (FastAPI, SQLModel, Dapr, Kafka)

## Phase 2: Implementation Tasks

*Note: Tasks will be generated by `/sp.tasks` command after plan approval*

### Expected Task Categories

1. **Foundation**: Global styles, CSS variables, animation system, responsive breakpoints
2. **Layout Components**: Header, Footer, Sidebar with responsive behavior
3. **UI Components**: Button, Input, Card, Badge, Skeleton with animations
4. **Task Components**: TaskList, TaskItem, TaskForm, PrioritySelector, TagSelector, DueDatePicker, RecurrenceSelector
5. **Search Components**: SearchBar, FilterPanel with instant updates
6. **Page Implementations**: Landing, Login, Signup, Dashboard pages
7. **Chatbot Widget**: Homepage chatbot integration
8. **Accessibility**: WCAG compliance, reduced-motion support, keyboard navigation
9. **Performance**: Lighthouse optimization, transition tuning
10. **Testing**: Component tests, page tests, e2e tests

## Gate Approval

- [x] Constitution Check passed
- [ ] Phase 0 research complete (research.md created)
- [ ] Phase 1 design complete (data-model.md, contracts/, quickstart.md created)
- [ ] Agent context updated
- [ ] Ready for `/sp.tasks`
