"use client";

import React, { useState, useEffect } from "react";
import { MessageCircle, X, Minimize2, Maximize2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ChatWindow } from "./ChatWindow";
import { useUI } from "@/contexts/UIContext";
import { cn } from "@/lib/utils";

interface ChatbotWidgetProps {
  suggestedQuestions?: string[];
}

/**
 * Homepage Chatbot Widget
 * Floating action button (FAB) that expands to a polished chat window.
 * - Pulse animation on the FAB when chat is not open
 * - Wider window on desktop (420px) and full-screen on mobile
 * - Glass morphism card with gradient header
 * - Smooth spring transitions for open/close/minimize
 */
export function ChatbotWidget({ suggestedQuestions }: ChatbotWidgetProps) {
  const { chatbotOpen, openChatbot, closeChatbot } = useUI();
  const [isMinimized, setIsMinimized] = useState(false);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    const session = sessionStorage.getItem("chatbot-session");
    setHasSession(!!session);
  }, []);

  // Listen for the "open-chatbot" custom event dispatched from the hero CTA button
  useEffect(() => {
    const handleOpenEvent = () => {
      setIsMinimized(false);
      openChatbot();
    };
    window.addEventListener("open-chatbot", handleOpenEvent);
    return () => window.removeEventListener("open-chatbot", handleOpenEvent);
  }, [openChatbot]);

  const handleOpen = () => {
    setIsMinimized(false);
    openChatbot();
  };

  const handleMinimize = () => {
    setIsMinimized(true);
  };

  const handleRestore = () => {
    setIsMinimized(false);
  };

  const handleClose = () => {
    setIsMinimized(false);
    closeChatbot();
  };

  const defaultQuestions = [
    "How do I create a task?",
    "What are priority levels?",
    "How do I set a reminder?",
    "Can I organize tasks with tags?",
  ];

  const questions = suggestedQuestions || defaultQuestions;

  return (
    <>
      {/* ================================================================= */}
      {/*  FLOATING ACTION BUTTON                                           */}
      {/* ================================================================= */}
      <AnimatePresence>
        {!chatbotOpen && !isMinimized && (
          <motion.button
            onClick={handleOpen}
            className={cn(
              "fixed bottom-6 right-6 z-40",
              "flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16",
              "bg-gradient-to-br from-indigo-600 to-purple-600 text-white",
              "rounded-full shadow-lg shadow-indigo-500/30",
              "hover:shadow-xl hover:shadow-indigo-500/40",
              "transition-shadow duration-300",
              "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2",
            )}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Open chatbot"
          >
            <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7" />

            {/* Pulse ring */}
            <span className="absolute inset-0 rounded-full animate-ping-slow bg-indigo-500/30 pointer-events-none" />

            {/* Notification dot */}
            {!hasSession && (
              <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-900 shadow-sm" />
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* ================================================================= */}
      {/*  CHAT WINDOW                                                      */}
      {/* ================================================================= */}
      <AnimatePresence>
        {chatbotOpen && !isMinimized && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={cn(
              // Mobile: full screen overlay with higher z-index to appear above navbar
              "fixed inset-0 z-[60] sm:inset-auto",
              // Desktop: positioned bottom-right with z-index above navbar (z-50)
              "sm:fixed sm:bottom-6 sm:right-6 sm:z-[55]",
              "sm:w-[420px] sm:max-h-[calc(100vh-3rem)]",
              // Card styling
              "bg-white dark:bg-gray-900",
              "sm:rounded-2xl sm:shadow-2xl",
              "sm:border sm:border-gray-200 sm:dark:border-gray-700/60",
              "overflow-hidden flex flex-col",
              // Add top padding on mobile to account for navbar/status bar
              "safe-area-top pt-safe-top",
              // Ensure minimum height for better mobile experience
              "min-h-[50vh] sm:min-h-[500px]",
            )}
          >
            {/* Chat Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white shrink-0 safe-area-top">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-sm">
                    TaskFlow Assistant
                  </h3>
                  <p className="text-xs text-white/70">
                    Here to help
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleMinimize}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                  aria-label="Minimize chat"
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
                <button
                  onClick={handleClose}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                  aria-label="Close chat"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chat Content */}
            <div className="flex-1 overflow-hidden">
              <ChatWindow suggestedQuestions={questions} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================================================================= */}
      {/*  MINIMIZED BAR                                                    */}
      {/* ================================================================= */}
      <AnimatePresence>
        {isMinimized && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={cn(
              "fixed bottom-6 right-6 z-[60]",
              "flex items-center gap-3 px-4 py-2.5",
              "bg-white dark:bg-gray-900 rounded-full",
              "shadow-lg border border-gray-200 dark:border-gray-700/60",
            )}
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-medium text-foreground">
              TaskFlow Assistant
            </span>
            <button
              onClick={handleRestore}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              aria-label="Restore chat"
            >
              <Maximize2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </button>
            <button
              onClick={handleClose}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              aria-label="Close chat"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
