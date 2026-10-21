import { PortalDashboard } from "@/components/shared/portal-dashboard";
import { prisma } from "@/lib/prisma";
import { requirePageRole } from "@/lib/rbac";

export default function AdminDashboard() {
  return <AdminDashboardContent />;
}

async function AdminDashboardContent() {
  const user = await requirePageRole("ADMIN");
  const [users, courses, published] = await Promise.all([
    prisma.user.count(),
    prisma.course.count(),
    prisma.course.count({ where: { published: true } }),
  ]);

  return (
    <PortalDashboard
      name={user.name}
      role="ADMIN"
      stats={[
        {
          label: "Registered users",
          value: users,
          detail: "Accounts across all roles",
          icon: "users",
        },
        {
          label: "Courses",
          value: courses,
          detail: "Courses created on the platform",
          icon: "courses",
        },
        {
          label: "Published courses",
          value: published,
          detail: "Courses visible to learners",
          icon: "complete",
        },
      ]}
    />
  );
}
