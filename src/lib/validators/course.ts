import { z } from "zod";

const cloudinaryUrl = z
  .string()
  .url()
  .refine(
    (url) => {
      const parsed = new URL(url);
      return (
        parsed.protocol === "https:" &&
        parsed.hostname === "res.cloudinary.com"
      );
    },
    "Thumbnail must be uploaded through ScholarFlow",
  );

export const courseSchema = z.object({
  title: z.string().trim().min(3, "At least 3 characters").max(100),
  description: z.string().trim().min(10, "At least 10 characters").max(2000),
  price: z.number().min(0, "Price can't be negative").max(100000),
  thumbnailUrl: cloudinaryUrl.nullish(),
});

export const courseUpdateSchema = courseSchema.partial().extend({
  published: z.boolean().optional(),
});

export const sectionSchema = z.object({
  title: z.string().trim().min(2, "At least 2 characters").max(100),
});

export const reorderSchema = z.object({
  orderedIds: z.array(z.string().min(1)).min(1),
});

export type CourseInput = z.infer<typeof courseSchema>;
export type CourseUpdateInput = z.infer<typeof courseUpdateSchema>;
export type SectionInput = z.infer<typeof sectionSchema>;
