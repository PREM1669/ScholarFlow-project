import { PortalDashboard } from "@/components/shared/portal-dashboard";
import { prisma } from "@/lib/prisma";
import { requirePageRole } from "@/lib/rbac";

export default function InstructorDashboard() {
  return <InstructorDashboardContent />;
}

async function InstructorDashboardContent() {
  const user = await requirePageRole("INSTRUCTOR", "ADMIN");
  const [courses, published, learners] = await Promise.all([
    prisma.course.count({ where: { instructorId: user.id } }),
    prisma.course.count({ where: { instructorId: user.id, published: true } }),
    prisma.enrollment.count({ where: { course: { instructorId: user.id } } }),
  ]);

  return (
    <PortalDashboard
      name={user.name}
      role={user.role}
      stats={[
        {
          label: "Courses created",
          value: courses,
          detail: "Courses in your teaching space",
          icon: "courses",
        },
        {
          label: "Published courses",
          value: published,
          detail: "Courses available to learners",
          icon: "complete",
        },
        {
          label: "Learner enrollments",
          value: learners,
          detail: "Learners enrolled in your courses",
          icon: "users",
        },
      ]}
    />
  );
}
