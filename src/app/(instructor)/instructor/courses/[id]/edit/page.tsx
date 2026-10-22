"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { CourseForm } from "@/components/courses/course-form";
import { SectionBuilder } from "@/components/courses/section-builder";
import { AssignmentManager } from "@/components/instructor/assignment-manager";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { useCourse, useUpdateCourse } from "@/hooks/use-courses";

export default function EditCoursePage() {
  const params = useParams<{ id: string }>();
  const courseId = params.id;
  const course = useCourse(courseId);
  const updateCourse = useUpdateCourse(courseId);

  if (course.isPending) {
    return (
      <div className="mx-auto max-w-3xl space-y-5">
        <div className="h-10 w-1/3 animate-pulse rounded-lg bg-slate-200" />
        <div className="h-96 animate-pulse rounded-2xl bg-slate-200/70" />
      </div>
    );
  }

  if (course.isError) {
    return (
      <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">
        <p className="font-semibold">Course could not be loaded.</p>
        <p className="mt-1">{course.error.message}</p>
        <Button
          asChild
          variant="outline"
          className="mt-4"
        >
          <Link href="/instructor/courses">
            <ArrowLeft aria-hidden="true" />
            Back to courses
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Manage course"
        description="Update its details, organize the learning path and control publication."
        action={
          <Button asChild variant="outline">
            <Link href="/instructor/courses">
              <ArrowLeft aria-hidden="true" />
              Back to courses
            </Link>
          </Button>
        }
      />
      <div className="mx-auto max-w-3xl space-y-6">
        <CourseForm
          course={course.data}
          busy={updateCourse.isPending}
          onSubmit={(values, published) =>
            updateCourse.mutateAsync({ ...values, published })
          }
        />
        <SectionBuilder courseId={courseId} />
        <AssignmentManager courseId={courseId} />
      </div>
    </>
  );
}
