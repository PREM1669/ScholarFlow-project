import { HttpError, handleApiError } from "@/lib/api-error";
import { computeAchievements } from "@/lib/achievements";
import { progressSummary } from "@/lib/progress";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { enrollSchema } from "@/lib/validators/learning";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireRole("STUDENT");
    const [enrollments, attempts] = await Promise.all([
      prisma.enrollment.findMany({
        where: { userId: user.id },
        orderBy: { enrolledAt: "desc" },
        include: {
          course: {
            select: {
              id: true,
              title: true,
              thumbnailUrl: true,
              category: true,
              instructor: { select: { name: true } },
              _count: { select: { sections: true } },
            },
          },
          _count: { select: { progress: { where: { completed: true } } } },
        },
      }),
      prisma.quizAttempt.findMany({
        where: { userId: user.id },
        select: { score: true, total: true },
      }),
    ]);
    const items = enrollments.map((enrollment) => ({
      id: enrollment.id,
      enrolledAt: enrollment.enrolledAt,
      completedAt: enrollment.completedAt,
      course: {
        id: enrollment.course.id,
        title: enrollment.course.title,
        thumbnailUrl: enrollment.course.thumbnailUrl,
        category: enrollment.course.category,
        instructorName: enrollment.course.instructor.name,
      },
      ...progressSummary(
        enrollment._count.progress,
        enrollment.course._count.sections,
      ),
    }));
    const achievements = computeAchievements({
      enrollments: items.length,
      completedSections: items.reduce(
        (count, item) => count + item.completedSections,
        0,
      ),
      perfectQuizzes: attempts.filter(
        (attempt) => attempt.total > 0 && attempt.score === attempt.total,
      ).length,
      completedCourses: items.filter((item) => item.isCompleted).length,
    });
    return Response.json({ enrollments: items, achievements });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireRole("STUDENT");
    const { courseId } = enrollSchema.parse(await request.json());
    const course = await prisma.course.findFirst({
      where: { id: courseId, published: true },
      select: { id: true },
    });
    if (!course) throw new HttpError(404, "Course not found");
    const enrollment = await prisma.enrollment.upsert({
      where: { userId_courseId: { userId: user.id, courseId } },
      update: {},
      create: { userId: user.id, courseId },
    });
    return Response.json(enrollment, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
