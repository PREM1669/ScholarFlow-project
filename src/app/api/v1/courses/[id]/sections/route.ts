import { handleApiError } from "@/lib/api-error";
import { getManagedCourse } from "@/lib/ownership";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { sectionSchema } from "@/lib/validators/course";

type RouteContext = { params: { id: string } };

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: RouteContext) {
  try {
    const user = await requireRole("INSTRUCTOR", "ADMIN");
    await getManagedCourse(params.id, user);
    const sections = await prisma.section.findMany({
      where: { courseId: params.id },
      orderBy: { order: "asc" },
      select: { id: true, title: true, order: true, videoUrl: true },
    });
    return Response.json(sections);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: Request, { params }: RouteContext) {
  try {
    const user = await requireRole("INSTRUCTOR", "ADMIN");
    await getManagedCourse(params.id, user);
    const { title } = sectionSchema.parse(await req.json());

    const last = await prisma.section.findFirst({
      where: { courseId: params.id },
      orderBy: { order: "desc" },
      select: { order: true },
    });
    const section = await prisma.section.create({
      data: { courseId: params.id, title, order: (last?.order ?? 0) + 1 },
      select: { id: true, title: true, order: true, videoUrl: true },
    });
    return Response.json(section, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
