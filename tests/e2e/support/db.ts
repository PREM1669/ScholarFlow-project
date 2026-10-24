import bcrypt from "bcryptjs";
import { PrismaClient, QuestionType, Role } from "@prisma/client";
import { PASSWORD, USERS } from "./users";

export const prisma = new PrismaClient();

export type Fixtures = {
  courseId: string;
  introSectionId: string;
  quizSectionId: string;
  assignmentId: string;
};

const prefix = "sf-e2e-";

export async function cleanupE2eData() {
  const users = await prisma.user.findMany({
    where: { email: { startsWith: prefix, endsWith: "@e2e.scholarflow.dev" } },
    select: { id: true },
  });
  const userIds = users.map(({ id }) => id);
  if (userIds.length) {
    await prisma.auditLog.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.quizAttempt.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.submission.deleteMany({ where: { studentId: { in: userIds } } });
    await prisma.progress.deleteMany({
      where: { enrollment: { userId: { in: userIds } } },
    });
    await prisma.enrollment.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.course.deleteMany({ where: { instructorId: { in: userIds } } });
    await prisma.user.deleteMany({ where: { id: { in: userIds } } });
  }
}

export async function seedE2eData(): Promise<Fixtures> {
  await cleanupE2eData();
  const passwordHash = await bcrypt.hash(PASSWORD, 10);
  const records = [
    ["student", USERS.student, Role.STUDENT],
    ["instructor", USERS.instructor, Role.INSTRUCTOR],
    ["admin", USERS.admin, Role.ADMIN],
    ["outsider", USERS.outsider, Role.STUDENT],
    ["other instructor", USERS.otherInstructor, Role.INSTRUCTOR],
  ] as const;
  const createdUsers = await Promise.all(
    records.map(([name, email, role]) =>
      prisma.user.create({
        data: { name, email, role, passwordHash },
        select: { id: true, email: true },
      }),
    ),
  );
  const instructor = createdUsers.find(
    ({ email }) => email === USERS.instructor,
  );
  const student = createdUsers.find(({ email }) => email === USERS.student);
  if (!instructor || !student) {
    throw new Error("Unable to create required E2E user fixtures.");
  }

  const course = await prisma.course.create({
    data: {
      title: "ScholarFlow E2E Course",
      description: "Course data created only for isolated end-to-end tests.",
      category: "Programming",
      price: 0,
      published: true,
      instructorId: instructor.id,
      sections: {
        create: [
          {
            title: "E2E Intro",
            order: 1,
            content:
              "Flexbox arranges items in one direction, either as a row or a column.",
            quiz: {
              create: {
                questions: {
                  create: [
                    {
                      type: QuestionType.MCQ,
                      text: "Which layout arranges items in one direction?",
                      options: ["Grid", "Flexbox"],
                      correctIndex: 1,
                      order: 0,
                    },
                  ],
                },
              },
            },
          },
          {
            title: "E2E Layout",
            order: 2,
            content: "Grid arranges items in rows and columns.",
          },
        ],
      },
      assignments: {
        create: {
          title: "ScholarFlow E2E Assignment",
          prompt: "Describe how Flexbox arranges items.",
          dueDate: new Date(Date.now() + 3 * 86_400_000),
          maxScore: 100,
        },
      },
    },
    include: { sections: { include: { quiz: true } }, assignments: true },
  });

  const introSection = course.sections.find(
    ({ title }) => title === "E2E Intro",
  );
  const quizSection = course.sections.find(({ quiz }) => Boolean(quiz));
  const assignment = course.assignments[0];
  if (!introSection || !quizSection || !assignment) {
    throw new Error("Unable to create required E2E course fixtures.");
  }
  await prisma.enrollment.create({
    data: { userId: student.id, courseId: course.id },
  });

  return {
    courseId: course.id,
    introSectionId: introSection.id,
    quizSectionId: quizSection.id,
    assignmentId: assignment.id,
  };
}

export async function getFixtures(): Promise<Fixtures> {
  const course = await prisma.course.findFirst({
    where: { title: "ScholarFlow E2E Course" },
    include: { sections: { include: { quiz: true } }, assignments: true },
  });
  const introSection = course?.sections.find(
    ({ title }) => title === "E2E Intro",
  );
  const quizSection = course?.sections.find(({ quiz }) => Boolean(quiz));
  const assignment = course?.assignments[0];
  if (!course || !introSection || !quizSection || !assignment) {
    throw new Error("E2E fixtures are missing from the isolated test database.");
  }
  return {
    courseId: course.id,
    introSectionId: introSection.id,
    quizSectionId: quizSection.id,
    assignmentId: assignment.id,
  };
}

export async function resetStudent() {
  const student = await prisma.user.findUnique({
    where: { email: USERS.student },
    select: { id: true },
  });
  const fixtures = await getFixtures();
  if (!student) throw new Error("The E2E student fixture is missing.");
  await prisma.quizAttempt.deleteMany({
    where: { userId: student.id, quiz: { sectionId: fixtures.quizSectionId } },
  });
  await prisma.submission.deleteMany({
    where: { studentId: student.id, assignmentId: fixtures.assignmentId },
  });
  const enrollment = await prisma.enrollment.upsert({
    where: {
      userId_courseId: { userId: student.id, courseId: fixtures.courseId },
    },
    update: { completedAt: null },
    create: { userId: student.id, courseId: fixtures.courseId },
  });
  await prisma.progress.deleteMany({ where: { enrollmentId: enrollment.id } });
}

export async function resetOutsider() {
  const outsider = await prisma.user.findUnique({
    where: { email: USERS.outsider },
    select: { id: true },
  });
  const fixtures = await getFixtures();
  if (!outsider) throw new Error("The E2E outsider fixture is missing.");
  await prisma.quizAttempt.deleteMany({
    where: { userId: outsider.id, quiz: { section: { courseId: fixtures.courseId } } },
  });
  await prisma.submission.deleteMany({
    where: { studentId: outsider.id, assignmentId: fixtures.assignmentId },
  });
  await prisma.enrollment.deleteMany({
    where: { userId: outsider.id, courseId: fixtures.courseId },
  });
}
