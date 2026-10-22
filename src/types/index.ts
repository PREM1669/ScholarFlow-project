import type { QuestionType, Role } from "@prisma/client";
import type { CourseCategory } from "@/lib/constants";

export type { QuestionType, Role };
export const ROLES = ["ADMIN", "INSTRUCTOR", "STUDENT"] as const;

export type CourseDetail = {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string | null;
  price: number;
  category: CourseCategory;
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

export type ProgressSummary = {
  completedSections: number;
  totalSections: number;
  percent: number;
  isCompleted: boolean;
};

export type CatalogItem = {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string | null;
  price: number;
  category: CourseCategory;
  instructorName: string;
  sectionCount: number;
  enrollmentCount: number;
  enrolled: boolean;
};
export type CatalogPage = {
  items: CatalogItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type CatalogCourseDetail = {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string | null;
  price: number;
  category: CourseCategory;
  instructorName: string;
  enrollmentCount: number;
  sections: {
    id: string;
    title: string;
    order: number;
    hasVideo: boolean;
    hasQuiz: boolean;
  }[];
  enrollment: (ProgressSummary & {
    enrolledAt: string;
    completedAt: string | null;
  }) | null;
};

export type QuizResultItem = {
  questionId: string;
  selectedIndex: number | null;
  correctIndex: number;
  isCorrect: boolean;
};
export type QuizResult = {
  score: number;
  total: number;
  percent: number;
  results: QuizResultItem[];
};
export type LearnQuestion = {
  id: string;
  type: QuestionType;
  text: string;
  options: string[];
};
export type LearnSection = {
  id: string;
  title: string;
  order: number;
  content: string;
  videoUrl: string | null;
  completed: boolean;
  quiz: { questions: LearnQuestion[] } | null;
  attempt: QuizResult | null;
};
export type LearnCourse = {
  id: string;
  title: string;
  instructorName: string;
  sections: LearnSection[];
  progress: ProgressSummary & { completedAt: string | null };
};

export type EnrollmentItem = ProgressSummary & {
  id: string;
  enrolledAt: string;
  completedAt: string | null;
  course: {
    id: string;
    title: string;
    thumbnailUrl: string | null;
    category: CourseCategory;
    instructorName: string;
  };
};

export type BadgeKey =
  | "first-steps"
  | "getting-started"
  | "quiz-ace"
  | "graduate";
export type Achievement = {
  key: BadgeKey;
  label: string;
  description: string;
  earned: boolean;
};
