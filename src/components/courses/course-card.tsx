"use client";

import Link from "next/link";
import { BookOpen, Pencil, Trash2, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { CourseThumbnail } from "@/components/shared/course-thumbnail";
import { formatPrice } from "@/lib/utils";
import type { CourseListItem } from "@/types";

export function CourseCard({
  course,
  onDelete,
}: {
  course: CourseListItem;
  onDelete: () => Promise<unknown>;
}) {
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <CourseThumbnail src={course.thumbnailUrl} alt="">
        <Badge
          variant={course.published ? "default" : "secondary"}
          className="absolute left-3 top-3 shadow-sm"
        >
          {course.published ? "Published" : "Draft"}
        </Badge>
      </CourseThumbnail>
      <div className="space-y-4 p-5">
        <div className="min-h-16">
          <h2 className="line-clamp-2 font-semibold text-slate-900">
            {course.title}
          </h2>
          <p className="mt-1 line-clamp-2 text-sm leading-5 text-slate-500">
            {course.description}
          </p>
        </div>
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <BookOpen className="size-3.5" />
            {course._count.sections}{" "}
            {course._count.sections === 1 ? "section" : "sections"}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Users className="size-3.5" />
            {course._count.enrollments}{" "}
            {course._count.enrollments === 1 ? "learner" : "learners"}
          </span>
          <span className="font-medium text-slate-700">
            {formatPrice(course.price)}
          </span>
        </div>
        <div className="flex items-center gap-2 border-t border-slate-100 pt-4">
          <Button asChild className="flex-1">
            <Link href={`/instructor/courses/${course.id}/edit`}>
              <Pencil aria-hidden="true" />
              Manage
            </Link>
          </Button>
          <ConfirmDialog
            trigger={
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Delete ${course.title}`}
              >
                <Trash2 className="text-destructive" aria-hidden="true" />
              </Button>
            }
            title="Delete this course?"
            description={`“${course.title}” and its sections will be permanently deleted. This action cannot be undone.`}
            onConfirm={onDelete}
          />
        </div>
      </div>
    </article>
  );
}
