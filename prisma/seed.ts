import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Password123", 10);
  const users = [
    { name: "Admin User", email: "admin@scholarflow.dev", role: "ADMIN" as const },
    {
      name: "Ivy Instructor",
      email: "instructor@scholarflow.dev",
      role: "INSTRUCTOR" as const,
    },
    { name: "Sam Student", email: "student@scholarflow.dev", role: "STUDENT" as const },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: { passwordHash },
      create: { ...user, passwordHash },
    });
  }

  const instructor = await prisma.user.findUniqueOrThrow({
    where: { email: "instructor@scholarflow.dev" },
  });
  await prisma.course.updateMany({
    where: {
      title: "Foundations of Web Development",
      instructorId: instructor.id,
    },
    data: { category: "Programming" },
  });
  const existingCourse = await prisma.course.findFirst({
    where: {
      instructorId: instructor.id,
      title: "Foundations of Web Development",
    },
  });

  if (!existingCourse) {
    await prisma.course.create({
      data: {
        title: "Foundations of Web Development",
        description:
          "Build a strong foundation in the web platform, from semantic HTML and modern CSS to JavaScript and accessible interfaces.",
        price: 0,
        published: true,
        instructorId: instructor.id,
        sections: {
          create: [
            { title: "How the web works", order: 1 },
            { title: "Semantic HTML", order: 2 },
            { title: "Modern CSS essentials", order: 3 },
            { title: "JavaScript in the browser", order: 4 },
          ],
        },
      },
    });
  }

  const htmlSection = await prisma.section.findFirst({
    where: {
      title: "Semantic HTML",
      course: { instructorId: instructor.id },
    },
  });
  if (htmlSection) {
    const existingQuiz = await prisma.quiz.findUnique({
      where: { sectionId: htmlSection.id },
    });
    if (!existingQuiz) {
      await prisma.quiz.create({
        data: {
          sectionId: htmlSection.id,
          questions: {
            create: [
              {
                order: 0,
                type: "MCQ",
                text: "Which tag creates the largest heading?",
                options: ["<h6>", "<h1>", "<head>", "<title>"],
                correctIndex: 1,
              },
              {
                order: 1,
                type: "TRUE_FALSE",
                text: "HTML stands for HyperText Markup Language.",
                options: ["True", "False"],
                correctIndex: 0,
              },
              {
                order: 2,
                type: "MCQ",
                text: "Which attribute sets the destination of a link?",
                options: ["src", "href", "alt", "title"],
                correctIndex: 1,
              },
            ],
          },
        },
      });
    }
  }

  const extraCourses = [
    { title: "Python for Beginners", category: "Programming", price: 0 },
    { title: "UI Design Principles", category: "Design", price: 19.99 },
    { title: "Startup Finance Basics", category: "Business", price: 29 },
    { title: "Data Analysis with Pandas", category: "Data Science", price: 39.5 },
    { title: "Spanish for Travelers", category: "Language", price: 0 },
    { title: "Advanced React Patterns", category: "Programming", price: 49 },
    { title: "Public Speaking Essentials", category: "Business", price: 15 },
  ];
  for (const course of extraCourses) {
    const existing = await prisma.course.findFirst({
      where: { title: course.title, instructorId: instructor.id },
    });
    if (existing) continue;
    await prisma.course.create({
      data: {
        ...course,
        description: `A practical introduction to ${course.title.toLowerCase()}, with hands-on examples and clear explanations.`,
        published: true,
        instructorId: instructor.id,
        sections: {
          create: [
            {
              title: "Introduction",
              order: 1,
              content: `## Welcome\n\nThis section introduces **${course.title}**.`,
            },
            {
              title: "Core Concepts",
              order: 2,
              content: "## Core concepts\n\n- Idea one\n- Idea two\n- Idea three",
            },
          ],
        },
      },
    });
  }

  console.log("Seeded the ScholarFlow demo accounts.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
