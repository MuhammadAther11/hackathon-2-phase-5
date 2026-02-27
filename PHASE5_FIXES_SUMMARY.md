# Phase 5 Fixes Summary

## Issues Fixed

### 1. Event Publisher - Save Events to Database
**File**: `backend/src/services/event_publisher.py`

**Problem**: Event publisher was trying to publish events to Dapr pub/sub (not implemented), causing events to be lost.

**Solution**: Changed to save events directly to the `task_event` table in the database.

**Changes**:
- Replaced `_publish_fallback()` method with `_save_event()` method
- Events are now persisted with: `event_type`, `aggregate_id`, `user_id`, `version`, `payload` (as JSONB), `timestamp`, `correlation_id`
- Falls back to logging if database save fails (non-blocking)

---

### 2. Chatbot Reminder Feature
**Files Modified**:
- `backend/src/mcp/tools.py` - Added `set_reminder_tool()` function
- `backend/src/agent/tool_selector.py` - Updated `INTENT_TOOL_MAP` to map `SET_REMINDER` to `set_reminder` tool
- `backend/src/agent/mcp_executor.py` - Added `set_reminder_tool` import and tool mapping
- `backend/src/db/init.py` - Added `Reminder` model import to ensure table creation
- `backend/src/agent/openai_agent.py` - Added combined intent detection for reminders

**Problem**: SET_REMINDER intent was mapped to `update_task` tool, which only updated the task's due_date but never created a reminder in the `reminder` table.

**Solution**: Created dedicated `set_reminder_tool()` that:
- Parses natural language dates (today, tomorrow, next week, etc.) or ISO datetime
- Verifies task ownership before creating reminder
- Inserts reminder record into `reminder` table with `task_id`, `trigger_time`, `delivered`, and `created_at`
- **Also updates the task's `due_date` field to match the reminder time** (keeps task and reminder in sync)

**Combined Intent Support**:
The system now handles combined intents like:
- "Update task #1 and remind me tomorrow" → Updates task + creates reminder
- "Set task #2 priority to high and remind me next week" → Sets priority + creates reminder
- "Change task #3 description and remind me on 12/31" → Updates description + creates reminder

**Database Migration**:
The reminder table was created using migration `005_create_reminder_table.sql`.

To apply the migration manually:
```sql
CREATE TABLE IF NOT EXISTS reminder (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    trigger_time TIMESTAMPTZ NOT NULL,
    delivered BOOLEAN DEFAULT FALSE,
    delivered_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CHECK (trigger_time > NOW())  -- Trigger time must be in future
);

CREATE INDEX IF NOT EXISTS idx_reminders_task_id ON reminder(task_id);
CREATE INDEX IF NOT EXISTS idx_reminders_trigger_time ON reminder(trigger_time) WHERE delivered = FALSE;  -- Partial index for pending reminders
```

---

## How to Use Reminders via Chatbot

Users can now set reminders using natural language:

**Examples**:
- "Remind me about task #3 tomorrow"
- "Set a reminder for task #1 next week"
- "Remind me to call John tomorrow at 9am"
- "Update task #2 and remind me tomorrow" (combined)
- "Set task #1 priority to high and remind me next week" (combined)

**Intent Detection**:
- Intent: `SET_REMINDER` (or combined with `UPDATE_TASK`, `SET_PRIORITY`, etc.)
- Parameters extracted: `task_index`, `reminder_time`, `reminder_message`

**Tool Execution Flow**:
1. Intent detector identifies `SET_REMINDER` with parameters
2. Tool selector maps to `set_reminder` tool
3. MCP executor resolves task ID from index/title
4. `set_reminder_tool` verifies task ownership and creates reminder
5. **Task's `due_date` is also updated to match reminder time**
6. Reminder is saved to database with trigger time

**Combined Intent Flow**:
1. Primary intent detected (e.g., `UPDATE_TASK`)
2. System detects reminder keywords in message
3. Executes primary tool first (e.g., `update_task`)
4. Then executes `set_reminder` tool with extracted reminder time
5. Returns combined confirmation message

---

## Testing

Tested successfully with:
```python
result = await set_reminder_tool(
    session=session,
    user_id="test-user-123",
    task_id="281632c5-de15-4bb5-8dab-2f56f6683161",
    trigger_time="tomorrow",
    update_due_date=True
)
# Returns: {'status': 'success', 'data': {'reminder_id': '...', 'trigger_time': '...'}}
```

Combined intent test:
```
User: "Update task #1 and remind me tomorrow"
Agent: "Got it! Task 'Task Title' has been updated. Also, I'll remind you at tomorrow."
```

---

## Files Changed

1. `backend/src/services/event_publisher.py` - Complete rewrite to save events to DB
2. `backend/src/mcp/tools.py` - Added `set_reminder_tool()` (76 lines), updated task query to use `tasks` table
3. `backend/src/agent/tool_selector.py` - Updated `INTENT_TOOL_MAP['SET_REMINDER']` 
4. `backend/src/agent/mcp_executor.py` - Added `set_reminder_tool` import, mapping, and `update_due_date` parameter
5. `backend/src/db/init.py` - Added `Reminder` model import
6. `backend/src/agent/openai_agent.py` - Added `_detect_combined_reminder()` method and combined intent execution
7. `README.md` - Updated Phase V description

---

## Next Steps

1. **Frontend Integration**: Ensure frontend displays reminder confirmation messages
2. **Reminder Notifications**: Implement Dapr Jobs API or background scheduler to trigger reminders
3. **Reminder List**: Add endpoint to list upcoming reminders
4. **Reminder Management**: Allow users to update/delete reminders

---

## Date
2026-02-26 (Updated: 2026-02-26 - Added combined intent support)
