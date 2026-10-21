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
