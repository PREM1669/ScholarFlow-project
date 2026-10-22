import { handleApiError } from "@/lib/api-error";
import { requireRole } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const user = await requireRole("STUDENT");
    const searchParams = new URL(request.url).searchParams;
    const courseId = searchParams.get("courseId") ?? searchParams.get("course");
    const enrollments = await prisma.enrollment.findMany({
      where: {
        userId: user.id,
        ...(courseId ? { courseId } : {}),
      },
      select: { courseId: true },
    });
    const courseIds = enrollments.map((enrollment) => enrollment.courseId);
    const assignments = await prisma.assignment.findMany({
      where: { courseId: { in: courseIds } },
      orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
      include: {
        course: { select: { title: true } },
        submissions: {
          where: { studentId: user.id },
          select: {
            submittedAt: true,
            isLate: true,
            score: true,
            gradedAt: true,
          },
        },
      },
    });
    return Response.json(
      assignments.map(({ course, submissions, ...assignment }) => {
        const submission = submissions[0];
        return {
          ...assignment,
          courseTitle: course.title,
          status: submission
            ? submission.gradedAt
              ? "graded"
              : "submitted"
            : "not_submitted",
          submittedAt: submission?.submittedAt ?? null,
          isLate: submission?.isLate ?? false,
          score: submission?.score ?? null,
        };
      }),
    );
  } catch (error) {
    return handleApiError(error);
  }
}
