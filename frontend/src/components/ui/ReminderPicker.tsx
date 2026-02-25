"use client";

import { useState } from "react";
import { Calendar, Bell, X, Clock } from "lucide-react";
import { motion } from "framer-motion";

interface ReminderPickerProps {
  value: string | null;
  onChange: (date: string | null) => void;
  disabled?: boolean;
  size?: "sm" | "md";
}

function getQuickTime(offset: "now" | "1_hour" | "tomorrow" | "next_week"): string {
  const d = new Date();
  if (offset === "now") {
    d.setMinutes(d.getMinutes() + 5); // 5 minutes from now
  } else if (offset === "1_hour") {
    d.setMinutes(d.getMinutes() + 60);
  } else if (offset === "tomorrow") {
    d.setDate(d.getDate() + 1);
    d.setHours(9, 0, 0, 0); // Tomorrow at 9 AM
  } else {
    d.setDate(d.getDate() + 7);
    d.setHours(9, 0, 0, 0); // Next week at 9 AM
  }
  return d.toISOString();
}

export function ReminderPicker({ value, onChange, disabled = false, size = "md" }: ReminderPickerProps) {
  const isSmall = size === "sm";

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Bell className={`absolute left-3 top-1/2 -translate-y-1/2 ${isSmall ? "h-3.5 w-3.5" : "h-4 w-4"} text-gray-400 dark:text-gray-500 pointer-events-none`} />
          <input
            type="datetime-local"
            value={value ? value.slice(0, 16) : ""}
            onChange={(e) => onChange(e.target.value ? new Date(e.target.value).toISOString() : null)}
            disabled={disabled}
            className={`
              w-full bg-white/60 dark:bg-white/5 border rounded-xl focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 hover:border-gray-300 dark:hover:border-white/20 text-gray-900 dark:text-gray-100 transition-all duration-300
              ${isSmall ? "pl-8 pr-3 py-1.5 text-xs" : "pl-10 pr-3 py-2.5 text-sm"}
              ${disabled ? "opacity-50 cursor-not-allowed" : ""}
            `}
          />
        </div>
        {value && !disabled && (
          <motion.button
            type="button"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onChange(null)}
            className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
          >
            <X className={isSmall ? "h-3.5 w-3.5" : "h-4 w-4"} />
          </motion.button>
        )}
      </div>

      {/* Quick-set pills */}
      {!isSmall && !disabled && (
        <div className="flex gap-1.5">
          {([["Now +5m", "now"], ["In 1 hour", "1_hour"], ["Tomorrow", "tomorrow"], ["Next Week", "next_week"]] as const).map(([label, offset]) => (
            <button
              key={offset}
              type="button"
              onClick={() => onChange(getQuickTime(offset))}
              className="px-2.5 py-1 text-xs rounded-lg bg-gray-100/70 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400 border border-gray-200/60 dark:border-white/10 transition-colors"
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
