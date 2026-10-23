import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const DAY_MS = 86_400_000;
const demoEmailPrefix = "demo.student";

function daysAgo(days: number, hour = 12) {
  const date = new Date(Date.now() - days * DAY_MS);
  date.setUTCHours(hour, 0, 0, 0);
  return date;
}

async function main() {
  const passwordHash = await bcrypt.hash("DemoPass123!", 10);
  const [courses, assignments] = await Promise.all([
    prisma.course.findMany({
      where: { published: true },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        sections: { orderBy: { order: "asc" }, select: { id: true } },
      },
    }),
    prisma.assignment.findMany({
      select: { id: true, courseId: true },
    }),
  ]);
  const usableCourses = courses.filter((course) => course.sections.length > 0);
  if (usableCourses.length === 0) {
    throw new Error(
      "No published course with sections found. Run the base seed before the demo seed.",
    );
  }

  const studentSeeds = Array.from({ length: 45 }, (_, index) => {
    const number = index + 1;
    return {
      id: `demo-student-${number}`,
      name: `Demo Student ${number.toString().padStart(2, "0")}`,
      email: `${demoEmailPrefix}${number}@demo.scholarflow.dev`,
      passwordHash,
      role: "STUDENT" as const,
      isActive: number !== 1 && number !== 24,
      createdAt: daysAgo(89 - (index % 30), 9),
    };
  });

  await prisma.$transaction(async (tx) => {
    const existing = await tx.user.findMany({
      where: { email: { startsWith: demoEmailPrefix } },
      select: { id: true },
    });
    const ids = existing.map((user) => user.id);
    if (ids.length) {
      await tx.auditLog.deleteMany({ where: { userId: { in: ids } } });
      await tx.quizAttempt.deleteMany({ where: { userId: { in: ids } } });
      await tx.submission.deleteMany({ where: { studentId: { in: ids } } });
      await tx.enrollment.deleteMany({ where: { userId: { in: ids } } });
      await tx.user.deleteMany({ where: { id: { in: ids } } });
    }

    await tx.user.createMany({ data: studentSeeds });
    const students = await tx.user.findMany({
      where: { email: { startsWith: demoEmailPrefix } },
      select: { id: true, email: true },
    });
    const byEmail = new Map(students.map((student) => [student.email, student]));
    const auditRows: {
      userId: string;
      action: string;
      entity: string;
      entityId: string;
      createdAt: Date;
    }[] = [];

    for (let index = 0; index < studentSeeds.length; index += 1) {
      const seed = studentSeeds[index];
      const student = byEmail.get(seed.email);
      if (!student) throw new Error(`Demo user was not created: ${seed.email}`);
      const accountAgeDays = 89 - (index % 30);
      const courseCount = 1 + (index % Math.min(3, usableCourses.length));
      const selectedCourses = Array.from(
        { length: courseCount },
        (_, offset) => usableCourses[(index + offset) % usableCourses.length],
      );

      for (let courseIndex = 0; courseIndex < selectedCourses.length; courseIndex += 1) {
        const course = selectedCourses[courseIndex];
        const enrollmentAge = Math.max(
          0,
          accountAgeDays -
            ((index * 3 + courseIndex * 11) % (accountAgeDays + 1)),
        );
        const enrolledAt = daysAgo(enrollmentAge, 10 + ((index + courseIndex) % 8));
        const completed = (index + courseIndex) % 4 === 0;
        const progressCount = completed
          ? course.sections.length
          : (index + courseIndex) % (course.sections.length + 1);
        const progress = course.sections
          .slice(0, progressCount)
          .map((section, position) => {
            return {
              sectionId: section.id,
              completed: true,
              completedAt: new Date(
                Math.min(
                  Date.now(),
                  enrolledAt.getTime() + (position + 1) * DAY_MS,
                ),
              ),
            };
          });
        const completedAt =
          completed && progress.length
            ? progress[progress.length - 1].completedAt
            : null;

        await tx.enrollment.create({
          data: {
            userId: student.id,
            courseId: course.id,
            enrolledAt,
            completedAt,
            progress: { create: progress },
          },
        });

        const loginDaysAgo = index % 14;
        auditRows.push({
          userId: student.id,
          action: "LOGIN",
          entity: "User",
          entityId: student.id,
          createdAt: daysAgo(loginDaysAgo, 8 + (index % 12)),
        });
        const assignment = assignments.find(
          (item) => item.courseId === course.id,
        );
        if (assignment && (index + courseIndex) % 3 === 0) {
          auditRows.push({
            userId: student.id,
            action: "AI_QUESTION",
            entity: "Course",
            entityId: course.id,
            createdAt: daysAgo((index * 3 + courseIndex) % 45, 9 + (index % 10)),
          });
        }
      }
    }
    await tx.auditLog.createMany({ data: auditRows });
  }, { timeout: 60_000 });

  console.log(
    `Created 45 demo students. Sign in with demo.student1@demo.scholarflow.dev through demo.student45@demo.scholarflow.dev; password: DemoPass123!`,
  );
}

main()
  .catch((error) => {
    console.error("Demo seed failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
