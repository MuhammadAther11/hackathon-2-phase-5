  
   # hackathon-2-phase-4

# TaskFlow - AI-Powered Task Management (Cloud-Native)

An intelligent task management application that lets you manage your todos through natural language conversation. Built with an AI chatbot powered by OpenAI Agents SDK and MCP (Model Context Protocol) tools, backed by a FastAPI backend and Neon Serverless PostgreSQL.

**Phase IV** adds cloud-native deployment: the entire application is containerized with Docker and deployed to a local Minikube Kubernetes cluster via Helm charts, with all infrastructure managed by AI agents (kubectl-ai, kagent, Gordon).

## Live Demo & Links

| Resource | Link |
|:---|:---|
| **Live App (Frontend)** | [https://hackathon-2-phase-3-todo-ai-cahtbot.vercel.app/](https://hackathon-2-phase-3-todo-ai-cahtbot.vercel.app/) |
| **Backend API** | [https://atherali11-ai-chatbot-phase-3.hf.space](https://atherali11-ai-chatbot-phase-3.hf.space) |
| **GitHub Repository** | [https://github.com/MuhammadAther11/hackathon-2-phase-4.git](https://github.com/MuhammadAther11/hackathon-2-phase-4.git) |
| **YouTube Demo** | [https://youtu.be/iU6tChPvlAA](https://youtu.be/iU6tChPvlAA) |

---

## Table of Contents

- [Live Demo & Links](#live-demo--links)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
  - [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [MCP Tools](#mcp-tools)
- [Authentication](#authentication)
- [Responsive Design](#responsive-design)
- [Testing](#testing)
- [Deployment](#deployment)
  - [Cloud Deployment (Vercel + HF Spaces)](#cloud-deployment)
  - [Local Kubernetes (Minikube + Helm)](#local-kubernetes-minikube--helm)
- [Video Demo](#video-demo)
- [Contributing](#contributing)

---

## Features

- **Natural Language Task Management** - Create, update, delete, and list tasks by chatting naturally (e.g., "Add task: Buy groceries tomorrow")
- **AI-Powered Intent Detection** - OpenAI Agent understands user intent and selects the appropriate tool automatically
- **MCP Tool Execution** - Five stateless MCP tools handle all task operations with structured JSON responses
- **Real-Time Chat Interface** - ChatKit-style UI with message bubbles, typing indicators, and conversation history
- **Task Dashboard** - Visual dashboard with stats cards (total, completed, in progress, completion rate)
- **Conversation Persistence** - Chat sessions are stored in the database and resume after restart
- **JWT Authentication** - Secure signup/signin with hashed passwords and JWT token-based API protection
- **Dark/Light Theme** - Full theme support with smooth transitions across all pages
- **Fully Responsive** - Optimized for mobile, tablet, and desktop with touch-friendly interactions
- **Glassmorphism Design** - Modern glass-card UI with gradient accents, animated backgrounds, and Framer Motion animations
- **Containerized Deployment** - Frontend and backend packaged as Docker containers with multi-stage builds
- **Kubernetes Ready** - Deployable to Minikube via Helm charts with health checks, resource limits, and probes
- **AI-Managed Infrastructure** - DevOps operations handled by kubectl-ai, kagent, and Gordon agents
- **Infrastructure as Code** - All deployment configuration defined in Dockerfiles, Helm charts, and K8s manifests

---

## Tech Stack

| Layer | Technology |
|:---|:---|
| **Frontend** | Next.js 16, React 19, TypeScript |
| **Styling** | Tailwind CSS 3.4, Framer Motion |
| **State Management** | TanStack React Query |
| **Backend** | Python FastAPI |
| **AI Agent** | OpenAI Agents SDK |
| **MCP Tools** | Official MCP SDK (stateless tool execution) |
| **ORM** | SQLModel / SQLAlchemy |
| **Database** | Neon Serverless PostgreSQL |
| **Authentication** | JWT (python-jose) with bcrypt password hashing |
| **Form Handling** | React Hook Form + Zod validation |
| **Icons** | Lucide React |
| **Containerization** | Docker (multi-stage builds) |
| **Orchestration** | Minikube (local Kubernetes) |
| **Package Manager** | Helm Charts |
| **AI Ops** | kubectl-ai, kagent, Gordon (Docker) |

---

## Architecture

```
                    ┌─────────────────────────────────────────────┐
                    │           Minikube Kubernetes Cluster        │
                    │                                             │
User (Browser) ──> │  ┌──────────────┐    ┌──────────────────┐  │
                    │  │  Frontend Pod │    │   Backend Pod     │  │
                    │  │  (Next.js)   │───>│   (FastAPI)       │  │
                    │  │  Container   │    │   Container       │  │
                    │  └──────────────┘    └────────┬─────────┘  │
                    │                               │             │
                    │         HTTP + JWT             │             │
                    │                               v             │
                    │              [OpenAI Agent (Intent Detection)]│
                    │                               │             │
                    │                    [MCP Tool Selector]       │
                    │                               │             │
                    │                  +----+----+----+----+      │
                    │                  |    |    |    |    |      │
                    │                 add  list compl upd  del    │
                    │                  +----+----+----+----+      │
                    │                               │             │
                    │  ┌────────────┐  ┌────────────┴──────┐     │
                    │  │ ConfigMaps │  │   K8s Secrets      │     │
                    │  └────────────┘  └───────────────────┘     │
                    └───────────────────────┬─────────────────────┘
                                            │
                    ┌───────────────────────v─────────────────────┐
                    │         Neon PostgreSQL Database              │
                    │   [Task Data] + [Conversation History]       │
                    └──────────────────────────────────────────────┘

    Managed by: Helm Charts | kubectl-ai | kagent | Gordon
```

**Data Flow:**
1. User types a message in the chat UI
2. Frontend sends the message to FastAPI backend with JWT token
3. Backend passes the message to the OpenAI Agent
4. Agent detects intent (create, list, update, delete, complete)
5. Agent selects and executes the appropriate MCP tool
6. MCP tool performs the database operation via service layer
7. Response flows back to the user through the chat interface

**Infrastructure Flow (Phase IV):**
1. Dockerfiles build frontend and backend container images
2. Helm charts define Kubernetes manifests (Deployments, Services, Ingress)
3. `helm install` deploys the full application to Minikube
4. ConfigMaps and Secrets inject environment configuration
5. Liveness/readiness probes ensure container health
6. AI agents (kubectl-ai, kagent) manage scaling and troubleshooting

---

## Project Structure

```
phase-4/
├── frontend/                    # Next.js frontend application
│   ├── src/
│   │   ├── app/                 # Next.js App Router pages
│   │   │   ├── page.tsx         # Landing page (hero, features, CTA)
│   │   │   ├── login/page.tsx   # Login page with branding panel
│   │   │   ├── signup/page.tsx  # Signup page with branding panel
│   │   │   ├── dashboard/page.tsx # Task dashboard with stats
│   │   │   ├── chat/page.tsx    # AI chat interface + task sidebar
│   │   │   ├── layout.tsx       # Root layout (fonts, providers)
│   │   │   └── globals.css      # Global styles, animations, glass-card
│   │   ├── components/
│   │   │   ├── AuthForm.tsx     # Reusable login/signup form
│   │   │   ├── NavBar.tsx       # Navigation with mobile menu
│   │   │   ├── TaskDashboard.tsx # Task CRUD form + task list
│   │   │   ├── TaskItem.tsx     # Individual task card (toggle, edit, delete)
│   │   │   ├── chat/
│   │   │   │   ├── ChatInterface.tsx  # Main chat container
│   │   │   │   ├── ChatHistory.tsx    # Message list with empty state
│   │   │   │   ├── ChatInput.tsx      # Auto-resizing message input
│   │   │   │   ├── MessageBubble.tsx  # User/agent message bubbles
│   │   │   │   └── TypingIndicator.tsx # Animated typing dots
│   │   │   ├── theme/
│   │   │   │   ├── ThemeProvider.tsx   # next-themes provider
│   │   │   │   └── ThemeToggle.tsx     # Dark/light mode toggle
│   │   │   └── ui/              # Reusable UI primitives
│   │   ├── hooks/
│   │   │   ├── useChat.ts       # Chat message state + API calls
│   │   │   ├── useChatHistory.ts # Chat history fetching
│   │   │   └── useTasks.ts      # Task CRUD via React Query
│   │   ├── lib/
│   │   │   ├── auth-client.ts   # Auth client (login, signup, session)
│   │   │   ├── api-client.ts    # HTTP client with JWT injection
│   │   │   ├── chat-api.ts      # Chat API functions
│   │   │   ├── auth-errors.ts   # Auth error message mapping
│   │   │   └── utils.ts         # cn() utility for class merging
│   │   └── types/index.ts       # TypeScript type definitions
│   ├── tailwind.config.js       # Tailwind with custom animations
│   └── package.json
│
├── backend/                     # Python FastAPI backend
│   ├── src/
│   │   ├── main.py              # FastAPI app entry point
│   │   ├── database.py          # Database connection + session
│   │   ├── api/
│   │   │   ├── auth.py          # POST /auth/signup, POST /auth/login
│   │   │   ├── tasks.py         # CRUD endpoints for /api/{user_id}/tasks
│   │   │   └── chat.py          # POST /chat/message, GET /chat/history
│   │   ├── agent/
│   │   │   ├── openai_agent.py  # OpenAI Agent orchestration
│   │   │   ├── intent_detector.py # NLP intent detection
│   │   │   ├── tool_selector.py # Maps intents to MCP tools
│   │   │   ├── mcp_executor.py  # Executes selected MCP tools
│   │   │   ├── error_handler.py # Agent error handling
│   │   │   └── schemas.py       # Agent data schemas
│   │   ├── mcp/
│   │   │   └── tools.py         # MCP tool definitions (5 tools)
│   │   ├── models/
│   │   │   ├── user.py          # User SQLModel
│   │   │   ├── task.py          # Task SQLModel
│   │   │   └── chat.py          # ChatMessage SQLModel
│   │   ├── services/
│   │   │   ├── user_service.py  # User creation + authentication
│   │   │   ├── task_service.py  # Task CRUD business logic
│   │   │   └── chat_service.py  # Chat processing + history
│   │   ├── auth/
│   │   │   ├── jwt.py           # JWT creation + verification
│   │   │   └── passwords.py     # bcrypt hashing
│   │   ├── middleware/
│   │   │   └── auth.py          # JWT middleware for protected routes
│   │   └── db/
│   │       ├── connection.py    # Database connection pool
│   │       ├── session.py       # Session management
│   │       └── init.py          # Table initialization
│   ├── tests/                   # Test suite
│   │   ├── unit/                # Unit tests (intent, services)
│   │   ├── integration/         # Integration tests (MCP tools)
│   │   └── contract/            # Contract tests (tool schemas)
│   ├── pyproject.toml           # Python project config + dependencies
│   └── .env                     # Environment variables (not committed)
│
├── helm/                        # Helm charts (Phase IV)
│   └── taskflow/
│       ├── Chart.yaml           # Chart metadata
│       ├── values.yaml          # Default configuration values
│       └── templates/
│           ├── frontend-deployment.yaml
│           ├── frontend-service.yaml
│           ├── backend-deployment.yaml
│           ├── backend-service.yaml
│           ├── configmap.yaml
│           ├── secrets.yaml
│           └── ingress.yaml
│
├── Dockerfile.frontend          # Frontend container (multi-stage build)
├── Dockerfile.backend           # Backend container (multi-stage build)
├── docker-compose.yaml          # Local multi-container development
│
├── .specify/                    # SpecKit Plus (SDD workflow)
│   ├── memory/constitution.md   # Project constitution (v2.0.0)
│   └── templates/               # Spec, plan, tasks templates
│
├── specs/                       # Feature specifications
├── history/                     # PHRs and ADRs
├── CLAUDE.md                    # AI agent instructions (Phase IV)
└── README.md                    # This file
```

---

## Getting Started

### Prerequisites

- **Node.js** >= 18.x (for frontend)
- **Python** >= 3.10 (for backend)
- **PostgreSQL** database (Neon recommended, or any PostgreSQL instance)
- **Docker** (for containerization)
- **Minikube** (for local Kubernetes cluster)
- **Helm** >= 3.x (for Kubernetes package management)
- **kubectl** (for cluster interaction)
- **Git**

### Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create a virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # Linux/Mac
   venv\Scripts\activate     # Windows
   ```

3. **Install dependencies:**
   ```bash
   pip install -e ".[dev]"
   ```

4. **Configure environment variables** (see [Environment Variables](#environment-variables)):
   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```

5. **Run the backend server:**
   ```bash
   uvicorn src.main:app --reload --port 8000
   ```

   The API will be available at `http://localhost:8000`.

### Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:3000`.

### Environment Variables

#### Backend (`backend/.env`)

| Variable | Description | Required |
|:---|:---|:---|
| `DATABASE_URL` | PostgreSQL connection string (Neon or local) | Yes |
| `BETTER_AUTH_SECRET` | Secret key for JWT token signing | Yes |
| `FRONTEND_URL` | Frontend URL for CORS (default: `http://localhost:3000`) | No |
| `OPENAI_API_KEY` | OpenAI API key for AI agent | Yes |

#### Frontend (`frontend/.env.local`)

| Variable | Description | Required |
|:---|:---|:---|
| `NEXT_PUBLIC_API_BASE_URL` | Backend API URL (default: `http://localhost:8000`) | Yes |

---

## API Reference

### Authentication

| Method | Endpoint | Description | Auth |
|:---|:---|:---|:---|
| `POST` | `/auth/signup` | Create a new account | No |
| `POST` | `/auth/login` | Sign in and receive JWT token | No |

#### POST /auth/signup
```json
// Request
{ "email": "user@example.com", "password": "securepassword" }

// Response (201)
{ "id": "uuid", "email": "user@example.com", "created_at": "2024-01-01T00:00:00Z" }
```

#### POST /auth/login
```json
// Request
{ "email": "user@example.com", "password": "securepassword" }

// Response (200)
{
  "user": { "id": "uuid", "email": "user@example.com", "created_at": "..." },
  "access_token": "jwt-token-here",
  "token_type": "bearer"
}
```

### Tasks

All task endpoints require `Authorization: Bearer <token>` header.

| Method | Endpoint | Description |
|:---|:---|:---|
| `GET` | `/api/{user_id}/tasks` | List all tasks |
| `POST` | `/api/{user_id}/tasks` | Create a new task |
| `GET` | `/api/{user_id}/tasks/{id}` | Get a specific task |
| `PUT` | `/api/{user_id}/tasks/{id}` | Update a task |
| `DELETE` | `/api/{user_id}/tasks/{id}` | Delete a task |

### Chat

| Method | Endpoint | Description |
|:---|:---|:---|
| `POST` | `/chat/message` | Send a message to the AI chatbot |
| `GET` | `/chat/history` | Get conversation history |

#### POST /chat/message
```json
// Request
{
  "user_id": "uuid",
  "message_text": "Add task: Buy groceries tomorrow",
  "session_id": "optional-session-id"
}

// Response (200)
{
  "session_id": "uuid",
  "agent_response": "Done! Task 'Buy groceries' created for tomorrow.",
  "intent_detected": "create_task",
  "confidence": 0.95,
  "mcp_tool_executed": "add_task",
  "tool_result": { "id": "uuid", "title": "Buy groceries", ... }
}
```

### Utility

| Method | Endpoint | Description |
|:---|:---|:---|
| `GET` | `/` | API welcome message |
| `GET` | `/health` | Health check |

---

## MCP Tools

The backend exposes five MCP (Model Context Protocol) tools that the AI agent selects and executes based on user intent:

| Tool | Description | Trigger Examples |
|:---|:---|:---|
| `add_task` | Create a new task | "Add task Buy groceries", "Create a task for meeting" |
| `list_tasks` | List user's tasks (with optional status filter) | "Show my tasks", "What's on my list?", "List pending tasks" |
| `complete_task` | Mark a task as completed | "Complete task #1", "Mark Buy groceries as done" |
| `update_task` | Update task title or description | "Rename task #1 to Weekly report" |
| `delete_task` | Delete a task | "Delete task #3", "Remove the groceries task" |

All tools:
- Are stateless (no in-memory state; all data in PostgreSQL)
- Enforce user isolation via JWT-extracted `user_id`
- Return structured JSON: `{ status: "success"|"error", data|error: {...} }`

---

## Authentication

TaskFlow uses JWT-based authentication:

1. **Signup** - User registers with email and password (bcrypt hashed)
2. **Login** - Returns a JWT access token (24-hour expiry)
3. **Protected Routes** - All task and chat endpoints verify the JWT token
4. **User Isolation** - Each user can only access their own tasks and conversations

The frontend stores the JWT token in memory and injects it into all API requests via the centralized HTTP client.

---

## Responsive Design

The application is fully responsive across all breakpoints:

| Breakpoint | Width | Optimizations |
|:---|:---|:---|
| **Mobile** | < 640px | Stacked layouts, touch-friendly buttons (44px min), collapsible task panel, larger font inputs |
| **Tablet** | 640px - 1024px | Two-column hero, 2-col feature grid, optimized stats grid |
| **Desktop** | > 1024px | Full two-panel chat layout, 3-col features, 4-col stats |

Key responsive features:
- **NavBar**: Hamburger menu on mobile with animated slide-down
- **Landing Page**: Hero demo card visible on tablet+, floating shapes scale with viewport
- **Auth Pages**: Split-screen branding panel on desktop, compact mobile branding
- **Dashboard**: Stats cards adapt from 2-col to 4-col, task actions always visible on touch devices
- **Chat Page**: Collapsible task panel on mobile with toggle button, full sidebar on desktop
- **Safe Area Support**: Proper padding for notched devices (iPhone etc.)
- **Input Zoom Prevention**: Font size forced to 16px on mobile to prevent iOS zoom

---

## Testing

### Backend Tests

```bash
cd backend
pytest                          # Run all tests
pytest tests/unit/              # Unit tests only
pytest tests/integration/       # Integration tests only
pytest tests/contract/          # Contract tests only
pytest -v                       # Verbose output
```

### Frontend Tests

```bash
cd frontend
npm run test                    # Run unit tests (Vitest)
npm run test:ui                 # Run tests with UI
npm run test:e2e                # Run end-to-end tests (Playwright)
```

### Type Checking

```bash
cd frontend
npm run type-check              # TypeScript type checking
npm run lint                    # ESLint
```

---

## Deployment

### Cloud Deployment

#### Frontend (Vercel)

The frontend is deployed on **Vercel** at:
**[https://hackathon-2-phase-3-todo-ai-cahtbot.vercel.app/](https://hackathon-2-phase-3-todo-ai-cahtbot.vercel.app/)**

Push to the `main` branch triggers automatic deployment.

Environment variable set in Vercel:
- `NEXT_PUBLIC_API_BASE_URL` = `https://atherali11-ai-chatbot-phase-3.hf.space`

#### Backend (Hugging Face Spaces)

The backend is deployed on **Hugging Face Spaces** at:
**[https://atherali11-ai-chatbot-phase-3.hf.space](https://atherali11-ai-chatbot-phase-3.hf.space)**

Required environment variables configured in HF Spaces:
- `DATABASE_URL` - Neon PostgreSQL connection string
- `BETTER_AUTH_SECRET` - JWT signing secret
- `OPENAI_API_KEY` - OpenAI API key
- `FRONTEND_URL` - `https://hackathon-2-phase-3-todo-ai-cahtbot.vercel.app`

### Local Kubernetes (Minikube + Helm)

Phase IV enables full local deployment on a Minikube Kubernetes cluster.

#### 1. Start Minikube

```bash
minikube start
```

#### 2. Build Docker Images

```bash
# Build inside Minikube's Docker daemon
eval $(minikube docker-env)

docker build -f Dockerfile.frontend -t taskflow-frontend:latest .
docker build -f Dockerfile.backend -t taskflow-backend:latest .
```

#### 3. Deploy with Helm

```bash
# Install the Helm chart
helm install taskflow ./helm/taskflow \
  --set backend.env.DATABASE_URL="your-neon-connection-string" \
  --set backend.env.BETTER_AUTH_SECRET="your-jwt-secret" \
  --set backend.env.OPENAI_API_KEY="your-openai-key"

# Check deployment status
kubectl get pods
kubectl get services
```

#### 4. Access the Application

```bash
# Get the frontend service URL
minikube service taskflow-frontend --url
```

#### 5. Manage Releases

```bash
# Upgrade after changes
helm upgrade taskflow ./helm/taskflow

# Rollback if needed
helm rollback taskflow

# Uninstall
helm uninstall taskflow
```

#### Kubernetes Resources

| Resource | Description |
|:---|:---|
| **Deployments** | Frontend and backend pods with liveness/readiness probes |
| **Services** | ClusterIP services for inter-pod communication |
| **ConfigMaps** | Non-sensitive environment configuration |
| **Secrets** | DATABASE_URL, BETTER_AUTH_SECRET, OPENAI_API_KEY |
| **Ingress** | Optional ingress for external access |

---

## Video Demo

Watch the full walkthrough of TaskFlow in action:

**[YouTube Demo - TaskFlow AI Chatbot](https://youtu.be/iU6tChPvlAA)**

---

## Contributing

1. Fork the repository: [https://github.com/MuhammadAther11/hackathon-2-phase-4.git](https://github.com/MuhammadAther11/hackathon-2-phase-4.git)
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

MIT
   3c97158 (Initial commit)
