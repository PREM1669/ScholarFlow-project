import type { Role } from "@prisma/client";

export type { Role };
export const ROLES = ["ADMIN", "INSTRUCTOR", "STUDENT"] as const;

export type CourseDetail = {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string | null;
  price: number;
  published: boolean;
  createdAt: string;
};

export type CourseListItem = CourseDetail & {
  _count: { sections: number; enrollments: number };
};

export type SectionItem = {
  id: string;
  title: string;
  order: number;
  videoUrl: string | null;
};
