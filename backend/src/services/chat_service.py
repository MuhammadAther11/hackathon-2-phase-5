"""
Chat service for Phase III AI Chatbot.
Handles message processing, intent detection, and MCP tool execution.
"""

from sqlmodel import select, Session
from datetime import datetime, timezone, timedelta

# Pakistan Standard Time (UTC+5)
PKT = timezone(timedelta(hours=5))
from uuid import UUID, uuid4
from typing import Optional, Dict, Any
import logging

from src.models.chat import ChatSession, ChatMessage

logger = logging.getLogger(__name__)


def get_or_create_session(
    session: Session,
    user_id: str,
    session_id: Optional[str] = None
) -> ChatSession:
    """
    Get existing chat session or create a new one.
    """
    if session_id:
        # Try to get existing session
        statement = select(ChatSession).where(
            ChatSession.id == UUID(session_id),
            ChatSession.user_id == user_id
        )
        result = session.exec(statement)
        chat_session = result.first()

        if chat_session:
            return chat_session

    # Create new session
    chat_session = ChatSession(user_id=user_id)
    session.add(chat_session)
    session.commit()
    session.refresh(chat_session)

    logger.info(f"Created new chat session: {chat_session.id} for user: {user_id}")
    return chat_session


def save_message(
    session: Session,
    session_id: UUID,
    message_text: str,
    sender: str,
    intent: Optional[str] = None,
    tool: Optional[str] = None,
    result: Optional[str] = None
) -> ChatMessage:
    """
    Save a message to the database.
    """
    message = ChatMessage(
        session_id=session_id,
        message_text=message_text,
        sender=sender,
        intent_detected=intent,
        mcp_tool_executed=tool,
        tool_result=result
    )

    session.add(message)
    session.commit()
    session.refresh(message)

    return message


def get_chat_history(
    session: Session,
    session_id: UUID,
    user_id: str,
    limit: int = 50
) -> list[ChatMessage]:
    """
    Retrieve chat history for a session.
    Enforces user isolation.
    """
    # Verify session belongs to user
    statement = select(ChatSession).where(
        ChatSession.id == session_id,
        ChatSession.user_id == user_id
    )
    result = session.exec(statement)
    chat_session = result.first()

    if not chat_session:
        raise ValueError(f"Session {session_id} not found or unauthorized")

    # Get messages
    statement = (
        select(ChatMessage)
        .where(ChatMessage.session_id == session_id)
        .order_by(ChatMessage.created_at)
        .limit(limit)
    )
    result = session.exec(statement)
    messages = result.all()

    return messages


async def process_message(
    session: Session,
    user_id: str,
    message_text: str,
    session_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Process incoming chat message with OpenAI Agent integration.

    Detects intent, executes MCP tools, and returns structured response.
    """
    # Get or create session
    chat_session = get_or_create_session(session, user_id, session_id)

    # Save user message
    save_message(
        session,
        chat_session.id,
        message_text,
        sender="user"
    )

    try:
        # Initialize OpenAI Agent
        from src.agent import OpenAIAgent

        agent = OpenAIAgent(session)

        # Process message with agent
        agent_response = await agent.process_message(
            user_id=user_id,
            message=message_text,
            context={"session_id": str(chat_session.id)}
        )

        # Save agent response
        save_message(
            session,
            chat_session.id,
            agent_response.response_text,
            sender="agent",
            intent=agent_response.intent,
            tool=agent_response.tool_name,
            result=str(agent_response.tool_result) if agent_response.tool_result else None
        )

        return {
            "session_id": str(chat_session.id),
            "agent_response": agent_response.response_text,
            "intent_detected": agent_response.intent,
            "confidence": agent_response.confidence,
            "mcp_tool_executed": agent_response.tool_name,
            "tool_result": agent_response.tool_result,
            "requires_confirmation": agent_response.requires_approval,
            "next_action": agent_response.next_action,
            "error": agent_response.error
        }

    except Exception as e:
        logger.error(f"[process_message] agent_error user_id={user_id} error={str(e)}")

        # Save error response
        error_message = "I encountered an error processing your request. Please try again."
        save_message(
            session,
            chat_session.id,
            error_message,
            sender="agent",
            intent="error",
            tool=None,
            result=str(e)
        )

        return {
            "session_id": str(chat_session.id),
            "agent_response": error_message,
            "intent_detected": "error",
            "confidence": 0.0,
            "mcp_tool_executed": None,
            "tool_result": None,
            "requires_confirmation": False,
            "next_action": None,
            "error": str(e)
        }
