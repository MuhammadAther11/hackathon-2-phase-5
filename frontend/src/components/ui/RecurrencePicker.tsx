"use client";

import { useState } from "react";
import { RecurrenceRule } from "@/types";
import { describeRecurrence } from "@/lib/recurrence-utils";
import { Repeat, Calendar, X } from "lucide-react";
import { motion } from "framer-motion";

const FREQUENCY_OPTIONS = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

const DAYS_OF_WEEK = [
  { value: 0, label: "Su" },
  { value: 1, label: "Mo" },
  { value: 2, label: "Tu" },
  { value: 3, label: "We" },
  { value: 4, label: "Th" },
  { value: 5, label: "Fr" },
  { value: 6, label: "Sa" },
];

interface RecurrencePickerProps {
  value: RecurrenceRule | null;
  onChange: (rule: RecurrenceRule | null) => void;
  disabled?: boolean;
}

export function RecurrencePicker({ value, onChange, disabled = false }: RecurrencePickerProps) {
  const [expanded, setExpanded] = useState(false);

  const handleChange = (updates: Partial<RecurrenceRule>) => {
    const newValue: RecurrenceRule = value ? { ...value, ...updates } : {
      frequency: "weekly" as const,
      interval: 1,
      ...updates
    };
    onChange(newValue);
  };

  const handleClear = () => {
    onChange(null);
    setExpanded(false);
  };

  const handleDayToggle = (day: number) => {
    const days = value?.days_of_week ? [...value.days_of_week] : [];
    const index = days.indexOf(day);
    if (index > -1) {
      days.splice(index, 1);
    } else {
      days.push(day);
    }
    handleChange({ days_of_week: days });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Repeat className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
          <select
            value={value?.frequency || ""}
            onChange={(e) => handleChange({ frequency: e.target.value as any })}
            disabled={disabled}
            className={`
              w-full bg-white/60 dark:bg-white/5 border rounded-xl focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 hover:border-gray-300 dark:hover:border-white/20 text-gray-900 dark:text-gray-100 transition-all duration-300
              pl-10 pr-3 py-2.5 text-sm
              ${disabled ? "opacity-50 cursor-not-allowed" : ""}
            `}
          >
            <option value="">No recurrence</option>
            {FREQUENCY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        {value && !disabled && (
          <motion.button
            type="button"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleClear}
            className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
          >
            <X className="h-4 w-4" />
          </motion.button>
        )}
      </div>

      {value && (
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {describeRecurrence(value)}
        </div>
      )}

      {value && expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="overflow-hidden pt-3 space-y-3 border-t border-gray-100 dark:border-white/10"
        >
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Interval
            </label>
            <input
              type="number"
              min="1"
              value={value.interval || 1}
              onChange={(e) => handleChange({ interval: parseInt(e.target.value) || 1 })}
              disabled={disabled}
              className="w-full px-3 py-1.5 text-sm bg-white/60 dark:bg-white/5 border border-gray-200/80 dark:border-white/10 rounded-lg focus:outline-none focus:border-indigo-400 text-gray-900 dark:text-gray-100"
            />
          </div>

          {value.frequency === "weekly" && (
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Days of week
              </label>
              <div className="flex gap-1">
                {DAYS_OF_WEEK.map((day) => (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => handleDayToggle(day.value)}
                    className={`px-2 py-1 text-xs rounded ${
                      (value.days_of_week || []).includes(day.value)
                        ? "bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20"
                        : "bg-white/60 dark:bg-white/5 text-gray-500 dark:text-gray-400 border border-gray-200/60 dark:border-white/10"
                    }`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {value.frequency === "monthly" && (
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Day of month
              </label>
              <input
                type="number"
                min="1"
                max="31"
                value={value.day_of_month || 1}
                onChange={(e) => handleChange({ day_of_month: parseInt(e.target.value) || 1 })}
                disabled={disabled}
                className="w-full px-3 py-1.5 text-sm bg-white/60 dark:bg-white/5 border border-gray-200/80 dark:border-white/10 rounded-lg focus:outline-none focus:border-indigo-400 text-gray-900 dark:text-gray-100"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              End condition
            </label>
            <div className="flex gap-2">
              <input
                type="date"
                value={value.end_date || ""}
                onChange={(e) => handleChange({ end_date: e.target.value || undefined })}
                disabled={disabled}
                className="flex-1 px-3 py-1.5 text-sm bg-white/60 dark:bg-white/5 border border-gray-200/80 dark:border-white/10 rounded-lg focus:outline-none focus:border-indigo-400 text-gray-900 dark:text-gray-100"
              />
              <span className="self-center text-gray-400 dark:text-gray-500 text-sm">OR</span>
              <input
                type="number"
                placeholder="Count"
                min="1"
                value={value.end_count || ""}
                onChange={(e) => handleChange({ end_count: e.target.value ? parseInt(e.target.value) : undefined })}
                disabled={disabled}
                className="flex-1 px-3 py-1.5 text-sm bg-white/60 dark:bg-white/5 border border-gray-200/80 dark:border-white/10 rounded-lg focus:outline-none focus:border-indigo-400 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>
        </motion.div>
      )}

      {value && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-indigo-500 dark:text-indigo-400 hover:underline"
        >
          {expanded ? "Hide options" : "Show options"}
        </button>
      )}
    </div>
  );
}
