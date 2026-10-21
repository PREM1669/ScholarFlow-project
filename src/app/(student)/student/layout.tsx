import { PortalShell } from "@/components/shared/portal-shell";
import { requirePageRole } from "@/lib/rbac";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requirePageRole("STUDENT");
  return <PortalShell user={user}>{children}</PortalShell>;
}
