"use client";

import { useSession } from "@/lib/auth-client";
import Link from "next/link";
import {
  CheckCircle2,
  Zap,
  Shield,
  Smartphone,
  MessageCircle,
  ArrowRight,
  Bot,
  Sparkles,
  ListChecks,
  ChevronRight,
  Tag,
  Calendar,
  Bell,
  Search,
  RefreshCw,
  Target,
  Clock,
  Star,
  Users,
  BarChart3,
  LayoutDashboard,
  LogOut,
} from "lucide-react";
import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { ChatbotWidget } from "@/components/chatbot/ChatbotWidget";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1 },
};

const stats = [
  { label: "Active Users", value: "10,000+", icon: Users },
  { label: "Tasks Managed", value: "500K+", icon: BarChart3 },
  { label: "Uptime", value: "99.9%", icon: Zap },
  { label: "Satisfaction", value: "4.9/5", icon: Star },
];

const howItWorks = [
  {
    step: 1,
    title: "Tell the AI what you need",
    description: "Type natural language commands like \"Add task: Buy groceries tomorrow\" and the AI understands instantly.",
    icon: MessageCircle,
    gradient: "from-indigo-500 to-purple-500",
  },
  {
    step: 2,
    title: "AI organizes your tasks",
    description: "Smart prioritization, scheduling, tags and reminders are applied automatically based on your instructions.",
    icon: Sparkles,
    gradient: "from-purple-500 to-pink-500",
  },
  {
    step: 3,
    title: "Stay productive effortlessly",
    description: "Real-time sync across devices, recurring tasks auto-generate, and smart reminders keep you on track.",
    icon: Target,
    gradient: "from-pink-500 to-rose-500",
  },
];

const features = [
  {
    icon: MessageCircle,
    title: "Natural Language",
    description: "Just type what you want. No forms, no buttons \u2014 just conversation.",
    iconBg: "bg-indigo-100 dark:bg-indigo-500/10",
    iconColor: "text-indigo-600 dark:text-indigo-400",
    gradient: "from-indigo-500 to-purple-500",
  },
  {
    icon: Tag,
    title: "Smart Tags",
    description: "Organize with custom colored tags. Filter and find tasks in seconds.",
    iconBg: "bg-emerald-100 dark:bg-emerald-500/10",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    icon: Zap,
    title: "Priority Levels",
    description: "Four levels from LOW to CRITICAL with visual color coding.",
    iconBg: "bg-amber-100 dark:bg-amber-500/10",
    iconColor: "text-amber-600 dark:text-amber-400",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    icon: Calendar,
    title: "Due Dates",
    description: "Quick-select dates with overdue warnings and smart scheduling.",
    iconBg: "bg-sky-100 dark:bg-sky-500/10",
    iconColor: "text-sky-600 dark:text-sky-400",
    gradient: "from-sky-500 to-blue-500",
  },
  {
    icon: RefreshCw,
    title: "Recurring Tasks",
    description: "Daily, weekly, monthly \u2014 tasks auto-generate so you never forget.",
    iconBg: "bg-violet-100 dark:bg-violet-500/10",
    iconColor: "text-violet-600 dark:text-violet-400",
    gradient: "from-violet-500 to-purple-500",
  },
  {
    icon: Bell,
    title: "Reminders",
    description: "Custom notifications at the right time. Never miss a deadline.",
    iconBg: "bg-pink-100 dark:bg-pink-500/10",
    iconColor: "text-pink-600 dark:text-pink-400",
    gradient: "from-pink-500 to-rose-500",
  },
  {
    icon: Search,
    title: "Full-Text Search",
    description: "Instantly find any task with powerful search and multi-filter.",
    iconBg: "bg-cyan-100 dark:bg-cyan-500/10",
    iconColor: "text-cyan-600 dark:text-cyan-400",
    gradient: "from-cyan-500 to-teal-500",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "JWT authentication, encrypted data, and private by design.",
    iconBg: "bg-slate-100 dark:bg-slate-500/10",
    iconColor: "text-slate-600 dark:text-slate-400",
    gradient: "from-slate-500 to-gray-500",
  },
];

function LogoutButton() {
  const handleLogout = async () => {
    const { signOut } = await import('@/lib/auth-client');
    await signOut();
    window.location.href = '/login';
  };
  return (
    <button
      onClick={handleLogout}
      className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg text-red-600 dark:text-red-400 border border-red-200/60 dark:border-red-500/20 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-200"
    >
      <LogOut className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">Logout</span>
    </button>
  );
}

export default function HomePage() {
  const { data: session, isLoading } = useSession();

  return (
    <div className="min-h-screen bg-white dark:bg-[#0d1117] auth-gradient-mesh noise-overlay transition-colors relative pt-16">
      {/* Floating geometric shapes */}
      <div className="hidden sm:block absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute top-32 left-[8%] w-32 sm:w-48 lg:w-64 h-32 sm:h-48 lg:h-64 border border-indigo-200/30 dark:border-indigo-500/10 rounded-3xl rotate-12 animate-float" />
        <div className="absolute top-[60%] right-[5%] w-24 sm:w-36 lg:w-48 h-24 sm:h-36 lg:h-48 border border-purple-200/30 dark:border-purple-500/10 rounded-full animate-float-delayed" />
        <div className="absolute top-[20%] right-[15%] w-20 sm:w-28 lg:w-32 h-20 sm:h-28 lg:h-32 bg-indigo-100/40 dark:bg-indigo-500/5 rounded-2xl rotate-45 animate-float-slow" />
        <div className="absolute bottom-[15%] left-[12%] w-24 sm:w-32 lg:w-40 h-24 sm:h-32 lg:h-40 border border-pink-200/20 dark:border-pink-500/10 rounded-full animate-morph" />
        <div className="absolute top-[45%] left-[40%] w-32 sm:w-40 lg:w-52 h-32 sm:h-40 lg:h-52 border border-indigo-100/20 dark:border-indigo-500/5 rounded-full animate-rotate-slow" />
      </div>

      {/* ===== HERO SECTION ===== */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 lg:pt-24 pb-16 sm:pb-20">
        <motion.div
          className="grid md:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center"
          initial="hidden"
          animate="visible"
          variants={stagger}
        >
          {/* Left: Text content */}
          <div>
            <motion.div variants={fadeInUp} transition={{ duration: 0.5 }}>
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-display font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200/60 dark:border-indigo-500/20 mb-6">
                <Sparkles className="h-3.5 w-3.5" />
                AI-Powered Task Management
              </span>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold tracking-tight leading-[1.1] mb-6"
            >
              <span className="text-gray-900 dark:text-white">Manage tasks</span>
              <br />
              <span className="text-gray-900 dark:text-white">with the power of </span>
              <span className="gradient-text">conversation</span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              transition={{ duration: 0.5 }}
              className="text-lg sm:text-xl text-gray-500 dark:text-gray-400 mb-10 max-w-lg leading-relaxed"
            >
              Just type what you need. TaskFlow&apos;s AI understands natural language and turns your words into organized, actionable tasks with priorities, tags, and smart scheduling.
            </motion.p>

            <motion.div
              variants={fadeInUp}
              transition={{ duration: 0.5 }}
              className="flex flex-wrap gap-4"
            >
              {!isLoading && !session && (
                <>
                  <Link
                    href="/signup"
                    className="group inline-flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-[length:200%_auto] hover:bg-right text-white rounded-xl font-display font-semibold shadow-xl shadow-indigo-500/25 dark:shadow-indigo-500/15 hover:shadow-2xl hover:shadow-indigo-500/30 transition-all duration-500"
                  >
                    Get Started Free
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </Link>
                  <Link
                    href="/login"
                    className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-xl border border-gray-200/60 dark:border-white/10 bg-white/40 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 font-display font-semibold transition-all duration-300 hover:border-indigo-300 dark:hover:border-indigo-500/50 hover:shadow-md"
                  >
                    Sign In
                    <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform duration-300" />
                  </Link>
                </>
              )}
              {session && (
                <>
                  <Link
                    href="/dashboard"
                    className="group inline-flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-[length:200%_auto] hover:bg-right text-white rounded-xl font-display font-semibold shadow-xl shadow-indigo-500/25 hover:shadow-2xl hover:shadow-indigo-500/30 transition-all duration-500"
                  >
                    Open Dashboard
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </Link>
                  <Link
                    href="/chat"
                    className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-xl border border-gray-200/60 dark:border-white/10 bg-white/40 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 font-display font-semibold transition-all duration-300 hover:border-indigo-300 dark:hover:border-indigo-500/50 hover:shadow-md"
                  >
                    <MessageCircle className="h-4 w-4" />
                    AI Chat
                  </Link>
                </>
              )}
            </motion.div>

            {/* Prominent Chatbot CTA button */}
            <motion.div
              variants={fadeInUp}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="mt-4"
            >
              <button
                type="button"
                onClick={() => {
                  const event = new CustomEvent("open-chatbot");
                  window.dispatchEvent(event);
                }}
                className="group inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-gradient-to-r from-purple-600/10 to-indigo-600/10 dark:from-purple-500/15 dark:to-indigo-500/15 border border-purple-200/60 dark:border-purple-500/20 text-purple-700 dark:text-purple-300 font-display font-medium text-sm hover:from-purple-600/20 hover:to-indigo-600/20 dark:hover:from-purple-500/25 dark:hover:to-indigo-500/25 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300"
              >
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500" />
                </span>
                Try our AI Assistant now
                <Bot className="h-4 w-4 group-hover:rotate-12 transition-transform duration-300" />
              </button>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              transition={{ duration: 0.5 }}
              className="mt-8 sm:mt-10 flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm text-gray-400 dark:text-gray-500"
            >
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Free forever
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                No credit card
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Setup in seconds
              </span>
            </motion.div>
          </div>

          {/* Right: Interactive demo card */}
          <motion.div
            variants={scaleIn}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="hidden md:block"
          >
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-2xl animate-glow-pulse" />
              <div className="relative glass-card rounded-2xl p-1 shadow-2xl shadow-indigo-500/10">
                <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 rounded-t-xl px-5 py-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-display font-semibold text-white">AI Task Assistant</p>
                    <p className="text-xs text-white/60">Always ready to help</p>
                  </div>
                  <div className="ml-auto flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs text-white/50">Online</span>
                  </div>
                </div>
                <div className="bg-gray-50/50 dark:bg-gray-900/50 p-5 space-y-4">
                  <motion.div
                    className="flex justify-end"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8, duration: 0.4 }}
                  >
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2.5 rounded-2xl rounded-tr-md text-sm max-w-[75%] shadow-md shadow-indigo-500/15">
                      Add task: Buy groceries tomorrow, high priority
                    </div>
                  </motion.div>
                  <motion.div
                    className="flex gap-2.5"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.2, duration: 0.4 }}
                  >
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                      <Bot className="h-3.5 w-3.5 text-white" />
                    </div>
                    <div className="glass-card px-4 py-2.5 rounded-2xl rounded-tl-md text-sm text-gray-700 dark:text-gray-300 max-w-[75%]">
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">Done!</span> Task created with{" "}
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-300 rounded text-xs font-medium">HIGH</span>{" "}
                      priority for tomorrow.
                    </div>
                  </motion.div>
                  <motion.div
                    className="flex justify-end"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.6, duration: 0.4 }}
                  >
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2.5 rounded-2xl rounded-tr-md text-sm max-w-[75%] shadow-md shadow-indigo-500/15">
                      Show my tasks tagged &quot;work&quot;
                    </div>
                  </motion.div>
                  <motion.div
                    className="flex gap-2.5"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 2.0, duration: 0.4 }}
                  >
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                      <Bot className="h-3.5 w-3.5 text-white" />
                    </div>
                    <div className="glass-card px-4 py-3 rounded-2xl rounded-tl-md text-sm text-gray-700 dark:text-gray-300 space-y-1.5">
                      <p className="font-medium text-gray-900 dark:text-white">Found 3 tasks tagged &quot;work&quot;:</p>
                      {[
                        { name: "Finish project report", priority: "HIGH", done: false },
                        { name: "Team standup notes", priority: "MEDIUM", done: true },
                        { name: "Update documentation", priority: "LOW", done: false },
                      ].map((task, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <CheckCircle2 className={`h-3.5 w-3.5 ${task.done ? 'text-emerald-500' : 'text-gray-300 dark:text-gray-600'}`} />
                          <span className={task.done ? 'line-through text-gray-400 dark:text-gray-500' : ''}>
                            {task.name}
                          </span>
                          <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded font-medium ${
                            task.priority === 'HIGH' ? 'bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-300' :
                            task.priority === 'MEDIUM' ? 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-300' :
                            'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300'
                          }`}>
                            {task.priority}
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </div>
                <div className="px-5 py-3 border-t border-gray-200/60 dark:border-white/[0.06] flex items-center gap-2.5">
                  <div className="flex-1 bg-white/60 dark:bg-white/5 border border-gray-200/80 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-400 dark:text-gray-500">
                    Type a message...
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/20">
                    <MessageCircle className="h-4 w-4 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ===== STATS BAR ===== */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={stagger}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
        >
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={i}
                variants={fadeInUp}
                transition={{ duration: 0.5 }}
                className="glass-card glass-card-hover rounded-2xl p-5 sm:p-6 text-center"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-500/10 flex items-center justify-center mx-auto mb-3">
                  <Icon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <p className="text-2xl sm:text-3xl font-display font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{stat.label}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* ===== HOW IT WORKS SECTION ===== */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger}
          className="text-center mb-14"
        >
          <motion.span
            variants={fadeInUp}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-display font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/60 dark:border-emerald-500/20 mb-4"
          >
            <Clock className="h-3.5 w-3.5" />
            Simple 3-Step Process
          </motion.span>
          <motion.h2
            variants={fadeInUp}
            transition={{ duration: 0.5 }}
            className="text-3xl sm:text-4xl font-display font-bold text-gray-900 dark:text-white tracking-tight mb-4"
          >
            How <span className="gradient-text-emerald">TaskFlow</span> works
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            transition={{ duration: 0.5 }}
            className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl mx-auto"
          >
            From idea to organized task in seconds. No learning curve required.
          </motion.p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 lg:gap-10"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger}
        >
          {howItWorks.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={i}
                variants={fadeInUp}
                transition={{ duration: 0.5 }}
                className="relative text-center"
              >
                {/* Step number */}
                <div className="relative inline-flex mb-6">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-lg`}>
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-7 h-7 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-full flex items-center justify-center text-xs font-display font-bold text-gray-900 dark:text-white shadow-sm">
                    {item.step}
                  </span>
                </div>
                {/* Connector line (desktop only, not on last) */}
                {i < howItWorks.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[calc(50%+3rem)] w-[calc(100%-6rem)] h-[2px] bg-gradient-to-r from-gray-200 dark:from-gray-700 to-transparent" />
                )}
                <h3 className="text-lg font-display font-semibold text-gray-900 dark:text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-xs mx-auto">
                  {item.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger}
          className="text-center mb-16"
        >
          <motion.span
            variants={fadeInUp}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-display font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-500/10 border border-purple-200/60 dark:border-purple-500/20 mb-4"
          >
            <ListChecks className="h-3.5 w-3.5" />
            Phase 5 Features
          </motion.span>
          <motion.h2
            variants={fadeInUp}
            transition={{ duration: 0.5 }}
            className="text-3xl sm:text-4xl font-display font-bold text-gray-900 dark:text-white tracking-tight mb-4"
          >
            Everything you need to stay{" "}
            <span className="gradient-text">productive</span>
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            transition={{ duration: 0.5 }}
            className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl mx-auto"
          >
            Advanced task management with priorities, tags, due dates, recurring tasks, reminders, and real-time sync.
          </motion.p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger}
        >
          {features.map((feature, i) => (
            <motion.div
              key={i}
              variants={fadeInUp}
              transition={{ duration: 0.5 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="glass-card rounded-2xl p-6 group cursor-default"
            >
              <div className={`w-11 h-11 ${feature.iconBg} rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110`}>
                <feature.icon className={`h-5 w-5 ${feature.iconColor}`} />
              </div>
              <h3 className="text-base font-display font-semibold text-gray-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                {feature.description}
              </p>
              <div className={`mt-5 h-1 w-10 rounded-full bg-gradient-to-r ${feature.gradient} opacity-50 group-hover:w-full transition-all duration-500`} />
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl"
        >
          <div className="absolute inset-0 animated-gradient-bg" />
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-[10%] left-[5%] w-32 h-32 border border-white/10 rounded-2xl rotate-12 animate-float" />
            <div className="absolute bottom-[10%] right-[8%] w-24 h-24 border border-white/10 rounded-full animate-float-delayed" />
            <div className="absolute top-[50%] right-[30%] w-20 h-20 bg-white/5 rounded-lg rotate-45 animate-float-slow" />
          </div>
          <div className="relative px-5 sm:px-8 md:px-12 py-12 sm:py-16 md:py-20 text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold text-white mb-4 sm:mb-5 tracking-tight">
              Ready to work smarter?
            </h2>
            <p className="text-base sm:text-lg text-white/70 mb-8 sm:mb-10 max-w-xl mx-auto">
              Join TaskFlow and start managing your tasks through natural conversation. Free forever, no strings attached.
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4">
              {!isLoading && !session ? (
                <>
                  <Link
                    href="/signup"
                    className="group inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white text-indigo-700 rounded-xl font-display font-semibold text-base shadow-xl shadow-black/10 hover:shadow-2xl hover:bg-gray-50 transition-all duration-300 w-full sm:w-auto"
                  >
                    Create Free Account
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </Link>
                  <Link
                    href="/login"
                    className="group inline-flex items-center justify-center gap-2 px-8 py-3.5 border-2 border-white/30 text-white rounded-xl font-display font-semibold text-base hover:bg-white/10 transition-all duration-300 w-full sm:w-auto"
                  >
                    Sign In
                  </Link>
                </>
              ) : (
                session && (
                  <Link
                    href="/dashboard"
                    className="group inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white text-indigo-700 rounded-xl font-display font-semibold text-base shadow-xl shadow-black/10 hover:shadow-2xl hover:bg-gray-50 transition-all duration-300 w-full sm:w-auto"
                  >
                    Go to Dashboard
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </Link>
                )
              )}
            </div>
          </div>
        </motion.div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="relative z-10 border-t border-gray-200/60 dark:border-white/[0.06] bg-white/50 dark:bg-[#0d1117]/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="text-base font-display font-bold text-gray-900 dark:text-white">TaskFlow</span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                AI-powered task management that understands natural language.
              </p>
            </div>
            {/* Product */}
            <div>
              <h4 className="text-sm font-display font-semibold text-gray-900 dark:text-white mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                <li><Link href="/signup" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Features</Link></li>
                <li><Link href="/signup" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Pricing</Link></li>
                <li><Link href="/chat" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">AI Chat</Link></li>
              </ul>
            </div>
            {/* Company */}
            <div>
              <h4 className="text-sm font-display font-semibold text-gray-900 dark:text-white mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                <li><Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">About</Link></li>
                <li><Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Blog</Link></li>
                <li><Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Careers</Link></li>
              </ul>
            </div>
            {/* Legal */}
            <div>
              <h4 className="text-sm font-display font-semibold text-gray-900 dark:text-white mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                <li><Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Privacy</Link></li>
                <li><Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Terms</Link></li>
                <li><Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Security</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200/60 dark:border-white/[0.06] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-gray-400 dark:text-gray-500">
              &copy; {new Date().getFullYear()} TaskFlow. Built with AI. Designed for humans.
            </p>
            <div className="flex items-center gap-4 text-gray-400 dark:text-gray-500">
              <Smartphone className="h-4 w-4 hover:text-indigo-500 transition-colors cursor-pointer" />
              <Shield className="h-4 w-4 hover:text-indigo-500 transition-colors cursor-pointer" />
              <Bot className="h-4 w-4 hover:text-indigo-500 transition-colors cursor-pointer" />
            </div>
          </div>
        </div>
      </footer>

      {/* Homepage Chatbot Widget */}
      <ChatbotWidget
        suggestedQuestions={[
          'How do I create a task?',
          'What are priority levels?',
          'How do I set a reminder?',
          'Can I organize tasks with tags?',
        ]}
      />
    </div>
  );
}
