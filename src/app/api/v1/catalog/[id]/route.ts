import { HttpError, handleApiError } from "@/lib/api-error";
import { progressSummary } from "@/lib/progress";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const user = await requireRole("STUDENT");
    const course = await prisma.course.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        title: true,
        description: true,
        thumbnailUrl: true,
        price: true,
        category: true,
        published: true,
        instructor: { select: { name: true } },
        _count: { select: { enrollments: true } },
        sections: {
          orderBy: { order: "asc" },
          select: {
            id: true,
            title: true,
            order: true,
            videoUrl: true,
            quiz: { select: { _count: { select: { questions: true } } } },
          },
        },
        enrollments: {
          where: { userId: user.id },
          select: {
            enrolledAt: true,
            completedAt: true,
            _count: { select: { progress: { where: { completed: true } } } },
          },
        },
      },
    });
    const enrollment = course?.enrollments[0] ?? null;
    if (!course || (!course.published && !enrollment)) {
      throw new HttpError(404, "Course not found");
    }
    return Response.json({
      id: course.id,
      title: course.title,
      description: course.description,
      thumbnailUrl: course.thumbnailUrl,
      price: course.price,
      category: course.category,
      instructorName: course.instructor.name,
      enrollmentCount: course._count.enrollments,
      sections: course.sections.map((section) => ({
        id: section.id,
        title: section.title,
        order: section.order,
        hasVideo: section.videoUrl !== null,
        hasQuiz: (section.quiz?._count.questions ?? 0) > 0,
      })),
      enrollment: enrollment
        ? {
            enrolledAt: enrollment.enrolledAt,
            completedAt: enrollment.completedAt,
            ...progressSummary(enrollment._count.progress, course.sections.length),
          }
        : null,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
