"use client";

import { useSession } from "@/lib/auth-client";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { TaskDashboard } from "@/components/TaskDashboard";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  ListChecks,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Zap,
  Calendar,
  Tag,
  Search,
  Bell,
  CheckSquare,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Quick command chips shown above the chat
// ---------------------------------------------------------------------------

const quickCommands = [
  { label: "Create a task", icon: Zap, color: "text-indigo-500" },
  { label: "Show my tasks", icon: ListChecks, color: "text-emerald-500" },
  { label: "Due today", icon: Calendar, color: "text-amber-500" },
  { label: "Set a reminder", icon: Bell, color: "text-pink-500" },
  { label: "Search tasks", icon: Search, color: "text-blue-500" },
  { label: "Add tags", icon: Tag, color: "text-purple-500" },
];

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const fadeInUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const chipVariant = {
  hidden: { opacity: 0, scale: 0.85 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.25 } },
};

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function ChatPage() {
  const [mounted, setMounted] = useState(false);
  const [showTasks, setShowTasks] = useState(false);
  const { data: session, isLoading } = useSession();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isLoading && !session?.user) {
      router.push("/login");
    }
  }, [session, isLoading, router, mounted]);

  // Loading state
  if (!mounted || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <MessageCircle className="h-7 w-7 text-white" />
          </div>
          <div className="flex flex-col items-center gap-2">
            <motion.div
              className="h-1 w-24 overflow-hidden rounded-full bg-muted"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut",
                }}
              />
            </motion.div>
            <p className="text-sm font-medium text-muted-foreground">
              Loading chat...
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!session?.user) return null;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* ============================================================= */}
        {/*  PAGE HEADER                                                   */}
        {/* ============================================================= */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={fadeInUp}
          className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
        >
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-bold text-foreground tracking-tight flex items-center gap-2">
              <span className="gradient-text">AI Chat</span>
              <Sparkles className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
            </h1>
            <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-muted-foreground">
              Manage tasks with natural language commands
            </p>
          </div>

          {/* Mobile: toggle task panel button */}
          <button
            type="button"
            onClick={() => setShowTasks((v) => !v)}
            className={cn(
              "lg:hidden inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium",
              "border border-input bg-background text-foreground shadow-sm",
              "hover:bg-accent hover:text-accent-foreground transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            )}
          >
            <ListChecks className="h-4 w-4" />
            <span>{showTasks ? "Hide Tasks" : "View Tasks"}</span>
            {showTasks ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </button>
        </motion.div>

        {/* ============================================================= */}
        {/*  QUICK COMMAND CHIPS                                           */}
        {/* ============================================================= */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="flex flex-wrap gap-2 mb-4 sm:mb-5"
        >
          {quickCommands.map((cmd) => {
            const Icon = cmd.icon;
            return (
              <motion.span
                key={cmd.label}
                variants={chipVariant}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium",
                  "bg-card border border-border shadow-sm",
                  "hover:shadow-md hover:border-primary/30 hover:scale-[1.03]",
                  "transition-all duration-200 cursor-default select-none",
                )}
              >
                <Icon className={cn("h-3.5 w-3.5", cmd.color)} />
                {cmd.label}
              </motion.span>
            );
          })}
        </motion.div>

        {/* ============================================================= */}
        {/*  MOBILE TASK PANEL (slide down)                                */}
        {/* ============================================================= */}
        <AnimatePresence>
          {showTasks && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="lg:hidden overflow-hidden mb-4"
            >
              <div className="rounded-2xl border border-border bg-card p-4 shadow-sm max-h-[50vh] overflow-y-auto">
                <div className="flex items-center gap-2 mb-3 pb-2.5 border-b border-border">
                  <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-500/15 flex items-center justify-center">
                    <CheckSquare className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h2 className="text-sm font-display font-semibold text-foreground">
                    Your Tasks
                  </h2>
                </div>
                <TaskDashboard />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ============================================================= */}
        {/*  TWO-PANEL LAYOUT                                              */}
        {/* ============================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-5">
          {/* Chat panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="lg:col-span-3"
          >
            <ChatInterface
              userId={session.user.id}
              className="h-[calc(100vh-280px)] sm:h-[calc(100vh-300px)] lg:h-[calc(100vh-220px)]"
            />
          </motion.div>

          {/* Task panel - desktop sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, delay: 0.2 }}
            className="hidden lg:block lg:col-span-2"
          >
            <div className="rounded-2xl border border-border bg-card p-4 h-[calc(100vh-220px)] overflow-y-auto shadow-sm">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-500/15 flex items-center justify-center">
                  <CheckSquare className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h2 className="text-sm font-display font-semibold text-foreground">
                  Your Tasks
                </h2>
              </div>
              <TaskDashboard />
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
