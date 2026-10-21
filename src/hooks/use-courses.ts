"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api-client";
import type {
  CourseDetail,
  CourseListItem,
  SectionItem,
} from "@/types";
import type { CourseInput, CourseUpdateInput } from "@/lib/validators/course";

const courseKeys = {
  all: ["instructor-courses"] as const,
  detail: (id: string) => ["instructor-course", id] as const,
  sections: (id: string) => ["course-sections", id] as const,
};

export function useCourses() {
  return useQuery({
    queryKey: courseKeys.all,
    queryFn: () => apiFetch<CourseListItem[]>("/api/v1/courses"),
  });
}

export function useCourse(id: string) {
  return useQuery({
    queryKey: courseKeys.detail(id),
    queryFn: () => apiFetch<CourseDetail>(`/api/v1/courses/${id}`),
    enabled: Boolean(id),
  });
}

export function useSections(id: string) {
  return useQuery({
    queryKey: courseKeys.sections(id),
    queryFn: () => apiFetch<SectionItem[]>(`/api/v1/courses/${id}/sections`),
    enabled: Boolean(id),
  });
}

export function useCreateCourse() {
  const router = useRouter();
  const client = useQueryClient();
  return useMutation({
    mutationFn: (values: CourseInput) =>
      apiFetch<CourseDetail>("/api/v1/courses", {
        method: "POST",
        body: JSON.stringify(values),
      }),
    onSuccess: (course) => {
      toast.success("Course created");
      void client.invalidateQueries({ queryKey: courseKeys.all });
      router.push(`/instructor/courses/${course.id}/edit`);
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useUpdateCourse(id: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (values: CourseUpdateInput) =>
      apiFetch<CourseDetail>(`/api/v1/courses/${id}`, {
        method: "PATCH",
        body: JSON.stringify(values),
      }),
    onSuccess: (course) => {
      toast.success("Course saved");
      client.setQueryData(courseKeys.detail(id), course);
      void client.invalidateQueries({ queryKey: courseKeys.all });
    },
  });
}

export function useDeleteCourse() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ ok: true }>(`/api/v1/courses/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Course deleted");
      void client.invalidateQueries({ queryKey: courseKeys.all });
    },
  });
}

export function useAddSection(courseId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (title: string) =>
      apiFetch<SectionItem>(`/api/v1/courses/${courseId}/sections`, {
        method: "POST",
        body: JSON.stringify({ title }),
      }),
    onSuccess: () => {
      toast.success("Section added");
      void client.invalidateQueries({ queryKey: courseKeys.sections(courseId) });
      void client.invalidateQueries({ queryKey: courseKeys.all });
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useUpdateSection(courseId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ sectionId, title }: { sectionId: string; title: string }) =>
      apiFetch<SectionItem>(
        `/api/v1/courses/${courseId}/sections/${sectionId}`,
        { method: "PATCH", body: JSON.stringify({ title }) },
      ),
    onSuccess: () => {
      toast.success("Section renamed");
      void client.invalidateQueries({ queryKey: courseKeys.sections(courseId) });
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useDeleteSection(courseId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (sectionId: string) =>
      apiFetch<{ ok: true }>(
        `/api/v1/courses/${courseId}/sections/${sectionId}`,
        { method: "DELETE" },
      ),
    onSuccess: () => {
      toast.success("Section deleted");
      void client.invalidateQueries({ queryKey: courseKeys.sections(courseId) });
      void client.invalidateQueries({ queryKey: courseKeys.all });
    },
  });
}

export function useReorderSections(courseId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (orderedIds: string[]) =>
      apiFetch<{ ok: true }>(
        `/api/v1/courses/${courseId}/sections/reorder`,
        { method: "PATCH", body: JSON.stringify({ orderedIds }) },
      ),
    onMutate: async (orderedIds) => {
      await client.cancelQueries({ queryKey: courseKeys.sections(courseId) });
      const previous = client.getQueryData<SectionItem[]>(
        courseKeys.sections(courseId),
      );
      if (previous) {
        const byId = new Map(previous.map((section) => [section.id, section]));
        client.setQueryData(
          courseKeys.sections(courseId),
          orderedIds
            .map((id, index) => {
              const section = byId.get(id);
              return section ? { ...section, order: index + 1 } : null;
            })
            .filter((section): section is SectionItem => section !== null),
        );
      }
      return { previous };
    },
    onError: (error, _ids, context) => {
      if (context?.previous) {
        client.setQueryData(courseKeys.sections(courseId), context.previous);
      }
      toast.error(error.message);
    },
    onSettled: () => {
      void client.invalidateQueries({ queryKey: courseKeys.sections(courseId) });
    },
  });
}

export async function uploadCourseThumbnail(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return apiFetch<{ url: string }>("/api/v1/upload/thumbnail", {
    method: "POST",
    body: formData,
  });
}
