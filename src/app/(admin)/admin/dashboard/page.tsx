import { requirePageRole } from "@/lib/rbac";
import { AdminAnalyticsDashboard } from "@/components/admin/admin-analytics-dashboard";

export default async function AdminDashboard() {
  const user = await requirePageRole("ADMIN");
  return <AdminAnalyticsDashboard name={user.name} />;
}
