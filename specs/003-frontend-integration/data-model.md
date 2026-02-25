# UI Data Model: Frontend Representations

## Entity: FrontendTask (Mirror of Backend)
The structure of a task as used within React components.

| Property | Type | Description |
|----------|------|-------------|
| `id` | `string` (UUID) | Unique identifier |
| `title` | `string` | Task summary |
| `description` | `string` \| `null` | Detailed notes |
| `is_completed`| `boolean` | Status |
| `user_id` | `string` | Owner reference |
| `created_at` | `ISO8601` | Created timestamp |

## Component Prop Contracts

### TaskItemProps
- `task`: `FrontendTask`
- `onToggle`: `(id: string) => Promise<void>`
- `onDelete`: `(id: string) => Promise<void>`
- `onEdit`: `(task: FrontendTask) => void`

### AuthFormProps
- `type`: `'login' | 'signup'`
- `onSubmit`: `(data: AuthModel) => Promise<void>`
- `isLoading`: `boolean`
