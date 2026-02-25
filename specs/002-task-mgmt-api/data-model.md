# Data Model: Task Management

## Entity: Task
Represents a single task entry in the database.

| Field | Type | Attributes | Description |
|-------|------|------------|-------------|
| `id` | `UUID` | Primary Key | Unique identifier for the task |
| `title` | `str` | Not Null, Max 255 | Short summary of the task |
| `description` | `str` | Nullable | Optional detailed explanation |
| `is_completed`| `bool` | Default: False | Completion status |
| `user_id` | `str` | Not Null, Index | ID of the task owner (from Better Auth) |
| `created_at` | `DateTime`| Auto-now | Timestamp of creation |
| `updated_at` | `DateTime`| Auto-now-update | Timestamp of last modification |

## Validation Rules
1. `title` must not be empty or purely whitespace.
2. `user_id` must match the authenticated user's ID during all operations.

## State Transitions
- **Created**: `is_completed = False`
- **Completed**: `is_completed = True` (via toggle)
- **Deleted**: Row removed from database.
