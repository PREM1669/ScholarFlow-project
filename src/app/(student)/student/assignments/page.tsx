import { AssignmentList } from "@/components/student/assignment-list";
import { PageHeader } from "@/components/shared/page-header";
import { requirePageRole } from "@/lib/rbac";

type PageProps = { searchParams: { course?: string } };

export default async function StudentAssignmentsPage({ searchParams }: PageProps) {
  await requirePageRole("STUDENT");
  return (
    <>
      <PageHeader
        title="Assignments"
        description="Track upcoming work, update submissions, and review instructor feedback."
      />
      <AssignmentList courseId={searchParams.course} />
    </>
  );
}
