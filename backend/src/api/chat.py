"""
Chat API endpoints for Phase III AI Chatbot.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field
from typing import Optional, Any
from uuid import UUID
from datetime import datetime, timezone, timedelta
import logging

# Pakistan Standard Time (UTC+5)
PKT = timezone(timedelta(hours=5))

from src.middleware.auth import get_current_user_id
from src.database import get_session
from src.services.chat_service import process_message, get_chat_history

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Chat"])


async def get_optional_user_id(credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False))) -> Optional[str]:
    """
    Optional authentication dependency - returns user_id if token is valid, None otherwise.
    """
    if credentials is None:
        return None
    
    from jose import JWTError, jwt
    from src.auth.jwt import SECRET_KEY, ALGORITHM
    
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        return user_id
    except JWTError:
        return None


class SendMessageRequest(BaseModel):
    """Request model for sending a chat message."""
    user_id: str = Field(..., description="User ID sending the message")
    message_text: str = Field(..., min_length=1, max_length=2000, description="Message content")
    session_id: Optional[str] = Field(None, description="Optional session ID to continue conversation")


class SendMessageResponse(BaseModel):
    """Response model for chat message."""
    session_id: str = Field(..., description="Session ID for this conversation")
    agent_response: str = Field(..., description="AI agent's response")
    intent_detected: Optional[str] = Field(None, description="Detected user intent")
    confidence: Optional[float] = Field(None, description="Intent detection confidence (0.0-1.0)")
    mcp_tool_executed: Optional[str] = Field(None, description="MCP tool that was executed")
    tool_result: Optional[Any] = Field(None, description="Result from tool execution")
    requires_confirmation: bool = Field(False, description="Whether action requires user confirmation")
    next_action: Optional[str] = Field(None, description="Suggested next action")
    error: Optional[str] = Field(None, description="Error message if processing failed")


class ChatHistoryResponse(BaseModel):
    """Response model for chat history."""
    session_id: str = Field(..., description="Session ID")
    messages: list[dict] = Field(..., description="List of messages in the conversation")


@router.post("/message", response_model=SendMessageResponse)
async def send_chat_message(
    request: SendMessageRequest,
    session = Depends(get_session),
    current_user_id: Optional[str] = Depends(get_optional_user_id)
):
    """
    Send a message to the AI chatbot.

    The agent processes the message, detects intent, executes appropriate MCP tools,
    and returns a response. All messages are persisted in the database.

    For anonymous users (no auth token), uses the user_id from the request.
    """
    try:
        # Determine user_id: use authenticated user if available, otherwise use request user_id
        user_id = current_user_id if current_user_id else request.user_id

        # For anonymous users, allow request.user_id; for authenticated users, enforce match
        if current_user_id and request.user_id != current_user_id:
            raise HTTPException(
                status_code=403,
                detail="Cannot send messages on behalf of another user"
            )

        # Process message through AI agent (now async)
        result = await process_message(
            session=session,
            user_id=user_id,
            message_text=request.message_text,
            session_id=request.session_id
        )

        return SendMessageResponse(**result)

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error processing chat message: {e}")
        raise HTTPException(status_code=500, detail="Failed to process message")


@router.get("/history", response_model=ChatHistoryResponse)
async def get_chat_history_endpoint(
    session_id: Optional[str] = Query(None, description="Session ID to retrieve history for"),
    limit: int = Query(50, ge=1, le=200, description="Maximum number of messages to return"),
    session = Depends(get_session),
    current_user_id: str = Depends(get_current_user_id)
):
    """
    Retrieve chat history for a session.

    User can only access their own chat sessions. If no session_id provided,
    returns empty history (user needs to start a new conversation).
    """
    try:
        if not session_id:
            # No session ID provided, return empty history
            return ChatHistoryResponse(
                session_id="",
                messages=[]
            )

        # Get messages for this session
        messages = get_chat_history(
            session=session,
            session_id=UUID(session_id),
            user_id=current_user_id,
            limit=limit
        )

        # Convert to response format
        message_list = [
            {
                "id": str(msg.id),
                "message_text": msg.message_text,
                "sender": msg.sender,
                "created_at": (msg.created_at.replace(tzinfo=timezone.utc) if msg.created_at.tzinfo is None else msg.created_at).astimezone(PKT).isoformat() if msg.created_at else None
            }
            for msg in messages
        ]

        return ChatHistoryResponse(
            session_id=session_id,
            messages=message_list
        )

    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error retrieving chat history: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve chat history")
