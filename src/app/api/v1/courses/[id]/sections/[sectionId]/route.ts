import { handleApiError } from "@/lib/api-error";
import { getManagedSection } from "@/lib/ownership";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { sectionUpdateSchema } from "@/lib/validators/section";

type RouteContext = { params: { id: string; sectionId: string } };

const sectionSelect = {
  id: true,
  courseId: true,
  title: true,
  order: true,
  content: true,
  videoUrl: true,
} as const;

export async function GET(_req: Request, { params }: RouteContext) {
  try {
    const user = await requireRole("INSTRUCTOR", "ADMIN");
    const section = await getManagedSection(
      params.id,
      params.sectionId,
      user,
    );
    return Response.json(section);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: Request, { params }: RouteContext) {
  try {
    const user = await requireRole("INSTRUCTOR", "ADMIN");
    await getManagedSection(params.id, params.sectionId, user);
    const data = sectionUpdateSchema.parse(await req.json());
    const section = await prisma.section.update({
      where: { id: params.sectionId },
      data,
      select: sectionSelect,
    });
    return Response.json(section);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_req: Request, { params }: RouteContext) {
  try {
    const user = await requireRole("INSTRUCTOR", "ADMIN");
    await getManagedSection(params.id, params.sectionId, user);

    const remaining = await prisma.section.findMany({
      where: { courseId: params.id, NOT: { id: params.sectionId } },
      orderBy: { order: "asc" },
      select: { id: true },
    });

    await prisma.$transaction([
      prisma.section.delete({ where: { id: params.sectionId } }),
      ...remaining.map((section, index) =>
        prisma.section.update({
          where: { id: section.id },
          data: { order: index + 1 },
        }),
      ),
    ]);
    return Response.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
