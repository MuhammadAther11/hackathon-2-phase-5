'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface UIContextType {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  chatbotOpen: boolean;
  setTheme: (theme: 'light' | 'dark') => void;
  toggleSidebar: () => void;
  toggleChatbot: () => void;
  openChatbot: () => void;
  closeChatbot: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<'light' | 'dark'>('light');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatbotOpen, setChatbotOpen] = useState(false);

  // Initialize theme from system preference or localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
      setThemeState(savedTheme);
    } else if (systemPrefersDark) {
      setThemeState('dark');
    }
  }, []);

  // Update document class and localStorage when theme changes
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const setTheme = (newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
  };

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const toggleChatbot = () => {
    setChatbotOpen((prev) => !prev);
  };

  const openChatbot = () => {
    setChatbotOpen(true);
  };

  const closeChatbot = () => {
    setChatbotOpen(false);
  };

  const value: UIContextType = {
    theme,
    sidebarOpen,
    chatbotOpen,
    setTheme,
    toggleSidebar,
    toggleChatbot,
    openChatbot,
    closeChatbot,
  };

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI() {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
}
