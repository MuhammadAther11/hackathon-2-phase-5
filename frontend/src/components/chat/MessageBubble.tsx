'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Bot, User } from 'lucide-react';

interface MessageBubbleProps {
  text: string;
  sender: 'user' | 'agent';
  timestamp?: string;
  className?: string;
}

export function MessageBubble({
  text,
  sender,
  timestamp,
  className
}: MessageBubbleProps) {
  const isUser = sender === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'flex gap-3 mb-5',
        { 'flex-row-reverse': isUser },
        className
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center mt-1 shadow-md',
          isUser
            ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-indigo-500/20'
            : 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-emerald-500/20'
        )}
      >
        {isUser ? <User size={14} /> : <Bot size={14} />}
      </div>

      {/* Bubble */}
      <div className={cn('max-w-[85%] sm:max-w-[75%] space-y-1')}>
        <div
          className={cn(
            'px-4 py-3 text-sm leading-relaxed',
            isUser
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl rounded-tr-md shadow-lg shadow-indigo-500/15'
              : 'glass-card text-gray-800 dark:text-gray-200 rounded-2xl rounded-tl-md'
          )}
        >
          <div className="whitespace-pre-wrap break-words">
            {renderFormattedText(text)}
          </div>
        </div>

        {/* Timestamp */}
        {timestamp && (
          <p className={cn(
            'text-[11px] text-gray-400 dark:text-gray-500 px-1',
            isUser ? 'text-right' : 'text-left'
          )}>
            {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>
    </motion.div>
  );
}

/**
 * Render text with basic formatting:
 * - Lines starting with a number + dot become styled list items
 * - Checkmark/circle symbols get colored
 */
function renderFormattedText(text: string) {
  const lines = text.split('\n');

  return lines.map((line, i) => {
    // Task list item: "1. checkmark Task title" or "1. circle Task title"
    const taskMatch = line.match(/^(\d+)\.\s*(\u2713|\u25CB)\s*(.*)$/);
    if (taskMatch) {
      const [, num, icon, title] = taskMatch;
      const isComplete = icon === '\u2713';
      return (
        <div key={i} className="flex items-start gap-2 py-0.5">
          <span className="text-xs font-mono min-w-[1.2rem] text-right opacity-50">{num}.</span>
          <span className={isComplete ? 'text-emerald-400' : 'opacity-50'}>{icon}</span>
          <span className={isComplete ? 'line-through opacity-60' : ''}>{title}</span>
        </div>
      );
    }

    // Lines starting with "- " become bullet points
    if (line.startsWith('- ')) {
      return (
        <div key={i} className="flex items-start gap-2 py-0.5 pl-1">
          <span className="mt-2 w-1 h-1 rounded-full bg-current opacity-40 flex-shrink-0" />
          <span>{line.slice(2)}</span>
        </div>
      );
    }

    // Lines starting with checkmark get green styling
    if (line.startsWith('\u2713')) {
      return (
        <div key={i} className="flex items-center gap-1.5 py-0.5 text-emerald-400 font-medium">
          {line}
        </div>
      );
    }

    // Empty lines
    if (line.trim() === '') {
      return <div key={i} className="h-2" />;
    }

    // Normal text
    return <span key={i}>{line}{i < lines.length - 1 ? '\n' : ''}</span>;
  });
}
