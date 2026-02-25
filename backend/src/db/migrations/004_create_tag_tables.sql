-- Migration 004: Create Tag Tables
-- Creates tag and task_tag junction tables for many-to-many relationship

-- Tag table: user-defined categorization labels
CREATE TABLE IF NOT EXISTS tag (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(256) NOT NULL,
    name VARCHAR(50) NOT NULL,
    color VARCHAR(7) DEFAULT '#6B7280',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),

    -- Constraints
    UNIQUE (user_id, name),  -- Unique tag names per user
    CHECK (color ~ '^#[0-9A-Fa-f]{6}$')  -- Valid hex color format
);

-- TaskTag junction table: many-to-many relationship
CREATE TABLE IF NOT EXISTS task_tag (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tag(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),

    -- Prevent duplicate associations
    UNIQUE (task_id, tag_id)
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_tags_user_id ON tag(user_id);
CREATE INDEX IF NOT EXISTS idx_tags_name ON tag(user_id, name);  -- Composite for user tag lookup
CREATE INDEX IF NOT EXISTS idx_task_tag_task_id ON task_tag(task_id);
CREATE INDEX IF NOT EXISTS idx_task_tag_tag_id ON task_tag(tag_id);

-- Comments for documentation
COMMENT ON TABLE tag IS 'User-defined categorization labels';
COMMENT ON TABLE task_tag IS 'Junction table for task-tag many-to-many relationship';
COMMENT ON COLUMN tag.user_id IS 'Tag owner for user isolation';
COMMENT ON COLUMN tag.name IS 'Tag name (e.g., work, urgent)';
COMMENT ON COLUMN tag.color IS 'Hex color for UI display (e.g., #EF4444)';
