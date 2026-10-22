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

export async function getManagedSection(
  courseId: string,
  sectionId: string,
  user: { id: string; role: Role },
) {
  await getManagedCourse(courseId, user);
  const section = await prisma.section.findFirst({
    where: { id: sectionId, courseId },
  });
  if (!section) throw new HttpError(404, "Section not found");
  return section;
}

export async function getManagedAssignment(
  courseId: string,
  assignmentId: string,
  user: { id: string; role: Role },
) {
  await getManagedCourse(courseId, user);
  const assignment = await prisma.assignment.findFirst({
    where: { id: assignmentId, courseId },
  });
  if (!assignment) throw new HttpError(404, "Assignment not found");
  return assignment;
}
