"use client";

import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckSquare } from "lucide-react";

/**
 * DashboardLayout wraps authenticated pages with main content area.
 * Navbar is now global in layout.tsx, so we just need the content wrapper.
 *
 * - Mobile: Full width content with proper padding
 * - Desktop: Centered content with max-width
 */
export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
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

  // Loading state with smooth animation
  if (!mounted || isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background pt-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg shadow-indigo-500/20">
            <CheckSquare className="h-7 w-7 text-white" />
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
              Loading dashboard...
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!session?.user) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Main content area */}
      <main className="min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
