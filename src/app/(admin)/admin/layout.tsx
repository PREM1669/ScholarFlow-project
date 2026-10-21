import { PortalShell } from "@/components/shared/portal-shell";
import { requirePageRole } from "@/lib/rbac";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requirePageRole("ADMIN");
  return <PortalShell user={user}>{children}</PortalShell>;
}
