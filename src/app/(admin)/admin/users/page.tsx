import { AdminUserManager } from "@/components/admin/admin-user-manager";
import { requirePageRole } from "@/lib/rbac";

export default async function AdminUsersPage() {
  const user = await requirePageRole("ADMIN");
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Users</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage ScholarFlow accounts and access.
        </p>
      </div>
      <AdminUserManager currentUserId={user.id} />
    </div>
  );
}
