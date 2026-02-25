import { useState } from 'react';
import { apiClient } from '@/lib/api-client';

interface ChatMessage {
  id: string;
  message_text: string;
  sender: 'user' | 'agent';
  created_at: string;
}

interface ChatHistoryResponse {
  session_id: string;
  messages: ChatMessage[];
}

export function useChatHistory() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = async (session_id?: string) => {
    try {
      setIsLoading(true);
      setError(null);

      let url = '/chat/history';
      if (session_id) {
        url += `?session_id=${session_id}`;
      }

      const response: ChatHistoryResponse = await apiClient.get(url);

      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load chat history');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    loadHistory,
    isLoading,
    error
  };
}