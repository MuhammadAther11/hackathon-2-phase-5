"use client";

import { useSearch } from "@/hooks/useSearch";
import { Search, Loader2, X, AlertCircle } from "lucide-react";
import { PRIORITY_LABELS, PRIORITY_COLORS, TaskPriority } from "@/types";
import { formatDueDate } from "@/lib/date-utils";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SearchBarProps {
  onSelectTask?: (taskId: string) => void;
}

export function SearchBar({ onSelectTask }: SearchBarProps) {
  const { query, setQuery, results, total, isSearching, isError, error } = useSearch();
  const [isFocused, setIsFocused] = useState(false);
  const [shownError, setShownError] = useState<string | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const showDropdown = isFocused && query.length >= 1;

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search tasks by title or description..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          className="w-full pl-9 pr-8 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground placeholder:text-muted-foreground"
        />
        {query && (
          <button
            onClick={() => { setQuery(""); setIsFocused(false); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded text-muted-foreground hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        {isSearching && (
          <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-primary animate-spin" />
        )}
      </div>

      {/* Show error message if search fails */}
      {isError && error && (
        <div className="mt-2 text-xs text-red-500 dark:text-red-400 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          <span>Search unavailable</span>
        </div>
      )}

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute z-50 top-full mt-2 w-full border rounded-md shadow-lg bg-popover text-popover-foreground max-h-80 overflow-y-auto"
          >
            {isSearching ? (
              <div className="flex items-center justify-center gap-2 px-4 py-8 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Searching...</span>
              </div>
            ) : results.length > 0 ? (
              <>
                <div className="px-3 py-2 text-xs text-muted-foreground border-b bg-muted/50">
                  {total} result{total !== 1 ? "s" : ""} for &ldquo;{query}&rdquo;
                </div>
                {results.map((task) => {
                  const pColors = PRIORITY_COLORS[(task.priority ?? 2) as TaskPriority];
                  return (
                    <button
                      key={task.id}
                      onClick={() => {
                        onSelectTask?.(task.id);
                        setIsFocused(false);
                      }}
                      className="w-full text-left px-3 py-2.5 hover:bg-accent hover:text-accent-foreground transition-colors border-b border-border last:border-0"
                    >
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-sm font-medium truncate ${task.status === "completed" ? "line-through text-muted-foreground" : "text-foreground"}`}>
                          {task.title}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium ${pColors.bg} ${pColors.text}`}>
                          <span className={`w-1 h-1 rounded-full ${pColors.dot}`} />
                          {PRIORITY_LABELS[(task.priority ?? 2) as TaskPriority]}
                        </span>
                      </div>
                      {task.description && (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">{task.description}</p>
                      )}
                      {task.due_date && (
                        <p className="text-[10px] text-muted-foreground mt-0.5">{formatDueDate(task.due_date)}</p>
                      )}
                    </button>
                  );
                })}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 px-4 py-8 text-center">
                <AlertCircle className="h-5 w-5 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  No tasks found for &ldquo;{query}&rdquo;
                </p>
                <p className="text-xs text-muted-foreground">
                  Try searching with different keywords
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
