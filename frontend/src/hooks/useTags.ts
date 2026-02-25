"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { authClient } from "@/lib/auth-client";
import { FrontendTag } from "@/types";

export function useTags() {
  const queryClient = useQueryClient();

  // Get current user ID from session
  const session = authClient.getSession();
  const userId = session?.data?.user?.id;
  const token = session?.data?.token;

  const { data: tags = [], isLoading } = useQuery<FrontendTag[]>({
    queryKey: ["tags", userId],
    queryFn: () => apiFetch<FrontendTag[]>("/tags"),
    enabled: !!userId && !!token, // Only fetch when authenticated
    retry: 1,
  });

  const createTag = useMutation({
    mutationFn: (data: { name: string; color?: string }) =>
      apiFetch<FrontendTag>("/tags", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags", userId] });
    },
  });

  const updateTag = useMutation({
    mutationFn: ({ id, ...data }: { id: string; name?: string; color?: string }) =>
      apiFetch<FrontendTag>(`/tags/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags", userId] });
    },
  });

  const deleteTag = useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/tags/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags", userId] });
    },
  });

  return { tags, isLoading, createTag, updateTag, deleteTag };
}
