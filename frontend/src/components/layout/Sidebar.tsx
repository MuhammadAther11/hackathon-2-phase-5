"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  LayoutDashboard,
  MessageCircle,
  User,
  LogOut,
  X,
  CheckSquare,
} from "lucide-react";
import { signOut, useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useUI } from "@/contexts/UIContext";
import { cn } from "@/lib/utils";

/** Navigation item definition for sidebar links */
interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

/** Navigation items rendered in the sidebar */
const navItems: NavItem[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/chat", label: "Chat", icon: MessageCircle },
];

/**
 * SidebarContent renders the inner content shared between desktop and mobile sidebars.
 * Extracted to avoid duplication between the two sidebar variants.
 */
function SidebarContent({
  onNavClick,
  showCloseButton = false,
  onClose,
}: {
  onNavClick?: () => void;
  showCloseButton?: boolean;
  onClose?: () => void;
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <div className="flex h-full flex-col">
      {/* Sidebar header with brand */}
      <div className="flex h-16 shrink-0 items-center border-b border-border/50 px-4">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-md shadow-indigo-500/20">
            <CheckSquare className="h-4.5 w-4.5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground">
            TaskFlow
          </span>
        </Link>
        {showCloseButton && onClose && (
          <button
            onClick={onClose}
            className="ml-auto rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation links */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <nav className="space-y-1" aria-label="Main navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavClick}
                className={cn(
                  "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-indigo-500/10 font-semibold text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400"
                    : "text-muted-foreground hover:bg-accent/80 hover:text-foreground"
                )}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-indicator"
                    className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-indigo-600 dark:bg-indigo-400"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <Icon
                  className={cn(
                    "h-[18px] w-[18px] shrink-0 transition-colors duration-200",
                    isActive
                      ? "text-indigo-600 dark:text-indigo-400"
                      : "text-muted-foreground group-hover:text-foreground"
                  )}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User profile section at bottom */}
      {session && (
        <div className="shrink-0 border-t border-border/50 p-3">
          <div className="flex items-center gap-3 rounded-lg p-2">
            {/* Avatar with gradient and user initial */}
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 shadow-sm">
              <span className="text-sm font-semibold text-white">
                {session.user?.email?.charAt(0).toUpperCase() ?? (
                  <User className="h-4 w-4 text-white" />
                )}
              </span>
            </div>
            {/* User info */}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {session.user?.email?.split("@")[0]}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {session.user?.email}
              </p>
            </div>
            {/* Sign out button */}
            <button
              onClick={handleSignOut}
              className="shrink-0 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400"
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Sidebar component providing navigation for the application.
 *
 * - Desktop (md+): Fixed left sidebar, always visible, 256px wide.
 * - Mobile (<md): Hidden by default; slides in from left with overlay on toggle.
 *
 * Uses UIContext for sidebar open/close state and auth-client for session data.
 */
export function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useUI();

  return (
    <>
      {/* Desktop sidebar -- always visible on md+ */}
      <aside
        className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-border/50 bg-sidebar-bg md:flex md:flex-col"
        aria-label="Desktop sidebar"
      >
        <SidebarContent />
      </aside>

      {/* Mobile overlay backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={toggleSidebar}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Mobile sidebar -- slides in from left */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border/50 bg-sidebar-bg shadow-2xl md:hidden"
            initial={{ x: -256 }}
            animate={{ x: 0 }}
            exit={{ x: -256 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            aria-label="Mobile sidebar"
          >
            <SidebarContent
              showCloseButton
              onClose={toggleSidebar}
              onNavClick={toggleSidebar}
            />
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
