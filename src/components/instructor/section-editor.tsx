"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { SectionNotesTab } from "@/components/instructor/section-notes-tab";
import { SectionVideoTab } from "@/components/instructor/section-video-tab";
import { SectionQuizTab } from "@/components/instructor/section-quiz-tab";
import { useSection } from "@/hooks/use-sections";

export function SectionEditor({
  courseId,
  sectionId,
}: {
  courseId: string;
  sectionId: string;
}) {
  const sectionQuery = useSection(courseId, sectionId);

  if (sectionQuery.isPending) {
    return (
      <div className="mx-auto max-w-4xl space-y-5">
        <div className="h-10 w-1/3 animate-pulse rounded-lg bg-slate-200" />
        <div className="h-96 animate-pulse rounded-2xl bg-slate-200/70" />
      </div>
    );
  }
  if (sectionQuery.isError) {
    return (
      <div
        role="alert"
        className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-800"
      >
        <p>{sectionQuery.error.message}</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href={`/instructor/courses/${courseId}/edit`}>
            <ArrowLeft aria-hidden="true" />
            Back to course
          </Link>
        </Button>
      </div>
    );
  }

  const section = sectionQuery.data;
  const backLink = `/instructor/courses/${courseId}/edit`;
  return (
    <>
      <Button asChild variant="ghost" className="mb-4 -ml-3">
        <Link href={backLink}>
          <ArrowLeft aria-hidden="true" />
          Back to course
        </Link>
      </Button>
      <PageHeader
        title={section.title}
        description={`Section ${section.order} · Add notes, a video and an optional quiz.`}
      />

      <Tabs defaultValue="notes" className="gap-5">
        <TabsList className="h-11 w-full justify-start rounded-xl border border-slate-200 bg-white p-1 sm:w-fit">
          <TabsTrigger value="notes" className="px-4">
            Notes
          </TabsTrigger>
          <TabsTrigger value="video" className="px-4">
            Video
          </TabsTrigger>
          <TabsTrigger value="quiz" className="px-4">
            Quiz
          </TabsTrigger>
        </TabsList>
        <TabsContent value="notes" keepMounted className="pt-1">
          <SectionNotesTab courseId={courseId} section={section} />
        </TabsContent>
        <TabsContent value="video" keepMounted className="pt-1">
          <SectionVideoTab courseId={courseId} section={section} />
        </TabsContent>
        <TabsContent value="quiz" keepMounted className="pt-1">
          <SectionQuizTab courseId={courseId} sectionId={sectionId} />
        </TabsContent>
      </Tabs>
    </>
  );
}
