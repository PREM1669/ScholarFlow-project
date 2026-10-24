"use client";

import Link from "next/link";
import { MarkdownContent } from "@/components/shared/markdown-content";
import { VideoEmbed } from "@/components/shared/video-embed";
import { QuizTaker } from "@/components/student/quiz-taker";
import { Button } from "@/components/ui/button";
import { useSetProgress } from "@/hooks/use-learn";
import type { LearnSection } from "@/types";

export function SectionViewer({ courseId, section, prevId, nextId, className }: {
  courseId: string;
  section: LearnSection;
  prevId: string | null;
  nextId: string | null;
  className?: string;
}) {
  const setProgress = useSetProgress(courseId, section.id);
  const quizPending = section.quiz !== null && section.attempt === null;
  const hasContent = section.content.trim() !== "";
  const base = `/student/courses/${courseId}/learn`;
  return (
    <article className={`min-w-0 space-y-6 ${className ?? ""}`}>
      <div>
        <p className="text-sm text-muted-foreground">Section {section.order}</p>
        <h1 className="text-2xl font-bold">{section.title}</h1>
      </div>
      {section.videoUrl && <VideoEmbed url={section.videoUrl} title={section.title} />}
      {hasContent && <MarkdownContent>{section.content}</MarkdownContent>}
      {section.quiz && (
        <QuizTaker key={section.id} courseId={courseId} sectionId={section.id} questions={section.quiz.questions} attempt={section.attempt} />
      )}
      {!section.videoUrl && !hasContent && !section.quiz && <p className="text-muted-foreground">This section has no content yet.</p>}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
        {prevId ? <Button variant="outline" asChild><Link href={`${base}?section=${prevId}`} scroll={false}>Previous</Link></Button> : <span />}
        <div className="flex flex-col items-center gap-1">
          <Button
            variant={section.completed ? "outline" : "default"}
            disabled={setProgress.isPending || (!section.completed && quizPending)}
            onClick={() => setProgress.mutate(!section.completed)}
          >
            {section.completed ? "Mark as incomplete" : "Mark as complete"}
          </Button>
          {quizPending && !section.completed && <p className="text-xs text-muted-foreground">Submit the quiz to complete this section.</p>}
        </div>
        {nextId ? <Button variant="outline" asChild><Link href={`${base}?section=${nextId}`} scroll={false}>Next</Link></Button> : <span />}
      </div>
    </article>
  );
}
