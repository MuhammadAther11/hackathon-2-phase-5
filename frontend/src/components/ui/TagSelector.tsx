"use client";

import { useTags } from "@/hooks/useTags";
import { Check, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface TagSelectorProps {
  selectedTagIds?: string[];
  onChange: (tagIds: string[]) => void;
  disabled?: boolean;
}

/**
 * Multi-select tag selector for task creation/editing.
 * Displays all user tags as clickable chips.
 */
export function TagSelector({ selectedTagIds = [], onChange, disabled = false }: TagSelectorProps) {
  const { tags, isLoading } = useTags();

  const toggleTag = (tagId: string) => {
    if (disabled) return;
    
    if (selectedTagIds.includes(tagId)) {
      onChange(selectedTagIds.filter((id) => id !== tagId));
    } else {
      onChange([...selectedTagIds, tagId]);
    }
  };

  if (isLoading) {
    return (
      <div className="text-sm text-muted-foreground">
        Loading tags...
      </div>
    );
  }

  if (tags.length === 0) {
    return (
      <div className="text-sm text-muted-foreground flex items-center gap-2">
        <span>No tags yet</span>
        <span className="text-xs text-muted-foreground">
          Create tags in the Tags section above
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => {
        const isSelected = selectedTagIds.includes(tag.id);
        return (
          <button
            key={tag.id}
            type="button"
            onClick={() => toggleTag(tag.id)}
            disabled={disabled}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border",
              "hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-1",
              disabled && "opacity-50 cursor-not-allowed hover:scale-100",
              isSelected
                ? "border-transparent text-white shadow-md"
                : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
            )}
            style={isSelected ? { backgroundColor: tag.color } : {}}
          >
            {isSelected && <Check className="w-3.5 h-3.5" />}
            {!isSelected && (
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: tag.color }}
              />
            )}
            {tag.name}
          </button>
        );
      })}
    </div>
  );
}
