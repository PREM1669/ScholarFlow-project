import type { Role } from "@prisma/client";

export type { Role };
export const ROLES = ["ADMIN", "INSTRUCTOR", "STUDENT"] as const;
