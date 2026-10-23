"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CourseChat } from "@/components/chat/course-chat";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCatalogCourse } from "@/hooks/use-catalog";

export function AssistantView({ courseId }: { courseId: string }) {
  const sectionId = useSearchParams().get("section");
  const { data: course, isLoading, error } = useCatalogCourse(courseId);

  if (isLoading) return <Skeleton className="h-[480px]" />;
  if (error || !course) {
    return (
      <p role="alert" className="text-destructive">
        {error?.message ?? "Course not found"}
      </p>
    );
  }

  if (!course.enrollment) {
    return (
      <EmptyState
        title="Enroll to use the assistant"
        description="The course assistant is available to enrolled students."
        action={
          <Button asChild>
            <Link href={`/student/courses/${courseId}`}>View course</Link>
          </Button>
        }
      />
    );
  }

  const focus = course.sections.find((section) => section.id === sectionId);
  const suggestions = [
    ...(focus ? [`Summarize the key points of "${focus.title}"`] : []),
    "What is this course about?",
    ...course.sections
      .filter((section) => section.id !== focus?.id)
      .slice(0, 2)
      .map((section) => `Explain "${section.title}" in simple terms`),
  ];

  return (
    <>
      <Link
        href={`/student/courses/${courseId}/learn`}
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Back to course
      </Link>
      <div className="mt-2">
        <PageHeader title="Course assistant" description={course.title} />
      </div>
      <CourseChat
        key={courseId}
        courseId={courseId}
        courseTitle={course.title}
        suggestions={suggestions}
      />
    </>
  );
}
