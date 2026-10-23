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

  const assignmentCourse = await prisma.course.findFirstOrThrow({
    where: {
      instructorId: instructor.id,
      title: "Foundations of Web Development",
    },
  });
  const student = await prisma.user.findUniqueOrThrow({
    where: { email: "student@scholarflow.dev" },
  });
  await prisma.enrollment.upsert({
    where: {
      userId_courseId: { userId: student.id, courseId: assignmentCourse.id },
    },
    update: {},
    create: { userId: student.id, courseId: assignmentCourse.id },
  });
  const assignmentSeeds = [
    {
      title: "Build an accessible web page",
      prompt:
        "Create a semantic HTML page with a clear heading structure, accessible links, and a short explanation of your design decisions.",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      maxScore: 100,
    },
    {
      title: "HTML structure reflection",
      prompt:
        "Explain how semantic HTML improves accessibility and describe two elements you used in your work.",
      dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
      maxScore: 50,
    },
  ];
  const seededAssignments = [];
  for (const assignment of assignmentSeeds) {
    const existing = await prisma.assignment.findFirst({
      where: { courseId: assignmentCourse.id, title: assignment.title },
    });
    seededAssignments.push(
      existing
        ? await prisma.assignment.update({
            where: { id: existing.id },
            data: assignment,
          })
        : await prisma.assignment.create({
            data: { ...assignment, courseId: assignmentCourse.id },
          }),
    );
  }
  const lateAssignment = seededAssignments[1];
  await prisma.submission.upsert({
    where: {
      assignmentId_studentId: {
        assignmentId: lateAssignment.id,
        studentId: student.id,
      },
    },
    update: {
      textAnswer:
        "Semantic elements describe the purpose of each region. I used main for the page content and nav for its links.",
      submittedAt: new Date(lateAssignment.dueDate.getTime() + 60 * 60 * 1000),
      isLate: true,
    },
    create: {
      assignmentId: lateAssignment.id,
      studentId: student.id,
      textAnswer:
        "Semantic elements describe the purpose of each region. I used main for the page content and nav for its links.",
      submittedAt: new Date(lateAssignment.dueDate.getTime() + 60 * 60 * 1000),
      isLate: true,
    },
  });

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

  const sampleNotes: Record<string, string> = {
    "Semantic HTML": [
      "## What is HTML?",
      "",
      "HTML (HyperText Markup Language) describes the structure of a web page. The browser reads it and builds the page from its elements.",
      "",
      "## Common elements",
      "",
      "- h1 to h6 create headings, with h1 the largest.",
      "- p creates a paragraph.",
      "- a creates a link, and its href attribute holds the destination.",
      "- img shows an image, and its alt attribute describes it for screen readers.",
      "- ul and ol create bulleted and numbered lists, with li for each item.",
      "",
      "## Page skeleton",
      "",
      "Every page has a doctype, an html element, a head containing the title, and a body containing the visible content.",
    ].join("\n"),
    "Modern CSS essentials": [
      "## What is CSS?",
      "",
      "CSS (Cascading Style Sheets) controls how HTML looks: colors, fonts, spacing and layout.",
      "",
      "## Selectors",
      "",
      "- A type selector such as p targets every paragraph.",
      "- A class selector such as .card targets elements with that class.",
      "- An id selector such as #header targets one element.",
      "",
      "## Layout",
      "",
      "Flexbox arranges items in one direction, a row or a column, and suits navigation bars. Grid arranges items in rows and columns together and suits whole page layouts.",
      "",
      "## The box model",
      "",
      "Every element is a box made of content, padding, border and margin.",
    ].join("\n"),
    "JavaScript in the browser": [
      "## What is JavaScript?",
      "",
      "JavaScript adds behavior to a page: it responds to clicks, changes content and talks to servers.",
      "",
      "## Variables",
      "",
      "Use const for values that never change and let for values that do. Avoid var in modern code.",
      "",
      "## Functions",
      "",
      "A function is a reusable block of code. Arrow functions have a short syntax, for example: const add = (a, b) => a + b.",
      "",
      "## Events and the DOM",
      "",
      "The DOM is the browser's model of the page. Use addEventListener to run a function when a user clicks or types.",
    ].join("\n"),
  };

  for (const [title, content] of Object.entries(sampleNotes)) {
    await prisma.section.updateMany({
      where: {
        title,
        course: {
          title: "Foundations of Web Development",
          instructorId: instructor.id,
        },
      },
      data: { content },
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
