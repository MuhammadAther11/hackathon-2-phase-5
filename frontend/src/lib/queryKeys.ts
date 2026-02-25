import { TaskFilters } from '@/types';

/**
 * TanStack Query key definitions for consistent caching and invalidation
 */
export const queryKeys = {
  // Tasks
  tasks: {
    all: ['tasks'] as const,
    lists: () => [...queryKeys.tasks.all, 'list'] as const,
    list: (filters: TaskFilters) => [...queryKeys.tasks.lists(), filters] as const,
    details: () => [...queryKeys.tasks.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.tasks.details(), id] as const,
  },
  
  // Tags
  tags: {
    all: ['tags'] as const,
    lists: () => [...queryKeys.tags.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.tags.all, 'detail', id] as const,
  },
  
  // User
  user: {
    all: ['user'] as const,
    profile: () => [...queryKeys.user.all, 'profile'] as const,
    session: () => [...queryKeys.user.all, 'session'] as const,
  },
  
  // Reminders
  reminders: {
    all: ['reminders'] as const,
    byTask: (taskId: string) => [...queryKeys.reminders.all, 'task', taskId] as const,
  },
  
  // Search
  search: {
    all: ['search'] as const,
    query: (q: string) => [...queryKeys.search.all, 'query', q] as const,
  },
  
  // Chat
  chat: {
    all: ['chat'] as const,
    history: () => [...queryKeys.chat.all, 'history'] as const,
  },
};
