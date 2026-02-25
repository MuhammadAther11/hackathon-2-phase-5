-- Migration 006: Create Task Event Table
-- Creates task_event table for event sourcing and audit trail

CREATE TABLE IF NOT EXISTS task_event (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(50) NOT NULL,
    aggregate_id UUID NOT NULL,
    user_id UUID NOT NULL REFERENCES "user"(id),
    version INTEGER NOT NULL,
    payload JSONB NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
    correlation_id UUID DEFAULT NULL
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_task_events_aggregate ON task_event(aggregate_id, version);
CREATE INDEX IF NOT EXISTS idx_task_events_timestamp ON task_event(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_task_events_user ON task_event(user_id);

-- Comments for documentation
COMMENT ON TABLE task_event IS 'Event sourcing for audit trail and real-time sync';
COMMENT ON COLUMN task_event.event_type IS 'Event type: task.created, task.updated, task.completed, task.deleted';
COMMENT ON COLUMN task_event.aggregate_id IS 'Task ID (aggregate root)';
COMMENT ON COLUMN task_event.version IS 'Task version at time of event';
COMMENT ON COLUMN task_event.payload IS 'Event payload with before/after snapshots';
COMMENT ON COLUMN task_event.correlation_id IS 'Groups related events for tracing';

-- Grant permissions (events are append-only)
-- Note: No UPDATE or DELETE permissions should be granted to application users
