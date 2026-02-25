# Quickstart: Cohere-based AI Agent

**Date**: 2026-02-08
**Feature**: 2-cohere-agent
**Target**: Backend developers implementing AI agent layer

---

## Overview

This guide walks through setting up the Cohere-based AI agent, configuring it with MCP task tools, and testing conversational task management.

---

## Prerequisites

- Python 3.11+
- Cohere API account with API key
- MCP task tools (from feature 1-mcp-task-tools) already deployed
- PostgreSQL 14+ (Neon recommended)
- JWT authentication configured (Better Auth from Phase II)

---

## Step 1: Install Dependencies

```bash
cd backend

# Add to requirements.txt
echo "cohere==5.0.0" >> requirements.txt

pip install -r requirements.txt
```

---

## Step 2: Configure Environment Variables

Add to `.env`:

```bash
# Cohere API
COHERE_API_KEY=your-cohere-api-key-here

# Existing from Phase II
DATABASE_URL=postgresql+asyncpg://user:password@host:port/dbname
BETTER_AUTH_SECRET=your-jwt-secret

# Agent Configuration
AGENT_CONVERSATION_CONTEXT_LIMIT=10
AGENT_CONFIRMATION_TIMEOUT_MINUTES=5
```

### Getting COHERE_API_KEY

1. Sign up at https://cohere.com
2. Navigate to API Keys in dashboard
3. Create a new production key
4. Copy and paste into .env

---

## Step 3: Run Database Migrations

```bash
# Create conversation tables
python -c "
from backend.src.db.connection import engine
from backend.src.models.conversation import ConversationMessage, ChatSession, ConfirmationState
from sqlalchemy import text
import asyncio

async def init_conversation_tables():
    async with engine.begin() as conn:
        await conn.run_sync(ConversationMessage.__table__.create, checkfirst=True)
        await conn.run_sync(ChatSession.__table__.create, checkfirst=True)
        await conn.run_sync(ConfirmationState.__table__.create, checkfirst=True)

asyncio.run(init_conversation_tables())
"
```

---

## Step 4: Test Cohere API Connection

```python
# test_cohere.py
import cohere
import os

co = cohere.Client(api_key=os.getenv("COHERE_API_KEY"))

# Test simple chat
response = co.chat(
    message="Hello, can you help me with my tasks?",
    model="command-r-plus"
)

print("Cohere response:", response.text)
```

Run it:
```bash
python test_cohere.py
# Output: Cohere response: Of course! I'd be happy to help...
```

---

## Step 5: Test Agent Workflow

### Test 1: Send Message to Agent

```bash
curl -X POST http://localhost:8000/api/chat/message \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message_text": "Add a task to buy groceries"
  }'
```

Expected response:
```json
{
  "session_id": "uuid",
  "agent_response": "I've added a task for 'Buy groceries'. Would you like to add more details?",
  "intent_detected": "add_task",
  "mcp_tool_executed": "add_task",
  "tool_result": {
    "status": "success",
    "data": {
      "id": "task-uuid",
      "title": "Buy groceries",
      "completed": false,
      ...
    }
  }
}
```

### Test 2: List Tasks

```bash
curl -X POST http://localhost:8000/api/chat/message \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message_text": "Show me my tasks",
    "session_id": "uuid-from-previous-response"
  }'
```

Expected response:
```json
{
  "session_id": "uuid",
  "agent_response": "Here are your current tasks:\n1. Buy groceries (pending)\n\nWould you like to add more tasks or complete any?",
  "intent_detected": "list_tasks",
  "mcp_tool_executed": "list_tasks",
  "tool_result": {
    "status": "success",
    "data": [...]
  }
}
```

### Test 3: Delete with Confirmation

```bash
# First request
curl -X POST http://localhost:8000/api/chat/message \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message_text": "Delete the groceries task",
    "session_id": "uuid"
  }'
```

Agent asks for confirmation:
```json
{
  "session_id": "uuid",
  "agent_response": "Are you sure you want to delete 'Buy groceries'? Reply with 'yes' to confirm or 'no' to cancel.",
  "intent_detected": "delete_task",
  "requires_confirmation": true
}
```

```bash
# Confirm deletion
curl -X POST http://localhost:8000/api/chat/message \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message_text": "yes",
    "session_id": "uuid"
  }'
```

Agent executes delete:
```json
{
  "session_id": "uuid",
  "agent_response": "Task 'Buy groceries' has been deleted successfully.",
  "intent_detected": "confirm_delete",
  "mcp_tool_executed": "delete_task",
  "tool_result": {
    "status": "success",
    "data": { "message": "Task deleted" }
  }
}
```

---

## Step 6: Test Conversation History

```bash
curl -X GET "http://localhost:8000/api/chat/history?session_id=uuid&limit=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Expected response:
```json
{
  "session_id": "uuid",
  "messages": [
    {
      "id": "msg-1",
      "message_text": "Add a task to buy groceries",
      "sender": "user",
      "intent": "add_task",
      "created_at": "2026-02-08T10:00:00Z"
    },
    {
      "id": "msg-2",
      "message_text": "I've added a task for 'Buy groceries'...",
      "sender": "agent",
      "intent": "add_task",
      "mcp_tool_used": "add_task",
      "created_at": "2026-02-08T10:00:03Z"
    },
    ...
  ]
}
```

---

## Step 7: Run Tests

```bash
# Unit tests
pytest tests/unit/test_intent_detector.py -v
pytest tests/unit/test_tool_selector.py -v
pytest tests/unit/test_response_generator.py -v
pytest tests/unit/test_conversation_service.py -v

# Integration tests
pytest tests/integration/test_agent_workflow.py -v

# All tests
pytest tests/ -v --cov=backend/src/agent
```

---

## Step 8: Test Natural Language Variations

```python
# test_intent_variations.py
variations = {
    "add_task": [
        "Add a task to buy groceries",
        "Create a new task for shopping",
        "Make a task about cleaning",
        "Remind me to call mom",
        "I need to schedule dentist appointment",
    ],
    "list_tasks": [
        "Show me my tasks",
        "What do I need to do?",
        "List all my tasks",
        "What's on my todo list?",
        "Display my pending tasks",
    ],
    "complete_task": [
        "Mark groceries task as done",
        "I finished shopping",
        "Complete the cleaning task",
        "Task X is done",
        "I completed buying milk",
    ],
}

# Test each variation
for intent, messages in variations.items():
    for msg in messages:
        response = send_to_agent(msg)
        assert response["intent_detected"] == intent
```

---

## Troubleshooting

### Issue: "Cohere API key invalid"

**Solution**: Verify API key is correct in .env:
```bash
python -c "import cohere, os; co = cohere.Client(os.getenv('COHERE_API_KEY')); print('OK')"
```

### Issue: Agent response >5 seconds

**Solution**:
1. Check Cohere API latency: Usually 1-3s
2. Verify MCP tool execution: Should be <500ms
3. Check conversation context query: Index on (user_id, session_id)
4. Reduce context limit: Use last 5 messages instead of 10

### Issue: Intent detection accuracy <95%

**Solution**:
1. Improve tool descriptions: Add more examples of user phrases
2. Test with Cohere's `command-r-plus` model (better than `command`)
3. Log false positives/negatives for analysis
4. Ask for clarification when confidence <0.8

### Issue: Confirmation state not found

**Solution**:
Check expiration:
```python
# Confirmation expires after 5 minutes
confirmation = session.exec(
    select(ConfirmationState)
    .where(ConfirmationState.user_id == user_id)
    .where(ConfirmationState.expires_at > datetime.now())
).first()

if not confirmation:
    # Expired or doesn't exist
    return "Your confirmation has expired. Please try the delete command again."
```

---

## Next Steps

1. **Integration**: Connect agent with ChatKit UI frontend
2. **Testing**: Run 50+ natural language variations per intent
3. **Monitoring**: Track intent detection accuracy and response times
4. **Production**: Deploy with proper rate limiting and error monitoring

---

## Reference Documentation

- [Cohere Chat API](https://docs.cohere.com/reference/chat)
- [Cohere Tool Use](https://docs.cohere.com/docs/tool-use)
- [MCP Task Tools](../1-mcp-task-tools/quickstart.md) (Feature 1)
- [SQLModel Documentation](https://sqlmodel.tiangolo.com)

