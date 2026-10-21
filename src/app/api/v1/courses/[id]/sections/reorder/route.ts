import { handleApiError, HttpError } from "@/lib/api-error";
import { getManagedCourse } from "@/lib/ownership";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { reorderSchema } from "@/lib/validators/course";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const user = await requireRole("INSTRUCTOR", "ADMIN");
    await getManagedCourse(params.id, user);
    const { orderedIds } = reorderSchema.parse(await req.json());

    const existing = await prisma.section.findMany({
      where: { courseId: params.id },
      select: { id: true },
    });
    const existingIds = new Set(existing.map((section) => section.id));
    const valid =
      orderedIds.length === existingIds.size &&
      new Set(orderedIds).size === orderedIds.length &&
      orderedIds.every((id) => existingIds.has(id));
    if (!valid) {
      throw new HttpError(
        400,
        "orderedIds must contain every section of this course exactly once",
      );
    }

    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.section.update({ where: { id }, data: { order: index + 1 } }),
      ),
    );
    return Response.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
