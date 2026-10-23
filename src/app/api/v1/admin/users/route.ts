import { Role } from "@prisma/client";
import { z } from "zod";
import { handleApiError } from "@/lib/api-error";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";

const querySchema = z.object({
  q: z.string().trim().max(100).default(""),
  role: z.nativeEnum(Role).optional(),
  status: z.enum(["ACTIVE", "SUSPENDED"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
});

const PAGE_SIZE = 10;
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await requireRole("ADMIN");
    const filters = querySchema.parse(
      Object.fromEntries(new URL(request.url).searchParams),
    );
    const where = {
      ...(filters.q
        ? {
            OR: [
              { name: { contains: filters.q, mode: "insensitive" as const } },
              { email: { contains: filters.q, mode: "insensitive" as const } },
            ],
          }
        : {}),
      ...(filters.role ? { role: filters.role } : {}),
      ...(filters.status
        ? { isActive: filters.status === "ACTIVE" }
        : {}),
    };

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
        orderBy: [{ createdAt: "desc" }, { id: "asc" }],
        skip: (filters.page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
    ]);

    return Response.json({
      users,
      page: filters.page,
      pageSize: PAGE_SIZE,
      total,
      totalPages: Math.ceil(total / PAGE_SIZE),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
