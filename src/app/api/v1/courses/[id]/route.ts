import { handleApiError, HttpError } from "@/lib/api-error";
import { deleteRawAsset } from "@/lib/cloudinary";
import { getManagedCourse } from "@/lib/ownership";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { courseUpdateSchema } from "@/lib/validators/course";

type RouteContext = { params: { id: string } };

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: RouteContext) {
  try {
    const user = await requireRole("INSTRUCTOR", "ADMIN");
    const course = await getManagedCourse(params.id, user);
    return Response.json(course);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: Request, { params }: RouteContext) {
  try {
    const user = await requireRole("INSTRUCTOR", "ADMIN");
    await getManagedCourse(params.id, user);
    const body = courseUpdateSchema.parse(await req.json());

    if (body.published === true) {
      const sectionCount = await prisma.section.count({
        where: { courseId: params.id },
      });
      if (sectionCount === 0) {
        throw new HttpError(400, "Add at least one section before publishing");
      }
    }

    const course = await prisma.course.update({
      where: { id: params.id },
      data: body,
    });
    return Response.json(course);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_req: Request, { params }: RouteContext) {
  try {
    const user = await requireRole("INSTRUCTOR", "ADMIN");
    const course = await getManagedCourse(params.id, user);

    const submissions = await prisma.submission.findMany({
      where: { assignment: { courseId: course.id }, filePublicId: { not: null } },
      select: { filePublicId: true },
    });
    await prisma.$transaction([
      prisma.auditLog.create({
        data: {
          userId: user.id,
          action: "COURSE_DELETED",
          entity: "Course",
          entityId: course.id,
        },
      }),
      prisma.course.delete({ where: { id: course.id } }),
    ]);
    await Promise.all(
      submissions.flatMap((submission) =>
        submission.filePublicId ? [deleteRawAsset(submission.filePublicId)] : [],
      ),
    );
    return Response.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
