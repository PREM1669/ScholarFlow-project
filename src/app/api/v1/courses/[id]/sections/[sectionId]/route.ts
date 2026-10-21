import { handleApiError, HttpError } from "@/lib/api-error";
import { getManagedCourse } from "@/lib/ownership";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { sectionSchema } from "@/lib/validators/course";

type RouteContext = { params: { id: string; sectionId: string } };

async function getSection(courseId: string, sectionId: string) {
  const section = await prisma.section.findFirst({
    where: { id: sectionId, courseId },
  });
  if (!section) throw new HttpError(404, "Section not found");
  return section;
}

export async function PATCH(req: Request, { params }: RouteContext) {
  try {
    const user = await requireRole("INSTRUCTOR", "ADMIN");
    await getManagedCourse(params.id, user);
    await getSection(params.id, params.sectionId);
    const { title } = sectionSchema.parse(await req.json());

    const section = await prisma.section.update({
      where: { id: params.sectionId },
      data: { title },
      select: { id: true, title: true, order: true, videoUrl: true },
    });
    return Response.json(section);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_req: Request, { params }: RouteContext) {
  try {
    const user = await requireRole("INSTRUCTOR", "ADMIN");
    await getManagedCourse(params.id, user);
    await getSection(params.id, params.sectionId);

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
