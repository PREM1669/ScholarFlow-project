"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { CourseForm } from "@/components/courses/course-form";
import { SectionBuilder } from "@/components/courses/section-builder";
import { AssignmentManager } from "@/components/instructor/assignment-manager";
import { CourseChat } from "@/components/chat/course-chat";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { useCourse, useUpdateCourse } from "@/hooks/use-courses";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

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
        <Tabs defaultValue="setup">
          <TabsList>
            <TabsTrigger value="setup">Course setup</TabsTrigger>
            <TabsTrigger value="assistant">AI assistant</TabsTrigger>
          </TabsList>
          <TabsContent value="setup" className="space-y-6 pt-4">
            <CourseForm
              course={course.data}
              busy={updateCourse.isPending}
              onSubmit={(values, published) =>
                updateCourse.mutateAsync({ ...values, published })
              }
            />
            <SectionBuilder courseId={courseId} />
            <AssignmentManager courseId={courseId} />
          </TabsContent>
          <TabsContent value="assistant" className="pt-4">
            <p className="mb-3 max-w-2xl text-sm leading-6 text-slate-500">
              Preview what enrolled students can ask. The assistant uses the
              course description and section notes only, not quizzes or
              assignments. Add key points or transcripts to video lessons.
            </p>
            <CourseChat
              courseId={courseId}
              courseTitle={course.data.title}
              suggestions={[
                "What is this course about?",
                "Summarize the first section",
              ]}
            />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
