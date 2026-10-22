import { HttpError, handleApiError } from "@/lib/api-error";
import { getEnrolledSection } from "@/lib/enrollment";
import { progressSummary } from "@/lib/progress";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { progressSchema } from "@/lib/validators/learning";

export const dynamic = "force-dynamic";

type Context = { params: { courseId: string; sectionId: string } };

export async function PUT(request: Request, { params }: Context) {
  try {
    const user = await requireRole("STUDENT");
    const { completed } = progressSchema.parse(await request.json());
    const { enrollment, section } = await getEnrolledSection(
      user.id,
      params.courseId,
      params.sectionId,
    );
    if (completed) {
      const quiz = await prisma.quiz.findUnique({
        where: { sectionId: section.id },
        select: { id: true, _count: { select: { questions: true } } },
      });
      if (quiz && quiz._count.questions > 0) {
        const attempt = await prisma.quizAttempt.findUnique({
          where: { userId_quizId: { userId: user.id, quizId: quiz.id } },
          select: { id: true },
        });
        if (!attempt) {
          throw new HttpError(
            400,
            "Submit the quiz before completing this section",
          );
        }
      }
    }
    const result = await prisma.$transaction(async (transaction) => {
      await transaction.progress.upsert({
        where: {
          enrollmentId_sectionId: {
            enrollmentId: enrollment.id,
            sectionId: section.id,
          },
        },
        update: {
          completed,
          completedAt: completed ? new Date() : null,
        },
        create: {
          enrollmentId: enrollment.id,
          sectionId: section.id,
          completed,
          completedAt: completed ? new Date() : null,
        },
      });
      const [done, total] = await Promise.all([
        transaction.progress.count({
          where: { enrollmentId: enrollment.id, completed: true },
        }),
        transaction.section.count({ where: { courseId: params.courseId } }),
      ]);
      const summary = progressSummary(done, total);
      const completedAt = summary.isCompleted
        ? enrollment.completedAt ?? new Date()
        : null;
      await transaction.enrollment.update({
        where: { id: enrollment.id },
        data: { completedAt },
      });
      return { ...summary, completedAt };
    });
    return Response.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
