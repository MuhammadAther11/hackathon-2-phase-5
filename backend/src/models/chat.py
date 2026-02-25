"""
Chat session and message models for Phase III AI Chatbot.
"""

from sqlmodel import Field, SQLModel, Relationship, DateTime
from datetime import datetime, timezone, timedelta
from typing import Optional, List
from uuid import UUID, uuid4

# Pakistan Standard Time (UTC+5)
PKT = timezone(timedelta(hours=5))


class ChatSession(SQLModel, table=True):
    """
    Represents a conversation session between a user and the AI agent.
    """
    __tablename__ = "chat_sessions"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: str = Field(index=True, nullable=False)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(PKT),
        sa_type=DateTime(timezone=True),
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(PKT),
        sa_type=DateTime(timezone=True),
    )

    # Relationship to messages
    messages: List["ChatMessage"] = Relationship(back_populates="session")


class ChatMessage(SQLModel, table=True):
    """
    Individual message in a chat session.
    """
    __tablename__ = "chat_messages"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    session_id: UUID = Field(foreign_key="chat_sessions.id", index=True)
    message_text: str = Field(nullable=False)
    sender: str = Field(nullable=False)  # 'user' or 'agent'
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(PKT),
        sa_type=DateTime(timezone=True),
    )

    # Optional metadata
    intent_detected: Optional[str] = Field(default=None)
    mcp_tool_executed: Optional[str] = Field(default=None)
    tool_result: Optional[str] = Field(default=None)

    # Relationship back to session
    session: ChatSession = Relationship(back_populates="messages")
