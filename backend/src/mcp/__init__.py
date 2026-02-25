"""
MCP (Model Context Protocol) module for task operations.

Exposes MCP tools for the OpenAI Agents SDK to discover and invoke.
"""

from .tools import (
    list_tasks_tool,
    add_task_tool,
    complete_task_tool,
    update_task_tool,
    delete_task_tool,
    TASK_TOOLS,
    TaskToolResponse,
)

__all__ = [
    "list_tasks_tool",
    "add_task_tool",
    "complete_task_tool",
    "update_task_tool",
    "delete_task_tool",
    "TASK_TOOLS",
    "TaskToolResponse",
]
