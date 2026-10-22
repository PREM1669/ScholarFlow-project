import { handleApiError } from "@/lib/api-error";
import { getManagedAssignment } from "@/lib/ownership";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";

type RouteContext = { params: { id: string; assignmentId: string } };

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const user = await requireRole("INSTRUCTOR", "ADMIN");
    const assignment = await getManagedAssignment(params.id, params.assignmentId, user);
    const [enrolledCount, submissions] = await Promise.all([
      prisma.enrollment.count({ where: { courseId: assignment.courseId } }),
      prisma.submission.findMany({
        where: { assignmentId: assignment.id },
        orderBy: [{ submittedAt: "desc" }],
        select: {
          id: true,
          studentId: true,
          student: { select: { name: true, email: true } },
          textAnswer: true,
          fileUrl: true,
          fileName: true,
          isLate: true,
          submittedAt: true,
          score: true,
          feedback: true,
          gradedAt: true,
        },
      }),
    ]);
    return Response.json({
      enrolledCount,
      submissions: submissions.map(({ student, ...submission }) => ({
        ...submission,
        studentName: student.name,
        studentEmail: student.email,
      })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
