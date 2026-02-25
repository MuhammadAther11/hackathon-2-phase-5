"use client";

import { X, Calendar } from "lucide-react";
import { toISODateForInput } from "@/lib/date-utils";
import { motion } from "framer-motion";

interface DueDatePickerProps {
  value: string | null;
  onChange: (date: string | null) => void;
  disabled?: boolean;
  size?: "sm" | "md";
  showOverdue?: boolean;
}

function getQuickDate(offset: "today" | "tomorrow" | "next_week"): string {
  const d = new Date();
  if (offset === "today") {
    d.setHours(23, 59, 0, 0);
  } else if (offset === "tomorrow") {
    d.setDate(d.getDate() + 1);
    d.setHours(17, 0, 0, 0);
  } else {
    d.setDate(d.getDate() + (7 - d.getDay() + 1)); // next Monday
    d.setHours(9, 0, 0, 0);
  }
  return d.toISOString();
}

export function DueDatePicker({ value, onChange, disabled = false, size = "md", showOverdue = false }: DueDatePickerProps) {
  const isSmall = size === "sm";
  const isOverdue = showOverdue && value && new Date(value) < new Date();

  return (
    <div className="space-y-1.5 sm:space-y-2">
      <div className="flex items-center gap-1.5 sm:gap-2">
        <div className="relative flex-1 min-w-0">
          <Calendar className={`absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 ${isSmall ? "h-3.5 w-3.5" : "h-4 w-4"} text-gray-400 dark:text-gray-500 pointer-events-none`} />
          <input
            type="datetime-local"
            value={value ? toISODateForInput(value) : ""}
            onChange={(e) => onChange(e.target.value ? new Date(e.target.value).toISOString() : null)}
            disabled={disabled}
            className={`
              w-full bg-white/60 dark:bg-white/5 border rounded-xl focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 hover:border-gray-300 dark:hover:border-white/20 text-gray-900 dark:text-gray-100 transition-all duration-300
              ${isSmall ? "pl-7 sm:pl-8 pr-2.5 sm:pr-3 py-1.5 text-[10px] sm:text-xs" : "pl-10 pr-3 py-2.5 text-sm"}
              ${isOverdue ? "border-red-300 dark:border-red-500/30" : "border-gray-200/80 dark:border-white/10"}
              ${disabled ? "opacity-50 cursor-not-allowed" : ""}
              truncate
            `}
          />
        </div>
        {value && !disabled && (
          <motion.button
            type="button"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onChange(null)}
            className="p-1.5 sm:p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors flex-shrink-0"
          >
            <X className={isSmall ? "h-3.5 w-3.5" : "h-4 w-4"} />
          </motion.button>
        )}
      </div>

      {/* Quick-set pills */}
      {!isSmall && !disabled && (
        <div className="flex gap-1.5 flex-wrap">
          {([["Today", "today"], ["Tomorrow", "tomorrow"], ["Next Week", "next_week"]] as const).map(([label, offset]) => (
            <button
              key={offset}
              type="button"
              onClick={() => onChange(getQuickDate(offset))}
              className="px-2.5 py-1 text-xs rounded-lg bg-gray-100/70 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400 border border-gray-200/60 dark:border-white/10 transition-colors whitespace-nowrap"
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {isOverdue && (
        <p className="text-xs text-red-500 dark:text-red-400 font-medium">Overdue</p>
      )}
    </div>
  );
}
