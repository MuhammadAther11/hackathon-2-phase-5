import { z } from "zod";

export const taskCreateSchema = z.object({
  title: z.string().min(1, "Title is required").max(500, "Title too long"),
  description: z.string().max(5000, "Description too long").optional(),
  priority: z.number().int().min(1).max(4).optional().default(2),
  due_date: z.string().optional(),
});

export type TaskCreateFormData = z.infer<typeof taskCreateSchema>;
