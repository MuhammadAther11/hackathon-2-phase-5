'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Send, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  className?: string;
}

export function ChatInput({
  onSendMessage,
  isLoading = false,
  className
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [focused, setFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  }, [message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const canSend = message.trim() && !isLoading;

  return (
    <form onSubmit={handleSubmit} className={cn('flex items-end gap-2.5', className)}>
      <div className="flex-1 relative group">
        <div className={`absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 blur-sm transition-opacity duration-300 ${focused ? 'opacity-30' : 'group-hover:opacity-15'}`} />
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          disabled={isLoading}
          placeholder="Type a message... (Enter to send)"
          rows={1}
          className="relative w-full px-4 py-3 bg-white/60 dark:bg-white/5 border border-gray-200/80 dark:border-white/10 rounded-xl text-gray-900 dark:text-gray-100 text-sm resize-none focus:outline-none focus:bg-white dark:focus:bg-white/10 focus:border-indigo-400 dark:focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:focus:ring-indigo-400/10 placeholder:text-gray-400 dark:placeholder:text-gray-500 disabled:opacity-50 transition-all duration-300"
          aria-label="Type your message"
        />
      </div>
      <motion.button
        type="submit"
        disabled={!canSend}
        whileHover={canSend ? { scale: 1.05 } : undefined}
        whileTap={canSend ? { scale: 0.95 } : undefined}
        className={cn(
          'flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300',
          canSend
            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30'
            : 'bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-gray-600 cursor-not-allowed'
        )}
        aria-label="Send message"
      >
        {isLoading ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <Send size={18} />
        )}
      </motion.button>
    </form>
  );
}
