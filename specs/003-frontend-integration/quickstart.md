# Quickstart: Frontend Development

## Environment Setup
1. Create `frontend/.env.local`:
   ```text
   NEXT_PUBLIC_API_URL=http://localhost:8000
   BETTER_AUTH_SECRET=your_dev_secret
   ```
2. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```

## Development Workflow
1. Start the FastAPI backend first (see backend quickstart).
2. Run the Next.js dev server:
   ```bash
   npm run dev
   ```

## Integration Verification
- Login should redirect to `/dashboard`.
- Network tab in Chrome should show `Authorization` headers on all `/api/*` calls.
- Deleting a task on the dashboard should perform a DELETE call to the backend.
