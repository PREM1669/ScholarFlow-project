import type { Role } from "@prisma/client";
import { HttpError } from "@/lib/api-error";
import { prisma } from "@/lib/prisma";

export async function getManagedCourse(
  courseId: string,
  user: { id: string; role: Role },
) {
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) throw new HttpError(404, "Course not found");
  if (user.role !== "ADMIN" && course.instructorId !== user.id) {
    throw new HttpError(403, "You do not own this course");
  }
  return course;
}
