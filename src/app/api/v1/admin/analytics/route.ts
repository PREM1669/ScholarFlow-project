import type { Role } from "@prisma/client";
import { z } from "zod";
import { handleApiError } from "@/lib/api-error";
import {
  countPerDay,
  distinctUsers,
  distinctUsersPerDay,
  lastNDays,
  percent,
  sumPerDay,
  windowStart,
  type ActivityEvent,
} from "@/lib/analytics";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";

const querySchema = z.object({
  days: z.enum(["7", "30", "90"]).default("30").transform(Number),
});
const round2 = (value: number) => Math.round(value * 100) / 100;

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await requireRole("ADMIN");
    const { days: rangeDays } = querySchema.parse(
      Object.fromEntries(new URL(request.url).searchParams),
    );
    const days = lastNDays(rangeDays);
    const since = windowStart(days);

    const [
      roleGroups,
      courses,
      enrollmentGroups,
      completedGroups,
      pendingGrading,
      signups,
      enrollments,
      completions,
      quizAttempts,
      submissions,
      newCourses,
      auditEvents,
    ] = await Promise.all([
      prisma.user.groupBy({
        by: ["role", "isActive"],
        _count: { _all: true },
      }),
      prisma.course.findMany({
        select: {
          id: true,
          title: true,
          price: true,
          published: true,
          instructor: { select: { name: true } },
        },
      }),
      prisma.enrollment.groupBy({
        by: ["courseId"],
        _count: { _all: true },
      }),
      prisma.enrollment.groupBy({
        by: ["courseId"],
        where: { completedAt: { not: null } },
        _count: { _all: true },
      }),
      prisma.submission.count({ where: { gradedAt: null } }),
      prisma.user.findMany({
        where: { createdAt: { gte: since } },
        select: { createdAt: true },
      }),
      prisma.enrollment.findMany({
        where: { enrolledAt: { gte: since } },
        select: {
          userId: true,
          enrolledAt: true,
          course: { select: { price: true } },
        },
      }),
      prisma.progress.findMany({
        where: { completedAt: { gte: since } },
        select: {
          completedAt: true,
          enrollment: { select: { userId: true } },
        },
      }),
      prisma.quizAttempt.findMany({
        where: { updatedAt: { gte: since } },
        select: { userId: true, updatedAt: true },
      }),
      prisma.submission.findMany({
        where: { submittedAt: { gte: since } },
        select: { studentId: true, submittedAt: true },
      }),
      prisma.course.findMany({
        where: { createdAt: { gte: since } },
        select: {
          instructorId: true,
          createdAt: true,
          instructor: { select: { role: true } },
        },
      }),
      prisma.auditLog.findMany({
        where: {
          action: { in: ["LOGIN", "AI_QUESTION"] },
          createdAt: { gte: since },
        },
        select: { action: true, userId: true, createdAt: true },
      }),
    ]);

    const activity: ActivityEvent[] = [
      ...auditEvents.map((event) => ({
        userId: event.userId,
        date: event.createdAt,
      })),
      ...enrollments.map((enrollment) => ({
        userId: enrollment.userId,
        date: enrollment.enrolledAt,
      })),
      ...completions.flatMap((progress) =>
        progress.completedAt
          ? [
              {
                userId: progress.enrollment.userId,
                date: progress.completedAt,
              },
            ]
          : [],
      ),
      ...quizAttempts.map((attempt) => ({
        userId: attempt.userId,
        date: attempt.updatedAt,
      })),
      ...submissions.map((submission) => ({
        userId: submission.studentId,
        date: submission.submittedAt,
      })),
      ...newCourses
        .filter((course) => course.instructor.role === "INSTRUCTOR")
        .map((course) => ({
          userId: course.instructorId,
          date: course.createdAt,
        })),
    ];

    const enrollmentSeries = countPerDay(
      enrollments.map((enrollment) => enrollment.enrolledAt),
      days,
    );
    const signupSeries = countPerDay(
      signups.map((signup) => signup.createdAt),
      days,
    );
    const revenueSeries = sumPerDay(
      enrollments.map((enrollment) => ({
        date: enrollment.enrolledAt,
        value: enrollment.course.price,
      })),
      days,
    );
    const activeSeries = distinctUsersPerDay(activity, days);

    const enrolledBy = new Map<string, number>(
      enrollmentGroups.map(
        (group) => [group.courseId, group._count._all] as [string, number],
      ),
    );
    const completedBy = new Map<string, number>(
      completedGroups.map(
        (group) => [group.courseId, group._count._all] as [string, number],
      ),
    );
    const perCourse = courses.map((course) => {
      const enrolled = enrolledBy.get(course.id) ?? 0;
      const completed = completedBy.get(course.id) ?? 0;
      return {
        id: course.id,
        title: course.title,
        instructorName: course.instructor.name,
        price: course.price,
        enrollments: enrolled,
        completions: completed,
        completionRate: percent(completed, enrolled),
        revenue: round2(course.price * enrolled),
      };
    });
    const topCourses = [...perCourse]
      .sort(
        (a, b) =>
          b.enrollments - a.enrollments || a.title.localeCompare(b.title),
      )
      .slice(0, 8);
    const usersWithRole = (role: Role) =>
      roleGroups
        .filter((group) => group.role === role)
        .reduce((total, group) => total + group._count._all, 0);
    const totalEnrollments = enrollmentGroups.reduce(
      (total, group) => total + group._count._all,
      0,
    );
    const completedEnrollments = completedGroups.reduce(
      (total, group) => total + group._count._all,
      0,
    );

    return Response.json({
      days: rangeDays,
      generatedAt: new Date().toISOString(),
      totals: {
        users: roleGroups.reduce((total, group) => total + group._count._all, 0),
        students: usersWithRole("STUDENT"),
        instructors: usersWithRole("INSTRUCTOR"),
        admins: usersWithRole("ADMIN"),
        suspended: roleGroups
          .filter((group) => !group.isActive)
          .reduce((total, group) => total + group._count._all, 0),
        courses: courses.length,
        publishedCourses: courses.filter((course) => course.published).length,
        enrollments: totalEnrollments,
        completedEnrollments,
        completionRate: percent(completedEnrollments, totalEnrollments),
        revenue: round2(perCourse.reduce((total, course) => total + course.revenue, 0)),
        pendingGrading,
        activeUsers: distinctUsers(activity),
        aiQuestions: auditEvents.filter((event) => event.action === "AI_QUESTION")
          .length,
      },
      series: days.map((date, index) => ({
        date,
        enrollments: enrollmentSeries[index],
        signups: signupSeries[index],
        activeUsers: activeSeries[index],
        revenue: round2(revenueSeries[index]),
      })),
      topCourses,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
