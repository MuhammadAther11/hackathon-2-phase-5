"""
Pydantic models for agent I/O.
"""

from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from enum import Enum


class IntentType(str, Enum):
    """Supported intent types."""
    CREATE_TASK = "create_task"
    LIST_TASKS = "list_tasks"
    COMPLETE_TASK = "complete_task"
    UPDATE_TASK = "update_task"
    DELETE_TASK = "delete_task"
    SET_REMINDER = "set_reminder"
    VIEW_REMINDERS = "view_reminders"
    SET_PRIORITY = "set_priority"
    SET_DUE_DATE = "set_due_date"
    SET_RECURRING = "set_recurring"
    ADD_TAGS = "add_tags"
    VIEW_TAGS = "view_tags"
    CLARIFY = "clarify"
    GREETING = "greeting"
    UNKNOWN = "unknown"


class AgentResponse(BaseModel):
    """Structured response from the OpenAI agent."""

    intent: str = Field(description="Detected intent type")
    confidence: float = Field(description="Confidence score (0.0-1.0)", ge=0.0, le=1.0)
    parameters: Dict[str, Any] = Field(default_factory=dict, description="Extracted parameters")
    confirmation_text: Optional[str] = Field(default=None, description="User-facing confirmation message")
    requires_approval: bool = Field(default=False, description="Whether user approval is needed")
    fallback_action: Optional[str] = Field(default=None, description="Fallback action if approval denied")
    error: Optional[str] = Field(default=None, description="Error message if processing failed")
    tool_name: Optional[str] = Field(default=None, description="MCP tool to execute")
    tool_result: Optional[Dict[str, Any]] = Field(default=None, description="Result from tool execution")
    next_action: Optional[str] = Field(default=None, description="Suggested next action")
    response_text: str = Field(description="Natural language response to user")


class ToolExecutionResult(BaseModel):
    """Result from MCP tool execution."""

    status: str = Field(description="success or error")
    data: Optional[Any] = Field(default=None, description="Tool result data")
    error: Optional[Dict[str, Any]] = Field(default=None, description="Error details if failed")
