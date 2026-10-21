import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const userCount = await prisma.user.count();
    return Response.json({ status: "ok", db: "connected", users: userCount });
  } catch {
    return Response.json({ status: "error", db: "disconnected" }, { status: 500 });
  }
}
