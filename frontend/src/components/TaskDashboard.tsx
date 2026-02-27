"use client";

import { useState } from "react";
import { useTasks } from "@/hooks/useTasks";
import { useSearch } from "@/hooks/useSearch";
import { TaskItem } from "./TaskItem";
import { TaskFilterBar } from "./TaskFilterBar";
import { PrioritySelector } from "./ui/PrioritySelector";
import { DueDatePicker } from "./ui/DueDatePicker";
import { SearchBar } from "./SearchBar";
import { TagManager } from "./TagManager";
import { TagSelector } from "./ui/TagSelector";
import { Plus, Loader2, ListChecks, Sparkles, Tag, Calendar, Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { TaskFilters, TaskPriority, TaskUpdateInput } from "@/types";

export function TaskDashboard() {
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newPriority, setNewPriority] = useState<TaskPriority>(2);
  const [newDueDate, setNewDueDate] = useState<string | null>(null);
  const [newTags, setNewTags] = useState<string[]>([]);
  const [filters, setFilters] = useState<TaskFilters>({ sortBy: "created_at", sortDir: "desc" });

  const { tasks, isLoading, createTask, updateTask, deleteTask, toggleTask } = useTasks(filters);

  // Search — owned here so results can replace the task list
  const { query, setQuery, results, total, isSearching, isError } = useSearch();
  const isSearchActive = query.length >= 1;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    await createTask.mutateAsync({
      title: newTitle.trim(),
      description: newDescription.trim() || undefined,
      priority: newPriority,
      due_date: newDueDate || undefined,
      tags: newTags.length > 0 ? newTags : undefined,
    });
    setNewTitle("");
    setNewDescription("");
    setNewPriority(2);
    setNewDueDate(null);
    setNewTags([]);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
          <Loader2 className="h-6 w-6 text-primary animate-spin" />
        </div>
        <p className="text-muted-foreground font-medium">Loading your tasks...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Create task form */}
      <form onSubmit={handleCreate} className="border rounded-lg p-4 space-y-4 bg-card">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-display font-semibold text-foreground">New Task</span>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2 font-display">
            Title
          </label>
          <input
            type="text"
            placeholder="What needs to be done?"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground placeholder:text-muted-foreground"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            disabled={createTask.isPending}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2 font-display">
            Description <span className="text-muted-foreground font-normal">(optional)</span>
          </label>
          <textarea
            placeholder="Add more details..."
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground placeholder:text-muted-foreground resize-none"
            rows={3}
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            disabled={createTask.isPending}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
              <Tag className="w-4 h-4 text-blue-500" />
              Priority
            </label>
            <PrioritySelector value={newPriority} onChange={setNewPriority} disabled={createTask.isPending} size="sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-500" />
              Due Date <span className="text-muted-foreground font-normal text-xs">(optional)</span>
            </label>
            <DueDatePicker value={newDueDate} onChange={setNewDueDate} disabled={createTask.isPending} size="sm" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
            <Tag className="w-4 h-4 text-purple-500" />
            Tags <span className="text-muted-foreground font-normal text-xs">(optional)</span>
          </label>
          <TagSelector
            selectedTagIds={newTags}
            onChange={setNewTags}
            disabled={createTask.isPending}
          />
        </div>

        <button
          type="submit"
          disabled={createTask.isPending || !newTitle.trim()}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-display font-medium"
        >
          {createTask.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Creating...</span>
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" />
              <span>Add Task</span>
            </>
          )}
        </button>
      </form>

      {/* Tags Manager */}
      <div className="border rounded-lg p-4 bg-card">
        <TagManager />
      </div>

      {/* Search bar */}
      <SearchBar
        query={query}
        onChange={setQuery}
        isSearching={isSearching}
        isError={isError}
      />

      {/* Filter bar — hidden while search is active */}
      <AnimatePresence>
        {!isSearchActive && (
          <motion.div
            key="filter-bar"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <TaskFilterBar filters={filters} onFiltersChange={setFilters} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── SEARCH RESULTS or TASK LIST ── */}
      <AnimatePresence mode="wait">
        {isSearchActive ? (
          /* ── Search results panel ── */
          <motion.div
            key="search-results"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            {/* Search header */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Search className="h-4 w-4" />
                {isSearching ? (
                  <span>Searching...</span>
                ) : (
                  <span>
                    <span className="font-semibold text-foreground">{total}</span>{" "}
                    result{total !== 1 ? "s" : ""} for{" "}
                    <span className="font-semibold text-foreground">&ldquo;{query}&rdquo;</span>
                  </span>
                )}
              </div>
              <button
                onClick={() => setQuery("")}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                type="button"
              >
                <X className="h-3.5 w-3.5" />
                Clear search
              </button>
            </div>

            {/* Searching spinner */}
            {isSearching && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 text-primary animate-spin" />
              </div>
            )}

            {/* Results as full TaskItem components */}
            {!isSearching && results.length > 0 && (
              <AnimatePresence mode="popLayout">
                {results.map((task) => (
                  <motion.div
                    key={task.id}
                    layout
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.2 }}
                  >
                    <TaskItem
                      task={task}
                      onToggle={(id) => toggleTask.mutate(id)}
                      onDelete={(id) => deleteTask.mutate(id)}
                      onUpdate={(id, upd) => updateTask.mutate({ id, ...upd })}
                      isUpdating={updateTask.isPending}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            )}

            {/* No results */}
            {!isSearching && results.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16 border rounded-lg border-dashed border-border bg-card"
              >
                <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                  <Search className="h-7 w-7 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-display font-semibold text-foreground">No tasks found</h3>
                <p className="mt-1.5 text-sm text-muted-foreground max-w-xs mx-auto">
                  No tasks match &ldquo;{query}&rdquo;. Try different keywords.
                </p>
                <button
                  onClick={() => setQuery("")}
                  className="mt-4 text-sm text-primary hover:underline"
                  type="button"
                >
                  Clear search
                </button>
              </motion.div>
            )}
          </motion.div>
        ) : (
          /* ── Normal task list ── */
          <motion.div
            key="task-list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="space-y-3"
          >
            <AnimatePresence mode="popLayout">
              {tasks && tasks.length > 0 ? (
                tasks.map((task) => (
                  <motion.div
                    key={task.id}
                    layout
                    initial={{ opacity: 0, y: 10, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <TaskItem
                      task={task}
                      onToggle={(id) => toggleTask.mutate(id)}
                      onDelete={(id) => deleteTask.mutate(id)}
                      onUpdate={(id, updates) => updateTask.mutate({ id, ...updates })}
                      isUpdating={updateTask.isPending}
                    />
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-16 border rounded-lg border-dashed border-border bg-card"
                >
                  <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                    <ListChecks className="h-7 w-7 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-display font-semibold text-foreground">No tasks yet</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground max-w-xs mx-auto">
                    Create your first task above to get started on your productivity journey.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
