# Data Model: User Authentication & Security

## Entities

### User
Represents a registered person. Managed primarily by Better Auth but reflected in our database for relationships.

| Field | Type | Description | Constraints |
| :--- | :--- | :--- | :--- |
| `id` | `String` | Unique identifier (UUID or CUID) | Primary Key |
| `email` | `String` | User's email address | Unique, Indexed |
| `name` | `String` | User's display name | Optional |
| `image` | `String` | Profile image URL | Optional |
| `createdAt` | `DateTime` | Timestamp of registration | Default: `now()` |
| `updatedAt` | `DateTime` | Timestamp of last update | |

### Task (Updated for Auth)
Standard task entity linked to a specific user.

| Field | Type | Description | Constraints |
| :--- | :--- | :--- | :--- |
| `id` | `Int` | Unique task ID | Primary Key, Autoincrement |
| `user_id` | `String` | ID of the owning user | Foreign Key -> `User.id`, Indexed |
| `title` | `String` | Task description | Max 255 chars |
| `completed` | `Boolean` | Completion status | Default: `false` |
| `createdAt` | `DateTime` | Creation timestamp | Default: `now()` |

## Relationships
- **User (1) <-> Task (N)**: A user owns multiple tasks. A task belongs to exactly one user.

## Enforcement Rules
- **Isolation**: Every task operation (select, insert, update, delete) MUST include `WHERE user_id = CURRENT_USER_ID`.
- **Integrity**: Deleting a User should cascade delete their Tasks (or handle via business logic).
