"use client";

import { Search, Loader2, X, AlertCircle } from "lucide-react";
import { useRef } from "react";

interface SearchBarProps {
  query: string;
  onChange: (q: string) => void;
  isSearching?: boolean;
  isError?: boolean;
}

export function SearchBar({ query, onChange, isSearching = false, isError = false }: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClear = () => {
    onChange("");
    inputRef.current?.focus();
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search tasks by title or description..."
          value={query}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === "Escape" && handleClear()}
          className="w-full pl-9 pr-20 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground placeholder:text-muted-foreground bg-background transition-all"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {isSearching && <Loader2 className="h-4 w-4 text-primary animate-spin" />}
          {query && !isSearching && (
            <button
              onClick={handleClear}
              className="p-1 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Clear search"
              type="button"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {isError && (
        <div className="mt-2 text-xs text-red-500 dark:text-red-400 flex items-center gap-1.5 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-md border border-red-200 dark:border-red-800">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>Search unavailable. Please try again.</span>
        </div>
      )}
    </div>
  );
}
