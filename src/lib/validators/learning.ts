import { z } from "zod";
import { COURSE_CATEGORIES } from "@/lib/constants";

export const enrollSchema = z.object({ courseId: z.string().min(1) });
export const progressSchema = z.object({ completed: z.boolean() });
export const attemptSchema = z.object({
  answers: z.record(z.string(), z.number().int().min(0).max(5)),
});
export const catalogQuerySchema = z.object({
  q: z.string().trim().max(100).optional(),
  category: z.enum(COURSE_CATEGORIES).optional(),
  price: z.enum(["free", "paid"]).optional(),
  sort: z.enum(["newest", "popular", "title"]).default("newest"),
  page: z.coerce.number().int().min(1).max(1000).default(1),
});
