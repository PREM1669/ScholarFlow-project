"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CertificateButton } from "@/components/student/certificate-button";
import { LearnSidebar } from "@/components/student/learn-sidebar";
import { SectionViewer } from "@/components/student/section-viewer";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useLearnCourse } from "@/hooks/use-learn";
import { ApiError } from "@/lib/api-client";

export function LearnView({ courseId }: { courseId: string }) {
  const searchParams = useSearchParams();
  const { data: course, isLoading, error } = useLearnCourse(courseId);
  if (isLoading) return <Skeleton className="h-[480px]" />;
  if (error instanceof ApiError && error.status === 403) {
    return (
      <EmptyState
        title="You're not enrolled in this course"
        description="Enroll to access the lessons, quizzes and your progress."
        action={<Button asChild><Link href={`/student/courses/${courseId}`}>View course</Link></Button>}
      />
    );
  }
  if (error || !course) return <p role="alert" className="text-destructive">{error?.message ?? "Course not found"}</p>;
  if (course.sections.length === 0) {
    return <EmptyState title="No lessons yet" description="The instructor hasn't added any sections to this course." />;
  }
  const requested = course.sections.findIndex((section) => section.id === searchParams.get("section"));
  const firstIncomplete = course.sections.findIndex((section) => !section.completed);
  const activeIndex = requested >= 0 ? requested : firstIncomplete >= 0 ? firstIncomplete : 0;
  const active = course.sections[activeIndex];
  return (
    <div className="space-y-6">
      {course.progress.isCompleted && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-green-600/40 bg-green-50 p-4">
          <div>
            <p className="font-semibold text-green-800">Course completed</p>
            <p className="text-sm text-green-700">You finished every section. Download your certificate.</p>
          </div>
          <CertificateButton courseId={courseId} />
        </div>
      )}
      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <LearnSidebar course={course} activeId={active.id} />
        <SectionViewer
          key={active.id}
          courseId={courseId}
          section={active}
          prevId={course.sections[activeIndex - 1]?.id ?? null}
          nextId={course.sections[activeIndex + 1]?.id ?? null}
        />
      </div>
    </div>
  );
}
