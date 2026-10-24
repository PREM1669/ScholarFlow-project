import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import dotenv from "dotenv";

const root = process.cwd();

function readEnvFile(filename) {
  const file = path.join(root, filename);
  return existsSync(file) ? dotenv.parse(readFileSync(file)) : {};
}

function databaseIdentity(value) {
  try {
    const url = new URL(value);
    if (!["postgres:", "postgresql:"].includes(url.protocol)) return null;
    return `${url.hostname.toLowerCase()}:${url.port || "5432"}${url.pathname.replace(/\/+$/, "")}`;
  } catch {
    return null;
  }
}

export function loadTestEnv() {
  const testFile = path.join(root, ".env.test");
  if (!existsSync(testFile)) {
    throw new Error(
      "E2E tests require a dedicated .env.test. Copy .env.test.example and configure a separate test database.",
    );
  }

  const testValues = dotenv.parse(readFileSync(testFile));
  const testDatabaseUrls = ["DATABASE_URL", "DIRECT_URL"]
    .map((key) => testValues[key]?.trim())
    .filter(Boolean);
  if (testDatabaseUrls.length !== 2) {
    throw new Error(
      ".env.test must define both DATABASE_URL and DIRECT_URL for the isolated E2E database.",
    );
  }

  const developmentValues = [
    ...(process.env.SCHOLARFLOW_E2E_ENV_LOADED === "1" ? [] : [process.env]),
    readEnvFile(".env"),
    readEnvFile(".env.local"),
  ];
  const developmentDatabaseUrls = developmentValues.flatMap((values) =>
    ["DATABASE_URL", "DIRECT_URL"]
      .map((key) => values[key]?.trim())
      .filter(Boolean),
  );
  for (const testUrl of testDatabaseUrls) {
    const testIdentity = databaseIdentity(testUrl);
    if (!testIdentity) {
      throw new Error(".env.test contains an invalid PostgreSQL database URL.");
    }
    for (const developmentUrl of developmentDatabaseUrls) {
      if (databaseIdentity(developmentUrl) === testIdentity) {
        throw new Error(
          "E2E database safety check failed: .env.test points to a development database.",
        );
      }
    }
  }

  const nextAuthSecret = testValues.NEXTAUTH_SECRET?.trim();
  if (!nextAuthSecret || nextAuthSecret === "replace-with-a-random-test-only-secret") {
    throw new Error(".env.test must define a test-only NEXTAUTH_SECRET.");
  }

  dotenv.config({ path: testFile, override: true });
  process.env.NEXTAUTH_URL ??= "http://127.0.0.1:3101";
  process.env.SCHOLARFLOW_E2E_ENV_LOADED = "1";
}
