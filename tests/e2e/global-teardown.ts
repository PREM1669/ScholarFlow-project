import { loadTestEnv } from "../../scripts/e2e-env.mjs";
import { cleanupE2eData, prisma } from "./support/db";

export default async function globalTeardown() {
  loadTestEnv();
  try {
    await cleanupE2eData();
  } finally {
    await prisma.$disconnect();
  }
}
