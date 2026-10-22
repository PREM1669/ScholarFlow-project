"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api-client";
import type { QuizInput } from "@/lib/validators/quiz";
import type { QuizDetail } from "@/types";

const quizKey = (courseId: string, sectionId: string) =>
  ["quiz", courseId, sectionId] as const;
const quizUrl = (courseId: string, sectionId: string) =>
  `/api/v1/courses/${courseId}/sections/${sectionId}/quiz`;

export function useQuiz(courseId: string, sectionId: string) {
  return useQuery({
    queryKey: quizKey(courseId, sectionId),
    queryFn: () => apiFetch<QuizDetail | null>(quizUrl(courseId, sectionId)),
    enabled: Boolean(courseId && sectionId),
  });
}

export function useSaveQuiz(courseId: string, sectionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: QuizInput) =>
      apiFetch<QuizDetail>(quizUrl(courseId, sectionId), {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: (quiz) => {
      queryClient.setQueryData(quizKey(courseId, sectionId), quiz);
      toast.success("Quiz saved");
    },
  });
}

export function useDeleteQuiz(courseId: string, sectionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiFetch<{ ok: true }>(quizUrl(courseId, sectionId), {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.setQueryData(quizKey(courseId, sectionId), null);
      toast.success("Quiz deleted");
    },
  });
}
