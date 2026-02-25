# Docker Compose Setup Summary

## ✅ Files Created

| File | Purpose |
|------|---------|
| `docker-compose.yml` | Main Docker Compose configuration with 6 services |
| `.dapr/components/pubsub-kafka.yaml` | Dapr Pub/Sub component for Kafka (Redpanda) |
| `.dapr/components/statestore.yaml` | Dapr State Store component for Redis |
| `.dapr/components/jobs.yaml` | Dapr Jobs API component for scheduling |
| `.env.docker` | Environment variables template |
| `DOCKER_COMPOSE_README.md` | Complete documentation |
| `start-dev.sh` | Automated startup script |
| `backend/Dockerfile` | Added dev stage with hot reload |
| `frontend/Dockerfile` | Added dev stage with hot reload |

---

## 🚀 Quick Start (3 Commands)

```bash
# 1. Configure environment
cp .env.docker .env
nano .env  # Edit with your DATABASE_URL and API keys

# 2. Start all services
./start-dev.sh

# 3. Access application
# Frontend: http://localhost:3000
# Backend:  http://localhost:8000
# Health:   http://localhost:8000/health
```

---

## 📦 Services Running

| Service | Port | Description |
|---------|------|-------------|
| **frontend** | 3000 | Next.js web application |
| **backend** | 8000 | FastAPI REST API with Dapr sidecar |
| **redpanda** | 9092 | Kafka-compatible event streaming |
| **db** | 5432 | PostgreSQL database |
| **redis** | 6379 | Redis for Dapr state store |
| **dapr-placement** | 50005 | Dapr placement service |

---

## 🏗️ Architecture

```
┌──────────────┐      ┌──────────────┐
│   Frontend   │      │    Backend   │
│  (Next.js)   │─────▶│  (FastAPI)   │
│   :3000      │      │    :8000     │
└──────────────┘      └──────┬───────┘
                             │ Dapr
                             ▼
                    ┌────────────────┐
                    │  Dapr Runtime  │
                    └───────┬────────┘
           ┌────────────────┼────────────────┐
           ▼                ▼                ▼
    ┌──────────┐    ┌──────────┐    ┌──────────┐
    │ Redpanda │    │   DB     │    │  Redis   │
    │ (Kafka)  │    │(Postgres)│    │(State)   │
    │  :9092   │    │  :5432   │    │  :6379   │
    └──────────┘    └──────────┘    └──────────┘
```

---

## 🔧 Common Commands

```bash
# Start services
docker compose up -d

# View logs
docker compose logs -f

# Stop services
docker compose down

# Restart backend
docker compose restart backend

# Backend shell
docker compose exec backend bash

# Database shell
docker compose exec db psql -U postgres -d taskflow

# List Kafka topics
docker compose exec redpanda rpk topic list

# Test health
curl http://localhost:8000/health | jq
```

---

## ✅ Verification Checklist

```bash
# 1. Check all containers are running
docker compose ps
# All should show "Up (healthy)"

# 2. Test backend health
curl http://localhost:8000/health
# Should return: {"status": "ok", "dapr": {"connected": true}}

# 3. Test frontend
curl http://localhost:3000
# Should return HTML

# 4. Check Dapr components
docker compose exec backend dapr components
# Should show: pubsub, statestore, jobs

# 5. Check Kafka topics
docker compose exec redpanda rpk topic list
# Should show: task-events topic

# 6. Test database connection
docker compose exec backend python -c "from src.database import engine; print(engine.connect())"
# Should print connection object
```

---

## 🔐 Required Environment Variables

**Minimum required in `.env`:**

```bash
# Database (choose one)
DATABASE_URL=postgresql://postgres:postgres@db:5432/taskflow  # Local
# OR
DATABASE_URL=postgresql://user:pass@host:port/db  # Neon

# Authentication
BETTER_AUTH_SECRET=generate_with_openssl_rand_-hex_32

# OpenAI (for chatbot)
OPENAI_API_KEY=sk-your-key-here
```

---

## 🐛 Troubleshooting

### Backend won't start

```bash
# Check logs
docker compose logs backend

# Common fix: Restart with rebuild
docker compose up -d --force-recreate backend
```

### Dapr not connected

```bash
# Check Dapr components loaded
ls -la .dapr/components/

# Restart backend
docker compose restart backend
```

### Port already in use

```bash
# Find process using port 8000
lsof -i :8000

# Or change port in docker-compose.yml
```

### Database connection error

```bash
# Check db container
docker compose ps db

# Test connection
docker compose exec db psql -U postgres -c "SELECT 1"
```

---

## 📊 Resource Usage

| Service | CPU | Memory | Disk |
|---------|-----|--------|------|
| Frontend | ~100m | ~500MB | ~200MB |
| Backend | ~200m | ~400MB | ~100MB |
| Redpanda | ~500m | ~1GB | ~1GB |
| PostgreSQL | ~200m | ~500MB | ~500MB |
| Redis | ~50m | ~50MB | ~10MB |
| **Total** | **~1 CPU** | **~2.5GB** | **~2GB** |

**Minimum Requirements:**
- CPU: 2 cores (4 recommended)
- Memory: 4GB (8GB recommended)
- Disk: 5GB free space

---

## 🎯 What Works

### ✅ Phase III Features
- User authentication (signup/signin)
- Task CRUD via chatbot
- MCP tools integration
- Conversation history

### ✅ Phase IV Features
- Containerized deployment
- Health checks
- Database migrations

### ✅ Phase V Features (New)
- Task priorities (4 levels)
- Tags & categorization
- Search & filter
- Due dates with overdue indicators
- Recurring tasks (auto-generation)
- Reminders (Dapr Jobs API)
- Real-time sync (WebSocket + Kafka)
- Optimistic locking

---

## 📝 Next Steps

1. **Start the stack**: `./start-dev.sh`
2. **Create account**: http://localhost:3000
3. **Test features**: Create tasks with priorities, tags, due dates
4. **Test real-time**: Open two tabs, verify sync
5. **Test recurring**: Create recurring task, complete it
6. **Test reminders**: Set 1-minute reminder

For production deployment, use Kubernetes + Helm (see `helm/taskflow/`).

---

## 📚 Documentation

- **Full README**: `DOCKER_COMPOSE_README.md`
- **Phase V Features**: `PHASE_V_FEATURES.md`
- **API Contracts**: `specs/006-advanced-features-extension/contracts/api-contracts.md`
- **Quickstart**: `specs/006-advanced-features-extension/quickstart.md`

---

**Setup Time**: ~5 minutes  
**Status**: ✅ Ready for local development  
**Production**: Use Kubernetes/Helm for deployment
