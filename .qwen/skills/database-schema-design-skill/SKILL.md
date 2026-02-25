---
name: database-schema-design
description: Design database tables, create migrations, and structure schemas. Use for relational database design and schema management.
---

# Database Schema Design

## Instructions

1. **Schema Planning**
   - Identify entities and relationships
   - Normalize to 3NF (Third Normal Form)
   - Define primary and foreign keys

2. **Table Structure**
   - Choose appropriate data types
   - Set constraints (NOT NULL, UNIQUE, CHECK)
   - Add indexes for performance

3. **Migration Strategy**
   - Version control schema changes
   - Write reversible migrations
   - Handle data transformations

## Best Practices

- Use singular table names (user, not users)
- Add created_at and updated_at timestamps
- Use UUID or BIGINT for primary keys
- Index foreign keys and query columns
- Avoid premature optimization
- Document complex relationships

## Example Structure
```sql
-- Migration: Create users table
CREATE TABLE user (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Migration: Create posts table with foreign key
CREATE TABLE post (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_post_user_id ON post(user_id);
CREATE INDEX idx_post_published ON post(published) WHERE published = TRUE;
```

## Common Patterns

**One-to-Many**: Use foreign key in child table
**Many-to-Many**: Create junction table with composite key
**Soft Deletes**: Add deleted_at timestamp column
**Audit Trail**: Create separate audit table with triggers

## Migration Example
```sql
-- Up migration
ALTER TABLE user ADD COLUMN phone VARCHAR(20);
CREATE INDEX idx_user_phone ON user(phone);

-- Down migration (rollback)
DROP INDEX idx_user_phone;
ALTER TABLE user DROP COLUMN phone;
```