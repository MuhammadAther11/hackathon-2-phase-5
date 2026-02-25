"use client";
import { AuthForm } from "@/components/AuthForm";
import { Suspense } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

const checklistItems = [
  "Unlimited AI-powered task management",
  "Natural language commands",
  "Smart scheduling and reminders",
  "Cross-device sync",
];

export default function SignupPage() {
  return (
    <main className="min-h-screen flex flex-col relative overflow-hidden bg-white dark:bg-[#0d1117] auth-gradient-mesh noise-overlay transition-colors">
      {/* Top navigation bar */}
      <nav className="relative z-30 flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4 shrink-0">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Back to Home</span>
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-display font-semibold rounded-xl text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-300"
          >
            Sign in
          </Link>
        </div>
      </nav>

      {/* Main content */}
      <div className="flex flex-1 flex-col md:flex-row-reverse min-h-0">
        {/* ========== RIGHT BRANDING PANEL ========== */}
        <div className="hidden md:flex md:w-[45%] lg:w-1/2 relative items-center justify-center bg-gradient-to-bl from-emerald-500 via-teal-600 to-indigo-600 dark:from-emerald-900 dark:via-teal-900 dark:to-indigo-900 overflow-hidden">
          {/* Animated floating geometric shapes */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-[15%] right-[10%] w-20 md:w-24 lg:w-28 h-20 md:h-24 lg:h-28 border-2 border-white/20 rounded-full animate-float" />
            <div className="absolute top-[55%] right-[20%] w-16 md:w-20 lg:w-24 h-16 md:h-20 lg:h-24 border-2 border-white/15 rounded-2xl animate-float-delayed rotate-45" />
            <div className="absolute top-[25%] left-[10%] w-14 md:w-16 lg:w-20 h-14 md:h-16 lg:h-20 border-2 border-white/10 rounded-lg animate-float-slow rotate-12" />
            <div className="absolute bottom-[25%] left-[15%] w-12 md:w-14 lg:w-16 h-12 md:h-14 lg:h-16 bg-white/10 rounded-full animate-float" />
            <div className="absolute top-[40%] right-[40%] w-24 md:w-28 lg:w-36 h-24 md:h-28 lg:h-36 border border-white/10 rounded-2xl animate-rotate-slow rotate-45" />
            <div className="absolute bottom-[15%] right-[25%] w-20 md:w-24 lg:w-32 h-20 md:h-24 lg:h-32 bg-white/5 animate-morph" />
          </div>

          {/* Branding content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 px-6 md:px-8 lg:px-12 max-w-lg"
          >
            <div className="flex items-center gap-2.5 md:gap-3 mb-6 md:mb-8">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 md:w-7 md:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <span className="text-white/90 font-display text-lg md:text-xl font-bold tracking-tight">TaskFlow</span>
            </div>

            <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-display font-bold text-white leading-tight mb-4 md:mb-6">
              Start your{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-emerald-200">
                productivity journey
              </span>
            </h2>

            <p className="text-white/70 text-sm md:text-base lg:text-lg leading-relaxed mb-6 md:mb-8">
              Join thousands who organize their lives through conversation. Set up in seconds, benefit forever.
            </p>

            <div className="flex flex-wrap gap-2 md:gap-3 mb-8 md:mb-10">
              {["Free to Start", "No Credit Card", "Instant Setup"].map((feature, i) => (
                <motion.span
                  key={feature}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + i * 0.15, duration: 0.5 }}
                  className="px-3 md:px-4 py-1.5 md:py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/80 text-xs md:text-sm font-medium border border-white/10"
                >
                  {feature}
                </motion.span>
              ))}
            </div>

            {/* What you get checklist */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="glass-card rounded-2xl p-4 md:p-5 lg:p-6"
            >
              <h3 className="text-white/90 font-display font-semibold text-sm md:text-base mb-4">
                What you get
              </h3>
              <ul className="space-y-3">
                {checklistItems.map((item, i) => (
                  <motion.li
                    key={item}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.2 + i * 0.1, duration: 0.4 }}
                    className="flex items-center gap-3"
                  >
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-400/20 flex items-center justify-center">
                      <svg className="w-3 h-3 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-white/75 text-sm">{item}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </motion.div>
        </div>

        {/* ========== LEFT FORM PANEL ========== */}
        <div className="flex-1 flex flex-col justify-center py-8 sm:py-10 md:py-12 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20 relative z-10">
          {/* Mobile branding header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="md:hidden mb-6 sm:mb-8 text-center"
          >
            <div className="inline-flex items-center gap-2 mb-3 sm:mb-4">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-emerald-600 dark:bg-emerald-500 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <span className="font-display text-lg sm:text-xl font-bold text-gray-900 dark:text-white">TaskFlow</span>
            </div>
          </motion.div>

          <div className="w-full max-w-md mx-auto">
            {/* Heading */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-6 sm:mb-8"
            >
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-gray-900 dark:text-white tracking-tight">
                Create account
              </h1>
              <p className="mt-2 sm:mt-3 text-sm sm:text-base text-gray-500 dark:text-gray-400">
                Get started with your free account today
              </p>
            </motion.div>

            {/* Auth form - contains name/email/password fields + submit button + toggle link */}
            <Suspense fallback={
              <div className="flex justify-center items-center py-12">
                <div className="w-10 h-10 border-4 border-emerald-100 dark:border-emerald-900 border-t-emerald-600 dark:border-t-emerald-400 rounded-full animate-spin" />
              </div>
            }>
              <AuthForm type="signup" />
            </Suspense>

            {/* Terms of service notice */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.0, duration: 0.5 }}
              className="mt-6 text-center text-xs text-gray-400 dark:text-gray-500 leading-relaxed"
            >
              By creating an account, you agree to our{" "}
              <span className="underline underline-offset-2 cursor-pointer hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                Terms of Service
              </span>{" "}
              and{" "}
              <span className="underline underline-offset-2 cursor-pointer hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                Privacy Policy
              </span>
              .
            </motion.p>
          </div>
        </div>
      </div>
    </main>
  );
}
