"use client";

import { X } from "lucide-react";

interface TagChipProps {
  name: string;
  color: string;
  onRemove?: () => void;
  size?: "sm" | "md";
}

export function TagChip({ name, color, onRemove, size = "sm" }: TagChipProps) {
  const isSmall = size === "sm";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border font-medium ${
        isSmall ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs"
      }`}
      style={{
        backgroundColor: `${color}18`,
        borderColor: `${color}40`,
        color: color,
      }}
    >
      <span
        className={`rounded-full ${isSmall ? "w-1.5 h-1.5" : "w-2 h-2"}`}
        style={{ backgroundColor: color }}
      />
      {name}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 p-0.5 transition-colors"
        >
          <X className={isSmall ? "h-2.5 w-2.5" : "h-3 w-3"} />
        </button>
      )}
    </span>
  );
}
