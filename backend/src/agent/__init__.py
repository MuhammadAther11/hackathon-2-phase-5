"""
OpenAI Agent SDK integration for Phase III Todo AI Chatbot.

This module provides intent detection, tool selection, and execution
for natural language task management.
"""

from .openai_agent import OpenAIAgent, AgentResponse

__all__ = ["OpenAIAgent", "AgentResponse"]
