const nextJest = require("next/jest");

const createJestConfig = nextJest({ dir: "./" });

/** @type {import('jest').Config} */
const config = {
  testEnvironment: "node",
  testMatch: ["<rootDir>/tests/unit/**/*.test.ts"],
  moduleNameMapper: { "^@/(.*)$": "<rootDir>/src/$1" },
  clearMocks: true,
  collectCoverageFrom: [
    "src/lib/**/*.ts",
    "!src/lib/prisma.ts",
    "!src/lib/auth.ts",
    "!src/lib/cloudinary.ts",
    "!src/lib/roles.ts",
    "!src/lib/constants.ts",
  ],
  coverageThreshold: {
    global: { statements: 80, branches: 70, functions: 80, lines: 80 },
  },
};

module.exports = createJestConfig(config);
