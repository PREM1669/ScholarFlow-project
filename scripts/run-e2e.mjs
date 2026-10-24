import { spawnSync } from "node:child_process";
import { loadTestEnv } from "./e2e-env.mjs";

loadTestEnv();

function run(script, args) {
  const result = spawnSync(process.execPath, [script, ...args], {
    stdio: "inherit",
    env: process.env,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

run("node_modules/prisma/build/index.js", ["migrate", "deploy"]);
run("node_modules/@playwright/test/cli.js", ["test", ...process.argv.slice(2)]);
