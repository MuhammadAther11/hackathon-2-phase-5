import { NextRequest, NextResponse } from 'next/server';

/**
 * Chat API endpoint for homepage chatbot
 * Handles user questions and provides AI-powered responses
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, sessionId } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Check if backend chat API is available
    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

    try {
      // Try to call backend chat API
      // Backend expects: user_id, message_text, session_id
      const backendResponse = await fetch(`${backendUrl}/chat/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user_id: 'anonymous', 
          message_text: message, 
          session_id: sessionId 
        }),
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });

      if (backendResponse.ok) {
        const data = await backendResponse.json();
        return NextResponse.json({
          response: data.agent_response || data.response || data.message,
          sessionId,
        });
      }
    } catch (backendError) {
      // Backend unavailable, use fallback responses
      console.log('Backend chat unavailable, using fallback');
    }

    // Fallback responses for common questions
    const fallbackResponses: Record<string, string> = {
      'how do i create a task': 'To create a task, click the "New Task" button on your dashboard. Fill in the title, and optionally add a description, priority, due date, tags, or recurrence pattern. Click "Save" when done!',
      'create task': 'You can create tasks by saying "add task [title]" or using the New Task button on your dashboard!',
      'what are priority levels': 'TaskFlow has 4 priority levels: Low (blue), Medium (yellow), High (orange), and Critical (red). Use them to organize your tasks by urgency!',
      'how do i set a reminder': 'When creating or editing a task, scroll to the "Reminders" section and select when you want to be notified. You can set multiple reminders per task!',
      'can i organize tasks with tags': 'Yes! Click the "Tags" section when creating a task. You can select existing tags or create new ones with custom colors. Click a tag anywhere to filter by it!',
      'how do i search': 'Use the search bar at the top of your dashboard. Type any keyword from your task titles or descriptions. Results appear instantly!',
      'what is recurring': 'Recurring tasks automatically repeat on a schedule. Choose daily, weekly, or monthly recurrence when creating a task. Perfect for habits and regular activities!',
      'show my tasks': 'You can view all your tasks on the dashboard. They are organized by priority and due date!',
      'delete task': 'To delete a task, click the trash icon next to it or say "delete task [title]"!',
      'complete task': 'Mark tasks as complete by clicking the checkbox or saying "complete task [title]"!',
    };

    // Find matching fallback response
    const lowerMessage = message.toLowerCase();
    let response = 'I understand your question. For detailed help, please visit our documentation at /docs or contact support at support@taskflow.com. You can also ask about: creating tasks, priority levels, reminders, tags, search, or recurring tasks!';

    for (const [keyword, fallback] of Object.entries(fallbackResponses)) {
      if (lowerMessage.includes(keyword)) {
        response = fallback;
        break;
      }
    }

    return NextResponse.json({
      response,
      sessionId,
      fallback: true,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { 
        response: 'I apologize, but I\'m experiencing technical difficulties. Please contact support at support@taskflow.com for assistance.',
        error: true,
      },
      { status: 500 }
    );
  }
}
