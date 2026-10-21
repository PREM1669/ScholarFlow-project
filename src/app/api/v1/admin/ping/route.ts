import { handleApiError } from "@/lib/api-error";
import { requireRole } from "@/lib/rbac";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireRole("ADMIN");
    return Response.json({ ok: true, message: "admin access granted" });
  } catch (error) {
    return handleApiError(error);
  }
}
