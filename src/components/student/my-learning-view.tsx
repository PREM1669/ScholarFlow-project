"use client";

import Link from "next/link";
import { EmptyState } from "@/components/shared/empty-state";
import { Achievements } from "@/components/student/achievements";
import { EnrollmentCard } from "@/components/student/enrollment-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEnrollments } from "@/hooks/use-enrollments";
import type { EnrollmentItem } from "@/types";

function EnrollmentGrid({ items, emptyText }: { items: EnrollmentItem[]; emptyText: string }) {
  if (items.length === 0) return <p className="text-sm text-muted-foreground">{emptyText}</p>;
  return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{items.map((item) => <EnrollmentCard key={item.id} enrollment={item} />)}</div>;
}

export function MyLearningView() {
  const { data, isLoading, error } = useEnrollments();
  if (isLoading) return <Skeleton className="h-96" />;
  if (error || !data) return <p role="alert" className="text-destructive">{error?.message ?? "Could not load your courses"}</p>;
  const inProgress = data.enrollments.filter((item) => !item.isCompleted);
  const completed = data.enrollments.filter((item) => item.isCompleted);
  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-3 text-lg font-semibold">Achievements</h2>
        <Achievements items={data.achievements} />
      </section>
      {data.enrollments.length === 0 ? (
        <EmptyState
          title="You haven't enrolled in anything yet"
          description="Browse the catalog and start your first course."
          action={<Button asChild><Link href="/student/courses">Browse courses</Link></Button>}
        />
      ) : (
        <Tabs defaultValue="active">
          <TabsList>
            <TabsTrigger value="active">In progress ({inProgress.length})</TabsTrigger>
            <TabsTrigger value="done">Completed ({completed.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="active" className="pt-4">
            <EnrollmentGrid items={inProgress} emptyText="Nothing in progress. Pick up a new course from the catalog." />
          </TabsContent>
          <TabsContent value="done" className="pt-4">
            <EnrollmentGrid items={completed} emptyText="Finish a course to see it here with its certificate." />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
