-- Migration 011: Fix task_event user_id column
-- Changes user_id from UUID (with FK constraint) to TEXT
-- Fixes the silent FK violation that prevented all event inserts.
-- Better Auth stores user IDs as opaque strings, not UUID format.

DO $$
BEGIN
    -- Drop FK constraint if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'task_event_user_id_fkey'
          AND table_name = 'task_event'
    ) THEN
        ALTER TABLE task_event DROP CONSTRAINT task_event_user_id_fkey;
    END IF;

    -- Change column type from UUID to TEXT if it is still UUID
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'task_event'
          AND column_name = 'user_id'
          AND data_type = 'uuid'
    ) THEN
        ALTER TABLE task_event ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
    END IF;
END
$$;

-- Recreate index (idempotent)
DROP INDEX IF EXISTS idx_task_events_user;
CREATE INDEX IF NOT EXISTS idx_task_events_user ON task_event(user_id);
