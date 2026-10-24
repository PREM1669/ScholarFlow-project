"use client";

import Link from "next/link";
import { ListChecks, Video } from "lucide-react";
import { CourseThumbnail } from "@/components/shared/course-thumbnail";
import { CertificateButton } from "@/components/student/certificate-button";
import { CompletionBadge } from "@/components/student/completion-badge";
import { CourseProgress } from "@/components/student/course-progress";
import { EnrollButton } from "@/components/student/enroll-button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCatalogCourse } from "@/hooks/use-catalog";
import { formatPrice } from "@/lib/utils";

export function CourseDetailView({ courseId }: { courseId: string }) {
  const { data: course, isLoading, error } = useCatalogCourse(courseId);
  if (isLoading) return <Skeleton className="h-96" />;
  if (error || !course) return <p role="alert" className="text-destructive">{error?.message ?? "Course not found"}</p>;
  const enrollment = course.enrollment;
  return (
    <>
      <Link href="/student/courses" className="text-sm text-muted-foreground hover:text-foreground">← All courses</Link>
      <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="order-2 min-w-0 space-y-6 lg:order-1">
          <CourseThumbnail src={course.thumbnailUrl} alt={course.title} className="rounded-lg border" />
          <div className="space-y-2">
            <Badge variant="outline">{course.category}</Badge>
            <h1 className="text-3xl font-bold">{course.title}</h1>
            <p className="text-sm text-muted-foreground">by {course.instructorName}</p>
          </div>
          <p className="whitespace-pre-line">{course.description}</p>
          <section>
            <h2 className="mb-3 text-lg font-semibold">Course outline</h2>
            <ol className="space-y-2">
              {course.sections.map((section) => (
                <li key={section.id} className="flex min-w-0 items-start gap-3 rounded-md border p-3 text-sm">
                  <span className="w-6 shrink-0 text-muted-foreground">{section.order}</span>
                  <span className="min-w-0 flex-1 break-words font-medium">{section.title}</span>
                  {section.hasVideo && <Video className="h-4 w-4 text-muted-foreground" aria-label="Includes video" />}
                  {section.hasQuiz && <ListChecks className="h-4 w-4 text-muted-foreground" aria-label="Includes quiz" />}
                </li>
              ))}
            </ol>
          </section>
        </div>
        <Card className="order-1 h-fit min-w-0 space-y-4 p-5 lg:sticky lg:top-4 lg:order-2">
          <p className="text-3xl font-bold">{formatPrice(course.price)}</p>
          {enrollment && (
            <div className="space-y-3">
              <CompletionBadge percent={enrollment.percent} isCompleted={enrollment.isCompleted} />
              <CourseProgress percent={enrollment.percent} completed={enrollment.completedSections} total={enrollment.totalSections} />
            </div>
          )}
          <EnrollButton courseId={course.id} price={course.price} enrolled={enrollment !== null} />
          {!enrollment && course.price > 0 && <p className="text-xs text-muted-foreground">Payments are simulated. No card is charged.</p>}
          {enrollment?.isCompleted && <CertificateButton courseId={course.id} />}
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>{course.sections.length} sections</li>
            <li>{course.enrollmentCount} students enrolled</li>
          </ul>
        </Card>
      </div>
    </>
  );
}
