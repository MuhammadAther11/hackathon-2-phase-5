import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
interface ChatMessage {
  id: string;
  message_text: string;
  sender: 'user' | 'agent';
  created_at: string;
}

interface ChatResponse {
  session_id: string;
  agent_response: string;
  intent_detected?: string;
  mcp_tool_executed?: string;
  tool_result?: any;
  requires_confirmation?: boolean;
}

// Tools that modify tasks — dashboard should refresh after these
const TASK_MUTATING_TOOLS = ['add_task', 'complete_task', 'update_task', 'delete_task'];

export function useChat(userId: string, sessionId?: string | null) {
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load existing messages if sessionId is provided
  useEffect(() => {
    if (sessionId) {
      loadChatHistory(sessionId);
    }
  }, [sessionId]);

  const loadChatHistory = async (session_id: string) => {
    try {
      setIsLoading(true);
      const response = await apiClient.get<{ messages: ChatMessage[] }>(`/chat/history?session_id=${session_id}`);
      setMessages(response.messages || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load chat history');
    } finally {
      setIsLoading(false);
    }
  };

  const sendChatMessage = async (message: string, session_id?: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Create timestamp once at the start
      const timestamp = new Date().toISOString();
      const tempId = crypto.randomUUID ? crypto.randomUUID() : `temp-${Math.random().toString(36).substr(2, 9)}`;

      const requestBody: any = {
        message_text: message,
        user_id: userId
      };

      if (session_id) {
        requestBody.session_id = session_id;
      }

      const response: ChatResponse = await apiClient.post('/chat/message', requestBody);

      // Add user message to local state
      const userMessage: ChatMessage = {
        id: `user-${tempId}`,
        message_text: message,
        sender: 'user',
        created_at: timestamp
      };

      // Add agent response to local state
      const agentMessage: ChatMessage = {
        id: `agent-${tempId}`,
        message_text: response.agent_response,
        sender: 'agent',
        created_at: new Date().toISOString()
      };

      setMessages(prev => [...prev, userMessage, agentMessage]);

      // If a task-mutating tool ran successfully, refresh the dashboard task list
      if (response.mcp_tool_executed && TASK_MUTATING_TOOLS.includes(response.mcp_tool_executed)) {
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
      }

      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    sendChatMessage,
    isLoading,
    error,
    setError
  };
}