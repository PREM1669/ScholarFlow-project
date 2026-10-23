import { Suspense } from "react";
import { AssistantView } from "@/components/student/assistant-view";
import { Skeleton } from "@/components/ui/skeleton";

export default function AssistantPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <Suspense fallback={<Skeleton className="h-[480px]" />}>
      <AssistantView courseId={params.id} />
    </Suspense>
  );
}
