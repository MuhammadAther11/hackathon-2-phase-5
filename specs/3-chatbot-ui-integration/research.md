# Research: Chat API, Chatbot UI & Frontend UI/UX Integration

**Date**: 2026-02-08
**Feature**: 3-chatbot-ui-integration
**Status**: Complete

## Overview

This document consolidates research findings on implementing the complete frontend-backend integration for the AI-powered chatbot UI. All unknowns from the Technical Context have been resolved.

---

## Research Question 1: Chat UI Library Choice (ChatKit vs Custom)

**Unknown**: Should we use a pre-built chat library like ChatKit or build custom components?

### Decision
**Custom React components** instead of ChatKit library.

### Rationale
- Full control over UI/UX design and animations
- Better integration with existing Tailwind CSS
- No dependency overhead for simple use case (just message bubbles + input)
- Easier to customize for dark/light mode
- Can implement specific interaction patterns (auto-scroll, typing indicators) precisely

### Alternatives Considered
1. **ChatKit library**: Pre-built chat components
   - Rejected: Heavy dependency; limited customization; overkill for simple user/agent chat
2. **Vercel AI SDK UI**: React components for chat interfaces
   - Rejected: Tied to Vercel AI SDK; we use Cohere API directly
3. **Custom components**: Build from scratch with React + Tailwind
   - Chosen: Full control, lightweight, integrates perfectly with existing app

### Implementation Details
```tsx
// MessageBubble component will handle:
- Right-aligned (user) vs left-aligned (agent) messages
- Timestamp display
- Loading states for agent responses
- Dark/light mode styling

// ChatInput component will handle:
- Text input with character counter
- Send button with loading state
- Keyboard shortcuts (Enter to send)
- Disabled state during agent processing

// TypingIndicator component will handle:
- Animated dots for "AI is thinking"
- Smooth appearance/disappearance
- Dark/light mode styling
```

---

## Research Question 2: Animation Library & Approach

**Unknown**: Which animation library provides best balance of performance and functionality for UI animations?

### Decision
**Framer Motion** for complex animations + **CSS/Tailwind** for simple hover effects.

### Rationale
- Framer Motion: Declarative animations with gesture support (scale, tap effects)
- CSS animations: GPU-accelerated transforms for simple effects (hover, transitions)
- Best of both worlds: Complex page transitions and button interactions with Motion, simple hover states with CSS

### Alternatives Considered
1. **CSS animations only**: Pure Tailwind/inline styles
   - Rejected: Page transitions and complex gestures harder to implement
2. **react-spring**: Physics-based animations
   - Rejected: Overkill; Framer Motion has simpler API for UI animations
3. **GSAP**: Professional animation library
   - Rejected: Too heavy for UI; Framer Motion sufficient for React

### Implementation Details
```tsx
// Buttons with Framer Motion
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  className="..."
>
  {children}
</motion.button>

// Page transitions with Framer Motion
<AnimatePresence>
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
  >
    {children}
  </motion.div>
</AnimatePresence>

// CSS hover effects (Tailwind)
<button className="transition-transform duration-200 hover:scale-105">
```

---

## Research Question 3: Dark Mode Implementation Strategy

**Unknown**: How to implement dark/light theme switching with proper SSR support?

### Decision
**next-themes** library with Tailwind CSS `dark:` prefix.

### Rationale
- Industry standard for Next.js theme management
- Handles SSR flash prevention automatically
- Integrates seamlessly with Tailwind dark: prefix
- Persists theme in localStorage with system preference fallback
- Small bundle size, excellent performance

### Alternatives Considered
1. **Manual Tailwind dark mode**: CSS class manipulation
   - Rejected: Need to handle SSR flash, localStorage manually
2. **React Context only**: Custom theme provider
   - Rejected: Reinventing the wheel; next-themes handles edge cases
3. **CSS media queries only**: prefers-color-scheme
   - Rejected: No user preference override capability

### Implementation Details
```tsx
// ThemeProvider wrapper
import { ThemeProvider } from 'next-themes'

export function AppWrapper({ children }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system">
      {children}
    </ThemeProvider>
  )
}

// Component usage
const { theme, setTheme } = useTheme()

// Tailwind styling
<div className="bg-white dark:bg-gray-900 text-black dark:text-white">
// ...
</div>
```

---

## Research Question 4: Real-Time Communication Pattern

**Unknown**: WebSocket vs SSE vs HTTP request-response for chat communication?

### Decision
**HTTP request-response** (simple POST/GET) without WebSockets.

### Rationale
- Phase III spec doesn't require real-time collaboration
- Simple request-response model fits turn-based AI interaction
- Cohere agent returns complete response immediately
- Simpler to implement, test, and deploy
- No need for bidirectional communication

### Alternatives Considered
1. **WebSocket**: Bi-directional real-time communication
   - Rejected: Adds complexity; not needed for turn-based AI chat
2. **Server-Sent Events (SSE)**: Streaming server-to-client
   - Rejected: Cohere API already returns complete response; no streaming benefit
3. **Simple HTTP**: POST message, receive complete response
   - Chosen: Simplest implementation, matches existing API patterns

### Implementation Details
```ts
// Simple API call pattern
async function sendMessage(message: string) {
  const response = await fetch('/api/chat/message', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${jwt}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ message_text: message })
  });
  return response.json();
}
```

---

## Research Question 5: Chat State Management Strategy

**Unknown**: How to manage chat history, loading states, and message sending in React?

### Decision
**React Query (TanStack Query)** for server state + React useState for UI state.

### Rationale
- React Query handles cache, refetch, optimistic updates automatically
- Perfect for chat history loading and message sending
- Handles loading/error states with built-in hooks
- Optimistic updates for better UX (show message immediately, update on response)

### Alternatives Considered
1. **useState + useEffect**: Manual state management
   - Rejected: Boilerplate-heavy; no cache management
2. **Redux Toolkit**: Global state management
   - Rejected: Overkill for chat-specific state
3. **Zustand**: Lightweight state management
   - Rejected: Still need to handle cache/query logic manually

### Implementation Details
```ts
// Sending messages with mutation
const { mutate, isLoading } = useMutation({
  mutationFn: sendMessage,
  onSuccess: (data) => {
    // Add response to chat history
    queryClient.setQueryData(['chat', sessionId], (old) => [...old, data.response]);
  }
});

// Loading history with query
const { data: messages, isLoading } = useQuery({
  queryKey: ['chat', sessionId],
  queryFn: () => fetchChatHistory(sessionId)
});
```

---

## Research Question 6: Responsive Design Pattern

**Unknown**: Mobile-first approach with breakpoints for different screen sizes?

### Decision
**Mobile-first** with Tailwind responsive classes (sm: 375px, md: 768px, lg: 1024px, xl: 1280px).

### Rationale
- Mobile usage primary for many users
- Progressive enhancement approach
- Tailwind provides excellent responsive utility classes
- Test on actual device sizes (iPhone SE: 375px, iPad: 768px)

### Alternatives Considered
1. **Desktop-first**: Start with desktop layout, add mobile overrides
   - Rejected: Mobile experience secondary; more complex overrides needed
2. **Breakpoint-specific**: Design each size independently
   - Rejected: Inconsistent patterns; harder to maintain
3. **Mobile-first**: Base styles for mobile, enhance for larger screens
   - Chosen: Progressive enhancement, better mobile experience

### Implementation Details
```tsx
// Mobile-first responsive
<div className="
  w-full          /* Mobile: full width */
  md:w-1/2        /* Tablet+: half width */
  lg:w-1/3        /* Desktop+: third width */
">
  {/* Content */}
</div>

// Touch targets
<button className="h-11 w-11 md:h-12 md:w-12 p-3"> /* ≥44px touch target */
```

---

## Research Question 7: Component Architecture Pattern

**Unknown**: How to structure React components for chat interface with proper separation of concerns?

### Decision
**Atomic design** with dedicated directories: chat/, theme/, ui/, layout/.

### Rationale
- Clear separation between chat-specific, theme, generic UI, and layout components
- Reusable components across different parts of app
- Easy to test and maintain individual pieces
- Follows React best practices

### Alternatives Considered
1. **Flat structure**: All components in one folder
   - Rejected: Hard to navigate, no separation of concerns
2. **Feature-based**: Components by page (dashboard, chat, auth)
   - Rejected: Duplicated components across features
3. **Atomic design**: Components by type (atoms, molecules, organisms)
   - Chosen: Clear organization, reusable, scalable

### Implementation Details
```text
frontend/src/components/
├── chat/              # Chat-specific components
│   ├── MessageBubble.tsx
│   ├── ChatInput.tsx
│   ├── ChatHistory.tsx
│   └── ChatInterface.tsx
├── theme/             # Theme-related components
│   ├── ThemeProvider.tsx
│   └── ThemeToggle.tsx
├── ui/                # Generic UI components
│   ├── Button.tsx
│   ├── Card.tsx
│   └── Modal.tsx
└── layout/            # Layout components
    ├── Navbar.tsx
    └── PageTransition.tsx
```

---

## Summary: Key Architectural Decisions

| Decision | Choice | Why |
|----------|--------|-----|
| Chat UI | Custom React components | Full control, lightweight, integrates with Tailwind |
| Animations | Framer Motion + CSS | Complex gestures + simple hover effects |
| Theme System | next-themes + Tailwind dark: | SSR-safe, localStorage persistence, WCAG compliant |
| Real-time | HTTP request-response | Simple, matches AI agent response pattern |
| State Management | React Query + useState | Cache management + UI state separation |
| Responsive | Mobile-first with Tailwind | Progressive enhancement, accessibility |
| Component Structure | Atomic design by type | Separation of concerns, reusability |

---

## Next Steps

1. **Phase 1 Design**: Create data-model.md with TypeScript interfaces for chat messages, theme preferences
2. **Phase 1 Contracts**: Define API endpoints in OpenAPI format
3. **Phase 1 Quickstart**: Document setup with theme configuration and chat API testing
4. **Phase 2 Tasks**: Generate implementation tasks for frontend components and backend API integration

