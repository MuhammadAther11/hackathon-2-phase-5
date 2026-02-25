-- Migration 003: Add Recurrence Rule to Task
-- Adds recurrence_rule JSONB column for recurring task configuration

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tasks' AND column_name = 'recurrence_rule') THEN
        ALTER TABLE tasks ADD COLUMN recurrence_rule JSONB DEFAULT NULL;
    END IF;
END $$;

-- Create GIN index for JSONB queries (if needed for filtering by recurrence type)
CREATE INDEX IF NOT EXISTS idx_task_recurrence_rule ON tasks USING GIN (recurrence_rule);

-- Add comment for documentation
COMMENT ON COLUMN tasks.recurrence_rule IS 'Recurrence configuration: {frequency, interval, days_of_week, day_of_month, end_date, end_count}';
