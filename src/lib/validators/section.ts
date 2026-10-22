import { z } from "zod";
import { parseVideoUrl } from "@/lib/video";

export const videoUrlSchema = z
  .string()
  .trim()
  .max(300)
  .refine(
    (value) => parseVideoUrl(value) !== null,
    "Use a valid YouTube or Vimeo link",
  );

export const sectionUpdateSchema = z
  .object({
    title: z.string().trim().min(2, "At least 2 characters").max(100).optional(),
    content: z.string().max(50_000, "Content is too long").optional(),
    videoUrl: videoUrlSchema.nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, "Nothing to update");

export type SectionUpdateInput = z.infer<typeof sectionUpdateSchema>;
