"use client";

import React, { useState, useRef } from "react";
import { signIn, signUp } from "@/lib/auth-client";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Mail, Lock, User, Eye, EyeOff, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/toast-provider";
import { getAuthErrorMessage } from "@/lib/auth-errors";
import { motion, AnimatePresence } from "framer-motion";

interface AuthFormProps {
  type: "login" | "signup";
}

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.15,
    },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } },
};

interface InputFieldProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  autoComplete: string;
  inputRef: React.RefObject<HTMLInputElement | null>;
  focusedField: string | null;
  onFocus: () => void;
  onBlur: () => void;
}

const InputField = React.memo(({ icon: Icon, label, type, placeholder, value, onChange, autoComplete, inputRef, focusedField, onFocus, onBlur }: InputFieldProps) => {
  const isFocused = focusedField === label;

  return (
    <motion.div variants={staggerItem} className="relative">
      <label htmlFor={label} className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 font-display">
        {label}
      </label>
      <div className="relative group">
        <div className={`absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 blur-sm transition-opacity duration-300 ${isFocused ? 'opacity-40' : 'group-hover:opacity-20'}`} />
        <div className="relative flex items-center">
          <Icon className={`absolute left-4 h-[18px] w-[18px] transition-all duration-300 ${isFocused ? 'text-indigo-600 dark:text-indigo-400 scale-110' : 'text-gray-400 dark:text-gray-500'}`} />
          <input
            ref={inputRef}
            id={label}
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onFocus={onFocus}
            onBlur={onBlur}
            autoComplete={autoComplete}
            required
            className="w-full pl-11 pr-4 py-3 sm:py-3.5 bg-white/60 dark:bg-white/5 border border-gray-200/80 dark:border-white/10 rounded-xl transition-all duration-300 focus:outline-none focus:bg-white dark:focus:bg-white/10 focus:border-indigo-400 dark:focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:focus:ring-indigo-400/10 hover:border-gray-300 dark:hover:border-white/20 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 text-sm sm:text-[15px]"
          />
        </div>
      </div>
    </motion.div>
  );
});

interface PasswordFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  autoComplete: string;
  inputRef: React.RefObject<HTMLInputElement | null>;
  focusedField: string | null;
  onFocus: () => void;
  onBlur: () => void;
  showPassword: boolean;
  onToggleShowPassword: () => void;
}

const PasswordField = React.memo(({ label, placeholder, value, onChange, autoComplete, inputRef, focusedField, onFocus, onBlur, showPassword, onToggleShowPassword }: PasswordFieldProps) => {
  const isFocused = focusedField === label;

  return (
    <motion.div variants={staggerItem} className="relative">
      <label htmlFor={label} className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 font-display">
        {label}
      </label>
      <div className="relative group">
        <div className={`absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 blur-sm transition-opacity duration-300 ${isFocused ? 'opacity-40' : 'group-hover:opacity-20'}`} />
        <div className="relative flex items-center">
          <Lock className={`absolute left-4 h-[18px] w-[18px] transition-all duration-300 ${isFocused ? 'text-indigo-600 dark:text-indigo-400 scale-110' : 'text-gray-400 dark:text-gray-500'}`} />
          <input
            ref={inputRef}
            id={label}
            type={showPassword ? "text" : "password"}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onFocus={onFocus}
            onBlur={onBlur}
            autoComplete={autoComplete}
            required
            className="w-full pl-11 pr-12 py-3 sm:py-3.5 bg-white/60 dark:bg-white/5 border border-gray-200/80 dark:border-white/10 rounded-xl transition-all duration-300 focus:outline-none focus:bg-white dark:focus:bg-white/10 focus:border-indigo-400 dark:focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:focus:ring-indigo-400/10 hover:border-gray-300 dark:hover:border-white/20 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 text-sm sm:text-[15px]"
          />
          <button
            type="button"
            onClick={onToggleShowPassword}
            className="absolute right-4 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none transition-all duration-300 hover:scale-110"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={showPassword ? "hide" : "show"}
                initial={{ opacity: 0, rotate: -90 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 90 }}
                transition={{ duration: 0.2 }}
              >
                {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>
      </div>
    </motion.div>
  );
});

export function AuthForm({ type }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const { showToast } = useToast();

  const nameInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const submitButtonRef = useRef<HTMLButtonElement>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const message = searchParams.get("message");

  const isLogin = type === "login";

  // Validate password length for signup
  const isPasswordValid = password.length >= 8;
  const showPasswordError = !isLogin && password.length > 0 && !isPasswordValid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate password length for signup
    if (!isLogin && !isPasswordValid) {
      setError("Password must be at least 8 characters");
      showToast("Password must be at least 8 characters", "error");
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { error: authError } = await signIn.email({
          email,
          password,
        });
        if (authError) throw authError;
        showToast("Welcome back! Redirecting to dashboard...", "success");
        setTimeout(() => router.push("/dashboard"), 800);
      } else {
        const { error: authError } = await signUp.email({
          email,
          password,
          name,
        });
        if (authError) throw authError;
        showToast("Account created! Redirecting to login...", "success");
        setTimeout(() => router.push("/login?message=Signup successful. Please log in."), 800);
      }
    } catch (err: unknown) {
      const errorMessage = getAuthErrorMessage(err);
      setError(errorMessage);
      showToast(errorMessage, "error");
      setLoading(false);
    }
  };

  const handleFocus = (label: string) => {
    setFocusedField(label);
  };

  const handleBlur = () => {
    setFocusedField(null);
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="w-full"
    >
      {/* Success message */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="mb-6 bg-emerald-50/80 dark:bg-emerald-900/20 border border-emerald-200/60 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-400 px-4 py-3 rounded-xl text-sm text-center backdrop-blur-sm"
            role="alert"
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">{message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Glass card form */}
      <div className="glass-card rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 shadow-xl shadow-black/5 dark:shadow-black/20">
        <form className="space-y-4 sm:space-y-5" onSubmit={handleSubmit}>
          {!isLogin && (
            <InputField
              icon={User}
              label="Full Name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
              autoComplete="name"
              inputRef={nameInputRef}
              focusedField={focusedField}
              onFocus={() => handleFocus("Full Name")}
              onBlur={handleBlur}
            />
          )}

          <InputField
            icon={Mail}
            label="Email address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            autoComplete="email"
            inputRef={emailInputRef}
            focusedField={focusedField}
            onFocus={() => handleFocus("Email address")}
            onBlur={handleBlur}
          />

          <PasswordField
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            autoComplete={isLogin ? "current-password" : "new-password"}
            inputRef={passwordInputRef}
            focusedField={focusedField}
            onFocus={() => handleFocus("Password")}
            onBlur={handleBlur}
            showPassword={showPassword}
            onToggleShowPassword={() => setShowPassword(!showPassword)}
          />

          {/* Error message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="text-red-600 dark:text-red-400 text-sm font-medium bg-red-50/80 dark:bg-red-900/20 p-3 rounded-xl border border-red-200/60 dark:border-red-800/40 flex items-center gap-2 backdrop-blur-sm">
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit button */}
          <motion.div variants={staggerItem}>
            <motion.button
              ref={submitButtonRef}
              type="submit"
              disabled={loading}
              whileHover={!loading ? { scale: 1.01 } : undefined}
              whileTap={!loading ? { scale: 0.98 } : undefined}
              className="w-full py-3 sm:py-3.5 px-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-[length:200%_auto] hover:bg-right text-white font-display font-semibold rounded-xl transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 mt-1 sm:mt-2 shadow-lg shadow-indigo-500/25 dark:shadow-indigo-500/15 hover:shadow-xl hover:shadow-indigo-500/30 text-sm sm:text-base"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5" />
                  <span>{isLogin ? "Signing in..." : "Creating account..."}</span>
                </>
              ) : (
                <>
                  <span>{isLogin ? "Sign in" : "Create account"}</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </>
              )}
            </motion.button>
          </motion.div>
        </form>
      </div>

      {/* Divider */}
      <motion.div variants={staggerItem} className="relative my-6 sm:my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200/60 dark:border-white/10" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white dark:bg-[#0d1117] text-gray-400 dark:text-gray-500 auth-gradient-mesh">
            {isLogin ? "New here?" : "Already have an account?"}
          </span>
        </div>
      </motion.div>

      {/* Toggle link */}
      <motion.div variants={staggerItem} className="text-center">
        <Link
          href={isLogin ? "/signup" : "/login"}
          className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-200/60 dark:border-white/10 bg-white/40 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 font-display font-medium text-sm transition-all duration-300 hover:border-indigo-300 dark:hover:border-indigo-500/50 hover:shadow-md"
        >
          <span>{isLogin ? "Create a free account" : "Sign in instead"}</span>
          <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </motion.div>
    </motion.div>
  );
}
