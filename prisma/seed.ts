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
