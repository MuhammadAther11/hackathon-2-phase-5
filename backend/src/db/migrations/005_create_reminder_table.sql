-- Migration 005: Create Reminder Table
-- Creates reminder table for scheduled task notifications

CREATE TABLE IF NOT EXISTS reminder (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    trigger_time TIMESTAMPTZ NOT NULL,
    delivered BOOLEAN DEFAULT FALSE,
    delivered_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),

    -- Constraints
    CHECK (trigger_time > NOW())  -- Trigger time must be in future
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_reminders_task_id ON reminder(task_id);
CREATE INDEX IF NOT EXISTS idx_reminders_trigger_time ON reminder(trigger_time) WHERE delivered = FALSE;  -- Partial index for pending reminders

-- Comments for documentation
COMMENT ON TABLE reminder IS 'Scheduled notifications for tasks';
COMMENT ON COLUMN reminder.task_id IS 'Associated task';
COMMENT ON COLUMN reminder.trigger_time IS 'When to trigger notification in UTC';
COMMENT ON COLUMN reminder.delivered IS 'Delivery status flag';
COMMENT ON COLUMN reminder.delivered_at IS 'Actual delivery timestamp';
