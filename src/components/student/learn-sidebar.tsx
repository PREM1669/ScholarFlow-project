import Link from "next/link";
import { Check, ListChecks } from "lucide-react";
import { CompletionBadge } from "@/components/student/completion-badge";
import { CourseProgress } from "@/components/student/course-progress";
import { cn } from "@/lib/utils";
import type { LearnCourse } from "@/types";

export function LearnSidebar({ course, activeId }: { course: LearnCourse; activeId: string }) {
  return (
    <aside className="space-y-4 lg:sticky lg:top-4 lg:self-start">
      <div className="space-y-3 rounded-lg border p-4">
        <Link href={`/student/courses/${course.id}`} className="block font-semibold hover:underline">{course.title}</Link>
        <CompletionBadge percent={course.progress.percent} isCompleted={course.progress.isCompleted} />
        <CourseProgress
          percent={course.progress.percent}
          completed={course.progress.completedSections}
          total={course.progress.totalSections}
        />
      </div>
      <nav aria-label="Course sections">
        <ol className="space-y-1">
          {course.sections.map((section) => (
            <li key={section.id}>
              <Link
                href={`/student/courses/${course.id}/learn?section=${section.id}`}
                scroll={false}
                aria-current={section.id === activeId ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-muted",
                  section.id === activeId && "bg-muted font-medium",
                )}
              >
                <span className={cn("flex h-5 w-5 shrink-0 items-center justify-center rounded-full border", section.completed && "border-green-600 bg-green-600 text-white")}>
                  {section.completed && <Check className="h-3 w-3" />}
                  <span className="sr-only">{section.completed ? "Completed" : "Not completed"}</span>
                </span>
                <span className="flex-1">{section.order}. {section.title}</span>
                {section.quiz && <ListChecks className="h-4 w-4 text-muted-foreground" aria-label="Has quiz" />}
              </Link>
            </li>
          ))}
        </ol>
      </nav>
    </aside>
  );
}
