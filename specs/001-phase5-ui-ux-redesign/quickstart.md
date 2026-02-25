# Quickstart: Phase 5 UI/UX Redesign

**Branch**: `001-phase5-ui-ux-redesign` | **Date**: 2026-02-21 | **Phase**: 1

## Purpose

Provide developers with quick reference for setting up the development environment, understanding styling guidelines, and using UI components for the Phase 5 UI/UX redesign.

---

## Development Setup

### Prerequisites

- Node.js 20.x or later
- npm 10.x or later
- Git
- Docker (for backend services)

### Installation

```bash
# Clone repository
git clone <repository-url>
cd phase-5

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies (if not already installed)
cd ../backend
pip install -r requirements.txt
```

### Environment Configuration

#### Frontend (.env.local)

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000

# WebSocket Configuration
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws

# Authentication
NEXT_PUBLIC_AUTH_PROVIDER=better-auth

# Feature Flags
NEXT_PUBLIC_PHASE5_FEATURES=true
```

#### Backend (.env)

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/taskflow

# Authentication
BETTER_AUTH_SECRET=your-secret-key-here

# Dapr Configuration
DAPR_HTTP_ENDPOINT=http://localhost:3500
DAPR_GRPC_ENDPOINT=localhost:50001
```

### Running Development Servers

```bash
# Terminal 1: Start backend
cd backend
python -m uvicorn main:app --reload --port 8000

# Terminal 2: Start frontend
cd frontend
npm run dev

# Terminal 3: Start Dapr (if using Phase-V features)
dapr run --app-id taskflow-api --app-port 8000 --dapr-http-port 3500
```

### Accessing the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Dapr Dashboard**: http://localhost:3500

---

## Styling Guidelines

### CSS Variables Usage

```css
/* Use CSS variables for theming */
.button {
  background-color: var(--color-primary);
  color: white;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  transition: background-color var(--transition-fast);
}

.button:hover {
  background-color: var(--color-primary-hover);
}
```

### Responsive Design Patterns

```css
/* Mobile-first approach */
.container {
  padding: var(--spacing-md);
  width: 100%;
}

/* Tablet: Two-column layout */
@media (min-width: 768px) {
  .container {
    padding: var(--spacing-lg);
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-lg);
  }
}

/* Desktop: Three-column layout with sidebar */
@media (min-width: 1024px) {
  .container {
    grid-template-columns: 240px 1fr 1fr;
  }
}

/* Large Desktop: Max-width container */
@media (min-width: 1440px) {
  .container {
    max-width: 1400px;
    margin: 0 auto;
  }
}
```

### Animation Best Practices

```css
/* GPU-accelerated transitions */
.card {
  transform: translateY(0);
  opacity: 1;
  transition: transform var(--transition-normal), opacity var(--transition-normal);
  will-change: transform, opacity;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

/* Respect reduced motion preference */
@media (prefers-reduced-motion: reduce) {
  .card {
    transition: none;
  }
}
```

### Accessibility Requirements

```css
/* Focus visible for keyboard navigation */
.button:focus-visible,
.input:focus-visible,
a:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* Ensure minimum touch target size */
.icon-button {
  min-width: 44px;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* Meet contrast requirements */
.text-primary {
  color: var(--gray-900); /* 4.5:1+ contrast on white */
}

.text-secondary {
  color: var(--gray-600); /* 4.5:1+ contrast on white */
}
```

---

## Component Usage Examples

### Button Component

```tsx
import { Button } from '@/components/ui/Button'

// Primary button
<Button variant="primary" onClick={handleSave}>
  Save Task
</Button>

// Secondary button
<Button variant="secondary" onClick={handleCancel}>
  Cancel
</Button>

// Loading state
<Button variant="primary" loading onClick={handleSubmit}>
  Submitting...
</Button>

// Disabled state
<Button variant="primary" disabled>
  Cannot Submit
</Button>
```

### Input Component

```tsx
import { Input } from '@/components/ui/Input'

// Text input
<Input
  type="text"
  label="Task Title"
  value={title}
  onChange={setTitle}
  placeholder="Enter task title"
/>

// Email input with validation
<Input
  type="email"
  label="Email"
  value={email}
  onChange={setEmail}
  error={emailError}
/>

// Search input
<Input
  type="search"
  value={searchQuery}
  onChange={setSearchQuery}
  placeholder="Search tasks..."
  onClear={() => setSearchQuery('')}
/>
```

### Badge Component (Priority)

```tsx
import { Badge } from '@/components/ui/Badge'

// Priority badges
<Badge variant="priority-low">Low</Badge>
<Badge variant="priority-medium">Medium</Badge>
<Badge variant="priority-high">High</Badge>
<Badge variant="priority-critical">Critical</Badge>

// Tag badge
<Badge variant="tag">Work</Badge>
```

### Card Component

```tsx
import { Card } from '@/components/ui/Card'

// Default card
<Card>
  <h3>Task Title</h3>
  <p>Task description...</p>
</Card>

// Interactive card
<Card variant="interactive" onClick={() => navigate(`/task/${id}`)}>
  <h3>Task Title</h3>
  <p>Task description...</p>
</Card>

// Elevated card
<Card variant="elevated">
  <h3>Important Task</h3>
</Card>
```

### TaskItem Component

```tsx
import { TaskItem } from '@/components/task/TaskItem'

<TaskItem
  task={task}
  isSelected={selectedTaskId === task.id}
  onClick={() => handleTaskClick(task)}
  onToggle={() => handleToggleTask(task.id)}
/>
```

### TaskForm Component

```tsx
import { TaskForm } from '@/components/task/TaskForm'

// Create mode
<TaskForm
  onSubmit={(taskInput) => handleCreateTask(taskInput)}
  onCancel={() => router.back()}
/>

// Edit mode
<TaskForm
  task={existingTask}
  onSubmit={(taskInput) => handleUpdateTask(task.id, taskInput)}
  onCancel={() => router.back()}
/>
```

### SearchBar Component

```tsx
import { SearchBar } from '@/components/search/SearchBar'

<SearchBar
  value={searchQuery}
  onChange={(query) => {
    setSearchQuery(query)
    debouncedSearch(query)
  }}
  onClear={() => setSearchQuery('')}
  isLoading={isSearching}
/>
```

### FilterPanel Component

```tsx
import { FilterPanel } from '@/components/search/FilterPanel'

<FilterPanel
  filters={filters}
  onFilterChange={setFilters}
  availableTags={tags}
  availablePriorities={['low', 'medium', 'high', 'critical']}
/>
```

### ChatbotWidget Component

```tsx
import { ChatbotWidget } from '@/components/chatbot/ChatbotWidget'

// Global chatbot widget (add to layout)
<ChatbotWidget />

// Or control open state
const [chatbotOpen, setChatbotOpen] = useState(false)

<ChatbotWidget
  isOpen={chatbotOpen}
  onToggle={() => setChatbotOpen(!chatbotOpen)}
/>
```

---

## API Integration

### Using TanStack Query

```tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

// Fetch tasks with filters
const { data: tasks, isLoading } = useQuery({
  queryKey: ['tasks', 'list', filters],
  queryFn: () => api.tasks.list(filters),
})

// Create task mutation
const queryClient = useQueryClient()
const createTaskMutation = useMutation({
  mutationFn: (taskInput: TaskInput) => api.tasks.create(taskInput),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['tasks', 'list'] })
  },
})

// Optimistic update
const updateTaskMutation = useMutation({
  mutationFn: ({ id, updates }: { id: string; updates: TaskUpdates }) =>
    api.tasks.update(id, updates),
  onMutate: async ({ id, updates }) => {
    await queryClient.cancelQueries({ queryKey: ['tasks', 'list'] })
    const previousTasks = queryClient.getQueryData(['tasks', 'list'])
    
    queryClient.setQueryData(['tasks', 'list'], (old: Task[]) =>
      old.map((task) => (task.id === id ? { ...task, ...updates } : task))
    )
    
    return { previousTasks }
  },
  onError: (err, variables, context) => {
    queryClient.setQueryData(['tasks', 'list'], context?.previousTasks)
  },
})
```

### API Client Usage

```tsx
import { api } from '@/lib/api'

// List tasks
const tasks = await api.tasks.list({
  priority: ['high', 'critical'],
  status: ['pending'],
  tags: ['work'],
})

// Create task
const newTask = await api.tasks.create({
  title: 'New Task',
  description: 'Task description',
  priority: 'high',
  dueDate: '2026-02-28',
  tags: ['work', 'urgent'],
})

// Update task
await api.tasks.update(taskId, {
  status: 'completed',
})

// Delete task
await api.tasks.delete(taskId)

// Search tasks
const results = await api.tasks.search({ q: 'meeting' })
```

---

## Testing

### Running Tests

```bash
# Unit tests
npm run test

# Component tests
npm run test:components

# E2E tests
npm run test:e2e

# Test with coverage
npm run test:coverage
```

### Writing Component Tests

```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '@/components/ui/Button'

describe('Button', () => {
  it('renders with children', () => {
    render(<Button variant="primary">Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn()
    render(<Button variant="primary" onClick={handleClick}>Click me</Button>)
    
    fireEvent.click(screen.getByText('Click me'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('shows loading state', () => {
    render(<Button variant="primary" loading>Loading</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('disabled')
  })
})
```

---

## Performance Optimization

### Code Splitting

```tsx
// Lazy load heavy components
const TaskFormModal = dynamic(() => import('@/components/task/TaskFormModal'), {
  loading: () => <Skeleton variant="rectangular" width={400} height={300} />,
})

const ChatbotWidget = dynamic(() => import('@/components/chatbot/ChatbotWidget'), {
  ssr: false, // Only render on client
})
```

### Image Optimization

```tsx
import Image from 'next/image'

// Responsive image
<Image
  src="/hero-image.jpg"
  alt="Hero"
  width={1200}
  height={600}
  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
  priority // Preload for LCP
/>
```

### Virtual Scrolling for Large Lists

```tsx
import { useVirtualizer } from '@tanstack/react-virtual'

function TaskList({ tasks }) {
  const parentRef = useRef<HTMLDivElement>(null)
  
  const virtualizer = useVirtualizer({
    count: tasks.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80, // Estimated height per task
    overscan: 10,
  })

  return (
    <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
      <div style={{ height: `${virtualizer.getTotalSize()}px` }}>
        {virtualizer.getVirtualItems().map((virtualRow) => (
          <TaskItem
            key={tasks[virtualRow.index].id}
            task={tasks[virtualRow.index]}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${virtualRow.start}px)`,
            }}
          />
        ))}
      </div>
    </div>
  )
}
```

---

## Troubleshooting

### Common Issues

#### Animation Performance Issues

**Problem**: Janky animations on low-end devices

**Solution**:
```css
/* Use transform and opacity only */
.animated {
  transform: translateX(0); /* Initialize */
  transition: transform 300ms ease-out;
  will-change: transform;
}

/* Avoid animating these */
/* ❌ width, height, margin, padding */
```

#### Reduced Motion Not Respected

**Problem**: Animations play even when user prefers reduced motion

**Solution**:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

#### Touch Targets Too Small

**Problem**: Mobile users have difficulty tapping buttons

**Solution**:
```css
.button, .icon-button {
  min-width: 44px;
  min-height: 44px;
  padding: var(--spacing-sm) var(--spacing-md);
}
```

#### Layout Shift During Load

**Problem**: Content jumps when images/fonts load

**Solution**:
```css
/* Reserve space for images */
.image-container {
  aspect-ratio: 16 / 9;
}

/* Preload critical fonts */
<link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossorigin />
```

---

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TanStack Query Documentation](https://tanstack.com/query)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Lighthouse Documentation](https://developer.chrome.com/docs/lighthouse/overview/)

---

## Next Steps

1. Review component specifications in `data-model.md`
2. Reference API contracts from Phase V in `contracts/` directory
3. Begin implementation following component hierarchy
4. Run tests to verify accessibility and performance requirements
