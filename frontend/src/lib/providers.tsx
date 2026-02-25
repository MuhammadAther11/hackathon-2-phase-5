"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState, useEffect } from "react";
import { ToastProvider } from "@/components/ui/toast-provider";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { UIProvider } from "@/contexts/UIContext";

export function Providers({ children }: { children: React.ReactNode }) {
  // 1. Ensure QueryClient is only created once
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
          },
        },
      })
  );

  // 2. State to track if the component has mounted
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <UIProvider>
        <QueryClientProvider client={queryClient}>
          <ToastProvider>
            {children}
            {/* Only render devtools on the client side to avoid hydration errors */}
            {mounted && <ReactQueryDevtools initialIsOpen={false} />}
          </ToastProvider>
        </QueryClientProvider>
      </UIProvider>
    </ThemeProvider>
  );
}
