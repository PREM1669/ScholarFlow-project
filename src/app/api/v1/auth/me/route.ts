import { handleApiError } from "@/lib/api-error";
import { requireRole } from "@/lib/rbac";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireRole();
    return Response.json(user);
  } catch (error) {
    return handleApiError(error);
  }
}
