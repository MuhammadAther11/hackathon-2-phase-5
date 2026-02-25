-- Migration 002: Add Due Date to Task
-- Adds due_date TIMESTAMPTZ column for deadline tracking

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tasks' AND column_name = 'due_date') THEN
        ALTER TABLE tasks ADD COLUMN due_date TIMESTAMPTZ DEFAULT NULL;
    END IF;
END $$;

-- Create index for due date filtering and sorting
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);

-- Add comment for documentation
COMMENT ON COLUMN tasks.due_date IS 'Task deadline in UTC timezone';
