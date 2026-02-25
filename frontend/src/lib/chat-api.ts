import { apiClient } from './api-client';

interface SendMessageRequest {
  user_id: string;
  message_text: string;
  session_id?: string;
}

interface SendMessageResponse {
  session_id: string;
  agent_response: string;
  intent_detected?: string;
  mcp_tool_executed?: string;
  tool_result?: any;
  requires_confirmation?: boolean;
}

interface GetChatHistoryRequest {
  session_id?: string;
  limit?: number;
}

interface GetChatHistoryResponse {
  session_id: string;
  messages: Array<{
    id: string;
    message_text: string;
    sender: 'user' | 'agent';
    created_at: string;
  }>;
}

export async function sendMessage(request: SendMessageRequest): Promise<SendMessageResponse> {
  const response = await apiClient.post<SendMessageResponse>('/chat/message', request);
  return response;
}

export async function getChatHistory(request: GetChatHistoryRequest): Promise<GetChatHistoryResponse> {
  const queryParams = new URLSearchParams();
  if (request.session_id) queryParams.append('session_id', request.session_id);
  if (request.limit) queryParams.append('limit', request.limit.toString());

  const queryString = queryParams.toString();
  const url = `/chat/history${queryString ? `?${queryString}` : ''}`;

  const response = await apiClient.get<GetChatHistoryResponse>(url);
  return response;
}