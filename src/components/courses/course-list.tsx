"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CourseCard } from "@/components/courses/course-card";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { useCourses, useDeleteCourse } from "@/hooks/use-courses";

export function CourseList() {
  const courses = useCourses();
  const deleteCourse = useDeleteCourse();

  return (
    <>
      <PageHeader
        title="My courses"
        description="Create, organize and publish your learning content."
        action={
          <Button asChild>
            <Link href="/instructor/courses/new">
              <Plus aria-hidden="true" />
              New course
            </Link>
          </Button>
        }
      />
      {courses.isPending ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="aspect-[4/3] animate-pulse rounded-2xl bg-slate-200/70"
            />
          ))}
        </div>
      ) : courses.isError ? (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-800"
        >
          <p className="font-medium">Courses could not be loaded.</p>
          <p className="mt-1">{courses.error.message}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => void courses.refetch()}
          >
            Try again
          </Button>
        </div>
      ) : courses.data.length === 0 ? (
        <EmptyState
          title="Start with your first course"
          description="Create a course, add sections and publish it when it is ready for learners."
          action={
            <Button asChild>
              <Link href="/instructor/courses/new">
                <Plus aria-hidden="true" />
                Create a course
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {courses.data.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onDelete={() => deleteCourse.mutateAsync(course.id)}
            />
          ))}
        </div>
      )}
    </>
  );
}
