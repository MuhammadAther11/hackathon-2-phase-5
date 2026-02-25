# Quickstart: Hydration-Safe React Components

**Feature**: 001-fix-hydration-stability
**Audience**: Developers implementing new components or fixing hydration bugs
**Last Updated**: 2026-02-08

---

## Quick Reference: Common Patterns

### ✅ Pattern 1: Mounted State for Browser APIs

**Use When**: Component needs `window`, `document`, `localStorage`, or any browser-only API

```typescript
'use client';

import { useState, useEffect } from 'react';

export function MyComponent() {
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    // Safe to access browser APIs here
    const value = localStorage.getItem('key');
    setData(value);
  }, []);

  // Return static fallback during SSR
  if (!mounted) {
    return <div>Loading...</div>;
  }

  // Full component with browser APIs
  return <div>{data}</div>;
}
```

**Why**: Server cannot render browser-dependent code. Mounted state ensures consistent HTML.

---

### ✅ Pattern 2: Theme Toggle Component

**Use When**: Building theme switcher or any component dependent on theme state

```typescript
'use client';

import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Show static version during SSR
  if (!mounted) {
    return (
      <button aria-label="Toggle theme">
        <SunIcon />
      </button>
    );
  }

  // Show actual theme state after mount
  return (
    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      {theme === 'dark' ? <MoonIcon /> : <SunIcon />}
    </button>
  );
}
```

**Why**: Theme stored in localStorage, unavailable during SSR. Static fallback prevents mismatch.

---

### ✅ Pattern 3: API Client Usage

**Use When**: Making API calls from components

```typescript
'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';

export function DataComponent() {
  const [data, setData] = useState<MyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // TypeScript-safe API call
        const result = await apiClient.get<{ items: MyData[] }>('/api/data');
        setData(result.items);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return <div>{/* render data */}</div>;
}
```

**Why**: API calls in useEffect ensure they run only on client. Typed responses prevent runtime errors.

---

### ✅ Pattern 4: Chat Interface with History

**Use When**: Building chat or messaging features

```typescript
'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';

export function ChatInterface({ userId }: { userId: string }) {
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    async function loadHistory() {
      const data = await apiClient.get<{ messages: Message[] }>('/chat/history');
      setMessages(data.messages);
    }

    loadHistory();
  }, [mounted]);

  if (!mounted) {
    return <ChatSkeleton />;
  }

  return <ChatUI messages={messages} />;
}
```

**Why**: Mounted check + separate useEffect for data loading. Clean separation of concerns.

---

### ✅ Pattern 5: Event Handlers with Dynamic Values

**Use When**: Generating timestamps, IDs, or other dynamic values

```typescript
'use client';

import { useState } from 'react';

export function MessageInput({ onSend }: { onSend: (msg: Message) => void }) {
  const [text, setText] = useState('');

  const handleSend = () => {
    // ✅ Generate dynamic values in event handlers
    const message: Message = {
      id: crypto.randomUUID(), // or Math.random()
      text,
      timestamp: new Date().toISOString(),
      sender: 'user'
    };

    onSend(message);
    setText('');
  };

  return (
    <div>
      <input value={text} onChange={e => setText(e.target.value)} />
      <button onClick={handleSend}>Send</button>
    </div>
  );
}
```

**Why**: Dynamic values in event handlers, not during render. Prevents hydration mismatch.

---

### ✅ Pattern 6: Framer Motion Button with TypeScript

**Use When**: Creating animated buttons with type safety

```typescript
import { forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "variant"> {
  variant?: "primary" | "secondary";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, variant = "primary", ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);

Button.displayName = "Button";
```

**Why**: HTMLMotionProps provides full type safety for motion animations + button props.

---

## ❌ Anti-Patterns: What NOT to Do

### ❌ Anti-Pattern 1: Browser APIs During Render

```typescript
// ❌ BAD - causes hydration error
export function BadComponent() {
  const value = localStorage.getItem('key'); // Runs during render
  return <div>{value}</div>;
}

// ✅ GOOD - use useEffect
export function GoodComponent() {
  const [value, setValue] = useState<string | null>(null);

  useEffect(() => {
    setValue(localStorage.getItem('key'));
  }, []);

  return <div>{value}</div>;
}
```

---

### ❌ Anti-Pattern 2: typeof window Checks

```typescript
// ❌ BAD - still causes hydration mismatch
export function BadComponent() {
  if (typeof window !== 'undefined') {
    return <div>{window.location.href}</div>;
  }
  return <div>Loading...</div>;
}

// ✅ GOOD - use mounted state
export function GoodComponent() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div>Loading...</div>;
  }

  return <div>{window.location.href}</div>;
}
```

---

### ❌ Anti-Pattern 3: Date.now() in Render

```typescript
// ❌ BAD - timestamp different on server vs client
export function BadComponent() {
  const id = `msg-${Date.now()}`; // Different value each render
  return <div id={id}>Message</div>;
}

// ✅ GOOD - generate in effect or event handler
export function GoodComponent() {
  const [id, setId] = useState<string>('');

  useEffect(() => {
    setId(`msg-${Date.now()}`);
  }, []);

  return <div id={id}>Message</div>;
}
```

---

## Testing Checklist

After implementing a component:

- [ ] Run `npm run build` - no hydration errors in output
- [ ] Open browser console - no hydration warnings
- [ ] Hard refresh page multiple times - consistent rendering
- [ ] Test with JavaScript disabled - static content visible
- [ ] Test with React DevTools - no unexpected re-renders
- [ ] Test in React Strict Mode - no warnings

---

## Debugging Hydration Errors

When you see: `Error: Hydration failed because the server rendered HTML didn't match the client`

**Steps**:
1. Identify the component causing the error (check stack trace)
2. Look for browser API usage (`window`, `document`, `localStorage`)
3. Check for dynamic values (`Date.now()`, `Math.random()`)
4. Look for conditional rendering based on client-only state
5. Apply mounted state pattern or move logic to useEffect

**Common Culprits**:
- Theme components accessing localStorage
- Time-based rendering (showing "Today" vs specific date)
- Random IDs generated during render
- Browser detection during render
- Third-party components not SSR-safe

---

## Resources

- [Next.js SSR Documentation](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [React Hydration](https://react.dev/reference/react-dom/client/hydrateRoot)
- [next-themes Documentation](https://github.com/pacocoursey/next-themes)
- Project Research: `specs/001-fix-hydration-stability/research.md`
- Feature Specification: `specs/001-fix-hydration-stability/spec.md`

---

**Questions?** Check research.md or ask in the team chat.
