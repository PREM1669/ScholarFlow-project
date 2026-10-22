import { handleApiError } from "@/lib/api-error";
import { getEnrolledAssignment } from "@/lib/enrollment";
import { requireRole } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: { assignmentId: string } };

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const user = await requireRole("STUDENT");
    const assignment = await getEnrolledAssignment(user.id, params.assignmentId);
    const submission = await prisma.submission.findUnique({
      where: {
        assignmentId_studentId: {
          assignmentId: assignment.id,
          studentId: user.id,
        },
      },
      select: {
        id: true,
        textAnswer: true,
        fileUrl: true,
        fileName: true,
        isLate: true,
        submittedAt: true,
        score: true,
        feedback: true,
        gradedAt: true,
      },
    });
    return Response.json({
      id: assignment.id,
      courseId: assignment.courseId,
      courseTitle: assignment.course.title,
      title: assignment.title,
      prompt: assignment.prompt,
      dueDate: assignment.dueDate,
      maxScore: assignment.maxScore,
      submission,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
