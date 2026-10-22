import type { QuestionType, Role } from "@prisma/client";

export type { QuestionType, Role };
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

export type SectionDetail = SectionItem & {
  courseId: string;
  content: string;
};

export type QuizQuestion = {
  type: QuestionType;
  text: string;
  options: string[];
  correctIndex: number;
};

export type QuizDetail = {
  id: string;
  attemptCount: number;
  questions: (QuizQuestion & { id: string })[];
};
