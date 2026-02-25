"use client";

import { useState } from "react";
import { FrontendTask, TaskUpdateInput, TaskPriority, PRIORITY_LABELS, PRIORITY_COLORS, RecurrenceRule } from "@/types";
import { CheckCircle2, Circle, Trash2, Clock, Edit2, Save, X, AlertTriangle, Repeat, ChevronDown, ChevronRight, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { PrioritySelector } from "./ui/PrioritySelector";
import { DueDatePicker } from "./ui/DueDatePicker";
import { RecurrencePicker } from "./ui/RecurrencePicker";
import { ReminderPicker } from "./ui/ReminderPicker";
import { describeRecurrence } from "@/lib/recurrence-utils";
import { isOverdue, isDueSoon, formatDueDate } from "@/lib/date-utils";

interface TaskItemProps {
  task: FrontendTask;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: TaskUpdateInput) => void;
  isUpdating?: boolean;
}

export function TaskItem({ task, onToggle, onDelete, onUpdate, isUpdating = false }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description || "");
  const [editPriority, setEditPriority] = useState<TaskPriority>(task.priority ?? 2);
  const [editDueDate, setEditDueDate] = useState<string | null>(task.due_date);

  const handleSave = () => {
    if (editTitle.trim()) {
      onUpdate(task.id, {
        title: editTitle.trim(),
        description: editDescription.trim() || undefined,
        priority: editPriority,
        due_date: editDueDate,
      });
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditTitle(task.title);
    setEditDescription(task.description || "");
    setEditPriority(task.priority ?? 2);
    setEditDueDate(task.due_date);
    setIsEditing(false);
  };

  const isCompleted = task.status === "completed" || task.completed;
  const overdue = isOverdue(task.due_date, task.status);
  const dueSoon = isDueSoon(task.due_date, task.status);
  const priorityColors = PRIORITY_COLORS[(task.priority ?? 2) as TaskPriority];

  if (isEditing) {
    return (
      <div className="border rounded-lg p-4 space-y-3 bg-card">
        <input
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground placeholder:text-muted-foreground"
          placeholder="Task title"
          disabled={isUpdating}
        />
        <textarea
          value={editDescription}
          onChange={(e) => setEditDescription(e.target.value)}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground placeholder:text-muted-foreground resize-none"
          placeholder="Description (optional)"
          rows={2}
          disabled={isUpdating}
        />
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              Priority
            </label>
            <PrioritySelector value={editPriority} onChange={setEditPriority} disabled={isUpdating} size="sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
              Due Date
            </label>
            <DueDatePicker value={editDueDate} onChange={setEditDueDate} disabled={isUpdating} size="sm" />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={handleCancel}
            disabled={isUpdating}
            className="px-3 py-1.5 text-sm rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground disabled:opacity-50 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
          <button
            onClick={handleSave}
            disabled={isUpdating || !editTitle.trim()}
            className="px-3 py-1.5 text-sm rounded-md bg-primary text-primary-foreground disabled:opacity-50 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row sm:items-start gap-3 bg-card">
      {/* Checkbox - always on top left for mobile, left for desktop */}
      <button
        onClick={() => onToggle(task.id)}
        className="focus:outline-none flex-shrink-0 self-start sm:mt-0.5"
        aria-label={isCompleted ? "Mark as incomplete" : "Mark as complete"}
      >
        {isCompleted ? (
          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
        ) : (
          <Circle className="h-5 w-5 text-muted-foreground" />
        )}
      </button>

      {/* Content area */}
      <div className="flex-1 min-w-0">
        {/* Title row */}
        <p className={`text-sm font-medium break-words ${
          isCompleted
            ? "text-muted-foreground line-through"
            : "text-foreground"
        }`}>
          {task.title}
        </p>

        {/* Description */}
        {task.description && (
          <p className={`text-xs mt-1.5 line-clamp-2 ${
            isCompleted
              ? "text-muted-foreground"
              : "text-muted-foreground"
          }`}>
            {task.description}
          </p>
        )}

        {/* Badges row - Priority, Due Date, Tags - with proper wrapping */}
        <div className="flex flex-wrap items-center gap-2 mt-2.5">
          {/* Priority badge */}
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${priorityColors.bg} ${priorityColors.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${priorityColors.dot}`} />
            {PRIORITY_LABELS[(task.priority ?? 2) as TaskPriority]}
          </span>

          {/* Due date badge */}
          {task.due_date && (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
              overdue
                ? "bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400"
                : dueSoon
                  ? "bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  : "bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
            }`}>
              <Clock className="w-3 h-3 flex-shrink-0" />
              <span className="truncate max-w-[150px] sm:max-w-none">{formatDueDate(task.due_date)}</span>
              {overdue && <AlertTriangle className="w-2.5 h-2.5 flex-shrink-0" />}
            </span>
          )}

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap">
              {task.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap"
                  style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
                >
                  <span className="w-1.5 h-1.5 rounded-full mr-1" style={{ backgroundColor: tag.color }} />
                  {tag.name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Meta info row */}
        <div className="flex items-center gap-3 mt-2.5 text-xs text-muted-foreground flex-wrap">
          <span className="flex items-center whitespace-nowrap">
            <Clock className="h-3 w-3 mr-1" />
            Created {new Date(task.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Action buttons - right side, stacked on mobile */}
      <div className="flex items-center gap-1 sm:ml-3 flex-shrink-0 self-end sm:self-auto">
        <button
          onClick={() => setIsEditing(true)}
          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          title="Edit task"
          aria-label="Edit task"
        >
          <Edit2 className="h-4 w-4" />
        </button>
        <button
          onClick={() => onDelete(task.id)}
          className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          title="Delete task"
          aria-label="Delete task"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
