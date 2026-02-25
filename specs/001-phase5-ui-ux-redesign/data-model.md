# Data Model: Phase 5 UI/UX Redesign

**Branch**: `001-phase5-ui-ux-redesign` | **Date**: 2026-02-21 | **Phase**: 1

## Purpose

Define the UI component architecture, state management approach, and styling system for the Phase 5 UI/UX redesign. This document focuses on frontend data structures and component relationships (not database schema, which remains unchanged from Phase V).

---

## UI Component Model

### Component Hierarchy

```
App
├── Header (navigation, user menu, notifications)
├── Footer (links, copyright, social)
├── Pages
│   ├── LandingPage
│   │   ├── HeroSection
│   │   ├── FeatureHighlights
│   │   ├── CallToAction
│   │   └── ChatbotWidget
│   ├── LoginPage
│   │   └── LoginForm
│   ├── SignupPage
│   │   └── SignupForm
│   └── DashboardPage
│       ├── Sidebar
│       ├── TaskToolbar
│       │   ├── SearchBar
│       │   ├── FilterPanel
│       │   └── SortDropdown
│       ├── TaskList
│       │   └── TaskItem (multiple)
│       │       ├── TaskContent
│       │       ├── PriorityBadge
│       │       ├── TagList
│       │       │   └── TagBadge (multiple)
│       │       ├── DueDateIndicator
│       │       ├── RecurrenceIcon
│       │       └── TaskActions
│       └── TaskFormModal
│           ├── TaskBasics (title, description)
│           ├── PrioritySelector
│           ├── TagSelector
│           ├── DueDatePicker
│           ├── RecurrenceSelector
│           └── ReminderSettings
└── ChatbotWidget (floating, global)
    ├── ChatButton (FAB)
    └── ChatWindow
        ├── ChatHeader
        ├── MessageList
        │   └── MessageBubble (multiple)
        │       ├── UserMessage
        │       └── BotMessage
        ├── SuggestedQuestions
        └── ChatInput
```

---

## Component Specifications

### Layout Components

#### Header
**Purpose**: Primary navigation and user actions
**Props**: 
- `user: User | null` - Current authenticated user
- `onNavigate: (path: string) => void` - Navigation handler
- `onLogout: () => void` - Logout handler

**State**:
- `isMenuOpen: boolean` - Mobile menu state
- `notifications: Notification[]` - User notifications

#### Sidebar
**Purpose**: Secondary navigation and filters (desktop)
**Props**:
- `filters: FilterState` - Current filter settings
- `onFilterChange: (filters: FilterState) => void` - Filter change handler

**Responsive Behavior**:
- Hidden on mobile (<768px), accessible via hamburger menu
- Collapsible on tablet (768px-1024px)
- Fixed width on desktop (>1024px)

#### Footer
**Purpose**: Secondary links and legal information
**Props**:
- `links: FooterLink[]` - Footer navigation links

---

### UI Primitive Components

#### Button
**Purpose**: Interactive action trigger
**Props**:
- `variant: 'primary' | 'secondary' | 'tertiary' | 'danger'`
- `size: 'small' | 'medium' | 'large'`
- `disabled: boolean`
- `loading: boolean`
- `onClick: () => void`
- `children: ReactNode`

**Accessibility**:
- Minimum 44px touch target
- Visible focus indicator
- Keyboard accessible (Enter/Space activation)

#### Input
**Purpose**: Text input field
**Props**:
- `type: 'text' | 'email' | 'password' | 'search'`
- `value: string`
- `onChange: (value: string) => void`
- `placeholder: string`
- `label: string`
- `error: string | null`
- `disabled: boolean`

#### Card
**Purpose**: Content container
**Props**:
- `variant: 'default' | 'interactive' | 'elevated'`
- `onClick?: () => void`
- `children: ReactNode`

#### Badge
**Purpose**: Status or category indicator
**Props**:
- `variant: 'priority-low' | 'priority-medium' | 'priority-high' | 'priority-critical' | 'tag'`
- `children: ReactNode`

**Priority Colors**:
- LOW: Blue (#3B82F6)
- MEDIUM: Yellow (#F59E0B)
- HIGH: Orange (#F97316)
- CRITICAL: Red (#EF4444)

#### Skeleton
**Purpose**: Loading placeholder
**Props**:
- `variant: 'text' | 'circular' | 'rectangular'`
- `width: string | number`
- `height: string | number`

---

### Task Components

#### TaskList
**Purpose**: Container for task items with virtual scrolling
**Props**:
- `tasks: Task[]` - Array of tasks to display
- `filters: FilterState` - Active filters
- `sort: SortOption` - Current sort setting
- `onTaskClick: (taskId: string) => void`
- `onTaskToggle: (taskId: string) => void`

**Performance**:
- Virtual scrolling for 1000+ tasks
- Windowing with 10-item overscan

#### TaskItem
**Purpose**: Individual task display
**Props**:
- `task: Task` - Task data
- `isSelected: boolean` - Selection state
- `onClick: () => void`
- `onToggle: () => void`

**Layout**:
```
┌─────────────────────────────────────────────────────┐
│ [ ] Task Title                          [Priority]  │
│     Task description preview...         [Tags...]   │
│     📅 Due Date  🔄 Recurrence         [Actions]   │
└─────────────────────────────────────────────────────┘
```

#### TaskForm
**Purpose**: Create/edit task with Phase-5 features
**Props**:
- `task?: Task | null` - Existing task (edit mode)
- `onSubmit: (task: TaskInput) => void`
- `onCancel: () => void`

**Progressive Disclosure**:
1. **Basic Fields** (always visible): Title, Description
2. **Advanced Fields** (expandable): Priority, Tags, Due Date, Recurrence, Reminders

**State Management**:
- Form state managed via React Hook Form
- Validation with Zod schema
- Optimistic UI updates on submit

---

### Search & Filter Components

#### SearchBar
**Purpose**: Full-text search input
**Props**:
- `value: string`
- `onChange: (query: string) => void`
- `onClear: () => void`
- `isLoading: boolean`

**Behavior**:
- Debounced input (300ms)
- Search results within 1 second (per SC-003)
- Highlighted search terms in results

#### FilterPanel
**Purpose**: Multi-criteria filtering
**Props**:
- `filters: FilterState`
- `onFilterChange: (filters: FilterState) => void`
- `availableTags: Tag[]`
- `availablePriorities: Priority[]`

**Filter Options**:
- Priority: Multi-select (LOW, MEDIUM, HIGH, CRITICAL)
- Status: Multi-select (PENDING, IN_PROGRESS, COMPLETED)
- Tags: Multi-select from user's tags
- Due Date: Relative (Overdue, Today, Tomorrow, This Week, Next Week)

---

### Chatbot Components

#### ChatbotWidget
**Purpose**: Homepage floating chatbot
**Props**:
- `isOpen: boolean`
- `onToggle: () => void`

**State**:
- `messages: Message[]` - Conversation history
- `isTyping: boolean` - Bot typing indicator
- `suggestedQuestions: string[]` - Quick prompts

#### ChatWindow
**Purpose**: Chat conversation display
**Props**:
- `messages: Message[]`
- `onSendMessage: (message: string) => void`
- `onClose: () => void`

**Features**:
- Auto-scroll to latest message
- Typing indicator
- Suggested questions on first open
- Conversation persistence in session

---

## State Management

### Global State (React Context)

```typescript
interface AppState {
  // Authentication
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  
  // UI State
  theme: 'light' | 'dark'
  sidebarOpen: boolean
  chatbotOpen: boolean
  
  // Actions
  login: (credentials: Credentials) => Promise<void>
  logout: () => void
  setTheme: (theme: 'light' | 'dark') => void
  toggleSidebar: () => void
  toggleChatbot: () => void
}
```

### Server State (TanStack Query)

```typescript
// Query Keys
const queryKeys = {
  tasks: {
    all: ['tasks'] as const,
    lists: () => [...queryKeys.tasks, 'list'] as const,
    list: (filters: FilterState) => [...queryKeys.tasks.lists(), filters] as const,
    details: () => [...queryKeys.tasks, 'detail'] as const,
    detail: (id: string) => [...queryKeys.tasks.details(), id] as const,
  },
  tags: {
    all: ['tags'] as const,
    lists: () => [...queryKeys.tags, 'list'] as const,
  },
  user: {
    all: ['user'] as const,
    profile: () => [...queryKeys.user, 'profile'] as const,
  },
}

// Mutations
const useCreateTask = () => {
  return useMutation({
    mutationFn: (task: TaskInput) => api.tasks.create(task),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.lists() })
    },
  })
}
```

### Local State (Component Level)

- Form state: React Hook Form
- UI toggle state: `useState`
- Animation state: `useSpring` (React Spring)

---

## Styling System

### CSS Variables (Theming)

```css
:root {
  /* Colors */
  --color-primary: #3B82F6;
  --color-primary-hover: #2563EB;
  --color-secondary: #6B7280;
  --color-success: #10B981;
  --color-warning: #F59E0B;
  --color-danger: #EF4444;
  
  /* Priority Colors */
  --priority-low: #3B82F6;
  --priority-medium: #F59E0B;
  --priority-high: #F97316;
  --priority-critical: #EF4444;
  
  /* Neutrals */
  --gray-50: #F9FAFB;
  --gray-100: #F3F4F6;
  --gray-200: #E5E7EB;
  --gray-300: #D1D5DB;
  --gray-400: #9CA3AF;
  --gray-500: #6B7280;
  --gray-600: #4B5563;
  --gray-700: #374151;
  --gray-800: #1F2937;
  --gray-900: #111827;
  
  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  
  /* Typography */
  --font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-size-xs: 12px;
  --font-size-sm: 14px;
  --font-size-md: 16px;
  --font-size-lg: 18px;
  --font-size-xl: 20px;
  --font-size-2xl: 24px;
  
  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-full: 9999px;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
  
  /* Transitions */
  --transition-fast: 150ms ease-out;
  --transition-normal: 300ms ease-out;
  --transition-slow: 400ms ease-out;
  
  /* Z-Index Scale */
  --z-dropdown: 100;
  --z-sticky: 200;
  --z-modal: 300;
  --z-chatbot: 400;
  --z-tooltip: 500;
}

/* Dark Theme */
[data-theme='dark'] {
  --color-primary: #60A5FA;
  --color-primary-hover: #3B82F6;
  --gray-50: #111827;
  --gray-900: #F9FAFB;
  /* ... inverted colors */
}
```

### Responsive Breakpoints

```css
/* Mobile-first approach */

/* Base: 320px+ (mobile) */

/* Tablet */
@media (min-width: 768px) {
  /* Two-column layouts */
}

/* Desktop */
@media (min-width: 1024px) {
  /* Three-column layouts, sidebar */
}

/* Large Desktop */
@media (min-width: 1440px) {
  /* Max-width containers */
}
```

### Animation Classes

```css
/* Page Transitions */
.page-enter {
  opacity: 0;
  transform: translateY(8px);
}

.page-enter-active {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 300ms ease-out, transform 300ms ease-out;
}

.page-exit {
  opacity: 1;
}

.page-exit-active {
  opacity: 0;
  transition: opacity 200ms ease-in;
}

/* Fade In */
.fade-in {
  animation: fadeIn 300ms ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Slide Up */
.slide-up {
  animation: slideUp 300ms ease-out;
}

@keyframes slideUp {
  from { 
    opacity: 0;
    transform: translateY(16px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Data Types (TypeScript)

```typescript
// Core Entities
interface User {
  id: string
  email: string
  name: string
  avatarUrl?: string
  createdAt: Date
}

interface Task {
  id: string
  userId: string
  title: string
  description: string
  status: 'pending' | 'in_progress' | 'completed'
  priority: 'low' | 'medium' | 'high' | 'critical'
  dueDate?: string // ISO date
  recurrenceRule?: RecurrenceRule
  tags: Tag[]
  version: number
  createdAt: Date
  updatedAt: Date
}

interface RecurrenceRule {
  frequency: 'daily' | 'weekly' | 'monthly'
  interval: number
  endDate?: string
}

interface Tag {
  id: string
  userId: string
  name: string
  color: string
}

interface Reminder {
  id: string
  taskId: string
  triggerTime: string // ISO datetime
  delivered: boolean
}

// UI State
interface FilterState {
  priorities?: Priority[]
  statuses?: TaskStatus[]
  tags?: string[]
  dueDate?: 'overdue' | 'today' | 'tomorrow' | 'this_week' | 'next_week'
}

interface SortOption {
  field: 'due_date' | 'priority' | 'created_date' | 'title'
  order: 'asc' | 'desc'
}

// Chatbot
interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

// Component Props
interface TaskItemProps {
  task: Task
  isSelected: boolean
  onClick: () => void
  onToggle: () => void
}

interface TaskFormProps {
  task?: Task | null
  onSubmit: (task: TaskInput) => void
  onCancel: () => void
}
```

---

## Validation Rules

### Task Validation (Zod Schema)

```typescript
const taskSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  description: z
    .string()
    .max(2000, 'Description must be less than 2000 characters')
    .optional(),
  priority: z
    .enum(['low', 'medium', 'high', 'critical'])
    .default('medium'),
  status: z
    .enum(['pending', 'in_progress', 'completed'])
    .default('pending'),
  dueDate: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), 'Invalid date'),
  tags: z
    .array(z.string())
    .optional(),
  recurrenceRule: z
    .object({
      frequency: z.enum(['daily', 'weekly', 'monthly']),
      interval: z.number().min(1),
      endDate: z.string().optional(),
    })
    .optional(),
})
```

---

## Next Steps

1. Reference existing API contracts from Phase V (no new endpoints)
2. Create `quickstart.md` with development setup
3. Update agent context with UI technologies
