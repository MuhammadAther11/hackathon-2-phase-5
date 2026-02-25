import type { TaskStatus } from "@/types";

/**
 * Check if a task is past due and not completed.
 */
export function isOverdue(due_date: string | null, status: TaskStatus): boolean {
  if (!due_date || status === "completed") return false;
  return new Date(due_date) < new Date();
}

/**
 * Check if a task is due within N hours (default 24) and not completed.
 */
export function isDueSoon(due_date: string | null, status: TaskStatus, hours = 24): boolean {
  if (!due_date || status === "completed") return false;
  const due = new Date(due_date);
  const now = new Date();
  if (due < now) return false; // Already overdue, not "due soon"
  const diff = due.getTime() - now.getTime();
  return diff <= hours * 60 * 60 * 1000;
}

/**
 * Format a due date into a human-readable relative string.
 */
export function formatDueDate(due_date: string | null): string {
  if (!due_date) return "";
  const due = new Date(due_date);
  const now = new Date();
  const diffMs = due.getTime() - now.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    // Check if it's today
    const dueDay = due.toDateString();
    const today = now.toDateString();
    if (dueDay === today) return "Today";
    return diffMs > 0 ? "Tomorrow" : "Yesterday";
  }
  if (diffDays === 1) return "Tomorrow";
  if (diffDays === -1) return "Yesterday";
  if (diffDays > 1 && diffDays <= 7) return `In ${diffDays} days`;
  if (diffDays < -1 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`;

  return due.toLocaleDateString(undefined, { month: "short", day: "numeric", year: due.getFullYear() !== now.getFullYear() ? "numeric" : undefined });
}

/**
 * Convert a date string to the format needed for datetime-local inputs.
 */
export function toISODateForInput(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  // datetime-local requires YYYY-MM-DDTHH:mm format (no seconds, no timezone)
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
