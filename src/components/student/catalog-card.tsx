import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CourseThumbnail } from "@/components/shared/course-thumbnail";
import { formatPrice } from "@/lib/utils";
import type { CatalogItem } from "@/types";

export function CatalogCard({ course }: { course: CatalogItem }) {
  return (
    <Card className="flex flex-col overflow-hidden">
      <CourseThumbnail src={course.thumbnailUrl} alt={course.title}>
        {course.enrolled && (
          <Badge className="absolute left-2 top-2">Enrolled</Badge>
        )}
      </CourseThumbnail>
      <CardHeader className="space-y-2">
        <Badge variant="outline" className="w-fit">
          {course.category}
        </Badge>
        <CardTitle className="line-clamp-2 text-lg">
          {course.title}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          by {course.instructorName}
        </p>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="line-clamp-3 text-sm text-muted-foreground">
          {course.description}
        </p>
      </CardContent>
      <CardFooter className="flex-col items-stretch gap-3">
        <div className="flex items-center justify-between gap-2 text-sm">
          <span className="text-muted-foreground">
            {course.sectionCount} sections · {course.enrollmentCount} students
          </span>
          <span className="font-semibold">{formatPrice(course.price)}</span>
        </div>
        <Button asChild>
          <Link href={`/student/courses/${course.id}`}>
            {course.enrolled ? "Open course" : "View course"}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
