# phase-5 Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-02-21

## Active Technologies

### Frontend (001-phase5-ui-ux-redesign)
- **Language**: TypeScript 5.x
- **Framework**: Next.js 16+, React 19
- **State Management**: TanStack Query (server state), React Context (global state)
- **Styling**: CSS Modules with CSS Variables
- **Animations**: CSS transitions + React Spring (selective)
- **Testing**: Jest, React Testing Library

### Backend (006-advanced-features-extension)
- **Language**: Python 3.11
- **Framework**: FastAPI + SQLModel ORM
- **Database**: Neon PostgreSQL
- **Event Streaming**: Kafka (Redpanda) via Dapr Pub/Sub
- **Distributed Runtime**: Dapr (Pub/Sub, Jobs API, State Store)
- **Testing**: pytest

## Project Structure

```text
# Frontend (001-phase5-ui-ux-redesign)
frontend/
├── src/
│   ├── app/                    # Next.js App Router pages
│   ├── components/
│   │   ├── ui/                 # Primitive components (Button, Input, Card)
│   │   ├── layout/             # Layout components (Header, Footer, Sidebar)
│   │   ├── task/               # Task components (TaskList, TaskItem, TaskForm)
│   │   ├── search/             # Search components (SearchBar, FilterPanel)
│   │   └── chatbot/            # Chatbot components (ChatbotWidget, ChatWindow)
│   ├── hooks/                  # Custom React hooks
│   ├── styles/                 # Global styles, animations, responsive
│   └── lib/                    # Utilities, API client
└── tests/

# Backend (006-advanced-features-extension)
backend/
├── src/
│   ├── models/                 # SQLModel entities
│   ├── services/               # Business logic services
│   └── api/                    # FastAPI routes
└── tests/
```

## Commands

```bash
# Frontend
cd frontend && npm run dev          # Start development server
cd frontend && npm run test         # Run unit tests
cd frontend && npm run test:e2e     # Run E2E tests

# Backend
cd backend && python -m uvicorn main:app --reload --port 8000
cd backend && pytest                # Run tests
cd backend && ruff check .          # Lint
```

## Code Style

**TypeScript/React**: Follow standard conventions, use functional components with hooks, prefer CSS Modules for styling, ensure WCAG 2.1 AA accessibility compliance.

**Python**: Follow PEP 8, use type hints, docstrings for public APIs.

## Design Guidelines (001-phase5-ui-ux-redesign)

### Responsive Breakpoints
- Mobile: 320px+ (base)
- Tablet: 768px+
- Desktop: 1024px+
- Large Desktop: 1440px+

### Animation Guidelines
- Use `transform` and `opacity` only (GPU-accelerated)
- Duration: 150ms (micro), 300ms (standard), 400ms (emphasis)
- Always respect `prefers-reduced-motion` media query
- CSS transitions for simple animations, React Spring for gestures

### Accessibility Requirements
- Minimum 44px touch targets
- 4.5:1 contrast ratio for normal text
- Visible focus indicators for keyboard navigation
- Full keyboard accessibility (Tab, Enter, Escape)

### Performance Targets
- Lighthouse Performance: 90+
- First Contentful Paint: <1.8s
- Cumulative Layout Shift: <0.1
- Page transitions: <300ms

## Recent Changes

- 001-phase5-ui-ux-redesign: Added Next.js 16, React 19, TanStack Query, CSS Modules, responsive design system
- 006-advanced-features-extension: Added Python 3.11, FastAPI, SQLModel, Dapr, Kafka

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
