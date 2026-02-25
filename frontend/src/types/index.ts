// --- Priority ---
export type TaskPriority = 1 | 2 | 3 | 4;
export type TaskStatus = "pending" | "in_progress" | "completed";

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  1: "Low",
  2: "Medium",
  3: "High",
  4: "Critical",
};

export const PRIORITY_COLORS: Record<TaskPriority, { bg: string; text: string; dot: string }> = {
  1: { bg: "bg-slate-100 dark:bg-slate-500/10", text: "text-slate-600 dark:text-slate-400", dot: "bg-slate-400" },
  2: { bg: "bg-blue-100 dark:bg-blue-500/10", text: "text-blue-600 dark:text-blue-400", dot: "bg-blue-500" },
  3: { bg: "bg-amber-100 dark:bg-amber-500/10", text: "text-amber-600 dark:text-amber-400", dot: "bg-amber-500" },
  4: { bg: "bg-red-100 dark:bg-red-500/10", text: "text-red-600 dark:text-red-400", dot: "bg-red-500" },
};

// --- Recurrence ---
export interface RecurrenceRule {
  frequency: "daily" | "weekly" | "monthly" | "yearly";
  interval: number;
  days_of_week?: number[];
  day_of_month?: number;
  end_date?: string;
  end_count?: number;
}

// --- Task ---
export interface FrontendTask {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  completed?: boolean;
  user_id: string;
  priority: TaskPriority;
  due_date: string | null;
  recurrence_rule: RecurrenceRule | null;
  version: number;
  created_at: string;
  updated_at: string;
  tags?: FrontendTag[];
}

export interface TaskCreateInput {
  title: string;
  description?: string;
  priority?: TaskPriority;
  due_date?: string;
  tags?: string[];
}

export interface TaskUpdateInput {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  due_date?: string | null;
  recurrence_rule?: RecurrenceRule | null;
  tags?: string[];
}

export interface TaskFilters {
  status?: TaskStatus | "all";
  priority?: TaskPriority | "all";
  tag?: string | "all";
  sortBy?: "created_at" | "due_date" | "priority" | "title";
  sortDir?: "asc" | "desc";
}

// --- Tags ---
export interface FrontendTag {
  id: string;
  name: string;
  color: string;
  task_count: number;
}

// --- Reminders ---
export interface FrontendReminder {
  id: string;
  task_id: string;
  trigger_time: string;
  delivered: boolean;
  delivered_at: string | null;
}

// --- Search ---
export interface SearchResult {
  tasks: FrontendTask[];
  total: number;
  query: string;
}

// --- Auth ---
export interface AuthModel {
  email: string;
  password?: string;
}
