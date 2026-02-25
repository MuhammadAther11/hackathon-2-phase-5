# OpenAI Agent Module

This module implements the OpenAI Agent SDK integration for natural language task management in the Phase III Todo AI Chatbot.

## Architecture

The agent follows a **stateless, tool-driven architecture** where all data operations execute through MCP tools. No database access occurs directly in agent code.

### Module Structure

```
backend/src/agent/
├── __init__.py              # Module exports
├── openai_agent.py          # Main agent orchestrator
├── intent_detector.py       # Intent classification logic
├── tool_selector.py         # Tool selection rules
├── error_handler.py         # Error handling & recovery
├── mcp_executor.py          # MCP tool invocation
├── schemas.py               # Pydantic models for I/O
└── README.md                # This file
```

## Components

### 1. OpenAI Agent (`openai_agent.py`)

Main orchestrator that processes user messages through the following pipeline:

1. **Detect Intent** → Parse natural language to identify user's goal
2. **Select Tool** → Map intent to appropriate MCP tool
3. **Execute Tool** → Invoke MCP tool with user context
4. **Format Response** → Generate user-friendly response

**Usage:**
```python
from src.agent import OpenAIAgent

agent = OpenAIAgent(session)
response = await agent.process_message(
    user_id="user123",
    message="create a task to buy groceries",
    context={"session_id": "abc"}
)
```

### 2. Intent Detector (`intent_detector.py`)

Detects user intent using pattern matching and returns confidence score.

**Supported Intents:**
- `CREATE_TASK` - Create a new task
- `LIST_TASKS` - List tasks (with optional status filter)
- `COMPLETE_TASK` - Mark task as complete
- `UPDATE_TASK` - Update task title/description
- `DELETE_TASK` - Delete a task
- `GREETING` - Greetings and small talk
- `UNKNOWN` - Unclear intent

**Example:**
```python
from src.agent.intent_detector import IntentDetector

intent, confidence, params = IntentDetector.detect_intent("show my tasks")
# Returns: (IntentType.LIST_TASKS, 0.8, {"status": "all"})
```

### 3. Tool Selector (`tool_selector.py`)

Maps detected intents to appropriate MCP tools with validation.

**Intent-to-Tool Mapping:**
```python
CREATE_TASK → add_task
LIST_TASKS → list_tasks
COMPLETE_TASK → complete_task
UPDATE_TASK → update_task
DELETE_TASK → delete_task
```

**Validation:**
- Checks confidence threshold (0.6 minimum)
- Validates required parameters
- Returns error messages for missing data

### 4. Error Handler (`error_handler.py`)

Converts tool errors to user-friendly messages with recovery guidance.

**Error Handling:**
- Maps error codes to readable messages
- Suggests recovery actions
- Provides clarifying questions for ambiguous input

**Example:**
```python
from src.agent.error_handler import ErrorHandler

error_msg = ErrorHandler.handle_tool_error(
    tool_name="add_task",
    error_response={"error": {"code": "INVALID_TITLE"}},
    intent=IntentType.CREATE_TASK,
    parameters={"title": ""}
)
# Returns: "The task title is invalid. Please use 1-500 characters."
```

### 5. MCP Executor (`mcp_executor.py`)

Executes MCP tools with user context and proper parameter mapping.

**Features:**
- Enforces user isolation (all tools require user_id)
- Maps intent parameters to tool arguments
- Handles tool execution errors
- No direct database access (MCP tools only)

**Example:**
```python
from src.agent.mcp_executor import MCPExecutor

executor = MCPExecutor(session)
result = await executor.execute_tool(
    tool_name="add_task",
    user_id="user123",
    parameters={"title": "Buy groceries"}
)
```

### 6. Schemas (`schemas.py`)

Pydantic models for structured I/O.

**Key Models:**
- `IntentType` - Enum of supported intents
- `AgentResponse` - Structured agent response
- `ToolExecutionResult` - Tool execution result

## Response Format

All agent responses follow this structure:

```json
{
  "intent": "create_task",
  "confidence": 0.92,
  "parameters": {"title": "Buy groceries"},
  "confirmation_text": "I'll create a task: 'Buy groceries'. Should I go ahead?",
  "requires_approval": false,
  "error": null,
  "tool_name": "add_task",
  "tool_result": {
    "status": "success",
    "data": {"id": "...", "title": "Buy groceries", "completed": false}
  },
  "next_action": "Want to add another task or see your list?",
  "response_text": "✓ Created task: 'Buy groceries'"
}
```

## Intent Detection Examples

### Create Task
```
✓ "create a task to buy groceries"
✓ "add task: review code"
✓ "remind me to call mom"
✓ "I need to finish the report"
```

### List Tasks
```
✓ "show my tasks"
✓ "list all todos"
✓ "what's on my list"
✓ "display pending tasks"
```

### Complete Task
```
✓ "complete task 1"
✓ "mark buy groceries as done"
✓ "I've finished the report"
```

### Update Task
```
✓ "update task 1 to buy milk"
✓ "edit task: review code"
✓ "change task title"
```

### Delete Task
```
✓ "delete task 1"
✓ "remove the meeting task"
✓ "cancel this task"
```

## Error Handling

The agent provides graceful error handling with user-friendly messages:

### Ambiguous Intent (Confidence < 0.6)
```
User: "xyz abc"
Agent: "I'm not quite sure what you want to do. Here's what I can help with:
- Create a task: 'add task <title>'
- List tasks: 'show my tasks'
..."
```

### Missing Parameters
```
User: "create a task"
Agent: "What should the task title be?"
```

### Task Not Found
```
User: "delete task 999"
Agent: "I couldn't find a task matching '999'. Would you like to see your task list first?"
```

### Tool Execution Error
```
Tool Error: INVALID_TITLE
Agent: "The task title is invalid. Please use 1-500 characters."
```

## Confirmation Flow

Sensitive operations require confirmation:

- **Delete Task** → "I'll delete 'task 1'. This cannot be undone. Should I proceed?"
- **Complete Task** → "I'll mark 'buy groceries' as complete. Should I go ahead?"

Non-destructive operations execute immediately:
- **Create Task** → "✓ Created task: 'Buy groceries'"
- **List Tasks** → "You have 3 pending tasks: ..."

## Testing

Run unit tests for intent detection:

```bash
cd backend
pytest tests/unit/test_agent_intent.py -v
```

**Test Coverage:**
- Intent detection accuracy
- Parameter extraction
- Confirmation requirements
- Edge cases (empty messages, special characters, etc.)

## Configuration

The agent requires `OPENAI_API_KEY` in environment variables:

```bash
# .env
OPENAI_API_KEY=sk-proj-...
```

If the key is missing, the agent falls back to pattern-based intent detection (no LLM calls).

## Integration with Chat Service

The agent is integrated into `chat_service.py`:

```python
from src.agent import OpenAIAgent

async def process_message(session, user_id, message_text, session_id):
    agent = OpenAIAgent(session)
    response = await agent.process_message(
        user_id=user_id,
        message=message_text,
        context={"session_id": session_id}
    )
    # Save to database and return response
```

## Future Enhancements

### Task Resolution by Index/Title
Currently, task operations require task UUID. Future enhancements:
- Resolve by 1-based index: "complete task #1"
- Fuzzy match by title: "delete buy groceries"

Implementation in `mcp_executor.py`:
```python
async def resolve_task_by_index(self, user_id, task_index):
    # Get user's tasks sorted by created_at
    # Return task at 1-based index
    pass

async def resolve_task_by_title(self, user_id, title_fragment):
    # Fuzzy match against user's tasks
    # Return best match or ask for clarification
    pass
```

### Multi-Turn Conversations
Support context-aware follow-ups:
```
User: "create a task"
Agent: "What should the task title be?"
User: "buy groceries"
Agent: "✓ Created task: 'Buy groceries'"
```

### Batch Operations
Support multiple operations in one message:
```
User: "create tasks: buy milk, call mom, review code"
Agent: "✓ Created 3 tasks"
```

## Constraints

### MCP Tools Only
The agent **NEVER** accesses the database directly. All data operations flow through MCP tools in `backend/src/mcp/tools.py`.

### User Isolation
All tool executions enforce user isolation via `user_id` parameter extracted from JWT.

### Stateless Design
The agent is stateless - each message is processed independently. State management is handled by the FastAPI backend.

## Debugging

Enable debug logging:

```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

Logs include:
- Intent detection: `[openai_agent] intent_detected`
- Tool selection: `[tool_selector] selected`
- Tool execution: `[mcp_executor] executing`
- Errors: `[error_handler] tool_error`
