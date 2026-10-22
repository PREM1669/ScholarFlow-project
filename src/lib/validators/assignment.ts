import { z } from "zod";

export const assignmentSchema = z.object({
  title: z.string().trim().min(3).max(120),
  prompt: z.string().trim().min(10).max(5000),
  dueDate: z.string().datetime({ offset: true }).transform((value) => new Date(value)),
  maxScore: z.number().int().min(1).max(1000),
});

export const assignmentUpdateSchema = assignmentSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  "Provide at least one assignment field to update",
);

export const gradeSchema = z.object({
  score: z.number().int().min(0).max(1000),
  feedback: z.string().trim().max(5000).nullable().optional(),
});

export type AssignmentInput = z.infer<typeof assignmentSchema>;
export type AssignmentUpdateInput = z.infer<typeof assignmentUpdateSchema>;
