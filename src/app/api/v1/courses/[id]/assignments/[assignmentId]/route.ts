import { handleApiError, HttpError } from "@/lib/api-error";
import { deleteRawAsset } from "@/lib/cloudinary";
import { getManagedAssignment } from "@/lib/ownership";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { assignmentUpdateSchema } from "@/lib/validators/assignment";

type RouteContext = { params: { id: string; assignmentId: string } };

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const user = await requireRole("INSTRUCTOR", "ADMIN");
    const assignment = await getManagedAssignment(params.id, params.assignmentId, user);
    return Response.json(assignment);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const user = await requireRole("INSTRUCTOR", "ADMIN");
    const existing = await getManagedAssignment(params.id, params.assignmentId, user);
    const data = assignmentUpdateSchema.parse(await request.json());
    const maxScore = data.maxScore ?? existing.maxScore;
    if (maxScore !== existing.maxScore) {
      const overScored = await prisma.submission.findFirst({
        where: { assignmentId: existing.id, score: { gt: maxScore } },
        select: { id: true },
      });
      if (overScored) {
        throw new HttpError(400, "Max score cannot be lower than an existing submission score");
      }
    }
    const assignment = await prisma.assignment.update({
      where: { id: existing.id },
      data,
    });
    return Response.json(assignment);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const user = await requireRole("INSTRUCTOR", "ADMIN");
    const assignment = await getManagedAssignment(params.id, params.assignmentId, user);
    const submissions = await prisma.submission.findMany({
      where: { assignmentId: assignment.id, filePublicId: { not: null } },
      select: { filePublicId: true },
    });
    await prisma.$transaction([
      prisma.auditLog.create({
        data: {
          userId: user.id,
          action: "ASSIGNMENT_DELETED",
          entity: "Assignment",
          entityId: assignment.id,
        },
      }),
      prisma.assignment.delete({ where: { id: assignment.id } }),
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
