'use client';

import { useState } from 'react';
import { ChatHistory } from './ChatHistory';
import { ChatInput } from './ChatInput';
import { useChat } from '@/hooks/useChat';
import { cn } from '@/lib/utils';
import { Bot, AlertCircle, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatInterfaceProps {
  userId: string;
  className?: string;
}

export function ChatInterface({ userId, className }: ChatInterfaceProps) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const { messages, sendChatMessage, isLoading, error, setError } = useChat(userId, sessionId);

  const handleSendMessage = async (text: string) => {
    try {
      const response = await sendChatMessage(text, sessionId || undefined);
      if (response.session_id && !sessionId) {
        setSessionId(response.session_id);
      }
      setError(null);
    } catch (err) {
      console.error('Failed to send message:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message');
    }
  };

  return (
    <div className={cn(
      'flex flex-col h-full glass-card rounded-xl sm:rounded-2xl overflow-hidden',
      className
    )}>
      {/* Header */}
      <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 border-b border-gray-200/60 dark:border-white/[0.06] bg-white/50 dark:bg-white/[0.02]">
        <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 flex-shrink-0">
          <Bot className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-xs sm:text-sm font-display font-semibold text-gray-900 dark:text-gray-100 truncate flex items-center gap-1 sm:gap-1.5">
            <span className="truncate">AI Task Assistant</span>
            <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-indigo-500 dark:text-indigo-400 flex-shrink-0" />
          </h2>
          <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 truncate">Powered by natural language</p>
        </div>
        <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="hidden xs:inline text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 font-medium">Online</span>
        </div>
      </div>

      {/* Messages area */}
      <ChatHistory
        messages={messages.map(m => ({
          id: m.id,
          text: m.message_text,
          sender: m.sender as 'user' | 'agent',
          timestamp: m.created_at
        }))}
        isLoading={isLoading}
        className="auth-scrollbar"
      />

      {/* Error banner */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mx-2 sm:mx-4 mb-2 flex items-center gap-2 px-2.5 sm:px-3 py-2 sm:py-2.5 bg-red-50/80 dark:bg-red-900/20 border border-red-200/60 dark:border-red-800/40 rounded-lg sm:rounded-xl text-xs sm:text-sm text-red-700 dark:text-red-400 backdrop-blur-sm">
              <AlertCircle size={14} className="flex-shrink-0" />
              <span className="flex-1 break-words">{error}</span>
              <button onClick={() => setError(null)} className="text-red-400 dark:text-red-500 hover:text-red-600 dark:hover:text-red-300 transition-colors flex-shrink-0">
                <X size={12} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input area */}
      <div className="px-2.5 sm:px-3 py-2 sm:py-2.5 border-t border-gray-200/60 dark:border-white/[0.06] bg-white/50 dark:bg-white/[0.02] safe-area-bottom">
        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
