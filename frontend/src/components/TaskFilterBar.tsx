"use client";

import { useState, useRef, useEffect } from "react";
import { TaskFilters, TaskPriority, TaskStatus, PRIORITY_LABELS, PRIORITY_COLORS } from "@/types";
import { useTags } from "@/hooks/useTags";
import {
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Tag as TagIcon,
  X,
  ChevronDown,
  SlidersHorizontal,
  Check,
  RotateCcw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TaskFilterBarProps {
  filters: TaskFilters;
  onFiltersChange: (filters: TaskFilters) => void;
}

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const statusOptions: { value: TaskStatus | "all"; label: string; dot?: string }[] = [
  { value: "all", label: "All Status" },
  { value: "pending", label: "Pending", dot: "bg-amber-400" },
  { value: "in_progress", label: "In Progress", dot: "bg-blue-500" },
  { value: "completed", label: "Completed", dot: "bg-emerald-500" },
];

const priorityOptions: { value: TaskPriority | "all"; label: string }[] = [
  { value: "all", label: "All Priorities" },
  { value: 1, label: "Low" },
  { value: 2, label: "Medium" },
  { value: 3, label: "High" },
  { value: 4, label: "Critical" },
];

const sortOptions: { value: NonNullable<TaskFilters["sortBy"]>; label: string }[] = [
  { value: "created_at", label: "Created Date" },
  { value: "due_date", label: "Due Date" },
  { value: "priority", label: "Priority" },
  { value: "title", label: "Title" },
];

// ---------------------------------------------------------------------------
// Custom Dropdown Component
// ---------------------------------------------------------------------------

interface DropdownProps {
  value: string | number;
  options: { value: string | number; label: string; dot?: string }[];
  onChange: (value: string | number) => void;
  icon?: React.ReactNode;
  placeholder?: string;
}

function Dropdown({ value, options, onChange, icon, placeholder }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selected = options.find((o) => String(o.value) === String(value));
  const isDefault = String(value) === "all";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`
          group flex items-center gap-2 px-3 py-2 text-sm rounded-xl
          border transition-all duration-200 whitespace-nowrap
          focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40
          ${isDefault
            ? "border-border/60 bg-white/50 dark:bg-white/[0.03] text-muted-foreground hover:border-border hover:bg-white/80 dark:hover:bg-white/[0.06]"
            : "border-primary/30 bg-primary/5 dark:bg-primary/10 text-primary dark:text-primary hover:border-primary/50 hover:bg-primary/10 dark:hover:bg-primary/15"
          }
        `}
      >
        {icon && <span className="opacity-60 group-hover:opacity-100 transition-opacity">{icon}</span>}
        {selected?.dot && (
          <span className={`w-2 h-2 rounded-full ${selected.dot} shrink-0`} />
        )}
        <span className="font-medium">{selected?.label ?? placeholder}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 opacity-50 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="absolute z-[9999] top-full mt-1.5 left-0 min-w-[180px] max-w-[calc(100vw-2rem)] py-1.5 rounded-xl border border-border/80 bg-white dark:bg-[#1a1f2e] shadow-xl shadow-black/8 dark:shadow-black/30"
          >
            {options.map((opt) => {
              const isActive = String(opt.value) === String(value);
              return (
                <button
                  key={String(opt.value)}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors duration-150
                    ${isActive
                      ? "bg-primary/8 dark:bg-primary/12 text-primary font-medium"
                      : "text-foreground hover:bg-muted/60 dark:hover:bg-white/5"
                    }
                  `}
                >
                  {opt.dot && (
                    <span className={`w-2 h-2 rounded-full ${opt.dot} shrink-0`} />
                  )}
                  {!opt.dot && typeof opt.value === "number" && opt.value >= 1 && opt.value <= 4 && (
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${PRIORITY_COLORS[opt.value as TaskPriority].dot}`}
                    />
                  )}
                  <span className="flex-1 text-left">{opt.label}</span>
                  {isActive && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Active Filter Chip
// ---------------------------------------------------------------------------

function FilterChip({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <motion.span
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.15 }}
      className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 rounded-lg bg-primary/10 dark:bg-primary/15 text-primary text-xs font-medium"
    >
      {label}
      <button
        type="button"
        onClick={onClear}
        className="p-0.5 rounded-md hover:bg-primary/15 dark:hover:bg-primary/25 transition-colors"
        aria-label={`Remove ${label} filter`}
      >
        <X className="h-3 w-3" />
      </button>
    </motion.span>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function TaskFilterBar({ filters, onFiltersChange }: TaskFilterBarProps) {
  const { tags } = useTags();
  const [mobileOpen, setMobileOpen] = useState(false);
  const update = (patch: Partial<TaskFilters>) => onFiltersChange({ ...filters, ...patch });

  // Count active filters
  const activeCount = [
    filters.status && filters.status !== "all",
    filters.priority && filters.priority !== "all",
    filters.tag && filters.tag !== "all",
  ].filter(Boolean).length;

  const hasActiveFilters = activeCount > 0;

  const resetFilters = () =>
    onFiltersChange({
      sortBy: filters.sortBy,
      sortDir: filters.sortDir,
    });

  // Determine active filter labels for chips
  const activeFilterChips: { key: string; label: string; clear: () => void }[] = [];
  if (filters.status && filters.status !== "all") {
    const opt = statusOptions.find((o) => o.value === filters.status);
    if (opt) activeFilterChips.push({ key: "status", label: opt.label, clear: () => update({ status: undefined }) });
  }
  if (filters.priority && filters.priority !== "all") {
    const opt = priorityOptions.find((o) => o.value === filters.priority);
    if (opt) activeFilterChips.push({ key: "priority", label: opt.label, clear: () => update({ priority: undefined }) });
  }
  if (filters.tag && filters.tag !== "all") {
    const tag = tags.find((t) => t.id === filters.tag);
    if (tag) activeFilterChips.push({ key: "tag", label: tag.name, clear: () => update({ tag: undefined }) });
  }

  // Tag options for dropdown
  const tagOptions: { value: string | number; label: string }[] = [
    { value: "all", label: "All Tags" },
    ...tags.map((t) => ({ value: t.id, label: t.name })),
  ];

  return (
    <div className="relative space-y-2">
      {/* Main filter bar */}
      <div className="rounded-xl sm:rounded-2xl border border-border/60 bg-white/60 dark:bg-[#161b22]/75 dark:border-[#30363d]/80">
        <div className="px-3 py-2.5 sm:px-4 sm:py-3">
          {/* Desktop layout */}
          <div className="hidden md:flex items-center gap-2.5 flex-wrap">
            {/* Filter icon + label */}
            <div className="flex items-center gap-2 text-muted-foreground mr-1">
              <SlidersHorizontal className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Filters</span>
            </div>

            {/* Divider */}
            <div className="w-px h-5 bg-border/60" />

            {/* Status */}
            <Dropdown
              value={filters.status ?? "all"}
              options={statusOptions}
              onChange={(v) => update({ status: v === "all" ? undefined : (v as TaskStatus) })}
              icon={<Filter className="h-3.5 w-3.5" />}
            />

            {/* Priority */}
            <Dropdown
              value={filters.priority ?? "all"}
              options={priorityOptions}
              onChange={(v) => update({ priority: v === "all" ? undefined : (Number(v) as TaskPriority) })}
              icon={<Filter className="h-3.5 w-3.5" />}
            />

            {/* Tags */}
            {tags.length > 0 && (
              <Dropdown
                value={filters.tag ?? "all"}
                options={tagOptions}
                onChange={(v) => update({ tag: v === "all" ? undefined : String(v) })}
                icon={<TagIcon className="h-3.5 w-3.5" />}
              />
            )}

            {/* Reset */}
            <AnimatePresence>
              {hasActiveFilters && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  type="button"
                  onClick={resetFilters}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/60 dark:hover:bg-white/5 transition-colors"
                >
                  <RotateCcw className="h-3 w-3" />
                  Reset
                </motion.button>
              )}
            </AnimatePresence>

            {/* Spacer */}
            <div className="flex-1 min-w-0" />

            {/* Sort controls */}
            <div className="flex items-center gap-2 ml-auto">
              <div className="w-px h-5 bg-border/60" />
              <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
              <Dropdown
                value={filters.sortBy ?? "created_at"}
                options={sortOptions}
                onChange={(v) => update({ sortBy: v as TaskFilters["sortBy"] })}
              />
              <button
                type="button"
                onClick={() => update({ sortDir: filters.sortDir === "asc" ? "desc" : "asc" })}
                className="p-2 rounded-xl border border-border/60 bg-white/50 dark:bg-white/[0.03] text-muted-foreground hover:text-foreground hover:border-border hover:bg-white/80 dark:hover:bg-white/[0.06] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
                title={filters.sortDir === "asc" ? "Ascending" : "Descending"}
              >
                <motion.div
                  key={filters.sortDir}
                  initial={{ rotate: filters.sortDir === "asc" ? 180 : -180, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {filters.sortDir === "asc" ? (
                    <ArrowUp className="h-3.5 w-3.5" />
                  ) : (
                    <ArrowDown className="h-3.5 w-3.5" />
                  )}
                </motion.div>
              </button>
            </div>
          </div>

          {/* Mobile layout */}
          <div className="md:hidden">
            <div className="flex items-center gap-2">
              {/* Toggle filters button */}
              <button
                type="button"
                onClick={() => setMobileOpen(!mobileOpen)}
                className={`
                  flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-xl border transition-all duration-200
                  ${hasActiveFilters
                    ? "border-primary/30 bg-primary/5 text-primary"
                    : "border-border/60 bg-white/50 dark:bg-white/[0.03] text-muted-foreground"
                  }
                `}
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span>Filters</span>
                {activeCount > 0 && (
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                    {activeCount}
                  </span>
                )}
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform duration-200 ${mobileOpen ? "rotate-180" : ""}`}
                />
              </button>

              {/* Spacer */}
              <div className="flex-1" />

              {/* Sort (always visible on mobile) */}
              <div className="flex items-center gap-1.5">
                <Dropdown
                  value={filters.sortBy ?? "created_at"}
                  options={sortOptions}
                  onChange={(v) => update({ sortBy: v as TaskFilters["sortBy"] })}
                  icon={<ArrowUpDown className="h-3.5 w-3.5" />}
                />
                <button
                  type="button"
                  onClick={() => update({ sortDir: filters.sortDir === "asc" ? "desc" : "asc" })}
                  className="p-2 rounded-xl border border-border/60 bg-white/50 dark:bg-white/[0.03] text-muted-foreground hover:text-foreground transition-all duration-200"
                >
                  {filters.sortDir === "asc" ? (
                    <ArrowUp className="h-3.5 w-3.5" />
                  ) : (
                    <ArrowDown className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Mobile expanded filters */}
            <AnimatePresence>
              {mobileOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <div className="pt-3 mt-3 border-t border-border/40 space-y-3">
                    {/* Status */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-medium text-muted-foreground w-full sm:w-16 shrink-0">Status</span>
                      <div className="flex flex-wrap gap-1.5 w-full">
                        {statusOptions.map((opt) => {
                          const isActive = (filters.status ?? "all") === opt.value;
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => update({ status: opt.value === "all" ? undefined : (opt.value as TaskStatus) })}
                              className={`
                                flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-all duration-150 whitespace-nowrap
                                ${isActive
                                  ? "border-primary/40 bg-primary/10 text-primary"
                                  : "border-border/40 bg-white/30 dark:bg-white/[0.02] text-muted-foreground hover:border-border hover:text-foreground"
                                }
                              `}
                            >
                              {opt.dot && <span className={`w-1.5 h-1.5 rounded-full ${opt.dot}`} />}
                              {opt.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Priority */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-medium text-muted-foreground w-full sm:w-16 shrink-0">Priority</span>
                      <div className="flex flex-wrap gap-1.5 w-full">
                        {priorityOptions.map((opt) => {
                          const isActive = (filters.priority ?? "all") === opt.value;
                          const dotColor = typeof opt.value === "number" ? PRIORITY_COLORS[opt.value as TaskPriority]?.dot : undefined;
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => update({ priority: opt.value === "all" ? undefined : (Number(opt.value) as TaskPriority) })}
                              className={`
                                flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-all duration-150 whitespace-nowrap
                                ${isActive
                                  ? "border-primary/40 bg-primary/10 text-primary"
                                  : "border-border/40 bg-white/30 dark:bg-white/[0.02] text-muted-foreground hover:border-border hover:text-foreground"
                                }
                              `}
                            >
                              {dotColor && <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />}
                              {opt.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Tags */}
                    {tags.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-medium text-muted-foreground w-full sm:w-16 shrink-0">Tags</span>
                        <div className="flex flex-wrap gap-1.5 w-full">
                          <button
                            type="button"
                            onClick={() => update({ tag: undefined })}
                            className={`
                              px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-all duration-150 whitespace-nowrap
                              ${(!filters.tag || filters.tag === "all")
                                ? "border-primary/40 bg-primary/10 text-primary"
                                : "border-border/40 bg-white/30 dark:bg-white/[0.02] text-muted-foreground hover:border-border hover:text-foreground"
                              }
                            `}
                          >
                            All
                          </button>
                          {tags.map((tag) => {
                            const isActive = filters.tag === tag.id;
                            return (
                              <button
                                key={tag.id}
                                type="button"
                                onClick={() => update({ tag: tag.id })}
                                className={`
                                  flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-all duration-150 whitespace-nowrap
                                  ${isActive
                                    ? "border-primary/40 bg-primary/10 text-primary"
                                    : "border-border/40 bg-white/30 dark:bg-white/[0.02] text-muted-foreground hover:border-border hover:text-foreground"
                                  }
                                `}
                              >
                                <span
                                  className="w-2 h-2 rounded-full shrink-0"
                                  style={{ backgroundColor: tag.color }}
                                />
                                {tag.name}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Reset on mobile */}
                    {hasActiveFilters && (
                      <div className="flex justify-end pt-1">
                        <button
                          type="button"
                          onClick={resetFilters}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/60 transition-colors whitespace-nowrap"
                        >
                          <RotateCcw className="h-3 w-3" />
                          Reset all filters
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Active filter chips (shown below the bar on desktop) */}
      <AnimatePresence>
        {activeFilterChips.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="hidden md:flex items-center gap-2 px-1 overflow-hidden"
          >
            <span className="text-[11px] text-muted-foreground font-medium">Active:</span>
            <AnimatePresence mode="popLayout">
              {activeFilterChips.map((chip) => (
                <FilterChip key={chip.key} label={chip.label} onClear={chip.clear} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
