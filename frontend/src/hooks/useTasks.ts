"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { authClient } from "@/lib/auth-client";
import { FrontendTask, TaskCreateInput, TaskUpdateInput, TaskFilters } from "@/types";
import { useToast } from "@/components/ui/toast-provider";
import { formatTaskError } from "@/lib/task-errors";

export function useTasks(filters?: TaskFilters) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  // Get current user session
  const session = authClient.getSession();
  const userId = session?.data?.user?.id;
  const token = session?.data?.token;

  const { data: allTasks = [], isLoading, error } = useQuery<FrontendTask[]>({
    queryKey: ["tasks", userId],
    queryFn: () => apiFetch<FrontendTask[]>("/tasks"),
    enabled: !!userId && !!token, // Only fetch when authenticated
    retry: 1,
  });

  // Client-side filtering and sorting
  const tasks = useMemo(() => {
    let result = [...allTasks];

    // Filter by status
    if (filters?.status && filters.status !== "all") {
      result = result.filter((t) => t.status === filters.status);
    }

    // Filter by priority
    if (filters?.priority && filters.priority !== "all") {
      result = result.filter((t) => t.priority === filters.priority);
    }

    // Filter by tag
    if (filters?.tag && filters.tag !== "all") {
      result = result.filter((t) => t.tags?.some((tag) => tag.id === filters.tag));
    }

    // Sort
    const sortBy = filters?.sortBy ?? "created_at";
    const sortDir = filters?.sortDir ?? "desc";
    const dir = sortDir === "asc" ? 1 : -1;

    result.sort((a, b) => {
      switch (sortBy) {
        case "title":
          return dir * a.title.localeCompare(b.title);
        case "priority":
          return dir * ((a.priority ?? 2) - (b.priority ?? 2));
        case "due_date": {
          // Tasks without due dates go to the end
          if (!a.due_date && !b.due_date) return 0;
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return dir * (new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
        }
        case "created_at":
        default:
          return dir * (new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      }
    });

    return result;
  }, [allTasks, filters?.status, filters?.priority, filters?.tag, filters?.sortBy, filters?.sortDir]);

  const createTask = useMutation({
    mutationFn: (taskData: TaskCreateInput) =>
      apiFetch("/tasks", {
        method: "POST",
        body: JSON.stringify(taskData),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", userId] });
      showToast("Task created successfully", "success");
    },
    onError: (err: unknown) => {
      showToast(formatTaskError(err, "create"), "error");
    }
  });

  const updateTask = useMutation({
    mutationFn: ({ id, ...updates }: TaskUpdateInput & { id: string }) =>
      apiFetch(`/tasks/${id}`, {
        method: "PUT",
        body: JSON.stringify(updates),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", userId] });
      showToast("Task updated successfully", "success");
    },
    onError: (err: unknown) => {
      showToast(formatTaskError(err, "update"), "error");
    }
  });

  const deleteTask = useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/tasks/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", userId] });
      showToast("Task deleted successfully", "success");
    },
    onError: (err: unknown) => {
      showToast(formatTaskError(err, "delete"), "error");
    }
  });

  const toggleTask = useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/tasks/${id}/complete`, {
        method: "PATCH",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", userId] });
      showToast("Task status updated", "success");
    },
    onError: (err: unknown) => {
      showToast(formatTaskError(err, "toggle"), "error");
    }
  });

  return {
    tasks,
    allTasks,
    isLoading,
    error,
    createTask,
    updateTask,
    deleteTask,
    toggleTask,
  };
}
