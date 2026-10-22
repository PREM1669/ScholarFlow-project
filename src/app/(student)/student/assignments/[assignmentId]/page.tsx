import { StudentAssignmentDetail } from "@/components/student/assignment-detail";
import { requirePageRole } from "@/lib/rbac";

type PageProps = { params: { assignmentId: string } };

export default async function StudentAssignmentPage({ params }: PageProps) {
  await requirePageRole("STUDENT");
  return <StudentAssignmentDetail assignmentId={params.assignmentId} />;
}
