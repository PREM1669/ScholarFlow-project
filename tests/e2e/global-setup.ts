import { loadTestEnv } from "../../scripts/e2e-env.mjs";
import { seedE2eData, prisma } from "./support/db";

export default async function globalSetup() {
  loadTestEnv();
  try {
    await seedE2eData();
  } finally {
    await prisma.$disconnect();
  }
}
