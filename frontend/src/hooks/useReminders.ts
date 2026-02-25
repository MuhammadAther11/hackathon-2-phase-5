"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { FrontendReminder } from "@/types";
import { useToast } from "@/components/ui/toast-provider";

export function useReminders(taskId: string) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const { data: reminders = [], isLoading } = useQuery<FrontendReminder[]>({
    queryKey: ["reminders", taskId],
    queryFn: () => apiFetch<FrontendReminder[]>(`/tasks/${taskId}/reminders`),
    retry: 2,
  });

  const createReminder = useMutation({
    mutationFn: (data: { trigger_time: string }) =>
      apiFetch<FrontendReminder>(`/tasks/${taskId}/reminders`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders", taskId] });
      showToast("Reminder created", "success");
    },
    onError: () => showToast("Failed to create reminder", "error"),
  });

  const updateReminder = useMutation({
    mutationFn: ({ id, ...data }: { id: string; trigger_time?: string }) =>
      apiFetch<FrontendReminder>(`/reminders/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders", taskId] });
      showToast("Reminder updated", "success");
    },
    onError: () => showToast("Failed to update reminder", "error"),
  });

  const deleteReminder = useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/reminders/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders", taskId] });
      showToast("Reminder deleted", "success");
    },
    onError: () => showToast("Failed to delete reminder", "error"),
  });

  return { reminders, isLoading, createReminder, updateReminder, deleteReminder };
}
