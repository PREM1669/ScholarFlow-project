import { Suspense } from "react";
import { CatalogView } from "@/components/student/catalog-view";
import { PageHeader } from "@/components/shared/page-header";
import { Skeleton } from "@/components/ui/skeleton";

export default function CatalogPage() {
  return (
    <>
      <PageHeader title="Browse courses" description="Find a course and start learning." />
      <Suspense fallback={<Skeleton className="h-96" />}>
        <CatalogView />
      </Suspense>
    </>
  );
}
