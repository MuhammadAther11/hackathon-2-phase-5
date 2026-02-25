-- Migration 001: Add Priority to Task
-- Adds priority INTEGER column with CHECK constraint (1-4)

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tasks' AND column_name = 'priority') THEN
        ALTER TABLE tasks ADD COLUMN priority INTEGER DEFAULT 2 NOT NULL;
        ALTER TABLE tasks ADD CONSTRAINT chk_task_priority CHECK (priority BETWEEN 1 AND 4);
    END IF;
END $$;

-- Create index for priority filtering and sorting
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority DESC);

-- Add comment for documentation
COMMENT ON COLUMN tasks.priority IS 'Task priority: 1=LOW, 2=MEDIUM, 3=HIGH, 4=CRITICAL';
