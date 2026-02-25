# Research: Cohere-based AI Agent - Phase 0

**Date**: 2026-02-08
**Feature**: 2-cohere-agent
**Status**: Complete

## Overview

This document consolidates research findings on implementing a Cohere-based AI agent that interprets natural language and controls MCP task tools. All unknowns from the Technical Context have been resolved.

---

## Research Question 1: Cohere Chat API with Tool Calling

**Unknown**: How does Cohere's Chat API support tool/function calling? Can it automatically select tools based on user intent?

### Decision
Use **Cohere Chat API v2** with native tool calling support.

### Rationale
- Cohere v2 API includes built-in tool calling (similar to OpenAI function calling)
- API automatically detects when a tool should be called based on user message
- Handles intent detection and parameter extraction internally
- Returns structured tool call requests with parameters populated

### Alternatives Considered
1. **Cohere Classify API**: Separate classification endpoint
   - Rejected: Requires manual tool selection logic; less integrated

2. **Manual NLP parsing**: Use regex or keyword matching
   - Rejected: Brittle; doesn't handle natural language variations well

### Implementation Details
```python
import cohere

co = cohere.Client(api_key=COHERE_API_KEY)

# Define MCP tools in Cohere format
tools = [
    {
        "name": "add_task",
        "description": "Create a new task",
        "parameter_definitions": {
            "title": {
                "description": "Task title",
                "type": "str",
                "required": True
            },
            "description": {
                "description": "Task description",
                "type": "str",
                "required": False
            }
        }
    },
    # ... other tools
]

# Send message with tools
response = co.chat(
    message=user_message,
    tools=tools,
    chat_history=conversation_context
)

# Cohere returns tool_calls if intent detected
if response.tool_calls:
    tool_call = response.tool_calls[0]
    # Execute MCP tool with parameters
```

---

## Research Question 2: Intent Detection Accuracy Strategies

**Unknown**: How to achieve ≥95% intent detection accuracy with varied natural language input?

### Decision
Use **Cohere tool calling + confidence thresholding + fallback clarification**.

### Rationale
- Cohere's LLM handles natural language variations automatically
- If confidence <0.8, ask for clarification instead of guessing
- Provide examples in tool descriptions to improve accuracy
- Log all intent detections for accuracy measurement

### Alternatives Considered
1. **Rule-based intent detection**: Keyword matching
   - Rejected: <70% accuracy on varied input

2. **Train custom intent model**: Fine-tune on task operation examples
   - Rejected: Overkill for 5 intents; Cohere generic model sufficient

### Implementation Details
```python
# Tool descriptions guide Cohere's intent detection
tools = [
    {
        "name": "add_task",
        "description": "Create a new task. Use when user says: add, create, make, new task, remind me to...",
        ...
    },
    {
        "name": "list_tasks",
        "description": "Show all tasks. Use when user asks: list, show, what are my tasks, what do I need to do",
        ...
    },
]

# Check confidence
if response.tool_calls:
    # Cohere selected a tool (high confidence)
    execute_tool(response.tool_calls[0])
elif "task" in user_message.lower():
    # Low confidence but task-related
    ask_clarification()
else:
    # Not task-related
    respond_general()
```

---

## Research Question 3: Parameter Extraction from Natural Language

**Unknown**: How does the agent extract task_id, title, description from varied user input (e.g., "Complete the groceries task")?

### Decision
**Cohere extracts parameters automatically** when tool is selected. For task_id extraction, use list_tasks first to disambiguate.

### Rationale
- Cohere populates tool parameters from user message
- For ambiguous task references: call list_tasks, present options, user selects
- Two-step flow for updates/complete/delete: (1) identify task, (2) execute operation

### Alternatives Considered
1. **Regex extraction**: Pattern match for task identifiers
   - Rejected: Fragile; doesn't handle "the groceries task" or "my shopping task"

2. **Entity recognition library**: SpaCy or similar
   - Rejected: Overkill; Cohere handles this

### Implementation Details
```python
# Example: "Complete the groceries task"
# Cohere returns tool_call with title="groceries" (extracted)

# Agent logic:
# 1. Search tasks for user with title matching "groceries"
# 2. If 1 match: use that task_id
# 3. If multiple matches: ask "Which task? (1) Buy groceries (2) Organize groceries"
# 4. If no match: "I couldn't find a task matching 'groceries'"
```

---

## Research Question 4: Conversation History Storage & Retrieval

**Unknown**: How to efficiently store and retrieve conversation history for context?

### Decision
Store in **PostgreSQL conversation_messages table** with session grouping. Limit context to last 10 messages per request.

### Rationale
- PostgreSQL sufficient for Phase III scale
- Session-based queries are fast with proper indexes
- Limiting context reduces Cohere API payload size and cost
- 10 messages provides enough context for continuity

### Alternatives Considered
1. **Redis cache**: Fast message storage
   - Rejected: Adds infrastructure; PostgreSQL fast enough with indexes

2. **Send full conversation history**: All messages to Cohere
   - Rejected: Expensive; slow; most messages irrelevant

### Implementation Details
```python
# Retrieve recent context
messages = session.exec(
    select(ConversationMessage)
    .where(
        (ConversationMessage.user_id == user_id) &
        (ConversationMessage.session_id == session_id)
    )
    .order_by(ConversationMessage.created_at.desc())
    .limit(10)
).all()

# Format for Cohere chat_history
chat_history = [
    {"role": "USER" if msg.sender == "user" else "CHATBOT", "message": msg.message_text}
    for msg in reversed(messages)  # Chronological order
]

# Send to Cohere with context
response = co.chat(message=new_message, chat_history=chat_history, tools=tools)
```

---

## Research Question 5: Confirmation Flow in Stateless Agent

**Unknown**: How to implement multi-turn confirmation (ask → wait → confirm/cancel) in a stateless agent?

### Decision
Use **confirmation_state table** with 5-minute timeout. Store pending delete operations, check on next message.

### Rationale
- Stateless agent requires external state storage
- Timeout prevents stale confirmations from persisting
- Simple two-message flow: (1) agent asks, (2) user confirms/cancels

### Alternatives Considered
1. **In-memory state**: Store pending confirmations in memory
   - Rejected: Violates stateless design; lost on restart

2. **Require explicit command**: User must type "delete task X confirmed"
   - Rejected: Poor UX; unnatural

### Implementation Details
```python
# User: "Delete my groceries task"
# Agent checks confirmation_state:
if no_pending_confirmation:
    # Create confirmation
    confirmation = ConfirmationState(
        user_id=user_id,
        pending_operation="delete_task",
        task_id=task_id,
        task_title="Buy groceries",
        expires_at=now + 5_minutes
    )
    session.add(confirmation)
    session.commit()
    return "Are you sure you want to delete 'Buy groceries'? (yes/no)"

# User: "yes"
# Agent checks confirmation_state:
if pending_confirmation and not expired:
    # Execute delete
    result = delete_task_tool(user_id, task_id)
    # Delete confirmation state
    session.delete(confirmation)
    session.commit()
    return "Task deleted successfully."
```

---

## Research Question 6: Error Handling for MCP Tool Failures

**Unknown**: What should agent do when MCP tool execution fails (network error, DB error)?

### Decision
**Graceful degradation** with user-friendly error messages and retry suggestions.

### Rationale
- Users shouldn't see stack traces or technical error messages
- Suggest retry for transient failures
- Offer alternative actions if tool persistently fails

### Alternatives Considered
1. **Silent failure**: Don't notify user
   - Rejected: User has no feedback; confusing

2. **Raw error messages**: Return MCP tool error directly
   - Rejected: Technical; poor UX

### Implementation Details
```python
try:
    tool_result = await execute_mcp_tool(tool_name, parameters)
except NetworkError:
    return "I'm having trouble connecting to the task system. Please try again in a moment."
except DatabaseError:
    return "I couldn't complete that action due to a temporary issue. Would you like to try again?"
except ValidationError as e:
    return f"I couldn't process that request: {e.user_message}. Please check your input."
except Exception:
    return "Something went wrong. Please try again or rephrase your request."
```

---

## Research Question 7: Cohere API Cost and Rate Limits

**Unknown**: What are Cohere API rate limits and costs for chat with tool calling?

### Decision
Use **Cohere's standard rate limits** (100 req/min for production tier) with client-side retry logic.

### Rationale
- Standard tier sufficient for Phase III single-user testing
- Rate limit errors trigger retry after 1 second
- Production deployment may need enterprise tier

### Alternatives Considered
1. **Free tier**: Limited to 5 req/min
   - Rejected: Too restrictive for real usage

2. **Cached intent patterns**: Skip Cohere for common phrases
   - Future optimization; start with full Cohere integration

### Implementation Details
```python
from cohere import CohereError
import time

def call_cohere_with_retry(message, tools, chat_history, max_retries=3):
    for attempt in range(max_retries):
        try:
            return co.chat(message=message, tools=tools, chat_history=chat_history)
        except CohereError as e:
            if "rate_limit" in str(e) and attempt < max_retries - 1:
                time.sleep(1 * (attempt + 1))  # Exponential backoff
                continue
            raise
```

---

## Summary: Key Architectural Decisions

| Decision | Choice | Why |
|----------|--------|-----|
| Intent Detection | Cohere Chat API with tool calling | Native support; handles NLP automatically |
| Parameter Extraction | Cohere tool parameter mapping | Automatic; reliable; reduces custom code |
| State Management | PostgreSQL (conversation, confirmation) | Stateless agent; crash recovery; horizontal scaling |
| Confirmation Flow | confirmation_state table with timeout | Stateless yet user-friendly; 5-min expiration |
| Conversation Context | Last 10 messages per request | Balances context vs. API cost/latency |
| Error Handling | Graceful degradation + user-friendly messages | No stack traces; suggest retries |
| Tool Execution | Via MCP tools only (no direct DB) | Maintains separation; reuses feature 1 tools |

---

## Next Steps

1. **Phase 1 Design**: Create data-model.md (3 entities), contracts/ (2 endpoints), quickstart.md (agent setup)
2. **Implementation**: Follow Cohere SDK documentation; implement intent→tool→response pipeline
3. **Testing**: Test 50+ natural language variations; verify ≥95% intent accuracy
4. **Integration**: Connect with MCP tools from feature 1; verify end-to-end workflow

