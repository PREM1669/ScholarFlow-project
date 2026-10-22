import { handleApiError } from "@/lib/api-error";
import { getManagedCourse } from "@/lib/ownership";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { assignmentSchema } from "@/lib/validators/assignment";

type RouteContext = { params: { id: string } };

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const user = await requireRole("INSTRUCTOR", "ADMIN");
    await getManagedCourse(params.id, user);
    const assignments = await prisma.assignment.findMany({
      where: { courseId: params.id },
      orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
      include: {
        _count: { select: { submissions: true } },
        submissions: { where: { gradedAt: { not: null } }, select: { id: true } },
      },
    });
    return Response.json(
      assignments.map(({ submissions, _count, ...assignment }) => ({
        ...assignment,
        submittedCount: _count.submissions,
        gradedCount: submissions.length,
      })),
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request, { params }: RouteContext) {
  try {
    const user = await requireRole("INSTRUCTOR", "ADMIN");
    await getManagedCourse(params.id, user);
    const data = assignmentSchema.parse(await request.json());
    const assignment = await prisma.assignment.create({
      data: { ...data, courseId: params.id },
    });
    return Response.json(assignment, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
