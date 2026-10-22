import { Suspense } from "react";
import { LearnView } from "@/components/student/learn-view";
import { Skeleton } from "@/components/ui/skeleton";

export default function LearnPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<Skeleton className="h-[480px]" />}>
      <LearnView courseId={params.id} />
    </Suspense>
  );
}
