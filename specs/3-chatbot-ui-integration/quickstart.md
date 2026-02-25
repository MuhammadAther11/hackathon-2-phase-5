# Quickstart: Chat API, Chatbot UI & Frontend UI/UX Integration

**Date**: 2026-02-08
**Feature**: 3-chatbot-ui-integration
**Target**: Frontend developers implementing chat UI and theme system

---

## Overview

This guide walks through setting up the AI-powered chatbot UI integrated with the existing Todo app. The chatbot uses natural language to manage tasks via the Cohere AI agent and MCP tools.

---

## Prerequisites

- Node.js 18+ with npm
- Python 3.11+ with pip (backend already running from Features 1-2)
- Cohere API key (from Phase III setup)
- Better Auth JWT (from Phase II)
- PostgreSQL connection (Neon, from Features 1-2)

---

## Step 1: Install Frontend Dependencies

```bash
cd frontend

# Install chat and animation dependencies
npm install framer-motion next-themes @tanstack/react-query lucide-react

# Install dev dependencies for testing
npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

### package.json additions

```json
{
  "dependencies": {
    "framer-motion": "^10.16.4",
    "next-themes": "^0.2.1",
    "lucide-react": "^0.294.0",
    "@tanstack/react-query": "^4.36.1"
  }
}
```

---

## Step 2: Configure Theme System

### Configure Tailwind for Dark Mode

Update `tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',  // Enable dark mode via CSS class
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### Create Theme Provider

Create `src/components/theme/ThemeProvider.tsx`:

```tsx
'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { type ThemeProviderProps } from 'next-themes/dist/types';

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
```

### Wrap Application with Theme Provider

Update `src/app/layout.tsx`:

```tsx
import { ThemeProvider } from '@/components/theme/ThemeProvider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

---

## Step 3: Create Chat Components

### Create Message Bubble Component

Create `src/components/chat/MessageBubble.tsx`:

```tsx
'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  text: string;
  sender: 'user' | 'agent';
  timestamp?: string;
  className?: string;
}

export function MessageBubble({ text, sender, timestamp, className }: MessageBubbleProps) {
  const isUser = sender === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'flex mb-4',
        {
          'justify-end': isUser,
          'justify-start': !isUser
        },
        className
      )}
    >
      <div
        className={cn(
          'max-w-xs md:max-w-md px-4 py-2 rounded-lg',
          {
            'bg-blue-500 text-white rounded-br-none': isUser,
            'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none': !isUser
          }
        )}
      >
        <p className="whitespace-pre-wrap">{text}</p>
        {timestamp && (
          <p className="text-xs opacity-70 mt-1">
            {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>
    </motion.div>
  );
}
```

### Create Chat Input Component

Create `src/components/chat/ChatInput.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Send } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  className?: string;
}

export function ChatInput({ onSendMessage, isLoading = false, className }: ChatInputProps) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn('flex gap-2 w-full', className)}>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        disabled={isLoading}
        placeholder="Type a message..."
        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-l-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Type your message"
      />
      <Button
        type="submit"
        disabled={!message.trim() || isLoading}
        className="px-4 py-2 rounded-r-lg bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        {isLoading ? (
          <span>Sending...</span>
        ) : (
          <>
            <Send size={16} />
            <span>Send</span>
          </>
        )}
      </Button>
    </form>
  );
}
```

### Create Typing Indicator

Create `src/components/chat/TypingIndicator.tsx`:

```tsx
'use client';

import { motion } from 'framer-motion';

interface TypingIndicatorProps {
  className?: string;
}

export function TypingIndicator({ className }: TypingIndicatorProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`flex mb-4 ${className}`}
    >
      <div className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg rounded-bl-none">
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          <span className="ml-2">AI is thinking...</span>
        </div>
      </div>
    </motion.div>
  );
}
```

---

## Step 4: Create Chat API Client

Create `src/lib/chat-api.ts`:

```ts
import { apiClient } from './api-client';

interface SendMessageRequest {
  message_text: string;
  session_id?: string;
}

interface SendMessageResponse {
  status: 'success' | 'error';
  data?: {
    session_id: string;
    agent_response: string;
    intent_detected?: string;
    mcp_tool_executed?: string;
    tool_result?: any;
    requires_confirmation?: boolean;
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

interface GetChatHistoryRequest {
  session_id: string;
  limit?: number;
  offset?: number;
}

interface GetChatHistoryResponse {
  status: 'success' | 'error';
  data?: {
    session_id: string;
    messages: Array<{
      id: string;
      message_text: string;
      sender: 'user' | 'agent';
      created_at: string;
      intent_detected?: string;
      mcp_tool_used?: string;
    }>;
    total_count: number;
  };
  error?: {
    code: string;
    message: string;
  };
}

export async function sendMessage(request: SendMessageRequest): Promise<SendMessageResponse> {
  const response = await apiClient.post('/chat/message', request);
  return response;
}

export async function getChatHistory(request: GetChatHistoryRequest): Promise<GetChatHistoryResponse> {
  const params = new URLSearchParams({
    session_id: request.session_id,
    ...(request.limit && { limit: request.limit.toString() }),
    ...(request.offset && { offset: request.offset.toString() })
  });

  const queryString = params.toString();
  const url = `/chat/history?${queryString}`;

  const response = await apiClient.get(url);
  return response;
}
```

---

## Step 5: Create Chat Hooks

Create `src/hooks/useChat.ts`:

```ts
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sendMessage as apiSendMessage } from '@/lib/chat-api';

interface ChatMessage {
  id: string;
  message_text: string;
  sender: 'user' | 'agent';
  created_at: string;
  intent_detected?: string;
  mcp_tool_used?: string;
}

interface UseChatOptions {
  sessionId?: string;
}

export function useChat(userId: string, options: UseChatOptions = {}) {
  const [sessionId, setSessionId] = useState<string | undefined>(options.sessionId);
  const queryClient = useQueryClient();

  const {
    mutate: sendChatMessage,
    isLoading,
    error
  } = useMutation({
    mutationFn: async ({ message, currentSessionId }: { message: string; currentSessionId?: string }) => {
      const response = await apiSendMessage({
        message_text: message,
        session_id: currentSessionId
      });

      if (response.data?.session_id && !currentSessionId) {
        setSessionId(response.data.session_id);
      }

      return response;
    },
    onSuccess: (response) => {
      if (response.status === 'success' && response.data) {
        // Invalidate and refetch chat history to show new messages
        queryClient.invalidateQueries({ queryKey: ['chat-history', sessionId] });
      }
    }
  });

  const handleSendMessage = (message: string) => {
    sendChatMessage({ message, currentSessionId: sessionId });
  };

  return {
    sendChatMessage: handleSendMessage,
    isLoading,
    error: error instanceof Error ? error.message : 'Unknown error',
    sessionId
  };
}
```

Create `src/hooks/useChatHistory.ts`:

```ts
import { useQuery } from '@tanstack/react-query';
import { getChatHistory } from '@/lib/chat-api';

interface ChatMessage {
  id: string;
  message_text: string;
  sender: 'user' | 'agent';
  created_at: string;
  intent_detected?: string;
  mcp_tool_used?: string;
}

interface UseChatHistoryOptions {
  sessionId: string;
  limit?: number;
}

export function useChatHistory(options: UseChatHistoryOptions) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['chat-history', options.sessionId],
    queryFn: async () => {
      const response = await getChatHistory({
        session_id: options.sessionId,
        limit: options.limit ?? 50
      });

      if (response.status === 'error') {
        throw new Error(response.error?.message || 'Failed to load chat history');
      }

      return response.data;
    },
    enabled: !!options.sessionId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000 // 10 minutes
  });

  return {
    messages: data?.messages || [],
    isLoading,
    error: error instanceof Error ? error.message : 'Failed to load history',
    refetch
  };
}
```

---

## Step 6: Create Chat Interface Component

Create `src/components/chat/ChatInterface.tsx`:

```tsx
'use client';

import { useState, useEffect } from 'react';
import { useChat } from '@/hooks/useChat';
import { useChatHistory } from '@/hooks/useChatHistory';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { TypingIndicator } from './TypingIndicator';
import { cn } from '@/lib/utils';

interface ChatInterfaceProps {
  userId: string;
  sessionId?: string;
  className?: string;
}

export function ChatInterface({ userId, sessionId: providedSessionId, className }: ChatInterfaceProps) {
  const [sessionId, setSessionId] = useState<string | undefined>(providedSessionId);
  const { sendChatMessage, isLoading, error: sendError, sessionId: newSessionId } = useChat(userId, { sessionId: providedSessionId || sessionId });
  const { messages, isLoading: historyLoading, error: historyError, refetch } = useChatHistory({
    sessionId: providedSessionId || sessionId || '',
    limit: 50
  });

  // Update session ID if new one returned from sending
  useEffect(() => {
    if (newSessionId && !providedSessionId) {
      setSessionId(newSessionId);
    }
  }, [newSessionId, providedSessionId]);

  // Refresh history when session ID changes
  useEffect(() => {
    if (sessionId) {
      refetch();
    }
  }, [sessionId, refetch]);

  const handleSendMessage = (text: string) => {
    sendChatMessage(text);
  };

  return (
    <div className={cn('flex flex-col h-full max-h-[70vh] border rounded-lg', className)}>
      <div className="border-b p-4 bg-gray-50 dark:bg-gray-800">
        <h2 className="text-lg font-semibold">AI Task Assistant</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">Manage tasks with natural language</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2 max-h-[60vh]">
        {historyLoading && (
          <div className="flex justify-center mt-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 dark:border-white"></div>
          </div>
        )}

        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            text={message.message_text}
            sender={message.sender as 'user' | 'agent'}
            timestamp={message.created_at}
          />
        ))}

        {isLoading && <TypingIndicator />}

        {(sendError || historyError) && (
          <div className="mb-2 p-2 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded text-sm">
            {sendError || historyError}
          </div>
        )}
      </div>

      <div className="border-t p-4 bg-white dark:bg-gray-900">
        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
```

---

## Step 7: Create Theme Toggle Component

Create `src/components/theme/ThemeToggle.tsx`:

```tsx
'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/Button';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label="Toggle theme"
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  );
}
```

---

## Step 8: Update Navbar with Theme Toggle

Update `src/components/NavBar.tsx` to include theme toggle:

```tsx
// Add to imports at top
import { ThemeToggle } from './theme/ThemeToggle';

// Add to JSX inside navbar (before user info section)
<div className="flex items-center space-x-4">
  <ThemeToggle />
  {session ? (
    // ... existing user info
  ) : (
    // ... existing auth links
  )}
</div>
```

---

## Step 9: Create Chat Page

Create `src/app/chat/page.tsx`:

```tsx
'use client';

import { useSession } from 'next-auth/react';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { TaskDashboard } from '@/components/TaskDashboard';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!session?.user) {
    return null; // Redirect handled by useEffect
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="lg:col-span-1">
          <ChatInterface userId={session.user.id} />
        </div>
        <div className="lg:col-span-1">
          <TaskDashboard />
        </div>
      </div>
    </div>
  );
}
```

---

## Step 10: Test the Implementation

### Test 1: Verify Theme Toggle

```bash
# Start the frontend
npm run dev
# Visit http://localhost:3000
# Click theme toggle in navbar
# Verify all elements switch between light/dark modes
# Refresh page - verify theme preference persists
```

### Test 2: Verify Chat Functionality

```bash
# Backend must be running (Features 1-2)
# Visit http://localhost:3000/chat
# Send message: "Add a task to buy groceries"
# Verify AI responds with confirmation
# Verify task appears in right-side task list
# Send message: "List my tasks"
# Verify AI returns task list
```

### Test 3: Test Responsive Design

```bash
# Open Chrome DevTools
# Toggle device toolbar (Ctrl+Shift+M)
# Test mobile (375px): Verify chat interface usable, touch targets ≥44px
# Test tablet (768px): Verify layout adapts appropriately
# Test desktop (1920px): Verify optimal space utilization
```

### Test 4: Test Error Handling

```bash
# Send very long message (>5000 chars) - verify error handling
# Send message with invalid JWT - verify 401 error
# Send message when Cohere API is down - verify graceful error message
```

---

## Troubleshooting

### Issue: Theme toggle doesn't work

**Solution**: Verify ThemeProvider wraps entire app in layout.tsx:
```tsx
// In layout.tsx
<ThemeProvider>
  {children}
</ThemeProvider>
```

### Issue: Chat messages not appearing

**Solution**:
1. Verify backend is running (Features 1-2)
2. Check console for network errors
3. Verify JWT token is being sent with requests
4. Check backend logs for Cohere API connectivity

### Issue: Slow chat response (>6 seconds)

**Solution**:
1. Verify Cohere API key is valid
2. Check database connection pool settings
3. Monitor Cohere API latency in backend logs
4. Consider implementing loading indicators for better UX

### Issue: Mobile layout broken

**Solution**:
1. Verify Tailwind responsive classes: `sm:`, `md:`, `lg:`
2. Check touch target sizes (≥44px)
3. Verify no horizontal scrolling on mobile
4. Test on actual device sizes (iPhone SE: 375px)

---

## Next Steps

1. **Enhanced Chat Features**: Add message editing, rich text formatting
2. **Advanced UI**: Add task visualization, progress indicators
3. **Performance**: Implement message virtualization for long conversations
4. **Accessibility**: Add screen reader support, keyboard navigation
5. **Analytics**: Track user engagement with chat interface

---

## Reference Documentation

- [Framer Motion](https://www.framer.com/motion/)
- [next-themes](https://github.com/pacocoursey/next-themes)
- [TanStack Query](https://tanstack.com/query/latest)
- [Tailwind CSS Dark Mode](https://tailwindcss.com/docs/dark-mode)
- [Lucide Icons](https://lucide.dev/)
- [Cohere API](https://docs.cohere.com/)
- [Better Auth](https://better-auth.com/docs)

