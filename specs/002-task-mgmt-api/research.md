# Architectural Research: Task Management API

## Decision 1: JWT Verification via Middleware
**Resolved**: Use a FastAPI dependency or custom middleware to verify JWT tokens on every request to `/api/*`.
**Rationale**: Centralizing authentication ensures that no endpoint is accidentally left exposed.
**Alternatives Considered**: Verifying inside each endpoint manually (too error-prone).

## Decision 2: Tenancy Separation via `user_id` Filter
**Resolved**: Every SQLModel query for tasks MUST include a `.where(Task.user_id == authenticated_user_id)` clause.
**Rationale**: This provides strict row-level security within the application logic, preventing ID enumeration attacks.
**Alternatives Considered**: Separate database schemas per user (too complex for MVP).

## Decision 3: SQLModel + Neon Integration
**Resolved**: Use `SQLModel` with `create_engine` and `Session` directly with Neon's connection string.
**Rationale**: SQLModel combines Pydantic and SQLAlchemy, reducing boilerplate for FastAPI models.
**Alternatives Considered**: SQLAlchemy (requires separate Pydantic models), Tortoise ORM (different paradigm).

## Decision 4: Task Completion Toggle (PATCH)
**Resolved**: Implement a specific `PATCH /api/{user_id}/tasks/{id}/complete` endpoint that only updates the `is_completed` field.
**Rationale**: More semantic than a generic PUT request and reduces data transfer.
**Alternatives Considered**: Generic PUT `/tasks/{id}`.
