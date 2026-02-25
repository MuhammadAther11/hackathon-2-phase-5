"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch, APIError } from "@/lib/api-client";
import { authClient } from "@/lib/auth-client";
import { FrontendTask } from "@/types";

interface SearchResponse {
  query: string;
  results: FrontendTask[];
  total: number;
}

export function useSearch() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Get current user ID from session
  const session = authClient.getSession();
  const userId = session?.data?.user?.id;
  const token = session?.data?.token;

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { data, isLoading, error, isError } = useQuery<SearchResponse>({
    queryKey: ["search", userId, debouncedQuery],
    queryFn: async () => {
      if (!userId || !token) {
        throw new Error("User not authenticated. Please log in.");
      }
      // api-client.ts will automatically prefix with /api/{userId}
      const endpoint = `/tasks/search?q=${encodeURIComponent(debouncedQuery)}`;
      const result = await apiFetch<SearchResponse>(endpoint);
      return result;
    },
    enabled: !!userId && !!token && debouncedQuery.length >= 1,
    retry: 1,
    // Don't show errors globally - handle them in the component
    throwOnError: false,
  });

  return {
    query,
    setQuery,
    results: data?.results ?? [],
    total: data?.total ?? 0,
    isSearching: isLoading && debouncedQuery.length >= 1,
    isError,
    error: isError ? error : null,
  };
}
