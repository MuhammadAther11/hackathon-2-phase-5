# Quickstart: Task Management API

## Prerequisites
- Python 3.12+
- Neon PostgreSQL connection string

## Setup
1. Copy `.env.example` to `.env` in the `backend/` directory:
   ```bash
   cp backend/.env.example backend/.env
   ```
2. Update `DATABASE_URL` and `BETTER_AUTH_SECRET` in `.env`.
3. Install dependencies:
   ```bash
   pip install -r backend/requirements.txt
   ```

## Running the API
```bash
cd backend
python -m uvicorn src.main:app --reload
```

## Running Tests
```bash
cd backend
python -m pytest
```

## Example Usage

### Create a Task
```bash
curl -X POST http://localhost:8000/api/user_123/tasks \
  -H "Authorization: Bearer <JWT>" \
  -H "Content-Type: application/json" \
  -d '{"title": "Implement Feature", "description": "Backend API development"}'
```

### List Tasks
```bash
curl -X GET http://localhost:8000/api/user_123/tasks \
  -H "Authorization: Bearer <JWT>"
```

### Toggle Completion
```bash
curl -X PATCH http://localhost:8000/api/user_123/tasks/{id}/complete \
  -H "Authorization: Bearer <JWT>"
```
