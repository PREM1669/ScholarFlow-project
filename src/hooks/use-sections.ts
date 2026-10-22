"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api-client";
import type { SectionUpdateInput } from "@/lib/validators/section";
import type { SectionDetail } from "@/types";

const sectionListKey = (courseId: string) =>
  ["course-sections", courseId] as const;
const sectionDetailKey = (courseId: string, sectionId: string) =>
  ["section", courseId, sectionId] as const;
const sectionUrl = (courseId: string, sectionId: string) =>
  `/api/v1/courses/${courseId}/sections/${sectionId}`;

export function useSection(courseId: string, sectionId: string) {
  return useQuery({
    queryKey: sectionDetailKey(courseId, sectionId),
    queryFn: () => apiFetch<SectionDetail>(sectionUrl(courseId, sectionId)),
    enabled: Boolean(courseId && sectionId),
  });
}

export function useSaveSection(courseId: string, sectionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SectionUpdateInput) =>
      apiFetch<SectionDetail>(sectionUrl(courseId, sectionId), {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: (section) => {
      queryClient.setQueryData(sectionDetailKey(courseId, sectionId), section);
      void queryClient.invalidateQueries({
        queryKey: sectionListKey(courseId),
      });
      toast.success("Section saved");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
