"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api-client";
import type {
  AssignmentDetail,
  AssignmentListItem,
  StudentAssignmentDetail,
  StudentAssignmentItem,
  SubmissionRow,
  SubmissionsPayload,
  SubmissionStatus,
} from "@/types";
import type { AssignmentInput, AssignmentUpdateInput } from "@/lib/validators/assignment";

const courseAssignmentUrl = (courseId: string) =>
  `/api/v1/courses/${courseId}/assignments`;
const assignmentListKey = (courseId: string) => ["assignments", courseId] as const;
const submissionListKey = (courseId: string, assignmentId: string) =>
  ["submissions", courseId, assignmentId] as const;

export function useAssignments(courseId: string) {
  return useQuery({
    queryKey: assignmentListKey(courseId),
    queryFn: () =>
      apiFetch<AssignmentListItem[]>(courseAssignmentUrl(courseId)),
    enabled: Boolean(courseId),
  });
}

export function useCreateAssignment(courseId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (data: AssignmentInput) =>
      apiFetch<AssignmentDetail>(courseAssignmentUrl(courseId), {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: assignmentListKey(courseId) });
      toast.success("Assignment created");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useUpdateAssignment(courseId: string, assignmentId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (data: AssignmentUpdateInput) =>
      apiFetch<AssignmentDetail>(
        `${courseAssignmentUrl(courseId)}/${assignmentId}`,
        { method: "PATCH", body: JSON.stringify(data) },
      ),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: assignmentListKey(courseId) });
      toast.success("Assignment updated");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useDeleteAssignment(courseId: string, assignmentId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiFetch(`${courseAssignmentUrl(courseId)}/${assignmentId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: assignmentListKey(courseId) });
      toast.success("Assignment deleted");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useSubmissions(courseId: string, assignmentId: string) {
  return useQuery({
    queryKey: submissionListKey(courseId, assignmentId),
    queryFn: () =>
      apiFetch<SubmissionsPayload>(
        `${courseAssignmentUrl(courseId)}/${assignmentId}/submissions`,
      ),
    enabled: Boolean(courseId && assignmentId),
  });
}

export function useGradeSubmission(courseId: string, assignmentId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({
      submissionId,
      score,
      feedback,
    }: {
      submissionId: string;
      score: number;
      feedback: string;
    }) =>
      apiFetch<SubmissionRow>(
        `${courseAssignmentUrl(courseId)}/${assignmentId}/submissions/${submissionId}/grade`,
        {
          method: "PUT",
          body: JSON.stringify({ score, feedback }),
        },
      ),
    onSuccess: () => {
      void client.invalidateQueries({
        queryKey: submissionListKey(courseId, assignmentId),
      });
      void client.invalidateQueries({ queryKey: assignmentListKey(courseId) });
      toast.success("Grade saved");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useMyAssignments(courseId?: string) {
  return useQuery({
    queryKey: ["myAssignments", courseId ?? "all"],
    queryFn: () =>
      apiFetch<StudentAssignmentItem[]>(
        `/api/v1/assignments${courseId ? `?courseId=${encodeURIComponent(courseId)}` : ""}`,
      ),
  });
}

export function useMyAssignment(assignmentId: string) {
  return useQuery({
    queryKey: ["myAssignment", assignmentId],
    queryFn: () =>
      apiFetch<StudentAssignmentDetail>(`/api/v1/assignments/${assignmentId}`),
    enabled: Boolean(assignmentId),
  });
}

export function useSubmitAssignment(assignmentId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (body: FormData) =>
      apiFetch<{
        status: SubmissionStatus;
        submission: StudentAssignmentDetail["submission"];
      }>(`/api/v1/assignments/${assignmentId}/submission`, {
        method: "PUT",
        body,
      }),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["myAssignment", assignmentId] });
      void client.invalidateQueries({ queryKey: ["myAssignments"] });
      toast.success("Submission saved");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
