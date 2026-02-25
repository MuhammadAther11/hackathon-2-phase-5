"""
Error handling and recovery for agent operations.
"""

from typing import Dict, Any, Optional
import logging

from .schemas import IntentType

logger = logging.getLogger(__name__)


class ErrorHandler:
    """Handles errors and provides recovery paths."""

    @staticmethod
    def handle_tool_error(
        tool_name: str,
        error_response: Dict[str, Any],
        intent: IntentType,
        parameters: Dict[str, Any]
    ) -> str:
        """
        Convert tool error to user-friendly message with recovery guidance.

        Args:
            tool_name: Name of the tool that failed
            error_response: Error response from tool execution
            intent: User's intent
            parameters: Parameters passed to tool

        Returns:
            User-friendly error message with recovery guidance
        """
        error_data = error_response.get("error", {})
        error_code = error_data.get("code", "UNKNOWN")
        error_message = error_data.get("message", "An error occurred")

        logger.error(f"[error_handler] tool={tool_name} code={error_code} message={error_message}")

        # Map error codes to clear "Here's what went wrong" messages with recovery options
        if error_code == "INVALID_TITLE":
            return "Here's what went wrong: The task title is invalid. Please use 1-500 characters and try again."

        elif error_code == "INVALID_DESCRIPTION":
            return "Here's what went wrong: The description is too long. Please keep it under 5000 characters."

        elif error_code == "INVALID_TASK_ID":
            return "Here's what went wrong: I couldn't find that task. Try 'show my tasks' to see your list, then use the task number."

        elif error_code == "NOT_FOUND":
            task_hint = parameters.get("task_identifier", parameters.get("task_index", ""))
            return (
                f"Here's what went wrong: No task matching '{task_hint}' was found. "
                "Try 'show my tasks' to see your current list."
            )

        elif error_code == "INVALID_STATUS":
            return "Here's what went wrong: Invalid status filter. Use 'pending', 'completed', or 'all'."

        elif error_code == "NO_UPDATE_FIELDS":
            return "Here's what went wrong: I need to know what to change. Try 'update task #1 to new title'."

        elif error_code == "UNAUTHORIZED":
            return "Here's what went wrong: You're not logged in. Please log in and try again."

        elif error_code == "INTERNAL_ERROR":
            return (
                "Here's what went wrong: Something unexpected happened on my end. "
                "Please try again. If it keeps happening, contact support."
            )

        # Validation errors (from task resolution) - pass through as they are user-friendly
        if error_code == "VALIDATION_ERROR":
            return f"Here's what went wrong: {error_message}"

        # Generic fallback
        return f"Here's what went wrong: {error_message}. Please try again or rephrase your request."

    @staticmethod
    def handle_ambiguous_intent(message: str, confidence: float) -> str:
        """
        Handle ambiguous or unclear user intent.

        Returns:
            Clarifying question for the user
        """
        logger.info(f"[error_handler] ambiguous_intent confidence={confidence}")

        return (
            "I'm not quite sure what you want me to do. Here's what I can help with:\n\n"
            "**Basic Task Management:**\n"
            "- Create a task: 'add task buy groceries'\n"
            "- List tasks: 'show my tasks' or 'show pending tasks'\n"
            "- Complete a task: 'mark task #1 as done' or 'complete task buy milk'\n"
            "- Update a task: 'update task #1 to new title'\n"
            "- Delete a task: 'delete task #1' or 'remove task buy milk'\n\n"
            "**Advanced Features:**\n"
            "- Set Priority: 'set task #1 priority to high' or 'create task urgent meeting with critical priority'\n"
            "- Set Due Date: 'set task #1 due date to tomorrow' or 'create task report due next week'\n"
            "- Add Reminders: 'remind me about task #1 tomorrow' or 'set a reminder for my meeting'\n"
            "- Set Recurring: 'make task #1 repeat weekly' or 'set task to recur every 3 days'\n"
            "- Add Tags: 'add tags work, urgent to task #1' or 'create task buy groceries tags shopping, home'\n\n"
            "**Natural Language Examples:**\n"
            "- 'Create task submit report with high priority due tomorrow tags work'\n"
            "- 'Show my completed tasks'\n"
            "- 'Make my morning routine repeat daily'\n"
            "- 'Remind me about the meeting task at 3 PM'\n\n"
            "What would you like to do?"
        )

    @staticmethod
    def handle_missing_parameters(
        tool_name: str,
        parameters: Dict[str, Any],
        missing_fields: list[str]
    ) -> str:
        """
        Handle missing required parameters.

        Returns:
            Clarifying question to get missing information
        """
        logger.info(f"[error_handler] missing_params tool={tool_name} fields={missing_fields}")

        if "title" in missing_fields:
            return "What should the task title be?"

        elif "task_id" in missing_fields or "task_identifier" in missing_fields:
            return "Which task? Please specify a task number (e.g., #1) or the task title."

        elif "new_title" in missing_fields or "new_description" in missing_fields:
            return "What should I change it to?"

        return f"I need more information: {', '.join(missing_fields)}"

    @staticmethod
    def handle_confirmation_denial(intent: IntentType) -> str:
        """
        Handle user denying confirmation for sensitive operations.

        Returns:
            Acknowledgment message
        """
        logger.info(f"[error_handler] confirmation_denied intent={intent}")

        action_map = {
            IntentType.DELETE_TASK: "delete the task",
            IntentType.COMPLETE_TASK: "mark the task as complete",
            IntentType.UPDATE_TASK: "update the task",
        }

        action = action_map.get(intent, "proceed")
        return f"No problem! I won't {action}. Let me know if you need anything else."

    @staticmethod
    def recover_from_failure(
        tool_name: str,
        intent: IntentType,
        parameters: Dict[str, Any]
    ) -> Optional[str]:
        """
        Suggest recovery action after tool failure.

        Returns:
            Suggested next action or None
        """
        if tool_name in ["complete_task", "update_task", "delete_task"]:
            return "Try 'show my tasks' first to see your task numbers, then try again."

        elif tool_name == "add_task":
            return "Try a shorter task title, like 'add task buy groceries'."

        return None
