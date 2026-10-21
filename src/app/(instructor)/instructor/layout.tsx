import { PortalShell } from "@/components/shared/portal-shell";
import { requirePageRole } from "@/lib/rbac";

export default async function InstructorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requirePageRole("INSTRUCTOR", "ADMIN");
  return <PortalShell user={user}>{children}</PortalShell>;
}
