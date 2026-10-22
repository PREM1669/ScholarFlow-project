"use client";

import { useQuiz } from "@/hooks/use-quiz";
import { QuizBuilder } from "@/components/instructor/quiz-builder";
import { Button } from "@/components/ui/button";

export function SectionQuizTab({
  courseId,
  sectionId,
}: {
  courseId: string;
  sectionId: string;
}) {
  const quiz = useQuiz(courseId, sectionId);

  if (quiz.isPending) {
    return (
      <div
        className="h-48 animate-pulse rounded-xl bg-slate-100"
        aria-label="Loading quiz"
      />
    );
  }
  if (quiz.isError) {
    return (
      <div role="alert" className="space-y-3 text-sm text-destructive">
        <p>{quiz.error.message}</p>
        <Button variant="outline" onClick={() => void quiz.refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <QuizBuilder
      key={sectionId}
      courseId={courseId}
      sectionId={sectionId}
      quiz={quiz.data}
    />
  );
}
