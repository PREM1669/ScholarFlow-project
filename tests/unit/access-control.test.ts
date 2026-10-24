import { getServerSession } from "next-auth";
import { HttpError } from "@/lib/api-error";
import { getManagedAssignment, getManagedCourse, getManagedSection } from "@/lib/ownership";
import { getEnrolledAssignment, getEnrolledSection, requireEnrollment } from "@/lib/enrollment";
import { requirePageRole, requireRole } from "@/lib/rbac";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

jest.mock("next-auth", () => ({ getServerSession: jest.fn() }));
jest.mock("next/navigation", () => ({
  redirect: jest.fn((path: string) => {
    throw new Error(`redirect:${path}`);
  }),
}));
jest.mock("@/lib/auth", () => ({ authOptions: {} }));
jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: jest.fn() },
    course: { findUnique: jest.fn() },
    section: { findFirst: jest.fn() },
    assignment: { findFirst: jest.fn(), findUnique: jest.fn() },
    enrollment: { findUnique: jest.fn() },
  },
}));

const mock = (fn: unknown) => fn as jest.Mock;
const course = { id: "course-1", instructorId: "instructor-1" };
const student = { id: "student-1", isActive: true, role: "STUDENT" };

beforeEach(() => jest.clearAllMocks());

describe("role authorization", () => {
  it("requires an active session and enforces the allowed role", async () => {
    mock(getServerSession).mockResolvedValue({ user: { id: "user-1" } });
    mock(prisma.user.findUnique).mockResolvedValue({
      id: "user-1",
      isActive: true,
      role: "ADMIN",
    });
    await expect(requireRole("ADMIN")).resolves.toMatchObject({ role: "ADMIN" });
    await expect(requireRole("STUDENT")).rejects.toMatchObject({
      status: 403,
      message: "Forbidden",
    });
  });

  it("rejects missing sessions and suspended accounts", async () => {
    mock(getServerSession).mockResolvedValue(null);
    await expect(requireRole("ADMIN")).rejects.toBeInstanceOf(HttpError);
    mock(getServerSession).mockResolvedValue({ user: { id: "user-1" } });
    mock(prisma.user.findUnique).mockResolvedValue({
      id: "user-1",
      isActive: false,
      role: "STUDENT",
    });
    await expect(requireRole("STUDENT")).rejects.toMatchObject({
      status: 403,
      message: "Account suspended",
    });
  });

  it("redirects page access to login, suspension, or the correct role home", async () => {
    mock(getServerSession).mockResolvedValue(null);
    await expect(requirePageRole("ADMIN")).rejects.toThrow("redirect:/login");
    mock(getServerSession).mockResolvedValue({ user: { id: "user-1" } });
    mock(prisma.user.findUnique).mockResolvedValue({
      id: "user-1",
      isActive: false,
      role: "STUDENT",
    });
    await expect(requirePageRole("STUDENT")).rejects.toThrow(
      "redirect:/suspended",
    );
    mock(prisma.user.findUnique).mockResolvedValue(student);
    await expect(requirePageRole("ADMIN")).rejects.toThrow(
      "redirect:/student/dashboard",
    );
    expect(redirect).toHaveBeenCalledWith("/student/dashboard");
    mock(prisma.user.findUnique).mockResolvedValue({
      id: "admin",
      isActive: true,
      role: "ADMIN",
    });
    await expect(requirePageRole("ADMIN")).resolves.toMatchObject({
      role: "ADMIN",
    });
  });
});

describe("course ownership checks", () => {
  it("allows owners and admins but denies another instructor", async () => {
    mock(prisma.course.findUnique).mockResolvedValue(course);
    await expect(
      getManagedCourse("course-1", { id: "instructor-1", role: "INSTRUCTOR" }),
    ).resolves.toEqual(course);
    await expect(
      getManagedCourse("course-1", { id: "other", role: "INSTRUCTOR" }),
    ).rejects.toMatchObject({ status: 403 });
    await expect(
      getManagedCourse("course-1", { id: "admin", role: "ADMIN" }),
    ).resolves.toEqual(course);
  });

  it("scopes child lookups to the requested course", async () => {
    mock(prisma.course.findUnique).mockResolvedValue(course);
    mock(prisma.section.findFirst).mockResolvedValue({ id: "section-1" });
    mock(prisma.assignment.findFirst).mockResolvedValue({ id: "assignment-1" });
    await expect(
      getManagedSection("course-1", "section-1", {
        id: "instructor-1",
        role: "INSTRUCTOR",
      }),
    ).resolves.toEqual({ id: "section-1" });
    expect(prisma.section.findFirst).toHaveBeenCalledWith({
      where: { id: "section-1", courseId: "course-1" },
    });
    await expect(
      getManagedAssignment("course-1", "assignment-1", {
        id: "instructor-1",
        role: "INSTRUCTOR",
      }),
    ).resolves.toEqual({ id: "assignment-1" });
    mock(prisma.course.findUnique).mockResolvedValue(null);
    await expect(
      getManagedSection("missing", "section-1", {
        id: "instructor-1",
        role: "INSTRUCTOR",
      }),
    ).rejects.toMatchObject({ status: 404 });
    mock(prisma.course.findUnique).mockResolvedValue(course);
    mock(prisma.assignment.findFirst).mockResolvedValue(null);
    await expect(
      getManagedAssignment("course-1", "missing", {
        id: "instructor-1",
        role: "INSTRUCTOR",
      }),
    ).rejects.toMatchObject({ status: 404 });
    mock(prisma.section.findFirst).mockResolvedValue(null);
    await expect(
      getManagedSection("course-1", "missing", {
        id: "instructor-1",
        role: "INSTRUCTOR",
      }),
    ).rejects.toMatchObject({ status: 404 });
  });
});

describe("enrollment checks", () => {
  it("requires enrollment and checks assignment and section access", async () => {
    const enrollment = { userId: "student-1", courseId: "course-1" };
    mock(prisma.enrollment.findUnique).mockResolvedValue(enrollment);
    await expect(requireEnrollment("student-1", "course-1")).resolves.toEqual(
      enrollment,
    );

    mock(prisma.assignment.findUnique).mockResolvedValue({
      id: "assignment-1",
      courseId: "course-1",
      course: { id: "course-1", title: "Course" },
    });
    await expect(
      getEnrolledAssignment("student-1", "assignment-1"),
    ).resolves.toMatchObject({ id: "assignment-1" });

    mock(prisma.section.findFirst).mockResolvedValue({ id: "section-1" });
    await expect(
      getEnrolledSection("student-1", "course-1", "section-1"),
    ).resolves.toEqual({ enrollment, section: { id: "section-1" } });

    mock(prisma.enrollment.findUnique).mockResolvedValue(null);
    await expect(requireEnrollment("student-1", "course-1")).rejects.toMatchObject({
      status: 403,
    });
  });

  it("distinguishes missing assignment and section records", async () => {
    mock(prisma.assignment.findUnique).mockResolvedValue(null);
    await expect(
      getEnrolledAssignment("student-1", "missing"),
    ).rejects.toMatchObject({ status: 404 });
    mock(prisma.enrollment.findUnique).mockResolvedValue(student);
    mock(prisma.section.findFirst).mockResolvedValue(null);
    await expect(
      getEnrolledSection("student-1", "course-1", "missing"),
    ).rejects.toMatchObject({ status: 404 });
  });
});
