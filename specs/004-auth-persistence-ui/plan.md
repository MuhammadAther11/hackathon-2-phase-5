# Implementation Plan: Working Authentication, Database Persistence & Clean UI

**Branch**: `004-auth-persistence-ui` | **Date**: 2026-01-12 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/004-auth-persistence-ui/spec.md`

---

## Summary

Transform the existing console app into a production-ready multi-user web application with secure email/password authentication, persistent data storage in Neon PostgreSQL via SQLModel ORM, and a clean, responsive Next.js UI. The feature delivers 6 prioritized user stories:

1. **P1 (Critical)**: User signup with email/password, account creation, and automatic login
2. **P1 (Critical)**: User login with credential validation and JWT issuance
3. **P1 (Critical)**: Task viewing/management with user isolation and data persistence
4. **P1 (Critical)**: Protected route enforcement with 401 rejection on missing/invalid JWT
5. **P2 (Enhancement)**: Logout functionality with session clearing
6. **P2 (Enhancement)**: Responsive, professional UI with loading/error/empty states

**Technical Approach**:
- **Backend**: Extend FastAPI with JWT verification middleware, user/task models, and auth endpoints
- **Database**: Create users + tasks tables with SQLModel; enforce user_id foreign key constraints
- **Frontend**: Implement signup/login/dashboard pages with Better Auth integration; attach JWT to all requests
- **Security**: JWT tokens in httpOnly cookies (sent automatically); user_id extracted from token (not URL)

---

## Technical Context

**Language/Version**: Python 3.11 (backend), TypeScript + React 18 (frontend)
**Primary Dependencies**:
- Backend: FastAPI, SQLModel, Pydantic, PyJWT, python-jose (JWT verification)
- Frontend: Next.js 15+, React Query, Better Auth client, Tailwind CSS, Lucide icons

**Storage**: Neon PostgreSQL (serverless, already configured with DATABASE_URL in .env.example)

**Testing**:
- Backend: pytest with fixtures for database and authentication
- Frontend: React Testing Library with MSW mocks
- Integration: End-to-end signup/login/task creation flows

**Target Platform**: Localhost development (HTTP); scales to production with HTTPS

**Project Type**: Web application (Next.js frontend + FastAPI backend, monorepo)

**Performance Goals**:
- Signup/login endpoint response: <2 seconds on typical localhost connection
- Dashboard page load: <1 second after successful login
- JWT verification per request: <10ms overhead

**Constraints**:
- Must work on localhost without manual database setup (migrations autorun)
- All implementation via Spec-Driven Development (no manual coding outside Claude Code agents)
- User isolation enforced at backend (JWT verification + user_id query filters)

**Scale/Scope**:
- Initial MVP: single app instance, 1-10 concurrent users
- Data: ~100 users, ~1000 tasks in Neon
- UI: 3 core pages (signup, login, dashboard) + 4 protected routes

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Security**: Strict isolation and JWT integrity enforced?
  - ✅ JWT tokens issued with user_id claim and verified on every protected endpoint
  - ✅ All task endpoints filter by user_id extracted from JWT (backend-side enforcement)
  - ✅ Unauthorized requests return 401; invalid tokens redirect to login on frontend
  - ✅ Signup/login endpoints validate credentials server-side; no client-side auth bypass possible

- [x] **Accuracy**: Backend-Frontend-Database synchronization verified?
  - ✅ Database models enforce user_id foreign key; tasks cannot exist without valid user
  - ✅ Frontend sends JWT with every request; backend returns only user's own data
  - ✅ Task creation/update endpoints require valid JWT and verify user_id ownership before modification
  - ✅ Dashboard UI reflects server state (fetches fresh after each action)

- [x] **Reliability**: Error handling (401, 404, 500) and status codes defined?
  - ✅ 401 Unauthorized: returned when JWT missing, invalid, or expired; frontend redirects to login
  - ✅ 422 Unprocessable Entity: validation errors on signup (invalid email, password too short)
  - ✅ 400 Bad Request: malformed requests (missing fields)
  - ✅ 500 Internal Server Error: database/auth service failures logged; generic response to user
  - ✅ All error responses include clear, user-friendly messages (not generic "error occurred")

- [x] **Usability**: Responsive layout and UX intuition planned?
  - ✅ Auth pages (signup/login) centered card layout; mobile-optimized width (max 400px on mobile)
  - ✅ Dashboard header with logout button; task list clearly shows active vs completed
  - ✅ Loading states shown during API calls; empty state when no tasks exist
  - ✅ Error messages appear inline with form fields (real-time validation feedback)
  - ✅ Mobile-first CSS; responsive breakpoints for tablet (768px) and desktop (1024px)

- [x] **Reproducibility**: Setup documentation and env vars defined?
  - ✅ .env.example contains: DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL
  - ✅ Database migrations auto-run on backend startup (SQLAlchemy create_all)
  - ✅ Frontend .env.local references same BETTER_AUTH_SECRET for JWT verification
  - ✅ Quickstart guide documents: env setup, database initialization, running frontend/backend

**GATE STATUS**: ✅ **PASS** - All constitution principles satisfied; proceed to Phase 0 research.

---

## Project Structure

### Documentation (this feature)

```text
specs/004-auth-persistence-ui/
├── plan.md                    # This file
├── research.md                # Phase 0: Technology & integration research
├── data-model.md              # Phase 1: Database schema design
├── quickstart.md              # Phase 1: Setup & local dev guide
├── contracts/
│   ├── auth-endpoints.md      # Auth endpoints (signup, login, logout)
│   ├── task-endpoints.md      # Task CRUD endpoints with JWT
│   └── models.md              # Pydantic/TypeScript models
└── checklists/
    └── requirements.md        # Spec quality validation (completed)
```

### Source Code (Web Application - Frontend + Backend)

```text
backend/
├── src/
│   ├── main.py                # FastAPI app, middleware registration
│   ├── database.py            # SQLAlchemy session management
│   ├── models/
│   │   ├── user.py            # User model (id, email, password_hash, created_at)
│   │   └── task.py            # Task model (id, title, completed, user_id, created_at)
│   ├── api/
│   │   ├── auth.py            # Signup, login, logout endpoints [NEW]
│   │   └── tasks.py           # CRUD endpoints with JWT verification [UPDATED]
│   ├── auth/
│   │   ├── jwt.py             # JWT token issuance & verification [NEW]
│   │   └── passwords.py       # Password hashing/validation [NEW]
│   └── middleware/
│       └── auth.py            # JWT verification middleware [NEW]
└── tests/
    ├── test_auth.py           # Auth flow tests (signup, login, JWT) [NEW]
    ├── test_tasks.py          # Task CRUD + authorization tests [UPDATED]
    └── conftest.py            # Test database fixtures [UPDATED]

frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Root layout with auth provider
│   │   ├── page.tsx           # Home page (redirects to login or dashboard)
│   │   ├── signup/
│   │   │   └── page.tsx       # Signup page [NEW]
│   │   ├── login/
│   │   │   └── page.tsx       # Login page [NEW]
│   │   ├── dashboard/
│   │   │   └── page.tsx       # Protected dashboard (redirects to login if no JWT) [NEW]
│   │   ├── middleware.ts      # Route protection (redirect to login on 401) [UPDATED]
│   │   └── api/ (internal Next.js API routes for proxy, if needed)
│   ├── components/
│   │   ├── AuthForm.tsx       # Signup/Login form component [UPDATED for real auth]
│   │   ├── TaskDashboard.tsx  # Task list, create, update, toggle, delete
│   │   ├── TaskItem.tsx       # Individual task rendering with edit/delete
│   │   ├── NavBar.tsx         # Header with user email + logout button [UPDATED]
│   │   └── ui/                # Tailwind button, input, modal components [UPDATED]
│   ├── lib/
│   │   ├── api-client.ts      # Centralized fetch with JWT injection [UPDATED]
│   │   ├── auth-client.ts     # Better Auth client configuration [UPDATED]
│   │   └── api.ts            # API utility functions (create, read, update, delete tasks)
│   ├── hooks/
│   │   ├── useTasks.ts        # React Query hook for task CRUD [UPDATED]
│   │   └── useAuth.ts         # Hook to access current user from auth context [NEW]
│   ├── types/
│   │   └── index.ts           # TypeScript types (User, Task, AuthResponse) [UPDATED]
│   ├── middleware.ts          # Next.js middleware for route protection [UPDATED]
│   └── lib/providers.tsx      # React providers (QueryClientProvider, AuthProvider) [UPDATED]
└── tests/
    ├── signup.test.ts         # Signup form submission & validation
    ├── login.test.ts          # Login form submission & JWT handling
    └── dashboard.test.ts      # Dashboard rendering & task operations
```

**Structure Decision**: Web application (Option 2) with separate backend (Python FastAPI) and frontend (Next.js) directories. This aligns with existing project layout and enables independent scaling, testing, and deployment.

---

## Complexity Tracking

No Constitution Check violations. Architecture is straightforward:
- Monorepo with clear backend/frontend separation
- Single database (Neon PostgreSQL) with simple two-table schema (users + tasks)
- Standard JWT-based auth without complex role/permission system
- No message queues, caching layer, or async workers needed for MVP

---

## Phase 0: Research & Unknowns Resolution

### Research Tasks (All knowns; no clarifications needed)

**Technology Stack Verification**:
1. ✅ Better Auth JWT generation/verification with BETTER_AUTH_SECRET
2. ✅ SQLModel ORM for user/task models (already in requirements.txt for backend)
3. ✅ Neon PostgreSQL connection pooling (DATABASE_URL provided in .env.example)
4. ✅ Tailwind CSS + Lucide icons for responsive UI (already in frontend package.json)
5. ✅ React Query for data fetching with JWT auth context

**Integration Patterns**:
1. ✅ Next.js middleware for route protection (redirect unauthenticated to /login)
2. ✅ HTTPOnly cookies for JWT storage (automatic with Better Auth)
3. ✅ FastAPI dependency injection for JWT verification (uses `Depends()` pattern)
4. ✅ CORS configuration for frontend ↔ backend communication

**Best Practices**:
1. ✅ Password hashing: use `passlib` with bcrypt (backend standard)
2. ✅ JWT claims: include user_id, exp, iat (standard JWT fields)
3. ✅ HTTP status codes: 401 for auth failures, 403 for authorization, 422 for validation
4. ✅ Error messages: user-friendly (not stack traces) logged server-side for debugging

**Database Migration Strategy**:
1. ✅ SQLAlchemy `create_all()` on backend startup for initial schema
2. ✅ Migration tool (Alembic) optional for later versions; not needed for MVP
3. ✅ Foreign key constraints enforced at database level (user_id in tasks table)

### Output: research.md (Created separately with detailed findings)

---

## Phase 1: Design & Contracts

### 1.1 Data Model Design (data-model.md)

**Users Table**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**SQLModel Definition**
```python
class User(SQLModel, table=True):
    id: Optional[UUID] = Field(default_factory=uuid4, primary_key=True)
    email: str = Field(unique=True, index=True)
    password_hash: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    tasks: List["Task"] = Relationship(back_populates="user")
```

**Tasks Table**
```sql
CREATE TABLE task (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**SQLModel Definition**
```python
class Task(SQLModel, table=True):
    id: Optional[UUID] = Field(default_factory=uuid4, primary_key=True)
    title: str
    completed: bool = Field(default=False)
    user_id: UUID = Field(foreign_key="user.id", index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    user: Optional[User] = Relationship(back_populates="tasks")
```

**Validation Rules**:
- User email must be valid email format (RFC 5322)
- User password must be ≥8 characters (enforced on signup)
- Task title must be non-empty string (max 255 chars)
- Task completed is boolean (default: false)
- user_id cannot be null (enforced by foreign key)

### 1.2 API Contracts (contracts/ directory)

**Auth Endpoints** (contracts/auth-endpoints.md)
- `POST /auth/signup` → Create user, return JWT
- `POST /auth/login` → Authenticate user, return JWT
- `POST /auth/logout` → Clear session

**Task Endpoints** (contracts/task-endpoints.md)
- `GET /tasks` → List user's tasks (requires JWT)
- `POST /tasks` → Create task (requires JWT)
- `PUT /tasks/{id}` → Update task title or completion (requires JWT)
- `DELETE /tasks/{id}` → Delete task (requires JWT)
- `PATCH /tasks/{id}/toggle` → Toggle completion status (requires JWT)

**Pydantic Models** (contracts/models.md)
- `SignupRequest`: email, password
- `LoginRequest`: email, password
- `TaskCreate`: title
- `TaskUpdate`: title, completed
- `TaskResponse`: id, title, completed, user_id, created_at
- `UserResponse`: id, email, created_at

### 1.3 Quickstart Guide (quickstart.md)

**Prerequisites**:
- Python 3.11+ (backend)
- Node.js 18+ (frontend)
- Git

**Setup Steps**:
1. Clone repo & install dependencies (backend: pip install -r requirements.txt; frontend: npm install)
2. Configure .env files (DATABASE_URL, BETTER_AUTH_SECRET)
3. Run backend: `cd backend && python -m uvicorn src.main:app --reload`
4. Run frontend: `cd frontend && npm run dev`
5. Open http://localhost:3000/signup to test

**Environment Variables**:
- `DATABASE_URL`: Neon PostgreSQL connection string (provided in .env.example)
- `BETTER_AUTH_SECRET`: Shared secret for JWT signing (provided in .env.example)
- `BETTER_AUTH_URL`: Frontend URL for auth callbacks (default: http://localhost:3000)
- `API_SECRET_KEY`: Backend secret for session encryption (optional for MVP)

### 1.4 Agent Context Update

**Backend Agent Context** (`backend/auth-context.md`):
- New models: User, Task (SQLModel)
- New endpoints: /auth/signup, /auth/login, /auth/logout
- New middleware: JWT verification with user_id extraction
- Database: Neon PostgreSQL, SQLAlchemy session factory
- Testing: pytest with database fixtures

**Frontend Agent Context** (`frontend/auth-context.md`):
- New pages: /signup, /login, /dashboard
- New components: AuthForm (signup/login), TaskDashboard, TaskItem, NavBar
- Auth client: Better Auth with JWT in httpOnly cookies
- API client: Centralized fetch with automatic JWT injection
- Testing: React Testing Library with MSW mocks

---

## Phase 2: Task Generation (Not in scope for /sp.plan)

After approval of this plan, run `/sp.tasks` to generate specific, testable implementation tasks:
- Database migrations (create tables, indexes)
- Backend auth endpoints (signup, login, JWT verification)
- Backend task endpoints (CRUD with authorization)
- Frontend auth pages (signup, login with form validation)
- Frontend dashboard (task list, create, update, delete, toggle)
- Frontend middleware (route protection, 401 handling)
- Integration tests (end-to-end signup→login→task creation flow)
- UI polish (responsive layout, loading/error/empty states)

---

## Next Steps

1. **Review & Approve**: Confirm plan aligns with specification and project constraints
2. **Generate Tasks**: Run `/sp.tasks` to break plan into actionable implementation items
3. **Implement**: Execute tasks using specialized agents (Auth Agent, Backend Agent, Frontend Agent, DB Agent)
4. **Test**: Run integration tests to verify signup→login→task creation flow works end-to-end
5. **Deploy**: Push feature branch to remote; create PR for code review

---

**Status**: ✅ Plan complete. Constitution check PASS. Ready for task generation and implementation.
