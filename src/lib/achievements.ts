import type { Achievement } from "@/types";

export function computeAchievements(stats: {
  enrollments: number;
  completedSections: number;
  perfectQuizzes: number;
  completedCourses: number;
}): Achievement[] {
  return [
    { key: "first-steps", label: "First Steps", description: "Enroll in a course", earned: stats.enrollments > 0 },
    { key: "getting-started", label: "Getting Started", description: "Complete a section", earned: stats.completedSections > 0 },
    { key: "quiz-ace", label: "Quiz Ace", description: "Score 100% on a quiz", earned: stats.perfectQuizzes > 0 },
    { key: "graduate", label: "Graduate", description: "Complete a course", earned: stats.completedCourses > 0 },
  ];
}
