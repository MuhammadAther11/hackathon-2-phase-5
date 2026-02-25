# Quickstart: User Authentication & Security

This guide describes how to set up and use the authentication system for the Todo App.

## JWT Authentication Flow

1.  **User Signin**: The user submits credentials to `Better Auth` on the Next.js frontend.
2.  **JWT Issuance**: Upon successful authentication, the `Better Auth` JWT plugin issues a symmetric JWT signed with the `BETTER_AUTH_SECRET`.
3.  **Token Storage**: The JWT is stored on the client side (e.g., in a cookie or memory).
4.  **Authenticated Requests**: The frontend `apiFetch` utility automatically attaches the JWT to the `Authorization: Bearer <token>` header for all calls to the FastAPI backend.
5.  **Backend Verification**: The FastAPI `AuthMiddleware` extracts the token, verifies it using the shared `BETTER_AUTH_SECRET`, and extracts the `sub` claim (User ID).
6.  **User Isolation**: Backend routes use the extracted `user_id` to filter all database operations, ensuring users only see and modify their own data.

## Setup Instructions

### Environment Variables

Create a `.env` file in the root directory (and ensure it is replicated in `backend/` and `frontend/` if running separately):

```env
# Shared Secret for JWT signing/verification
BETTER_AUTH_SECRET=your_super_shared_secret_here

# Database URL for Neon PostgreSQL
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require

# Better Auth URL (Frontend)
BETTER_AUTH_URL=http://localhost:3000
```

### Backend Setup (FastAPI)

1.  Install dependencies: `pip install -r backend/requirements.txt`
2.  Run the server: `uvicorn backend.src.main:app --reload`

### Frontend Setup (Next.js)

1.  Install dependencies: `npm install`
2.  Run the development server: `npm run dev`

## API Endpoints

-   `POST /auth/signup`: Create a new user account.
-   `POST /auth/signin`: Authenticate and obtain a JWT.
-   `GET /auth/whoami`: Returns the current user's ID (requires JWT).
-   `GET /tasks/`: List all tasks for the authenticated user.
-   `POST /tasks/`: Create a new task.
