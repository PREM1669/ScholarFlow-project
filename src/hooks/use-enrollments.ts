"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api-client";
import type { Achievement, EnrollmentItem } from "@/types";

function refreshEnrollmentViews(client: QueryClient, courseId: string) {
  void client.invalidateQueries({ queryKey: ["catalog"] });
  void client.invalidateQueries({ queryKey: ["catalogCourse", courseId] });
  void client.invalidateQueries({ queryKey: ["enrollments"] });
}

export function useEnrollments() {
  return useQuery({
    queryKey: ["enrollments"],
    queryFn: () =>
      apiFetch<{ enrollments: EnrollmentItem[]; achievements: Achievement[] }>(
        "/api/v1/enrollments",
      ),
  });
}

export function useEnroll() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (courseId: string) =>
      apiFetch("/api/v1/enrollments", {
        method: "POST",
        body: JSON.stringify({ courseId }),
      }),
    onSuccess: (_data, courseId) => {
      refreshEnrollmentViews(client, courseId);
      toast.success("You're enrolled");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useUnenroll(courseId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiFetch(`/api/v1/enrollments/${courseId}`, { method: "DELETE" }),
    onSuccess: () => {
      refreshEnrollmentViews(client, courseId);
      client.removeQueries({ queryKey: ["learn", courseId] });
      toast.success("You've been unenrolled");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
