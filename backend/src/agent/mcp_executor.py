"""
MCP tool executor - invokes MCP tools with proper context and error handling.
"""

from typing import Dict, Any, Optional
from uuid import UUID
import logging

logger = logging.getLogger(__name__)


class MCPExecutor:
    """Executes MCP tools without direct database access."""

    def __init__(self, session):
        """
        Initialize executor with database session.

        Args:
            session: SQLModel Session for tool execution
        """
        self.session = session

    async def execute_tool(
        self,
        tool_name: str,
        user_id: str,
        parameters: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Execute an MCP tool with user context and parameters.

        Args:
            tool_name: Name of the tool to execute (add_task, list_tasks, etc.)
            user_id: User ID for isolation
            parameters: Tool parameters

        Returns:
            Tool execution result: {status: "success"|"error", data: ..., error: ...}
        """
        logger.info(f"[mcp_executor] executing tool={tool_name} user_id={user_id}")

        try:
            # Import MCP tools
            from src.mcp.tools import (
                add_task_tool,
                list_tasks_tool,
                complete_task_tool,
                update_task_tool,
                delete_task_tool,
            )

            # Map tool name to handler
            tool_map = {
                "add_task": add_task_tool,
                "list_tasks": list_tasks_tool,
                "complete_task": complete_task_tool,
                "update_task": update_task_tool,
                "delete_task": delete_task_tool,
            }

            handler = tool_map.get(tool_name)
            if not handler:
                logger.error(f"[mcp_executor] unknown_tool tool={tool_name}")
                return {
                    "status": "error",
                    "error": {
                        "code": "UNKNOWN_TOOL",
                        "message": f"Tool '{tool_name}' not found",
                        "details": {"tool_name": tool_name}
                    }
                }

            # Prepare tool arguments
            tool_args = self._prepare_tool_args(tool_name, user_id, parameters)

            # Execute tool
            result = await handler(self.session, **tool_args)

            logger.info(f"[mcp_executor] tool_executed tool={tool_name} status={result.get('status')}")
            return result

        except ValueError as e:
            # ValueError from task resolution - pass through the user-friendly message
            logger.warning(f"[mcp_executor] validation_error tool={tool_name} error={str(e)}")
            return {
                "status": "error",
                "error": {
                    "code": "VALIDATION_ERROR",
                    "message": str(e),
                    "details": {"error": str(e)}
                }
            }
        except Exception as e:
            logger.error(f"[mcp_executor] execution_failed tool={tool_name} error={str(e)}")
            return {
                "status": "error",
                "error": {
                    "code": "EXECUTION_ERROR",
                    "message": f"Something went wrong while executing the task operation. Please try again.",
                    "details": {"error": str(e)}
                }
            }

    def _prepare_tool_args(
        self,
        tool_name: str,
        user_id: str,
        parameters: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Prepare arguments for tool execution based on tool requirements.

        Args:
            tool_name: Name of the tool
            user_id: User ID
            parameters: Raw parameters from intent detection

        Returns:
            Cleaned parameters ready for tool execution
        """
        # All tools need user_id
        tool_args = {"user_id": user_id}

        if tool_name == "add_task":
            tool_args["title"] = parameters.get("title", "")
            tool_args["description"] = parameters.get("description")
            tool_args["priority"] = parameters.get("priority")
            tool_args["due_date"] = parameters.get("due_date")
            tool_args["tags"] = parameters.get("tags")

        elif tool_name == "list_tasks":
            tool_args["status"] = parameters.get("status", "all")

        elif tool_name == "complete_task":
            tool_args["task_id"] = self._resolve_task_id(parameters, user_id=user_id)

        elif tool_name == "update_task":
            tool_args["task_id"] = self._resolve_task_id(parameters, user_id=user_id)
            if "new_title" in parameters:
                tool_args["title"] = parameters["new_title"]
            if "new_description" in parameters:
                tool_args["description"] = parameters["new_description"]
            # Advanced features
            if "priority" in parameters:
                tool_args["priority"] = parameters["priority"]
            if "due_date" in parameters:
                tool_args["due_date"] = parameters["due_date"]
            if "recurrence_rule" in parameters:
                rr = parameters["recurrence_rule"]
                # Ensure recurrence_rule is always a dict
                tool_args["recurrence_rule"] = rr if isinstance(rr, dict) else None
            if "tags" in parameters:
                tool_args["tags"] = parameters["tags"]
            if "reminder_time" in parameters:
                # For reminders, we set due_date if not already set
                if "due_date" not in parameters:
                    tool_args["due_date"] = parameters["reminder_time"]

        elif tool_name == "delete_task":
            tool_args["task_id"] = self._resolve_task_id(parameters, user_id=user_id)

        return tool_args

    def _resolve_task_id(self, parameters: Dict[str, Any], user_id: str = None) -> str:
        """
        Resolve task identifier to UUID.

        Supports: direct task_id, task_index (1-based), or task_identifier (title fragment).

        Args:
            parameters: Parameters containing task identifier
            user_id: User ID for querying tasks by index/title

        Returns:
            Task UUID as string

        Raises:
            ValueError: If task identifier cannot be resolved
        """
        # Direct task_id
        if "task_id" in parameters:
            return str(parameters["task_id"])

        # Task index (1-based) - resolve by querying user's tasks
        if "task_index" in parameters and user_id:
            task_index = int(parameters["task_index"])
            from src.services.task_service import get_user_tasks
            tasks = get_user_tasks(session=self.session, user_id=user_id)
            # Sort by created_at so index is stable
            tasks.sort(key=lambda t: t.created_at if t.created_at else "")
            if task_index < 1 or task_index > len(tasks):
                raise ValueError(
                    f"Task #{task_index} not found. You have {len(tasks)} task(s). "
                    f"Say 'show my tasks' to see the list."
                )
            return str(tasks[task_index - 1].id)

        # Task identifier (title fragment) - fuzzy match against user's tasks
        if "task_identifier" in parameters and user_id:
            identifier = parameters["task_identifier"].lower().strip()
            from src.services.task_service import get_user_tasks
            tasks = get_user_tasks(session=self.session, user_id=user_id)
            # Try exact match first, then substring match
            for task in tasks:
                if task.title.lower() == identifier:
                    return str(task.id)
            for task in tasks:
                if identifier in task.title.lower():
                    return str(task.id)
            raise ValueError(
                f"No task matching '{parameters['task_identifier']}' found. "
                f"Say 'show my tasks' to see your tasks."
            )

        raise ValueError("No task identifier found. Please specify a task number or title.")

    async def resolve_task_by_index(self, user_id: str, task_index: int) -> Optional[str]:
        """
        Future enhancement: Resolve task ID by index in user's task list.

        Args:
            user_id: User ID
            task_index: 1-based index

        Returns:
            Task UUID or None if not found
        """
        # TODO: Implement
        # 1. Get user's tasks (sorted by created_at)
        # 2. Return task at index (1-based)
        logger.warning("[mcp_executor] resolve_by_index not implemented")
        return None

    async def resolve_task_by_title(self, user_id: str, title_fragment: str) -> Optional[str]:
        """
        Future enhancement: Resolve task ID by title fragment (fuzzy match).

        Args:
            user_id: User ID
            title_fragment: Partial title to match

        Returns:
            Task UUID or None if not found
        """
        # TODO: Implement
        # 1. Get user's tasks
        # 2. Fuzzy match against title_fragment
        # 3. Return best match (or ask for clarification if multiple matches)
        logger.warning("[mcp_executor] resolve_by_title not implemented")
        return None
