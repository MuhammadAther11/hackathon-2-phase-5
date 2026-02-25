# Feature Specification: Working Authentication, Database Persistence & Clean UI

**Feature Branch**: `004-auth-persistence-ui`
**Created**: 2026-01-12
**Status**: Draft
**Input**: Transform the console app into a production-ready multi-user web application with secure authentication, persistent storage in Neon PostgreSQL, and a professional UI.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - New User Signup (Priority: P1)

A new user visits the application and needs to create an account to start using the task management system. They should be able to register with an email address and password, receive confirmation that their account was created, and automatically log in to see the dashboard.

**Why this priority**: This is the foundational entry point for all users. Without working signup, no user can access the system. This is an independent MVP slice that delivers immediate value: a user can sign up and be authenticated.

**Independent Test**: Can be fully tested by navigating to `/signup`, filling the form with valid email and password, submitting, and verifying that the user is redirected to `/dashboard` with authentication tokens created in the database.

**Acceptance Scenarios**:

1. **Given** a user is on the signup page, **When** they enter a valid email and password, **Then** the system creates a new user record and redirects to `/dashboard`
2. **Given** a user submits the signup form, **When** their email already exists, **Then** the system displays an error message indicating the email is already registered
3. **Given** signup succeeds, **When** the page refreshes, **Then** the user remains authenticated (session persists)

---

### User Story 2 - Existing User Login (Priority: P1)

An existing user who has already registered needs to log back into the system. They should be able to enter their credentials on the login page, receive a valid session token and JWT, and access their dashboard with all their data.

**Why this priority**: This is equally critical to signup. Users need to be able to return to the system and access their data securely. Without login, returning users cannot use the app. This is independently testable and delivers complete value.

**Independent Test**: Can be fully tested by navigating to `/login`, entering valid credentials of an existing user, submitting, verifying redirect to `/dashboard`, and confirming JWT is present and valid for API calls.

**Acceptance Scenarios**:

1. **Given** a registered user is on the login page, **When** they enter correct email and password, **Then** the system authenticates them and redirects to `/dashboard`
2. **Given** a user submits login with incorrect credentials, **When** they submit the form, **Then** the system displays a specific error (e.g., "Invalid email or password")
3. **Given** a user successfully logs in, **When** they make API requests, **Then** their JWT is automatically attached to requests by the frontend
4. **Given** a user logs in, **When** they close and reopen the browser, **Then** they are still authenticated (session token persists)

---

### User Story 3 - View and Manage Tasks (Priority: P1)

A logged-in user can see the dashboard with a list of their tasks, differentiated between completed and active tasks. They should be able to view only their own tasks (not other users' tasks), and the data should persist across sessions and server restarts.

**Why this priority**: Task management is the core feature of the application. Users need to see their data, trust it's persistent, and know it's isolated from other users. This completes the primary use case and demonstrates secure, persistent data storage.

**Independent Test**: Can be fully tested by creating a user, logging in, verifying tasks display or showing empty state, and confirming that another user cannot see these tasks.

**Acceptance Scenarios**:

1. **Given** a user is logged in, **When** they navigate to `/dashboard`, **Then** they see a list of their tasks (or empty state if no tasks exist)
2. **Given** a user has created tasks, **When** another user logs in, **Then** the second user sees only their own tasks, not the first user's
3. **Given** a user creates a task, **When** the page refreshes, **Then** the task is still present (verified in database)
4. **Given** a user marks a task as completed, **When** the page refreshes, **Then** the task completion status is retained

---

### User Story 4 - Protected Routes and Unauthorized Access (Priority: P1)

When a user's session expires or they access a protected route without authentication (e.g., JWT is missing or invalid), the system should automatically redirect them to the login page. The API should reject unauthenticated requests with a 401 Unauthorized status.

**Why this priority**: Security is non-negotiable. Unauthorized users must not access other users' data. This ensures the system enforces authorization at all levels (frontend redirect, backend JWT validation).

**Independent Test**: Can be fully tested by trying to access `/dashboard` without a valid JWT and confirming redirect to `/login`, and by making API calls without JWT headers and verifying 401 response.

**Acceptance Scenarios**:

1. **Given** a user has no valid session, **When** they try to access `/dashboard`, **Then** they are redirected to `/login`
2. **Given** a user makes an API request without JWT, **When** the backend receives it, **Then** the backend responds with 401 Unauthorized
3. **Given** a user's JWT is invalid or expired, **When** they make an API request, **Then** the frontend detects 401 and redirects to `/login`

---

### User Story 5 - Logout (Priority: P2)

A user should be able to log out of the system from any authenticated page. After logout, their session tokens should be cleared, and they should be redirected to the login page. Subsequent navigation attempts should redirect to login.

**Why this priority**: Logout is important for security in shared environments and demonstrates proper session management, but it's slightly lower priority than the core authentication and data management flows. Users can still use the system effectively if logout is implemented slightly later.

**Independent Test**: Can be fully tested by logging in, clicking logout button, verifying redirect to `/login`, attempting to access `/dashboard`, and confirming they're redirected to `/login` again.

**Acceptance Scenarios**:

1. **Given** a user is logged in, **When** they click the logout button, **Then** their session is cleared and they're redirected to `/login`
2. **Given** a user just logged out, **When** they try to access `/dashboard`, **Then** they're redirected to `/login`

---

### User Story 6 - Responsive UI and Professional Appearance (Priority: P2)

The application should have a clean, modern, and responsive user interface that works well on both desktop and mobile devices. Auth pages should use centered card layouts, and the dashboard should include a clear header with navigation and a professional task list view. The UI should handle empty states, loading states, and error states gracefully.

**Why this priority**: A professional UI is essential for user trust and usability, but the core functionality (auth + persistence) must work first. P2 ensures the feature is complete and production-ready after P1 critical paths are verified.

**Independent Test**: Can be fully tested by viewing the signup, login, and dashboard pages on desktop and mobile, verifying responsive layout adjusts correctly, and checking that all UI elements display error and loading states appropriately.

**Acceptance Scenarios**:

1. **Given** a user views the signup page on mobile, **When** they resize or use mobile browser, **Then** the form layout adjusts and remains usable
2. **Given** an API request is in progress, **When** the user sees the UI, **Then** loading indicators are shown
3. **Given** an API request fails, **When** the user sees the UI, **Then** an error message is displayed (not a generic "error occurred")
4. **Given** a user has no tasks, **When** they view the dashboard, **Then** an empty state message is displayed

---

### Edge Cases

- What happens when a user tries to sign up with the same email twice in rapid succession?
- How does the system handle database connection failures during signup or login?
- What happens if the JWT is valid but the corresponding user record is deleted from the database?
- How does the frontend handle a 401 response while the user is in the middle of creating a task?
- What happens if a user's browser is offline and they try to log in?

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to sign up with email and password, creating a persistent user record in Neon PostgreSQL.
- **FR-002**: System MUST validate email format and reject signup if email is already registered.
- **FR-003**: System MUST issue a valid JWT token upon successful login that includes the authenticated user's `user_id`.
- **FR-004**: System MUST verify JWT on all protected API endpoints and extract `user_id` from the token (not from URL parameters).
- **FR-005**: System MUST reject API requests with invalid, missing, or expired JWT tokens with a 401 Unauthorized response.
- **FR-006**: System MUST prevent users from viewing, editing, or deleting tasks belonging to other users (enforce ownership in backend).
- **FR-007**: System MUST persist user data (email, account creation timestamp) and task data (title, completion status, ownership) in Neon PostgreSQL using SQLModel ORM.
- **FR-008**: System MUST maintain user authentication across browser refreshes using persistent session/token storage.
- **FR-009**: System MUST display specific, user-friendly error messages for authentication failures (e.g., "Invalid email or password" instead of generic errors).
- **FR-010**: System MUST provide a logout mechanism that clears session tokens and redirects to login.
- **FR-011**: System MUST redirect unauthenticated requests to `/login` on the frontend (via middleware) and reject them with 401 on the backend.
- **FR-012**: System MUST provide a responsive, mobile-first UI with clean design suitable for desktop and mobile viewports.

### Key Entities *(include if feature involves data)*

- **User**: Represents an authenticated user in the system. Attributes: `id` (UUID), `email` (unique), `password_hash` (hashed), `created_at` (timestamp). Relationships: can own many tasks.
- **Task**: Represents a task item owned by a user. Attributes: `id` (UUID), `title` (string), `completed` (boolean), `user_id` (foreign key to User), `created_at` (timestamp). Relationships: belongs to one user.
- **Session**: (Backend concern) Transient record or cookie/JWT representing an authenticated session. Used to track active logins and enforce logout.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can complete signup, login, and view their dashboard on localhost within a single user flow without errors.
- **SC-002**: Signup and login endpoints return responses within 2 seconds on typical localhost connection.
- **SC-003**: Users can create and persist tasks; tasks remain visible after page refresh and server restart (verified via database).
- **SC-004**: All protected endpoints reject unauthenticated requests with 401 status and appropriate error message.
- **SC-005**: JWT tokens are correctly issued, contain `user_id`, and are verified on every protected API request.
- **SC-006**: Users cannot access other users' tasks or data even with a valid JWT (data isolation verified by backend authorization checks).
- **SC-007**: Signup, login, and dashboard pages render and are fully functional on both desktop (1920px) and mobile (375px) viewports.
- **SC-008**: Auth forms display field validation errors in real-time (e.g., "Email is required", "Password must be at least 8 characters").
- **SC-009**: API errors are communicated to users via clear, specific messages (not generic "An error occurred").
- **SC-010**: Logout clears session tokens; subsequent attempts to access protected routes redirect to `/login`.

---

## Assumptions

- **Email/Password Authentication**: Using email and password is the intended auth method (not OAuth or multi-factor auth).
- **JWT Storage**: JWT tokens are stored in httpOnly cookies (secure, not accessible by JS) on the frontend, automatically sent with requests.
- **User Isolation**: Users are the only entity; no role-based access control (RBAC) or admin features are required at this stage.
- **Database Availability**: Neon PostgreSQL is configured and reachable during development/testing; no offline mode is required.
- **Shared Secret**: `BETTER_AUTH_SECRET` environment variable is set and identical across frontend and backend for JWT signing/verification.
- **No Email Verification**: Users are activated immediately upon signup; no email confirmation step is required.
- **Task Features Scope**: Users can list, create, update, and toggle tasks; features like task deletion, due dates, or categories are not in scope for this feature.

---

## Out of Scope

- Email verification or password reset flows
- Role-based access control (RBAC) or admin features
- Multi-factor authentication (MFA)
- OAuth or social login
- Task deletion (only completion status toggle)
- Task categories, tags, or advanced filtering
- User profile customization
- Real-time collaboration features (like live task updates)
- Audit logging or user activity tracking
- Data export/import features

---

## Dependencies & Integration Points

- **Better Auth Library**: Frontend and backend must use the same Better Auth configuration with shared `BETTER_AUTH_SECRET`.
- **Neon PostgreSQL**: Backend must connect to a configured Neon database with credentials in `.env`.
- **SQLModel ORM**: Backend uses SQLModel for database models and queries.
- **React Query**: Frontend uses React Query for data fetching and caching.
- **Next.js App Router**: Frontend built with Next.js 15+ (App Router); uses `middleware.ts` for route protection.
- **Existing Codebase**: This feature builds on the current architecture; new signup/login endpoints replace existing stubs, and existing task endpoints are enhanced with JWT verification.

---

## Next Steps

1. **Clarification Phase**: If any assumptions or requirements are unclear, use `/sp.clarify` to refine the spec.
2. **Planning Phase**: Use `/sp.plan` to design the detailed architecture, including API contracts, database migrations, and frontend component structure.
3. **Task Generation**: Use `/sp.tasks` to break the plan into specific, testable implementation tasks.
4. **Implementation**: Execute tasks using `/sp.implement` or via Claude Code agents (Backend, Frontend, Auth, DB specialists).

---

**Status**: Ready for review and planning.
