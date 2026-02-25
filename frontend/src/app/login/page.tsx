"use client";
import { AuthForm } from "@/components/AuthForm";
import { Suspense } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col relative overflow-hidden bg-white dark:bg-[#0d1117] auth-gradient-mesh noise-overlay transition-colors">
      {/* Top navigation bar */}
      <nav className="relative z-30 flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4 shrink-0">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Back to Home</span>
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/signup"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-display font-semibold rounded-xl text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 transition-all duration-300"
          >
            Sign up
          </Link>
        </div>
      </nav>

      {/* Main content */}
      <div className="flex flex-1 flex-col md:flex-row min-h-0">
        {/* ========== LEFT BRANDING PANEL ========== */}
        <div className="hidden md:flex md:w-[45%] lg:w-1/2 relative items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 dark:from-indigo-950 dark:via-violet-950 dark:to-slate-900 overflow-hidden">
          {/* Animated floating geometric shapes */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-[10%] left-[10%] w-20 md:w-24 lg:w-32 h-20 md:h-24 lg:h-32 border-2 border-white/20 rounded-2xl animate-float rotate-12" />
            <div className="absolute top-[60%] left-[15%] w-14 md:w-16 lg:w-20 h-14 md:h-16 lg:h-20 border-2 border-white/15 rounded-full animate-float-delayed" />
            <div className="absolute top-[20%] right-[15%] w-16 md:w-20 lg:w-24 h-16 md:h-20 lg:h-24 border-2 border-white/10 rounded-xl animate-float-slow rotate-45" />
            <div className="absolute bottom-[20%] right-[20%] w-12 md:w-14 lg:w-16 h-12 md:h-14 lg:h-16 bg-white/10 rounded-lg animate-float rotate-12" />
            <div className="absolute top-[45%] left-[45%] w-28 md:w-32 lg:w-40 h-28 md:h-32 lg:h-40 border border-white/10 rounded-full animate-rotate-slow" />
            <div className="absolute bottom-[10%] left-[30%] w-20 md:w-24 lg:w-28 h-20 md:h-24 lg:h-28 bg-white/5 animate-morph" />
          </div>

          {/* Branding content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 px-6 md:px-8 lg:px-12 max-w-lg"
          >
            <div className="flex items-center gap-2.5 md:gap-3 mb-6 md:mb-8">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 md:w-7 md:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-white/90 font-display text-lg md:text-xl font-bold tracking-tight">TaskFlow</span>
            </div>

            <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-display font-bold text-white leading-tight mb-4 md:mb-6">
              Manage your tasks with{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-pink-200">
                AI power
              </span>
            </h2>

            <p className="text-white/70 text-sm md:text-base lg:text-lg leading-relaxed mb-6 md:mb-8">
              Talk naturally, get things done. Our AI chatbot understands what you need and makes task management effortless.
            </p>

            <div className="flex flex-wrap gap-2 md:gap-3 mb-8 md:mb-10">
              {["Natural Language", "Smart Scheduling", "AI Powered"].map((feature, i) => (
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

            {/* Testimonial card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="glass-card rounded-2xl p-4 md:p-5 lg:p-6"
            >
              <div className="flex items-center gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-white/80 text-sm md:text-base leading-relaxed mb-3 italic">
                &ldquo;TaskFlow completely changed how I organize my day. I just tell it what I need and it handles everything.&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-300 to-purple-400 flex items-center justify-center text-white text-xs font-bold">
                  SK
                </div>
                <div>
                  <p className="text-white/90 text-sm font-medium">Sarah K.</p>
                  <p className="text-white/50 text-xs">Product Designer</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* ========== RIGHT FORM PANEL ========== */}
        <div className="flex-1 flex flex-col justify-center py-8 sm:py-10 md:py-12 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20 relative z-10">
          {/* Mobile branding header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="md:hidden mb-6 sm:mb-8 text-center"
          >
            <div className="inline-flex items-center gap-2 mb-3 sm:mb-4">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-indigo-600 dark:bg-indigo-500 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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
                Welcome back
              </h1>
              <p className="mt-2 sm:mt-3 text-sm sm:text-base text-gray-500 dark:text-gray-400">
                Sign in to continue managing your tasks
              </p>
            </motion.div>

            {/* Auth form - contains email/password fields + submit button + toggle link */}
            <Suspense fallback={
              <div className="flex justify-center items-center py-12">
                <div className="w-10 h-10 border-4 border-indigo-100 dark:border-indigo-900 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin" />
              </div>
            }>
              <AuthForm type="login" />
            </Suspense>
          </div>
        </div>
      </div>
    </main>
  );
}
