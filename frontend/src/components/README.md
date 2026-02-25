# Component Documentation

This directory contains all reusable UI components for the TaskFlow application.

## Component Structure

```
components/
├── ui/                    # Primitive UI components
├── layout/                # Layout components
├── task/                  # Task-related components
├── search/                # Search and filter components
├── chatbot/               # Chatbot widget components
├── theme/                 # Theme-related components
└── ...                    # Other domain-specific components
```

## UI Primitive Components

### Button

**File**: `ui/Button.tsx`

Reusable button component with variants and sizes.

```tsx
<Button variant="primary" size="md" onClick={handleClick}>
  Click me
</Button>
```

**Props**:
- `variant`: "primary" | "secondary" | "ghost"
- `size`: "sm" | "md" | "lg"
- `onClick`: () => void
- `disabled`: boolean
- `loading`: boolean

---

### Input

**File**: `ui/input.tsx`

Text input component with various types.

```tsx
<Input
  type="email"
  label="Email"
  value={email}
  onChange={setEmail}
  error={emailError}
/>
```

**Props**:
- `type`: "text" | "email" | "password" | "search"
- `value`: string
- `onChange`: (value: string) => void
- `label`: string
- `error`: string | null
- `disabled`: boolean

---

### Card

**File**: `ui/Card.tsx`

Content container with variants.

```tsx
<Card variant="interactive" onClick={handleClick}>
  <h3>Card Title</h3>
  <p>Card content...</p>
</Card>
```

**Props**:
- `variant`: "default" | "interactive" | "elevated"
- `onClick`: () => void
- `children`: ReactNode

---

### Badge (TagChip)

**File**: `ui/TagChip.tsx`

Badge component for tags and priorities.

```tsx
<TagChip label="Work" color="#3B82F6" />
```

**Props**:
- `label`: string
- `color`: string
- `onClick`: () => void
- `onDelete`: () => void

---

### PrioritySelector

**File**: `ui/PrioritySelector.tsx`

Priority level selector (4 levels).

```tsx
<PrioritySelector
  value={priority}
  onChange={setPriority}
/>
```

**Props**:
- `value`: TaskPriority (1-4)
- `onChange`: (priority: TaskPriority) => void
- `disabled`: boolean

---

### DueDatePicker

**File**: `ui/DueDatePicker.tsx`

Date picker with quick-select options.

```tsx
<DueDatePicker
  value={dueDate}
  onChange={setDueDate}
  showOverdue
/>
```

**Props**:
- `value`: string | null (ISO date)
- `onChange`: (date: string | null) => void
- `showOverdue`: boolean

---

### RecurrencePicker

**File**: `ui/RecurrencePicker.tsx`

Recurrence pattern selector.

```tsx
<RecurrencePicker
  value={recurrenceRule}
  onChange={setRecurrenceRule}
/>
```

**Props**:
- `value`: RecurrenceRule | null
- `onChange`: (rule: RecurrenceRule | null) => void

---

## Layout Components

### NavBar

**File**: `NavBar.tsx`

Primary navigation header with responsive behavior.

```tsx
<NavBar />
```

**Features**:
- Responsive hamburger menu on mobile
- User menu with logout
- Theme toggle

---

## Task Components

### TaskItem

**File**: `TaskItem.tsx`

Individual task display with inline editing.

```tsx
<TaskItem
  task={task}
  onToggle={handleToggle}
  onDelete={handleDelete}
  onUpdate={handleUpdate}
/>
```

**Features**:
- Priority badge
- Due date indicator
- Recurrence icon
- Tags display
- Inline editing
- Optimistic updates

---

### TaskDashboard

**File**: `TaskDashboard.tsx`

Task list container with virtual scrolling.

```tsx
<TaskDashboard
  tasks={tasks}
  filters={filters}
  onTaskAction={handleTaskAction}
/>
```

**Features**:
- Virtual scrolling for 1000+ tasks
- Filter integration
- Sort functionality
- Loading states

---

### TagManager

**File**: `TagManager.tsx`

Tag creation and management.

```tsx
<TagManager />
```

**Features**:
- Create new tags
- Delete tags
- Color selection
- Preset colors

---

## Search Components

### SearchBar

**File**: `SearchBar.tsx`

Full-text search with debounced input.

```tsx
<SearchBar onSelectTask={handleSelectTask} />
```

**Features**:
- 300ms debounce
- Search results dropdown
- Loading indicator
- Clear button

---

### TaskFilterBar

**File**: `TaskFilterBar.tsx`

Multi-criteria filtering.

```tsx
<TaskFilterBar
  filters={filters}
  onFiltersChange={setFilters}
/>
```

**Features**:
- Priority filter
- Status filter
- Sort dropdown
- Instant updates

---

## Chatbot Components

### ChatbotWidget

**File**: `chatbot/ChatbotWidget.tsx`

Floating action button for homepage chatbot.

```tsx
<ChatbotWidget
  suggestedQuestions={[
    'How do I create a task?',
    'What are priority levels?',
  ]}
/>
```

**Features**:
- FAB position (bottom-right)
- Expandable chat window
- Minimize/restore
- Conversation persistence

---

### ChatWindow

**File**: `chatbot/ChatWindow.tsx`

Chat conversation display.

```tsx
<ChatWindow suggestedQuestions={questions} />
```

**Features**:
- Message history
- Typing indicator
- Auto-scroll
- Suggested questions

---

### ChatInput

**File**: `chatbot/ChatInput.tsx`

Chat message input.

```tsx
<ChatInput
  onSendMessage={handleSendMessage}
  disabled={isTyping}
/>
```

**Features**:
- Enter to send
- Disabled state
- Send button

---

## Styling

All components use Tailwind CSS with CSS variables for theming.

### CSS Variables

Defined in `app/globals.css`:
- Colors (primary, secondary, priority colors)
- Spacing
- Typography
- Border radius
- Shadows
- Transitions

### Responsive Breakpoints

- Mobile: 320px+ (base)
- Tablet: 768px+
- Desktop: 1024px+
- Large Desktop: 1440px+

### Animations

Defined in `styles/animations.css`:
- Page transitions
- Fade in/out
- Slide up/down
- Scale in/out
- Reduced motion support

---

## Accessibility

All components follow WCAG 2.1 AA guidelines:
- Minimum 44px touch targets
- 4.5:1 contrast ratio
- Keyboard navigation
- Focus indicators
- ARIA labels
- Reduced motion support

---

## Testing

Components should be tested with:
- Unit tests (Vitest)
- Component tests (React Testing Library)
- E2E tests (Playwright)

Example:
```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '@/components/ui/Button'

it('calls onClick when clicked', () => {
  const handleClick = jest.fn()
  render(<Button onClick={handleClick}>Click</Button>)
  fireEvent.click(screen.getByText('Click'))
  expect(handleClick).toHaveBeenCalledTimes(1)
})
```
