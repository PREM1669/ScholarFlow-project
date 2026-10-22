import { AssignmentSubmissions } from "@/components/instructor/assignment-submissions";
import { PageHeader } from "@/components/shared/page-header";
import { requirePageRole } from "@/lib/rbac";

type PageProps = { params: { id: string; assignmentId: string } };

export default async function AssignmentSubmissionsPage({ params }: PageProps) {
  await requirePageRole("INSTRUCTOR", "ADMIN");
  return (
    <>
      <PageHeader
        title="Assignment submissions"
        description="Review learner work and provide scores with written feedback."
      />
      <AssignmentSubmissions courseId={params.id} assignmentId={params.assignmentId} />
    </>
  );
}
