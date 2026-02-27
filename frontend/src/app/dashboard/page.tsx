"use client";

import { useState, useMemo } from "react";
import { TaskDashboard } from "@/components/TaskDashboard";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useTasks } from "@/hooks/useTasks";
import { useSession } from "@/lib/auth-client";
import { isOverdue, isDueSoon, formatDueDate } from "@/lib/date-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { PriorityBadge } from "@/components/priority/PriorityBadge";
import { CreateTaskModal } from "@/components/CreateTaskModal";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ListChecks,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Plus,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  CalendarDays,
  ArrowRight,
} from "lucide-react";
import type { FrontendTask } from "@/types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Return a time-of-day greeting based on the current hour. */
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

/** Format today's date as "Saturday, February 22, 2026". */
function formatTodayDate(): string {
  return new Date().toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** Check whether a task is due within the next 7 days (and not overdue). */
function isDueThisWeek(task: FrontendTask): boolean {
  if (!task.due_date || task.status === "completed") return false;
  const due = new Date(task.due_date);
  const now = new Date();
  if (due < now) return false; // overdue, not "this week"
  const diffMs = due.getTime() - now.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays <= 7;
}

// ---------------------------------------------------------------------------
// Circular Progress Ring
// ---------------------------------------------------------------------------

interface CircularProgressProps {
  /** Percentage from 0 to 100 */
  percentage: number;
  /** Diameter in pixels */
  size?: number;
  /** Stroke width in pixels */
  strokeWidth?: number;
}

function CircularProgress({
  percentage,
  size = 56,
  strokeWidth = 5,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/50"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#progress-gradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
        <defs>
          <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-foreground">
        {percentage}%
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stat Card Definition
// ---------------------------------------------------------------------------

interface StatDef {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  borderColor: string;
  trend: "up" | "down" | "neutral";
}

// ---------------------------------------------------------------------------
// Framer-motion variants
// ---------------------------------------------------------------------------

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const } },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } },
};

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function DashboardPage() {
  const { allTasks: tasks } = useTasks();
  const { data: session, isLoading } = useSession();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Show loading state while session is being loaded
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-200 dark:border-indigo-900 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!session) {
    window.location.href = "/login";
    return null;
  }

  // ------ Derived stats ------
  const totalTasks = tasks?.length ?? 0;
  const completedTasks =
    tasks?.filter((t) => t.status === "completed" || t.completed).length ?? 0;
  const inProgressTasks = totalTasks - completedTasks;
  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const overdueTasks =
    tasks?.filter((t) => isOverdue(t.due_date, t.status)).length ?? 0;

  // ------ Due today / due this week ------
  const dueTodayList = useMemo(
    () =>
      (tasks ?? []).filter(
        (t) => t.status !== "completed" && isDueSoon(t.due_date, t.status, 24),
      ),
    [tasks],
  );

  const dueThisWeekList = useMemo(
    () =>
      (tasks ?? [])
        .filter(
          (t) =>
            t.status !== "completed" &&
            isDueThisWeek(t) &&
            !isDueSoon(t.due_date, t.status, 24), // exclude "due today" items
        )
        .sort(
          (a, b) =>
            new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime(),
        ),
    [tasks],
  );

  // ------ Stat cards definition ------
  const stats: StatDef[] = [
    {
      label: "Total Tasks",
      value: totalTasks,
      icon: ListChecks,
      iconBg: "bg-indigo-100 dark:bg-indigo-500/15",
      iconColor: "text-indigo-600 dark:text-indigo-400",
      borderColor: "border-l-indigo-500",
      trend: "neutral",
    },
    {
      label: "Completed",
      value: completedTasks,
      icon: CheckCircle2,
      iconBg: "bg-emerald-100 dark:bg-emerald-500/15",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      borderColor: "border-l-emerald-500",
      trend: completedTasks > 0 ? "up" : "neutral",
    },
    {
      label: "In Progress",
      value: inProgressTasks,
      icon: Clock,
      iconBg: "bg-blue-100 dark:bg-blue-500/15",
      iconColor: "text-blue-600 dark:text-blue-400",
      borderColor: "border-l-blue-500",
      trend: inProgressTasks > 0 ? "up" : "neutral",
    },
    {
      label: "Overdue",
      value: overdueTasks,
      icon: AlertTriangle,
      iconBg: "bg-red-100 dark:bg-red-500/15",
      iconColor: "text-red-600 dark:text-red-400",
      borderColor: "border-l-red-500",
      trend: overdueTasks > 0 ? "down" : "neutral",
    },
  ];

  // ------ Extract first name from email ------
  const userName = session?.user?.email
    ? session.user.email.split("@")[0]
    : "there";

  return (
    <DashboardLayout>
      {/* ================================================================= */}
      {/*  HEADER SECTION                                                   */}
      {/* ================================================================= */}
      <motion.section
        initial="hidden"
        animate="show"
        variants={sectionVariants}
        className="mb-8"
      >
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          {/* Left: greeting + date */}
          <div className="min-w-0">
            <h1 className="text-2xl font-display font-bold tracking-tight text-foreground sm:text-3xl">
              {getGreeting()},{" "}
              <span className="gradient-text">{userName}</span>
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {formatTodayDate()}
            </p>
          </div>

          {/* Right: progress ring + quick actions */}
          <div className="flex items-center gap-4">
            {/* Circular completion ring */}
            {totalTasks > 0 && (
              <div className="flex items-center gap-3">
                <CircularProgress percentage={completionRate} />
                <div className="hidden sm:block">
                  <p className="text-xs text-muted-foreground leading-tight">
                    Completion
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {completedTasks}/{totalTasks} tasks
                  </p>
                </div>
              </div>
            )}

            {/* Divider (desktop only) */}
            {totalTasks > 0 && (
              <div className="hidden sm:block h-10 w-px bg-border" />
            )}

            {/* Quick action buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium",
                  "bg-primary text-primary-foreground shadow-sm",
                  "hover:bg-primary/90 transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                )}
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">New Task</span>
              </button>

              <Link
                href="/chat"
                className={cn(
                  "inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium",
                  "border border-input bg-background text-foreground shadow-sm",
                  "hover:bg-accent hover:text-accent-foreground transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                )}
              >
                <MessageSquare className="h-4 w-4" />
                <span className="hidden sm:inline">AI Chat</span>
              </Link>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ================================================================= */}
      {/*  STATS CARDS                                                      */}
      {/* ================================================================= */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.label} variants={cardVariants}>
              <Card
                className={cn(
                  "stat-card border-l-4",
                  stat.borderColor,
                  "cursor-default",
                )}
              >
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {stat.label}
                      </p>
                      <div className="flex items-baseline gap-2 mt-1">
                        <p className="text-2xl font-display font-bold text-foreground">
                          {stat.value}
                        </p>
                        {/* Trend indicator */}
                        {stat.trend === "up" && (
                          <span className="inline-flex items-center text-emerald-500">
                            <TrendingUp className="h-3.5 w-3.5" />
                          </span>
                        )}
                        {stat.trend === "down" && (
                          <span className="inline-flex items-center text-red-500">
                            <TrendingDown className="h-3.5 w-3.5" />
                          </span>
                        )}
                      </div>
                    </div>
                    {/* Icon with colored background circle */}
                    <div
                      className={cn(
                        "w-11 h-11 rounded-full flex items-center justify-center",
                        stat.iconBg,
                        stat.iconColor,
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* ================================================================= */}
      {/*  DUE TODAY / DUE SOON SECTION                                     */}
      {/* ================================================================= */}
      {(dueTodayList.length > 0 || dueThisWeekList.length > 0) && (
        <motion.section
          initial="hidden"
          animate="show"
          variants={sectionVariants}
          className="mb-8"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Due Today */}
            {dueTodayList.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-500/15 flex items-center justify-center">
                      <CalendarDays className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <CardTitle className="text-base">Due Today</CardTitle>
                    <span className="ml-auto text-xs font-medium text-muted-foreground bg-muted rounded-full px-2 py-0.5">
                      {dueTodayList.length}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="divide-y divide-border">
                    {dueTodayList.slice(0, 5).map((task) => (
                      <li
                        key={task.id}
                        className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0"
                      >
                        <PriorityBadge
                          priority={task.priority}
                          size="sm"
                          showLabel={false}
                        />
                        <span className="text-sm text-foreground truncate flex-1">
                          {task.title}
                        </span>
                        <span className="text-xs text-amber-600 dark:text-amber-400 font-medium whitespace-nowrap">
                          {formatDueDate(task.due_date)}
                        </span>
                      </li>
                    ))}
                  </ul>
                  {dueTodayList.length > 5 && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      +{dueTodayList.length - 5} more
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Due This Week */}
            {dueThisWeekList.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-500/15 flex items-center justify-center">
                      <ArrowRight className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <CardTitle className="text-base">Due This Week</CardTitle>
                    <span className="ml-auto text-xs font-medium text-muted-foreground bg-muted rounded-full px-2 py-0.5">
                      {dueThisWeekList.length}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="divide-y divide-border">
                    {dueThisWeekList.slice(0, 5).map((task) => (
                      <li
                        key={task.id}
                        className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0"
                      >
                        <PriorityBadge
                          priority={task.priority}
                          size="sm"
                          showLabel={false}
                        />
                        <span className="text-sm text-foreground truncate flex-1">
                          {task.title}
                        </span>
                        <span className="text-xs text-muted-foreground font-medium whitespace-nowrap">
                          {formatDueDate(task.due_date)}
                        </span>
                      </li>
                    ))}
                  </ul>
                  {dueThisWeekList.length > 5 && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      +{dueThisWeekList.length - 5} more
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </motion.section>
      )}

      {/* ================================================================= */}
      {/*  TASK MANAGEMENT SECTION                                          */}
      {/* ================================================================= */}
      <motion.section
        initial="hidden"
        animate="show"
        variants={sectionVariants}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-500/15 flex items-center justify-center">
                <ListChecks className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              <CardTitle>Task Management</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <TaskDashboard />
          </CardContent>
        </Card>
      </motion.section>

      {/* ================================================================= */}
      {/*  CREATE TASK MODAL                                                */}
      {/* ================================================================= */}
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </DashboardLayout>
  );
}
