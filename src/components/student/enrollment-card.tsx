import Link from "next/link";
import { CourseThumbnail } from "@/components/shared/course-thumbnail";
import { CertificateButton } from "@/components/student/certificate-button";
import { CompletionBadge } from "@/components/student/completion-badge";
import { CourseProgress } from "@/components/student/course-progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { EnrollmentItem } from "@/types";

export function EnrollmentCard({ enrollment }: { enrollment: EnrollmentItem }) {
  const { course } = enrollment;
  const label = enrollment.isCompleted ? "Review" : enrollment.percent === 0 ? "Start" : "Continue";
  return (
    <Card className="flex flex-col overflow-hidden">
      <CourseThumbnail src={course.thumbnailUrl} alt={course.title} />
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <Badge variant="outline">{course.category}</Badge>
          <CompletionBadge percent={enrollment.percent} isCompleted={enrollment.isCompleted} />
        </div>
        <CardTitle className="line-clamp-2 text-lg">{course.title}</CardTitle>
        <p className="text-sm text-muted-foreground">by {course.instructorName}</p>
      </CardHeader>
      <CardContent className="flex-1">
        <CourseProgress percent={enrollment.percent} completed={enrollment.completedSections} total={enrollment.totalSections} />
      </CardContent>
      <CardFooter className="gap-2">
        <Button asChild className="flex-1"><Link href={`/student/courses/${course.id}/learn`}>{label}</Link></Button>
        {enrollment.isCompleted && <CertificateButton courseId={course.id} />}
      </CardFooter>
    </Card>
  );
}
