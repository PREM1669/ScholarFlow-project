"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CourseForm } from "@/components/courses/course-form";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { useCreateCourse } from "@/hooks/use-courses";

export default function NewCoursePage() {
  const createCourse = useCreateCourse();

  return (
    <>
      <PageHeader
        title="Create a course"
        description="Start with the details. You can add sections and publish when ready."
        action={
          <Button asChild variant="outline">
            <Link href="/instructor/courses">
              <ArrowLeft aria-hidden="true" />
              Back to courses
            </Link>
          </Button>
        }
      />
      <div className="mx-auto max-w-3xl">
        <CourseForm
          busy={createCourse.isPending}
          onSubmit={(values) => createCourse.mutateAsync(values)}
        />
      </div>
    </>
  );
}
