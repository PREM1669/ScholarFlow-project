import { spawnSync, spawn } from "node:child_process";
import { loadTestEnv } from "./e2e-env.mjs";

loadTestEnv();

const next = "node_modules/next/dist/bin/next";
const build = spawnSync(process.execPath, [next, "build"], {
  stdio: "inherit",
  env: process.env,
});
if (build.error) throw build.error;
if (build.status !== 0) process.exit(build.status ?? 1);

const server = spawn(process.execPath, [next, "start", "-p", "3101"], {
  stdio: "inherit",
  env: process.env,
});
server.on("error", (error) => {
  console.error("Unable to start the production server for E2E tests.", error);
  process.exitCode = 1;
});
server.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  else process.exit(code ?? 1);
});
