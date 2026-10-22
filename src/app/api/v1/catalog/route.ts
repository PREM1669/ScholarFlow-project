import type { Prisma } from "@prisma/client";
import { handleApiError } from "@/lib/api-error";
import { CATALOG_PAGE_SIZE } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { catalogQuerySchema } from "@/lib/validators/learning";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const user = await requireRole("STUDENT");
    const raw: Record<string, string> = {};
    new URL(request.url).searchParams.forEach((value, key) => {
      if (value !== "") raw[key] = value;
    });
    const { q, category, price, sort, page } = catalogQuerySchema.parse(raw);
    const where: Prisma.CourseWhereInput = {
      published: true,
      ...(category ? { category } : {}),
      ...(price === "free" ? { price: 0 } : {}),
      ...(price === "paid" ? { price: { gt: 0 } } : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    };
    const orderBy: Prisma.CourseOrderByWithRelationInput =
      sort === "title"
        ? { title: "asc" }
        : sort === "popular"
          ? { enrollments: { _count: "desc" } }
          : { createdAt: "desc" };
    const [total, courses] = await Promise.all([
      prisma.course.count({ where }),
      prisma.course.findMany({
        where,
        orderBy: [orderBy, { id: "asc" }],
        skip: (page - 1) * CATALOG_PAGE_SIZE,
        take: CATALOG_PAGE_SIZE,
        select: {
          id: true,
          title: true,
          description: true,
          thumbnailUrl: true,
          price: true,
          category: true,
          instructor: { select: { name: true } },
          _count: { select: { sections: true, enrollments: true } },
          enrollments: { where: { userId: user.id }, select: { id: true } },
        },
      }),
    ]);
    return Response.json({
      items: courses.map((course) => ({
        id: course.id,
        title: course.title,
        description: course.description,
        thumbnailUrl: course.thumbnailUrl,
        price: course.price,
        category: course.category,
        instructorName: course.instructor.name,
        sectionCount: course._count.sections,
        enrollmentCount: course._count.enrollments,
        enrolled: course.enrollments.length > 0,
      })),
      total,
      page,
      pageSize: CATALOG_PAGE_SIZE,
      totalPages: Math.max(1, Math.ceil(total / CATALOG_PAGE_SIZE)),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
