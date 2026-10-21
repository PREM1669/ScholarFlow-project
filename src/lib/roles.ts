import type { Role } from "@prisma/client";

export const ROLES = ["ADMIN", "INSTRUCTOR", "STUDENT"] as const satisfies readonly Role[];

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && ROLES.some((role) => role === value);
}

export const ROLE_HOME: Record<Role, string> = {
  ADMIN: "/admin/dashboard",
  INSTRUCTOR: "/instructor/dashboard",
  STUDENT: "/student/dashboard",
};

export const NAV_LINKS: Record<Role, { href: string; label: string }[]> = {
  ADMIN: [{ href: "/admin/dashboard", label: "Dashboard" }],
  INSTRUCTOR: [{ href: "/instructor/dashboard", label: "Dashboard" }],
  STUDENT: [{ href: "/student/dashboard", label: "Dashboard" }],
};
