import { PortalDashboard } from "@/components/shared/portal-dashboard";
import { requirePageRole } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";

export default function StudentDashboard() {
  return <StudentDashboardContent />;
}

async function StudentDashboardContent() {
  const user = await requirePageRole("STUDENT");
  const [enrolled, completed, submissions] = await Promise.all([
    prisma.enrollment.count({ where: { userId: user.id } }),
    prisma.enrollment.count({ where: { userId: user.id, completedAt: { not: null } } }),
    prisma.submission.count({ where: { studentId: user.id } }),
  ]);

  return (
    <PortalDashboard
      name={user.name}
      role="STUDENT"
      stats={[
        {
          label: "Enrolled courses",
          value: enrolled,
          detail: enrolled === 1 ? "Course in your learning space" : "Courses in your learning space",
          icon: "courses",
        },
        {
          label: "Completed courses",
          value: completed,
          detail: "Courses you’ve completed",
          icon: "complete",
        },
        {
          label: "Assignments submitted",
          value: submissions,
          detail: "Assignments you’ve turned in",
          icon: "activity",
        },
      ]}
    />
  );
}
