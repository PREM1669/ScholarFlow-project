import { handleApiError, HttpError } from "@/lib/api-error";
import { getManagedAssignment } from "@/lib/ownership";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { gradeSchema } from "@/lib/validators/assignment";

type RouteContext = {
  params: { id: string; assignmentId: string; submissionId: string };
};

export const dynamic = "force-dynamic";

export async function PUT(request: Request, { params }: RouteContext) {
  try {
    const user = await requireRole("INSTRUCTOR", "ADMIN");
    const assignment = await getManagedAssignment(params.id, params.assignmentId, user);
    const data = gradeSchema.parse(await request.json());
    if (data.score > assignment.maxScore) {
      throw new HttpError(400, `Score cannot exceed ${assignment.maxScore}`);
    }
    const submission = await prisma.submission.findFirst({
      where: { id: params.submissionId, assignmentId: assignment.id },
      select: { id: true },
    });
    if (!submission) throw new HttpError(404, "Submission not found");

    const [graded] = await prisma.$transaction([
      prisma.submission.update({
        where: { id: submission.id },
        data: {
          score: data.score,
          feedback: data.feedback ?? null,
          gradedAt: new Date(),
        },
        select: {
          id: true,
          studentId: true,
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
      prisma.auditLog.create({
        data: {
          userId: user.id,
          action: "SUBMISSION_GRADED",
          entity: "Submission",
          entityId: submission.id,
        },
      }),
    ]);
    return Response.json(graded);
  } catch (error) {
    return handleApiError(error);
  }
}
