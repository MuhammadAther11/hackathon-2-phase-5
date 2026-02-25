"""
OpenAI Agent SDK integration for natural language task management.

This module processes user messages, detects intent, selects appropriate MCP tools,
and executes them with proper error handling.
"""

from typing import Dict, Any, Optional
import logging
import os

from .schemas import AgentResponse, IntentType
from .intent_detector import IntentDetector
from .tool_selector import ToolSelector
from .error_handler import ErrorHandler
from .mcp_executor import MCPExecutor

logger = logging.getLogger(__name__)


class OpenAIAgent:
    """
    OpenAI Agent for natural language task management.

    Processes user messages and executes appropriate MCP tools.
    """

    def __init__(self, session):
        """
        Initialize the agent with database session.

        Args:
            session: SQLModel Session for database operations (via MCP tools only)
        """
        self.session = session
        self.intent_detector = IntentDetector()
        self.tool_selector = ToolSelector()
        self.error_handler = ErrorHandler()
        self.mcp_executor = MCPExecutor(session)

        # Verify OpenAI API key is available
        self.openai_api_key = os.getenv("OPENAI_API_KEY")
        if not self.openai_api_key:
            logger.warning("[openai_agent] OPENAI_API_KEY not set - using fallback intent detection")

    async def process_message(
        self,
        user_id: str,
        message: str,
        context: Optional[Dict[str, Any]] = None
    ) -> AgentResponse:
        """
        Process user message and execute appropriate actions.

        Args:
            user_id: User ID for isolation
            message: User's natural language message
            context: Optional context (previous messages, session state, etc.)

        Returns:
            AgentResponse with intent, tool execution result, and response text
        """
        logger.info(f"[openai_agent] processing user_id={user_id} message_length={len(message)}")

        try:
            # Step 1: Detect intent
            intent, confidence, parameters = self.intent_detector.detect_intent(message)

            logger.info(
                f"[openai_agent] intent_detected intent={intent} confidence={confidence} params={parameters}"
            )

            # Step 2: Handle low confidence or unknown intent
            if confidence < 0.6 or intent == IntentType.UNKNOWN:
                response_text = self.error_handler.handle_ambiguous_intent(message, confidence)
                return AgentResponse(
                    intent=intent.value,
                    confidence=confidence,
                    parameters=parameters,
                    confirmation_text=None,
                    requires_approval=False,
                    error=None,
                    tool_name=None,
                    tool_result=None,
                    next_action=None,
                    response_text=response_text
                )

            # Step 3: Handle greeting and non-tool intents
            if intent == IntentType.GREETING:
                response_text = self.intent_detector.generate_confirmation_text(intent, parameters)
                return AgentResponse(
                    intent=intent.value,
                    confidence=confidence,
                    parameters=parameters,
                    confirmation_text=None,
                    requires_approval=False,
                    error=None,
                    tool_name=None,
                    tool_result=None,
                    next_action="Try asking 'show my tasks' or 'create a task'",
                    response_text=response_text
                )

            # Step 4: Select tool
            tool_name, error_message = self.tool_selector.select_tool(intent, confidence, parameters)

            if error_message:
                return AgentResponse(
                    intent=intent.value,
                    confidence=confidence,
                    parameters=parameters,
                    confirmation_text=None,
                    requires_approval=False,
                    error=error_message,
                    tool_name=None,
                    tool_result=None,
                    next_action=self.tool_selector.get_fallback_action(intent),
                    response_text=error_message
                )

            # Step 5: Generate confirmation text
            confirmation_text = self.intent_detector.generate_confirmation_text(intent, parameters)
            requires_approval = self.intent_detector.requires_confirmation(intent)

            # Step 6: Execute tool (if no approval required or approval already granted)
            # For Phase III MVP, we execute immediately and rely on frontend for confirmation UI
            tool_result = None
            response_text = confirmation_text

            if tool_name:
                tool_result = await self.mcp_executor.execute_tool(
                    tool_name=tool_name,
                    user_id=user_id,
                    parameters=parameters
                )

                # Step 7: Handle tool execution result
                if tool_result.get("status") == "success":
                    response_text = self._format_success_response(
                        intent, tool_name, tool_result, parameters
                    )
                else:
                    # Tool execution failed
                    error_message = self.error_handler.handle_tool_error(
                        tool_name, tool_result, intent, parameters
                    )
                    next_action = self.error_handler.recover_from_failure(
                        tool_name, intent, parameters
                    )

                    return AgentResponse(
                        intent=intent.value,
                        confidence=confidence,
                        parameters=parameters,
                        confirmation_text=None,
                        requires_approval=False,
                        error=error_message,
                        tool_name=tool_name,
                        tool_result=tool_result,
                        next_action=next_action,
                        response_text=error_message
                    )

            # Success path
            return AgentResponse(
                intent=intent.value,
                confidence=confidence,
                parameters=parameters,
                confirmation_text=confirmation_text if requires_approval else None,
                requires_approval=requires_approval,
                error=None,
                tool_name=tool_name,
                tool_result=tool_result,
                next_action=self._suggest_next_action(intent),
                response_text=response_text
            )

        except Exception as e:
            logger.error(f"[openai_agent] processing_failed user_id={user_id} error={str(e)}")
            return AgentResponse(
                intent="error",
                confidence=0.0,
                parameters={},
                confirmation_text=None,
                requires_approval=False,
                error=str(e),
                tool_name=None,
                tool_result=None,
                next_action=None,
                response_text="I encountered an error processing your request. Please try again."
            )

    def _format_success_response(
        self,
        intent: IntentType,
        tool_name: str,
        tool_result: Dict[str, Any],
        parameters: Dict[str, Any]
    ) -> str:
        """
        Format user-friendly success message based on intent and tool result.

        Args:
            intent: Detected intent
            tool_name: Executed tool name
            tool_result: Result from tool execution
            parameters: Original parameters

        Returns:
            User-friendly success message
        """
        data = tool_result.get("data", {})

        if intent == IntentType.CREATE_TASK:
            task = data
            title = task.get("title", "your task")
            parts = [f"Got it! Task '{title}' has been created"]
            
            if parameters.get("priority"):
                priority_names = {1: "Low", 2: "Medium", 3: "High", 4: "Critical"}
                parts.append(f"with {priority_names.get(parameters['priority'], 'Medium')} priority")
            
            if parameters.get("due_date"):
                parts.append(f"due {parameters['due_date']}")
            
            if parameters.get("tags"):
                parts.append(f"tagged with {', '.join(parameters['tags'])}")
            
            return ". ".join(parts) + "."

        elif intent == IntentType.LIST_TASKS:
            tasks = data
            count = len(tasks)
            status = parameters.get("status", "all")

            if count == 0:
                return f"You have no {status} tasks. Want to create one? Just say 'add task title'."

            priority_names = {1: "Low", 2: "Medium", 3: "High", 4: "Critical"}

            def _task_line(i, t):
                done = t.get('status') == 'completed' or t.get('completed')
                icon = '✓' if done else '○'
                title = t.get('title', '?')
                pri = t.get('priority')
                pri_label = f" [{priority_names.get(pri, '')}]" if pri and pri != 2 else ""
                due = t.get('due_date')
                due_label = ""
                if due:
                    try:
                        from datetime import datetime
                        dt = datetime.fromisoformat(due)
                        due_label = f" — due {dt.strftime('%b %d')}"
                    except Exception:
                        due_label = f" — due {due[:10]}"
                return f"{i+1}. {icon} {title}{pri_label}{due_label}"

            task_list = "\n".join([_task_line(i, t) for i, t in enumerate(tasks)])
            return f"Here are your {count} {status} task(s):\n{task_list}"

        elif intent == IntentType.VIEW_REMINDERS:
            tasks = data
            due_tasks = [t for t in tasks if t.get('due_date')]
            if not due_tasks:
                return "You don't have any tasks with due dates set. Want to add one? Say 'set task #1 due date to tomorrow'."

            count = len(due_tasks)

            def _due_line(i, t):
                done = t.get('status') == 'completed' or t.get('completed')
                icon = '✓' if done else '○'
                title = t.get('title', '?')
                due = t.get('due_date', '')
                try:
                    from datetime import datetime
                    dt = datetime.fromisoformat(due)
                    due_str = dt.strftime('%b %d, %Y %I:%M %p')
                except Exception:
                    due_str = due[:16] if due else 'N/A'
                return f"{i+1}. {icon} {title} — Due: {due_str}"

            task_list = "\n".join([_due_line(i, t) for i, t in enumerate(due_tasks)])
            return f"Here are your {count} task(s) with due dates:\n{task_list}"

        elif intent == IntentType.VIEW_TAGS:
            # For tags, we'd need a separate tags endpoint - for now show a helpful message
            return "To see your tags, say 'show my tags' - I'll display all your custom tags with their colors. You can also add tags when creating tasks: 'create task title tags work, urgent'."

        elif intent == IntentType.COMPLETE_TASK:
            task = data
            title = task.get("title", "task")
            return f"Got it! '{title}' is marked as complete. Nice work!"

        elif intent in [IntentType.SET_PRIORITY, IntentType.SET_DUE_DATE, IntentType.SET_REMINDER, IntentType.SET_RECURRING, IntentType.ADD_TAGS]:
            task = data
            title = task.get("title", "your task")
            
            if intent == IntentType.SET_PRIORITY:
                priority = parameters.get("priority", 2)
                priority_names = {1: "Low", 2: "Medium", 3: "High", 4: "Critical"}
                return f"Done! '{title}' priority is now {priority_names.get(priority, 'Medium')}."
            
            elif intent == IntentType.SET_DUE_DATE:
                due_date = parameters.get("due_date", "a date")
                return f"Done! '{title}' is now due {due_date}."
            
            elif intent == IntentType.SET_REMINDER:
                reminder_time = parameters.get("reminder_time", "a time")
                return f"Done! I'll remind you about '{title}' at {reminder_time}."
            
            elif intent == IntentType.SET_RECURRING:
                recurrence = parameters.get("recurrence_rule", {})
                freq = recurrence.get("frequency", "regular")
                interval = recurrence.get("interval", 1)
                repeat_text = f"{freq}" + (f" every {interval} {freq.rstrip('ly')}s" if interval > 1 else "")
                return f"Done! '{title}' will now repeat {repeat_text}."
            
            elif intent == IntentType.ADD_TAGS:
                tags = parameters.get("tags", [])
                if tags:
                    return f"Done! Added tags {', '.join(tags)} to '{title}'."
                return f"Done! Tags updated for '{title}'."
            
            return f"Got it! '{title}' has been updated."

        elif intent == IntentType.UPDATE_TASK:
            task = data
            title = task.get("title", "task")
            parts = [f"Got it! Task '{title}' has been updated"]
            if parameters.get("new_title"):
                parts = [f"Got it! Task renamed to '{title}'"]
            priority_names = {1: "Low", 2: "Medium", 3: "High", 4: "Critical"}
            if parameters.get("priority"):
                parts.append(f"priority set to {priority_names.get(parameters['priority'], 'Medium')}")
            if parameters.get("due_date"):
                parts.append(f"due date set to {parameters['due_date']}")
            return ". ".join(parts) + "."

        elif intent == IntentType.DELETE_TASK:
            return "Got it! Task has been deleted."

        return "Got it! Done."

    def _suggest_next_action(self, intent: IntentType) -> Optional[str]:
        """
        Suggest next action based on completed intent.

        Returns:
            Suggested next action or None
        """
        suggestions = {
            IntentType.CREATE_TASK: "Want to add another task or say 'show my tasks' to see your list?",
            IntentType.LIST_TASKS: "Want to complete, update, or delete any of these?",
            IntentType.COMPLETE_TASK: "Awesome! What's next?",
            IntentType.UPDATE_TASK: "All set! What else can I help with?",
            IntentType.DELETE_TASK: "Done! What else can I help with?",
        }
        return suggestions.get(intent)
