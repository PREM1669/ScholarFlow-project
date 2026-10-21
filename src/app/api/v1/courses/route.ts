import { handleApiError } from "@/lib/api-error";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { courseSchema } from "@/lib/validators/course";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireRole("INSTRUCTOR", "ADMIN");
    const courses = await prisma.course.findMany({
      where: user.role === "ADMIN" ? {} : { instructorId: user.id },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { sections: true, enrollments: true } } },
    });
    return Response.json(courses);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireRole("INSTRUCTOR", "ADMIN");
    const body = courseSchema.parse(await req.json());
    const course = await prisma.course.create({
      data: {
        title: body.title,
        description: body.description,
        price: body.price,
        thumbnailUrl: body.thumbnailUrl ?? null,
        instructorId: user.id,
      },
    });
    return Response.json(course, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
