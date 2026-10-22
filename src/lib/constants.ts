export const COURSE_CATEGORIES = [
  "Programming",
  "Design",
  "Business",
  "Data Science",
  "Language",
  "General",
] as const;

export type CourseCategory = (typeof COURSE_CATEGORIES)[number];
export const CATALOG_PAGE_SIZE = 6;
