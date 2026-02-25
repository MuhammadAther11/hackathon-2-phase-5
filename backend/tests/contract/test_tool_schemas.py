"""
Contract tests for MCP tool schemas.

Verifies tool definitions match the contracts specification.
"""

import pytest
import json
from src.mcp.tools import TASK_TOOLS


class TestToolSchemas:
    """Test MCP tool schema contracts."""

    def test_tool_registry_contains_all_tools(self):
        """Test that all required tools are registered."""
        required_tools = ["list_tasks", "add_task", "complete_task", "update_task", "delete_task"]

        for tool_name in required_tools:
            assert tool_name in TASK_TOOLS, f"Tool '{tool_name}' not found in registry"

    def test_list_tasks_tool_schema(self):
        """Test list_tasks tool schema matches contract."""
        tool = TASK_TOOLS["list_tasks"]

        assert tool["name"] == "list_tasks"
        assert "description" in tool
        assert "parameters" in tool
        assert "handler" in tool

        params = tool["parameters"]
        assert params["type"] == "object"
        assert "user_id" in params["properties"]
        assert "status" in params["properties"]
        assert "user_id" in params["required"]

    def test_add_task_tool_schema(self):
        """Test add_task tool schema matches contract."""
        tool = TASK_TOOLS["add_task"]

        assert tool["name"] == "add_task"
        assert "description" in tool
        assert "parameters" in tool
        assert "handler" in tool

        params = tool["parameters"]
        assert params["type"] == "object"
        assert "user_id" in params["properties"]
        assert "title" in params["properties"]
        assert "description" in params["properties"]
        assert "user_id" in params["required"]
        assert "title" in params["required"]

    def test_complete_task_tool_schema(self):
        """Test complete_task tool schema matches contract."""
        tool = TASK_TOOLS["complete_task"]

        assert tool["name"] == "complete_task"
        assert "description" in tool
        assert "parameters" in tool
        assert "handler" in tool

        params = tool["parameters"]
        assert params["type"] == "object"
        assert "user_id" in params["properties"]
        assert "task_id" in params["properties"]
        assert "user_id" in params["required"]
        assert "task_id" in params["required"]

    def test_update_task_tool_schema(self):
        """Test update_task tool schema matches contract."""
        tool = TASK_TOOLS["update_task"]

        assert tool["name"] == "update_task"
        assert "description" in tool
        assert "parameters" in tool
        assert "handler" in tool

        params = tool["parameters"]
        assert params["type"] == "object"
        assert "user_id" in params["properties"]
        assert "task_id" in params["properties"]
        assert "title" in params["properties"]
        assert "description" in params["properties"]
        assert "user_id" in params["required"]
        assert "task_id" in params["required"]

    def test_delete_task_tool_schema(self):
        """Test delete_task tool schema matches contract."""
        tool = TASK_TOOLS["delete_task"]

        assert tool["name"] == "delete_task"
        assert "description" in tool
        assert "parameters" in tool
        assert "handler" in tool

        params = tool["parameters"]
        assert params["type"] == "object"
        assert "user_id" in params["properties"]
        assert "task_id" in params["properties"]
        assert "user_id" in params["required"]
        assert "task_id" in params["required"]

    def test_all_tools_have_handlers(self):
        """Test that all tools have callable handlers."""
        for tool_name, tool in TASK_TOOLS.items():
            assert "handler" in tool, f"Tool '{tool_name}' missing handler"
            assert callable(tool["handler"]), f"Tool '{tool_name}' handler not callable"

    def test_all_tools_have_descriptions(self):
        """Test that all tools have descriptions."""
        for tool_name, tool in TASK_TOOLS.items():
            assert "description" in tool, f"Tool '{tool_name}' missing description"
            assert len(tool["description"]) > 0, f"Tool '{tool_name}' has empty description"

    def test_tool_parameter_schema_is_valid(self):
        """Test that all tool parameter schemas are valid JSON Schema."""
        for tool_name, tool in TASK_TOOLS.items():
            params = tool["parameters"]

            # Must be object type
            assert params["type"] == "object", f"Tool '{tool_name}' parameters not object type"

            # Must have properties
            assert "properties" in params, f"Tool '{tool_name}' parameters missing properties"
            assert isinstance(params["properties"], dict), f"Tool '{tool_name}' properties not dict"

            # May have required array
            if "required" in params:
                assert isinstance(params["required"], list), f"Tool '{tool_name}' required not list"

    def test_user_id_parameter_consistency(self):
        """Test that all tools have user_id parameter."""
        for tool_name, tool in TASK_TOOLS.items():
            params = tool["parameters"]
            assert "user_id" in params["properties"], f"Tool '{tool_name}' missing user_id parameter"
            assert "user_id" in params["required"], f"Tool '{tool_name}' user_id not required"

    def test_list_tasks_status_enum(self):
        """Test that list_tasks status parameter has valid enum values."""
        tool = TASK_TOOLS["list_tasks"]
        status_param = tool["parameters"]["properties"]["status"]

        assert "enum" in status_param, "status parameter missing enum"
        assert set(status_param["enum"]) == {"pending", "completed", "all"}

    def test_tool_registry_serializable(self):
        """Test that tool registry can be serialized to JSON."""
        try:
            json_str = json.dumps({
                name: {
                    "name": tool["name"],
                    "description": tool["description"],
                    "parameters": tool["parameters"]
                }
                for name, tool in TASK_TOOLS.items()
            })
            assert len(json_str) > 0
        except TypeError as e:
            pytest.fail(f"Tool registry not JSON serializable: {e}")

    def test_contract_matches_specification(self):
        """Test that tool contracts match the specification."""
        # Verify against specs/1-mcp-task-tools/contracts/tools-schema.json expectations
        expected_tools = {
            "list_tasks": {
                "params": ["user_id", "status"],
                "required": ["user_id"]
            },
            "add_task": {
                "params": ["user_id", "title", "description"],
                "required": ["user_id", "title"]
            },
            "complete_task": {
                "params": ["user_id", "task_id"],
                "required": ["user_id", "task_id"]
            },
            "update_task": {
                "params": ["user_id", "task_id", "title", "description"],
                "required": ["user_id", "task_id"]
            },
            "delete_task": {
                "params": ["user_id", "task_id"],
                "required": ["user_id", "task_id"]
            }
        }

        for tool_name, expected in expected_tools.items():
            assert tool_name in TASK_TOOLS, f"Tool '{tool_name}' not found"

            tool = TASK_TOOLS[tool_name]
            params = tool["parameters"]

            # Check all expected parameters are present
            for param in expected["params"]:
                assert param in params["properties"], \
                    f"Tool '{tool_name}' missing parameter '{param}'"

            # Check required parameters match
            assert set(params.get("required", [])) == set(expected["required"]), \
                f"Tool '{tool_name}' required parameters don't match specification"
