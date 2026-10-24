import bcrypt from "bcryptjs";
import { POST } from "@/app/api/v1/auth/register/route";
import { prisma } from "@/lib/prisma";

jest.mock("bcryptjs", () => ({ hash: jest.fn() }));
jest.mock("@/lib/prisma", () => ({
  prisma: { user: { findUnique: jest.fn(), create: jest.fn() } },
}));

const mock = (fn: unknown) => fn as jest.Mock;
const payload = {
  name: "Test User",
  email: "TEST@example.com",
  password: "Password123",
  role: "STUDENT",
};
const request = (body: unknown) =>
  new Request("http://localhost/api/v1/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

beforeEach(() => {
  jest.clearAllMocks();
});

describe("POST /api/v1/auth/register", () => {
  it("normalizes the email, hashes the password, and returns the new account", async () => {
    mock(prisma.user.findUnique).mockResolvedValue(null);
    mock(bcrypt.hash).mockResolvedValue("hashed-password");
    mock(prisma.user.create).mockResolvedValue({
      id: "user-1",
      name: payload.name,
      email: "test@example.com",
      role: "STUDENT",
    });

    const response = await POST(request(payload));
    expect(response.status).toBe(201);
    expect(await response.json()).toMatchObject({
      id: "user-1",
      email: "test@example.com",
      role: "STUDENT",
    });
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: "test@example.com" },
    });
    expect(bcrypt.hash).toHaveBeenCalledWith(payload.password, 10);
    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          email: "test@example.com",
          passwordHash: "hashed-password",
        }),
      }),
    );
  });

  it("rejects duplicate emails, invalid payloads, and admin self-registration", async () => {
    mock(prisma.user.findUnique).mockResolvedValue({ id: "existing" });
    const duplicate = await POST(request(payload));
    expect(duplicate.status).toBe(409);

    mock(prisma.user.findUnique).mockResolvedValue(null);
    const admin = await POST(request({ ...payload, role: "ADMIN" }));
    expect(admin.status).toBe(400);
    const invalid = await POST(request({ ...payload, email: "invalid" }));
    expect(invalid.status).toBe(400);
    expect(prisma.user.create).not.toHaveBeenCalled();
  });
});
