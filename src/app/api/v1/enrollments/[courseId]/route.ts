import { HttpError, handleApiError } from "@/lib/api-error";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";

export const dynamic = "force-dynamic";

export async function DELETE(
  _request: Request,
  { params }: { params: { courseId: string } },
) {
  try {
    const user = await requireRole("STUDENT");
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: { userId: user.id, courseId: params.courseId },
      },
    });
    if (!enrollment) {
      throw new HttpError(404, "You are not enrolled in this course");
    }
    await prisma.$transaction([
      prisma.quizAttempt.deleteMany({
        where: {
          userId: user.id,
          quiz: { section: { courseId: params.courseId } },
        },
      }),
      prisma.enrollment.delete({ where: { id: enrollment.id } }),
    ]);
    return Response.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
