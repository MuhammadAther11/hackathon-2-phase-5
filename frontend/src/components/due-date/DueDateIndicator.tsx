'use client';

import { isOverdue, isDueSoon, formatDueDate } from '@/lib/date-utils';
import { AlertTriangle, Clock } from 'lucide-react';

interface DueDateIndicatorProps {
  dueDate: string | null;
  status?: 'pending' | 'in_progress' | 'completed';
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Due date indicator with overdue warning
 */
export function DueDateIndicator({ dueDate, status = 'pending', size = 'md' }: DueDateIndicatorProps) {
  if (!dueDate) return null;

  const overdue = isOverdue(dueDate, status);
  const dueSoonFlag = isDueSoon(dueDate, status);
  const formatted = formatDueDate(dueDate);

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 ${sizeClasses[size]} ${
        overdue
          ? 'text-red-600 dark:text-red-400 font-medium'
          : dueSoonFlag
          ? 'text-amber-600 dark:text-amber-400'
          : 'text-gray-500 dark:text-gray-400'
      }`}
      title={new Date(dueDate).toLocaleDateString()}
    >
      {overdue ? (
        <>
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Overdue</span>
        </>
      ) : dueSoonFlag ? (
        <>
          <Clock className="w-3.5 h-3.5" />
          <span>Due soon</span>
        </>
      ) : (
        <>
          <Clock className="w-3.5 h-3.5" />
          <span>{formatted}</span>
        </>
      )}
    </span>
  );
}
