'use client';

import { TaskPriority, PRIORITY_LABELS, PRIORITY_COLORS } from '@/types';
import { motion } from 'framer-motion';

interface PriorityBadgeProps {
  priority: TaskPriority;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

/**
 * Priority badge with color coding
 * LOW=blue, MEDIUM=yellow, HIGH=orange, CRITICAL=red
 */
export function PriorityBadge({ priority, size = 'md', showLabel = true }: PriorityBadgeProps) {
  const colors = PRIORITY_COLORS[priority];
  const label = PRIORITY_LABELS[priority];
  
  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-xs',
    md: 'px-2 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };

  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${colors.bg} ${colors.text} ${sizeClasses[size]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
      {showLabel && label}
    </motion.span>
  );
}
