"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api-client";
import type { LearnCourse, QuizResult } from "@/types";

export const learnKey = (courseId: string) => ["learn", courseId] as const;
const sectionUrl = (courseId: string, sectionId: string) =>
  `/api/v1/learn/${courseId}/sections/${sectionId}`;

export function useLearnCourse(courseId: string) {
  return useQuery({
    queryKey: learnKey(courseId),
    queryFn: () => apiFetch<LearnCourse>(`/api/v1/learn/${courseId}`),
  });
}

export function useSetProgress(courseId: string, sectionId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (completed: boolean) =>
      apiFetch<LearnCourse["progress"]>(
        `${sectionUrl(courseId, sectionId)}/progress`,
        { method: "PUT", body: JSON.stringify({ completed }) },
      ),
    onSuccess: (progress, completed) => {
      client.setQueryData<LearnCourse>(learnKey(courseId), (old) =>
        old
          ? {
              ...old,
              sections: old.sections.map((section) =>
                section.id === sectionId ? { ...section, completed } : section,
              ),
              progress,
            }
          : old,
      );
      void client.invalidateQueries({ queryKey: ["enrollments"] });
      void client.invalidateQueries({ queryKey: ["catalogCourse", courseId] });
      if (completed && progress.isCompleted) {
        toast.success("Course completed. Your certificate is ready.");
      }
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useSubmitQuiz(courseId: string, sectionId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (answers: Record<string, number>) =>
      apiFetch<QuizResult>(
        `${sectionUrl(courseId, sectionId)}/quiz/attempt`,
        { method: "PUT", body: JSON.stringify({ answers }) },
      ),
    onSuccess: (attempt) => {
      client.setQueryData<LearnCourse>(learnKey(courseId), (old) =>
        old
          ? {
              ...old,
              sections: old.sections.map((section) =>
                section.id === sectionId ? { ...section, attempt } : section,
              ),
            }
          : old,
      );
      void client.invalidateQueries({ queryKey: ["enrollments"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
