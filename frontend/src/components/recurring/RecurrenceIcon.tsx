'use client';

import { RecurrenceRule } from '@/types';
import { Repeat } from 'lucide-react';

interface RecurrenceIconProps {
  recurrenceRule: RecurrenceRule | null;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

/**
 * Recurrence icon showing pattern type (daily, weekly, monthly)
 */
export function RecurrenceIcon({ recurrenceRule, size = 'md', showLabel = true }: RecurrenceIconProps) {
  if (!recurrenceRule) return null;

  const { frequency, interval = 1 } = recurrenceRule;

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const getLabel = () => {
    if (interval > 1) {
      return `Every ${interval} ${frequency}${interval === 1 ? '' : 's'}`;
    }
    switch (frequency) {
      case 'daily':
        return 'Daily';
      case 'weekly':
        return 'Weekly';
      case 'monthly':
        return 'Monthly';
      case 'yearly':
        return 'Yearly';
      default:
        return 'Recurring';
    }
  };

  return (
    <span className={`inline-flex items-center gap-1.5 ${sizeClasses[size]} text-purple-600 dark:text-purple-400`}>
      <Repeat className="w-3.5 h-3.5" />
      {showLabel && <span>{getLabel()}</span>}
    </span>
  );
}
