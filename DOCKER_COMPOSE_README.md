# TaskFlow Phase V - Local Development with Docker Compose

## Quick Start

### 1. Clone and Configure

```bash
cd /mnt/c/Users/us/Desktop/phase-5

# Copy environment template
cp .env.docker .env

# Edit .env with your credentials
nano .env  # or use your preferred editor
```

### 2. Set Required Environment Variables

**Minimum required in `.env`:**

```bash
# Database (use Neon or local - comment out the one you're not using)

# Option A: Neon PostgreSQL (recommended)
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require

# Option B: Local PostgreSQL (already in docker-compose)
# DATABASE_URL=postgresql://postgres:postgres@db:5432/taskflow

# Authentication (generate secure secret)
BETTER_AUTH_SECRET=$(openssl rand -hex 32)

# OpenAI API Key (for chatbot)
OPENAI_API_KEY=sk-your-key-here
```

### 3. Start All Services

```bash
# Build and start all containers
docker compose up -d

# View logs (follow mode)
docker compose logs -f

# View specific service logs
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f redpanda
```

### 4. Access the Application

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | Next.js web app |
| **Backend API** | http://localhost:8000 | FastAPI REST API |
| **API Health** | http://localhost:8000/health | Health check with Dapr status |
| **Redpanda Console** | http://localhost:8082 | Kafka REST API |
| **PostgreSQL** | localhost:5432 | Local database (if using) |

### 5. Verify Everything is Running

```bash
# Check container status
docker compose ps

# Expected output:
# NAME                   STATUS         PORTS
# taskflow-backend       Up (healthy)   0.0.0.0:8000->8000/tcp
# taskflow-frontend      Up (healthy)   0.0.0.0:3000->3000/tcp
# taskflow-redpanda      Up (healthy)   0.0.0.0:9092->9092/tcp
# taskflow-db            Up (healthy)   0.0.0.0:5432->5432/tcp
# taskflow-dapr-placement Up            0.0.0.0:50005->50005/tcp
# taskflow-redis         Up (healthy)   0.0.0.0:6379->6379/tcp

# Test health endpoint
curl http://localhost:8000/health | jq

# Expected response:
{
  "status": "ok",
  "service": "Task Management API",
  "version": "5.0.0",
  "dapr": {
    "enabled": true,
    "endpoint": "http://localhost:3500",
    "connected": true
  }
}
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Docker Compose Network                   │
│                                                              │
│  ┌──────────────┐      ┌──────────────┐                     │
│  │   Frontend   │      │    Backend   │                     │
│  │  (Next.js)   │─────▶│  (FastAPI)   │                     │
│  │   :3000      │      │    :8000     │                     │
│  └──────────────┘      └──────┬───────┘                     │
│                               │                               │
│                               │ Dapr Sidecar                  │
│                               ▼                               │
│                    ┌──────────────────────┐                  │
│                    │   Dapr Runtime        │                  │
│                    │  - Pub/Sub (Kafka)    │                  │
│                    │  - State Store (Redis)│                  │
│                    │  - Jobs API (Cron)    │                  │
│                    └──────────┬───────────┘                  │
│                               │                               │
│         ┌─────────────────────┼─────────────────────┐        │
│         │                     │                     │        │
│         ▼                     ▼                     ▼        │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐ │
│  │   Redpanda   │     │  PostgreSQL  │     │    Redis     │ │
│  │   (Kafka)    │     │   (Tasks)    │     │  (Dapr State)│ │
│  │    :9092     │     │    :5432     │     │    :6379     │ │
│  └──────────────┘     └──────────────┘     └──────────────┘ │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Common Commands

### Start/Stop Services

```bash
# Start all services
docker compose up -d

# Stop all services
docker compose down

# Stop and remove volumes (⚠️ deletes data)
docker compose down -v

# Restart a service
docker compose restart backend

# Rebuild and restart
docker compose up -d --build
```

### View Logs

```bash
# All logs
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f redpanda

# Last 100 lines
docker compose logs --tail=100 backend
```

### Execute Commands in Containers

```bash
# Backend shell
docker compose exec backend bash

# Frontend shell
docker compose exec frontend bash

# Database shell (psql)
docker compose exec db psql -U postgres -d taskflow

# Redpanda shell (rpk)
docker compose exec redpanda rpk topic list
```

### Database Management

```bash
# Connect to local PostgreSQL
docker compose exec db psql -U postgres -d taskflow

# Run migrations manually (if needed)
docker compose exec backend python -c "from src.database import run_migrations; run_migrations()"

# Backup database
docker compose exec db pg_dump -U postgres taskflow > backup.sql

# Restore database
docker compose exec -T db psql -U postgres taskflow < backup.sql
```

---

## Troubleshooting

### Backend Won't Start

**Check logs:**
```bash
docker compose logs backend
```

**Common issues:**

1. **Database connection error:**
   ```bash
   # Verify DATABASE_URL in .env
   # Check db container is running
   docker compose ps db
   ```

2. **Dapr connection error:**
   ```bash
   # Check Dapr components loaded
   docker compose logs backend | grep "Dapr"
   
   # Verify .dapr/components/*.yaml files exist
   ls -la .dapr/components/
   ```

3. **Port already in use:**
   ```bash
   # Find process using port 8000
   lsof -i :8000
   
   # Or change port in docker-compose.yml
   ```

### Frontend Shows "API Unavailable"

**Check backend is running:**
```bash
curl http://localhost:8000/health
```

**Verify NEXT_PUBLIC_API_BASE_URL:**
```bash
# In frontend container
docker compose exec frontend env | grep API
```

### Redpanda/Kafka Issues

**List topics:**
```bash
docker compose exec redpanda rpk topic list
```

**Consume task-events topic:**
```bash
docker compose exec redpanda rpk topic consume task-events
```

**Check Redpanda health:**
```bash
curl http://localhost:8082/brokers
```

### Dapr Issues

**Check Dapr components:**
```bash
# View loaded components
docker compose exec backend dapr components
```

**Test Pub/Sub:**
```bash
# Publish test event
curl -X POST http://localhost:3500/v1.0/publish/pubsub/task-events \
  -H "Content-Type: application/json" \
  -d '{"event_type": "test", "payload": {"message": "hello"}}'
```

---

## Development Workflow

### 1. Make Changes

**Backend:**
```bash
# Edit files in ./backend/src/
# Auto-reload is enabled (uvicorn --reload)
```

**Frontend:**
```bash
# Edit files in ./frontend/src/
# Auto-reload is enabled (Next.js fast refresh)
```

### 2. Test Changes

```bash
# Backend tests
docker compose exec backend pytest

# Frontend tests
docker compose exec frontend npm test

# E2E tests
docker compose exec frontend npm run test:e2e
```

### 3. View Real-Time Events

```bash
# Watch task events in Redpanda
docker compose exec redpanda rpk topic consume task-events

# Watch backend logs
docker compose logs -f backend
```

---

## Production Considerations

**This docker-compose setup is for LOCAL DEVELOPMENT only.**

For production deployment, use:
- **Kubernetes** with Helm charts (see `helm/taskflow/`)
- **Minikube** for testing (see Phase IV instructions)
- **Cloud Kubernetes** (AKS/GKE) for production

**Key differences:**
- Local: Single-node Redpanda, no replication
- Production: Multi-node Redpanda cluster with replication
- Local: HTTP only (no TLS)
- Production: HTTPS with proper certificates
- Local: Simple auth (dev secrets)
- Production: Secure secrets management (K8s Secrets, Vault)

---

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | ✅ | - | PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | ✅ | - | JWT signing secret |
| `OPENAI_API_KEY` | ✅ | - | OpenAI API key for chatbot |
| `COHERE_API_KEY` | ❌ | - | Cohere API key (optional) |
| `FRONTEND_URL` | ❌ | `http://localhost:3000` | CORS allowed origin |
| `DAPR_HTTP_ENDPOINT` | ❌ | `http://localhost:3500` | Dapr HTTP endpoint |
| `DAPR_GRPC_ENDPOINT` | ❌ | `localhost:50001` | Dapr gRPC endpoint |
| `KAFKA_BROKERS` | ❌ | `redpanda:9092` | Kafka broker address |

---

## Next Steps

1. **Verify Setup**: Run `curl http://localhost:8000/health`
2. **Create Account**: Open http://localhost:3000 and sign up
3. **Test Features**: Create tasks with priorities, tags, due dates
4. **Test Real-Time**: Open in two tabs, verify sync works
5. **Test Recurring**: Create recurring task, complete it, verify next instance
6. **Test Reminders**: Set reminder for 1 minute, verify notification

For deployment instructions, see:
- Phase IV: Kubernetes deployment (`helm/taskflow/`)
- Cloud deployment: AKS/GKE instructions in README
