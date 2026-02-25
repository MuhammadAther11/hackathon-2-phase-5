# Implementation Plan: Chat API, Chatbot UI & Frontend UI/UX Integration

**Branch**: `3-chatbot-ui-integration` | **Date**: 2026-02-08 | **Spec**: [specs/3-chatbot-ui-integration/spec.md](spec.md)
**Input**: Feature specification from `/specs/3-chatbot-ui-integration/spec.md`

**Note**: This plan completes Phase III by integrating Features 1 (MCP tools) and 2 (Cohere agent) with a modern chatbot UI and enhanced frontend experience.

## Summary

Build the complete frontend-backend integration for the Phase III Todo AI Chatbot. Implement chat API endpoints that connect the Cohere agent with a ChatKit-based UI, add conversation history persistence, create modern UI/UX with animations and responsive design, and implement dark/light theme system. The result is a polished, AI-powered todo management application accessible via natural language chat.

## Technical Context

**Frontend**:
- **Framework**: Next.js 15 (App Router), React 18+, TypeScript
- **Styling**: Tailwind CSS 3+ with custom animations
- **State**: React Query for server state, localStorage for theme
- **Chat UI**: Custom components (message bubbles, input, history)
- **Auth**: Better Auth React client (from Phase II)
- **API Client**: Centralized HTTP client with JWT injection

**Backend**:
- **Framework**: FastAPI (already deployed from Features 1-2)
- **Database**: Neon PostgreSQL (tasks + conversation tables ready)
- **AI Agent**: Cohere agent with MCP tool calling (Feature 2)
- **MCP Tools**: Task CRUD operations (Feature 1)

**Testing**: Playwright for e2e, Jest/React Testing Library for components
**Performance Goals**: Chat response <6s p95, animations 60fps, page load <2s
**Constraints**: Mobile-first responsive, accessibility (WCAG 2.1 AA), no WebSocket
**Scale/Scope**: Single-user chat sessions, 50+ message history, dark/light themes

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] Security: Strict isolation and JWT integrity enforced?
  - JWT required on all chat API requests
  - Frontend sends JWT with every message
  - User isolation enforced by backend agent (user_id from JWT)
- [x] Accuracy: Backend-Frontend-Database synchronization verified?
  - Frontend displays real-time chat responses
  - Conversation history loaded from database on page load
  - Chat state persisted; refresh recovers conversation
- [x] Reliability: Error handling (401, 404, 500) and status codes defined?
  - Frontend handles loading, error, and success states
  - Backend returns structured errors (from Feature 2)
  - Network failures show retry option
- [x] Usability: Responsive layout and UX intuition planned?
  - Mobile-first responsive design (375px - 1920px)
  - Touch targets ≥44px for mobile
  - Smooth animations and transitions
  - Dark/light mode for accessibility
- [x] Reproducibility: Setup documentation and env vars defined?
  - Frontend .env: NEXT_PUBLIC_API_URL, NEXT_PUBLIC_AUTH_URL
  - Backend .env: Already configured from Features 1-2
  - Setup documented in quickstart.md

## Project Structure

### Documentation (this feature)

```text
specs/3-chatbot-ui-integration/
├── spec.md              # Feature specification (complete)
├── plan.md              # This file (implementation plan)
├── research.md          # Phase 0 (resolve unknowns)
├── data-model.md        # Phase 1 (frontend state models)
├── quickstart.md        # Phase 1 (setup & testing)
├── contracts/           # Phase 1 (API contracts)
├── checklists/
│   └── requirements.md  # Quality checklist (complete)
└── tasks.md             # Phase 2 output (/sp.tasks)
```

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx          # Redesigned login page
│   │   │   └── signup/page.tsx         # Redesigned signup page
│   │   ├── dashboard/
│   │   │   └── page.tsx                # Redesigned dashboard
│   │   └── chat/
│   │       └── page.tsx                # New chat/todo integrated page
│   ├── components/
│   │   ├── chat/
│   │   │   ├── ChatInterface.tsx       # Main chat container
│   │   │   ├── MessageBubble.tsx       # User/assistant message bubbles
│   │   │   ├── ChatInput.tsx           # Input box with send button
│   │   │   ├── TypingIndicator.tsx     # Loading animation
│   │   │   └── ChatHistory.tsx         # Message list
│   │   ├── theme/
│   │   │   ├── ThemeProvider.tsx       # Theme context
│   │   │   └── ThemeToggle.tsx         # Light/dark toggle button
│   │   ├── ui/
│   │   │   ├── Button.tsx              # Animated button component
│   │   │   ├── Card.tsx                # Animated card component
│   │   │   └── Modal.tsx               # Animated modal component
│   │   └── layout/
│   │       ├── Navbar.tsx              # Redesigned with theme support
│   │       └── PageTransition.tsx      # Route transition wrapper
│   ├── hooks/
│   │   ├── useChat.ts                  # Chat state management
│   │   ├── useTheme.ts                 # Theme persistence hook
│   │   └── useChatHistory.ts           # Conversation history loading
│   ├── lib/
│   │   ├── api-client.ts               # HTTP client (already exists, extend)
│   │   └── chat-api.ts                 # Chat API functions
│   └── styles/
│       └── animations.css              # Custom animation keyframes
├── tailwind.config.ts                  # Dark mode configuration
└── package.json                        # Add framer-motion for animations

backend/
├── src/
│   └── api/
│       └── chat.py                     # Chat endpoints (from Feature 2, verify integration)
└── (Features 1 & 2 already complete)
```

**Structure Decision**: Extend existing Next.js frontend and FastAPI backend. Chat interface integrated into Todo app as new /chat route. Theme system wraps entire app. Animations added to existing components. No separate chat application.

## Complexity Tracking

No Constitution violations. Design follows all principles:
- Security: JWT auth on all requests
- Accuracy: Real-time chat + database persistence
- Reliability: Error states and retry logic
- Usability: Mobile-first, dark mode, smooth animations
- Reproducibility: Theme in localStorage, conversation in DB

---

## Phase 0: Research & Unknowns Resolution

### Research Tasks

1. **ChatKit vs custom chat components**: Evaluate if ChatKit library provides value or if custom components are sufficient
2. **Animation library**: framer-motion vs CSS animations vs Tailwind animate
3. **Dark mode implementation**: Tailwind dark: class vs next-themes provider
4. **Real-time updates**: Polling vs SSE vs simple request-response
5. **Message storage frontend**: React Query cache strategy for conversation history

### Consolidated Research (research.md - Phase 0 output)

**Decision 1: Custom Chat Components (No ChatKit)**

**Rationale**: ChatKit adds dependency overhead for simple use case. Custom React components with Tailwind provide full control and better integration with existing app.

**Alternatives considered**:
- ChatKit library: Feature-rich but heavy
  - Rejected: Overkill for simple user-assistant chat
- Vercel AI SDK UI: React chat components
  - Rejected: Tied to Vercel AI SDK; we use Cohere

**Decision 2: Framer Motion for Complex Animations**

**Rationale**: Framer Motion provides declarative animations with gesture support. CSS animations for simple effects. Best of both worlds.

**Alternatives considered**:
- CSS animations only: Lightweight but limited
  - Rejected: Page transitions and complex effects harder
- react-spring: Physics-based animations
  - Rejected: Overkill; framer-motion simpler API

**Decision 3: next-themes for Dark Mode**

**Rationale**: Industry-standard solution for Next.js. Handles SSR, localStorage persistence, and Tailwind integration automatically.

**Alternatives considered**:
- Manual Tailwind dark: class implementation
  - Rejected: Need to handle SSR flash, localStorage manually
- React Context only: Custom theme provider
  - Rejected: Reinventing the wheel; next-themes is battle-tested

**Decision 4: Simple HTTP Request-Response (No WebSocket)**

**Rationale**: Phase III spec doesn't require real-time updates. Simple POST request per message is sufficient and simpler.

**Alternatives considered**:
- WebSocket for real-time chat: Bi-directional communication
  - Rejected: Adds complexity; not needed for turn-based chat
- Server-Sent Events (SSE): Streaming responses
  - Rejected: Cohere API already returns complete response; no streaming benefit

**Decision 5: React Query for Chat State**

**Rationale**: React Query handles cache invalidation, optimistic updates, and loading states automatically. Perfect for chat history and message sending.

**Alternatives considered**:
- useState + useEffect: Manual state management
  - Rejected: Boilerplate; no cache management
- Redux: Global state management
  - Rejected: Overkill for simple chat state

---

## Phase 1: Design & Contracts

### 1a. Data Model (data-model.md - Phase 1 output)

**Frontend State Models** (TypeScript interfaces):

```typescript
// Chat Message (matches backend ConversationMessage)
interface ChatMessage {
  id: string;
  message_text: string;
  sender: 'user' | 'agent';
  intent?: string;
  mcp_tool_used?: string;
  created_at: string;  // ISO datetime
}

// Chat Response (from POST /api/chat/message)
interface ChatResponse {
  session_id: string;
  agent_response: string;
  intent_detected?: string;
  mcp_tool_executed?: string;
  tool_result?: any;
  requires_confirmation?: boolean;
}

// Chat History Response (from GET /api/chat/history)
interface ChatHistoryResponse {
  session_id: string;
  messages: ChatMessage[];
}

// Theme Preference (localStorage)
type Theme = 'light' | 'dark';
```

**Component State**:
- Chat component: messages array, loading boolean, error string, session_id
- Theme provider: theme string, toggleTheme function
- Message input: text string, sending boolean

### 1b. API Contracts (contracts/ - Phase 1 output)

**Frontend → Backend API Calls**:

**POST /api/chat/message**:
- Request: { message_text: string, session_id?: string }
- Headers: Authorization: Bearer {JWT}
- Response: { session_id, agent_response, intent_detected, tool_result }
- Errors: 400 (invalid input), 401 (no auth), 500 (agent failure)

**GET /api/chat/history**:
- Query: session_id (optional), limit (default 50)
- Headers: Authorization: Bearer {JWT}
- Response: { session_id, messages: [{id, message_text, sender, created_at}] }
- Errors: 401 (no auth), 500 (DB error)

**Component Contracts**:

**ChatInterface component**:
- Props: userId (from auth context)
- State: messages[], loading, error, sessionId
- Events: onMessageSend(text) → calls API, onHistoryLoad() → fetches history

**ThemeProvider component**:
- Props: children (ReactNode)
- Context: theme ('light'|'dark'), toggleTheme()
- Storage: localStorage.setItem('theme', value)

### 1c. Quickstart (quickstart.md - Phase 1 output)

**Frontend Setup**:
```bash
cd frontend
npm install framer-motion next-themes
npm install -D @types/node
```

**Test Chat Integration**:
```typescript
// Test sending message
const response = await fetch('/api/chat/message', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${jwt}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ message_text: 'Add task: buy milk' })
});

const data = await response.json();
console.log('Agent response:', data.agent_response);
```

**Test Theme Toggle**:
```typescript
// Toggle theme
const { theme, toggleTheme } = useTheme();
toggleTheme(); // light <-> dark

// Verify persistence
localStorage.getItem('theme'); // 'dark' or 'light'
```

---

## Phase 2: Task Generation

Task generation will occur in `/sp.tasks` and will break down into:

**Backend**: Verify chat endpoints from Feature 2 work correctly

**Frontend**:
- Chat UI components (MessageBubble, ChatInput, TypingIndicator, ChatInterface)
- Chat API integration hooks (useChat, useChatHistory)
- Theme system (ThemeProvider, ThemeToggle, dark mode styles)
- Animation components (Button, Card, Modal with framer-motion)
- Page redesigns (Login, Signup, Dashboard, Chat)
- Responsive layout updates
- Page transition wrapper

**Integration**: Connect frontend chat UI with backend agent, test e2e flow

---

## Key Architectural Decisions

### Decision 1: Chat UI Integrated into Todo App

**Rationale**: Chat and todo list should be on same page for seamless interaction. User adds task via chat, sees it appear in list immediately.

**Implication**: /chat route contains both chat interface and todo list. Layout: sidebar or split view. Mobile: tabs or stacked.

### Decision 2: Theme System with next-themes

**Rationale**: next-themes handles SSR flash prevention, localStorage persistence, and Tailwind dark: integration automatically.

**Implication**: Wrap app in ThemeProvider, use dark: prefix in Tailwind classes, toggle button updates context.

### Decision 3: Framer Motion for Complex Animations

**Rationale**: Page transitions, message bubble entry, modal animations benefit from declarative API. Simple hover effects use CSS.

**Implication**: Import AnimatePresence and motion components. Add exit animations for route changes.

### Decision 4: React Query for Chat State

**Rationale**: React Query manages cache, optimistic updates, and refetch logic. Simplifies chat message state management.

**Implication**: useMutation for sending messages, useQuery for loading history, automatic cache invalidation.

### Decision 5: Mobile-First Responsive Design

**Rationale**: Mobile usage is primary for many users. Design mobile layout first, enhance for tablet/desktop.

**Implication**: Tailwind responsive classes (sm:, md:, lg:). Touch targets ≥44px. Test on 375px viewport first.

---

## Validation Plan

### Test Coverage

1. **Component Tests** (React Testing Library):
   - Chat components: MessageBubble, ChatInput, TypingIndicator, ChatInterface
   - Theme components: ThemeToggle, ThemeProvider
   - Animated components: Button, Card, Modal

2. **Integration Tests** (Playwright e2e):
   - Full chat flow: Login → Send message → Receive response → Verify task created
   - Theme toggle: Switch mode → Verify all pages update → Refresh → Verify persists
   - Responsive: Test on 375px, 768px, 1920px viewports
   - Animations: Verify smooth 60fps performance

3. **API Integration Tests**:
   - POST /api/chat/message returns valid response
   - GET /api/chat/history loads previous messages
   - JWT authentication blocks unauthorized requests

### Validation Checklist

- [ ] Chat UI sends messages and receives AI responses
- [ ] Conversation history persists after page refresh
- [ ] Theme toggle works on all pages (login, signup, dashboard, chat)
- [ ] All animations run at 60fps without jank
- [ ] Mobile layout usable on 375px viewport
- [ ] Touch targets ≥44px on mobile
- [ ] End-to-end flow: Chat "add task" → Task appears in list

---

## Risk Analysis

### Risk 1: Animation Performance on Low-End Devices

**Blast Radius**: Janky animations, poor UX

**Mitigation**:
- Use transform and opacity for animations (GPU-accelerated)
- Detect reduced motion preference (prefers-reduced-motion)
- Limit animations on mobile devices
- Test on older devices

### Risk 2: Chat Response Latency >6 Seconds

**Blast Radius**: Poor perceived performance, user frustration

**Mitigation**:
- Show typing indicator immediately
- Optimistic UI updates where possible
- Display "AI is thinking..." message after 3s
- Timeout after 10s with retry option

### Risk 3: Theme Flash on Page Load (SSR Issue)

**Blast Radius**: Jarring visual flash between light/dark

**Mitigation**:
- Use next-themes with proper SSR configuration
- Inline theme script in _document.tsx
- Block render until theme resolved
- Test with JavaScript disabled

### Risk 4: Conversation History Query Performance

**Blast Radius**: Slow page load on chat page

**Mitigation**:
- Limit history to 50 messages (pagination if needed)
- Use indexed queries (user_id, session_id)
- Cache in React Query for 5 minutes
- Show skeleton loading state

---

## Next Steps

1. **Phase 0 (Research)**: Create `research.md` with consolidated findings on chat UI libraries, animation approach, theme system, responsive patterns
2. **Phase 1 (Design)**: Create `data-model.md`, `contracts/`, and `quickstart.md` with detailed component specs and API integration
3. **Phase 2 (Tasks)**: Run `/sp.tasks 3-chatbot-ui-integration` to generate implementation tasks
4. **Implementation**: Execute tasks using Frontend Agent for React/Next.js components, Backend Agent for API verification
5. **Validation**: Test e2e flow, verify performance, validate responsive design

