"""
Unit tests for agent intent detection.
"""

import pytest
from src.agent.intent_detector import IntentDetector
from src.agent.schemas import IntentType


class TestIntentDetection:
    """Test intent detection from natural language messages."""

    def test_create_task_intent(self):
        """Test detection of create_task intent."""
        messages = [
            "create a task to buy groceries",
            "add task review code",
            "new task: call mom",
            "remind me to finish report",
            "I need to schedule a meeting",
        ]

        for message in messages:
            intent, confidence, params = IntentDetector.detect_intent(message)
            assert intent == IntentType.CREATE_TASK, f"Failed for: {message}"
            assert confidence >= 0.7
            assert "title" in params

    def test_list_tasks_intent(self):
        """Test detection of list_tasks intent."""
        messages = [
            "show my tasks",
            "list all todos",
            "what's on my list",
            "display my pending tasks",
            "show me everything",
        ]

        for message in messages:
            intent, confidence, params = IntentDetector.detect_intent(message)
            assert intent == IntentType.LIST_TASKS, f"Failed for: {message}"
            assert confidence >= 0.7

    def test_complete_task_intent(self):
        """Test detection of complete_task intent."""
        messages = [
            "complete task 1",
            "mark buy groceries as done",
            "finish task",
            "I've completed the report",
        ]

        for message in messages:
            intent, confidence, params = IntentDetector.detect_intent(message)
            assert intent == IntentType.COMPLETE_TASK, f"Failed for: {message}"
            assert confidence >= 0.7

    def test_update_task_intent(self):
        """Test detection of update_task intent."""
        messages = [
            "update task 1",
            "edit my first task",
            "change task to buy milk",
            "rename task review code",
        ]

        for message in messages:
            intent, confidence, params = IntentDetector.detect_intent(message)
            assert intent == IntentType.UPDATE_TASK, f"Failed for: {message}"
            assert confidence >= 0.7

    def test_delete_task_intent(self):
        """Test detection of delete_task intent."""
        messages = [
            "delete task 1",
            "remove my first task",
            "cancel the meeting task",
            "get rid of this task",
        ]

        for message in messages:
            intent, confidence, params = IntentDetector.detect_intent(message)
            assert intent == IntentType.DELETE_TASK, f"Failed for: {message}"
            assert confidence >= 0.7

    def test_greeting_intent(self):
        """Test detection of greeting intent."""
        messages = [
            "hi",
            "hello",
            "hey there",
            "how are you",
        ]

        for message in messages:
            intent, confidence, params = IntentDetector.detect_intent(message)
            assert intent == IntentType.GREETING, f"Failed for: {message}"
            assert confidence >= 0.9

    def test_unknown_intent(self):
        """Test detection of unknown/unclear intent."""
        messages = [
            "asdfghjkl",
            "xyzabc123",
            "what is the weather",
        ]

        for message in messages:
            intent, confidence, params = IntentDetector.detect_intent(message)
            assert intent == IntentType.UNKNOWN, f"Failed for: {message}"
            assert confidence < 0.6

    def test_parameter_extraction_create_task(self):
        """Test parameter extraction for create_task intent."""
        message = "create a task to buy groceries and milk"
        intent, confidence, params = IntentDetector.detect_intent(message)

        assert intent == IntentType.CREATE_TASK
        assert "title" in params
        assert "buy groceries and milk" in params["title"]

    def test_parameter_extraction_list_tasks_status(self):
        """Test status parameter extraction for list_tasks intent."""
        test_cases = [
            ("show my pending tasks", "pending"),
            ("list completed tasks", "completed"),
            ("show all tasks", "all"),
        ]

        for message, expected_status in test_cases:
            intent, confidence, params = IntentDetector.detect_intent(message)
            assert intent == IntentType.LIST_TASKS
            assert params.get("status") == expected_status

    def test_parameter_extraction_task_identifier(self):
        """Test task identifier extraction for task operations."""
        message = "complete task 'buy groceries'"
        intent, confidence, params = IntentDetector.detect_intent(message)

        assert intent == IntentType.COMPLETE_TASK
        # Should extract either task_identifier or task_index
        assert "task_identifier" in params or "task_index" in params

    def test_requires_confirmation(self):
        """Test confirmation requirement for sensitive operations."""
        assert IntentDetector.requires_confirmation(IntentType.DELETE_TASK) is True
        assert IntentDetector.requires_confirmation(IntentType.COMPLETE_TASK) is True
        assert IntentDetector.requires_confirmation(IntentType.CREATE_TASK) is False
        assert IntentDetector.requires_confirmation(IntentType.LIST_TASKS) is False

    def test_confirmation_text_generation(self):
        """Test confirmation text generation."""
        params = {"title": "Buy groceries"}
        text = IntentDetector.generate_confirmation_text(IntentType.CREATE_TASK, params)
        assert "Buy groceries" in text
        assert "create" in text.lower() or "add" in text.lower()

        params = {"task_identifier": "task 1"}
        text = IntentDetector.generate_confirmation_text(IntentType.DELETE_TASK, params)
        assert "delete" in text.lower()
        assert "task 1" in text.lower()
        assert "cannot be undone" in text.lower()


class TestEdgeCases:
    """Test edge cases and error handling."""

    def test_empty_message(self):
        """Test handling of empty message."""
        intent, confidence, params = IntentDetector.detect_intent("")
        assert intent == IntentType.UNKNOWN
        assert confidence < 0.6

    def test_very_long_message(self):
        """Test handling of very long message."""
        message = "create task " + "a" * 1000
        intent, confidence, params = IntentDetector.detect_intent(message)
        assert intent == IntentType.CREATE_TASK
        assert "title" in params

    def test_mixed_case_message(self):
        """Test case-insensitive matching."""
        messages = [
            "CREATE A TASK",
            "ShOw My TaSkS",
            "DeLeTe TaSk 1",
        ]

        for message in messages:
            intent, confidence, params = IntentDetector.detect_intent(message)
            assert intent != IntentType.UNKNOWN
            assert confidence >= 0.7

    def test_message_with_special_characters(self):
        """Test handling of special characters."""
        message = "create task: buy milk @ store #1 (urgent!)"
        intent, confidence, params = IntentDetector.detect_intent(message)
        assert intent == IntentType.CREATE_TASK
        assert "title" in params

    def test_message_with_numbers(self):
        """Test handling of task numbers."""
        message = "complete task 42"
        intent, confidence, params = IntentDetector.detect_intent(message)
        assert intent == IntentType.COMPLETE_TASK
        assert params.get("task_index") == 42
