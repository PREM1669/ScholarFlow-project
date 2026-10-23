import { z } from "zod";
import { handleApiError, HttpError } from "@/lib/api-error";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";

const bodySchema = z.object({ isActive: z.boolean() });

export async function PATCH(
  request: Request,
  context: { params: { id: string } },
) {
  try {
    const admin = await requireRole("ADMIN");
    const { isActive } = bodySchema.parse(await request.json());
    if (context.params.id === admin.id) {
      throw new HttpError(400, "You cannot change your own account status");
    }

    const user = await prisma.$transaction(async (tx) => {
      const target = await tx.user.findUnique({
        where: { id: context.params.id },
        select: { id: true, role: true, isActive: true },
      });
      if (!target) throw new HttpError(404, "User not found");
      if (target.role === "ADMIN") {
        throw new HttpError(403, "Admin accounts cannot be suspended");
      }

      if (target.isActive !== isActive) {
        await tx.user.update({
          where: { id: target.id },
          data: { isActive },
        });
        await tx.auditLog.create({
          data: {
            userId: admin.id,
            action: isActive ? "USER_ACTIVATED" : "USER_SUSPENDED",
            entity: "User",
            entityId: target.id,
          },
        });
      }

      return tx.user.findUniqueOrThrow({
        where: { id: target.id },
        select: { id: true, name: true, email: true, role: true, isActive: true },
      });
    });
    return Response.json({ user });
  } catch (error) {
    return handleApiError(error);
  }
}
