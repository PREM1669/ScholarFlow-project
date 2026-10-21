import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { HttpError, handleApiError } from "@/lib/api-error";
import { registerSchema } from "@/lib/validators/auth";

export async function POST(req: Request) {
  try {
    const body = registerSchema.parse(await req.json());
    const email = body.email.toLowerCase();

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new HttpError(409, "Email already registered");

    const passwordHash = await bcrypt.hash(body.password, 10);
    const user = await prisma.user.create({
      data: { name: body.name, email, passwordHash, role: body.role },
      select: { id: true, name: true, email: true, role: true },
    });

    return Response.json(user, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
