import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { HttpError } from "@/lib/api-error";
import { ROLE_HOME } from "@/lib/roles";
import { prisma } from "@/lib/prisma";

async function getFreshUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  return prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, role: true, isActive: true },
  });
}

export async function requireRole(...roles: Role[]) {
  const user = await getFreshUser();
  if (!user) throw new HttpError(401, "Unauthorized");
  if (!user.isActive) throw new HttpError(403, "Account suspended");
  if (roles.length && !roles.includes(user.role)) {
    throw new HttpError(403, "Forbidden");
  }
  return user;
}

export async function requirePageRole(...roles: Role[]) {
  const user = await getFreshUser();
  if (!user) redirect("/login");
  if (!user.isActive) redirect("/suspended");
  if (roles.length && !roles.includes(user.role)) {
    redirect(ROLE_HOME[user.role]);
  }
  return user;
}
