"use client";

import { TaskPriority, PRIORITY_LABELS, PRIORITY_COLORS } from "@/types";
import { motion } from "framer-motion";

interface PrioritySelectorProps {
  value: TaskPriority;
  onChange: (priority: TaskPriority) => void;
  disabled?: boolean;
  size?: "sm" | "md";
}

const priorities: TaskPriority[] = [1, 2, 3, 4];

export function PrioritySelector({ value, onChange, disabled = false, size = "md" }: PrioritySelectorProps) {
  const isSmall = size === "sm";

  return (
    <div className="flex gap-1 flex-wrap">
      {priorities.map((p) => {
        const colors = PRIORITY_COLORS[p];
        const isActive = value === p;
        return (
          <motion.button
            key={p}
            type="button"
            whileHover={!disabled ? { scale: 1.05 } : undefined}
            whileTap={!disabled ? { scale: 0.95 } : undefined}
            onClick={() => !disabled && onChange(p)}
            disabled={disabled}
            className={`
              flex items-center gap-1.5 rounded-xl font-medium transition-all duration-200 border
              ${isSmall ? "px-2 py-1 sm:px-2.5 sm:py-1.5 text-[10px] sm:text-xs" : "px-3 py-2 text-sm"}
              ${isActive
                ? `${colors.bg} ${colors.text} border-current/30 shadow-sm`
                : "bg-white/60 dark:bg-white/5 text-gray-500 dark:text-gray-400 border-gray-200/80 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20"
              }
              ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
              flex-shrink-0
            `}
          >
            <span className={`rounded-full ${isSmall ? "w-1.5 h-1.5 sm:w-2 sm:h-2" : "w-2.5 h-2.5"} ${isActive ? colors.dot : "bg-gray-300 dark:bg-gray-600"}`} />
            {isSmall ? PRIORITY_LABELS[p].charAt(0) : PRIORITY_LABELS[p]}
          </motion.button>
        );
      })}
    </div>
  );
}
