import { prisma } from "@/lib/prisma";
import { HttpError } from "@/lib/api-error";

export async function requireEnrollment(userId: string, courseId: string) {
  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });
  if (!enrollment) throw new HttpError(403, "You are not enrolled in this course");
  return enrollment;
}

export async function getEnrolledSection(
  userId: string,
  courseId: string,
  sectionId: string,
) {
  const enrollment = await requireEnrollment(userId, courseId);
  const section = await prisma.section.findFirst({
    where: { id: sectionId, courseId },
  });
  if (!section) throw new HttpError(404, "Section not found");
  return { enrollment, section };
}
