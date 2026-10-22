import { HttpError, handleApiError } from "@/lib/api-error";
import { requireEnrollment } from "@/lib/enrollment";
import { gradeQuiz, parseAnswers } from "@/lib/quiz-grading";
import { progressSummary } from "@/lib/progress";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: { courseId: string } },
) {
  try {
    const user = await requireRole("STUDENT");
    const enrollment = await requireEnrollment(user.id, params.courseId);
    const [course, completed, attempts] = await Promise.all([
      prisma.course.findUnique({
        where: { id: params.courseId },
        select: {
          id: true,
          title: true,
          instructor: { select: { name: true } },
          sections: {
            orderBy: { order: "asc" },
            select: {
              id: true,
              title: true,
              order: true,
              content: true,
              videoUrl: true,
              quiz: {
                select: {
                  id: true,
                  questions: {
                    orderBy: { order: "asc" },
                    select: {
                      id: true,
                      type: true,
                      text: true,
                      options: true,
                      correctIndex: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),
      prisma.progress.findMany({
        where: { enrollmentId: enrollment.id, completed: true },
        select: { sectionId: true },
      }),
      prisma.quizAttempt.findMany({
        where: {
          userId: user.id,
          quiz: { section: { courseId: params.courseId } },
        },
        select: { quizId: true, answers: true },
      }),
    ]);
    if (!course) throw new HttpError(404, "Course not found");
    const completedIds = new Set(completed.map((item) => item.sectionId));
    const answersByQuiz = new Map(
      attempts.map((attempt) => [
        attempt.quizId,
        parseAnswers(attempt.answers),
      ]),
    );
    const sections = course.sections.map((section) => {
      const questions = section.quiz?.questions ?? [];
      const hasQuiz = Boolean(section.quiz && questions.length > 0);
      const stored = section.quiz
        ? answersByQuiz.get(section.quiz.id)
        : undefined;
      return {
        id: section.id,
        title: section.title,
        order: section.order,
        content: section.content,
        videoUrl: section.videoUrl,
        completed: completedIds.has(section.id),
        quiz: hasQuiz
          ? {
              questions: questions.map((question) => ({
                id: question.id,
                type: question.type,
                text: question.text,
                options: question.options as string[],
              })),
            }
          : null,
        attempt:
          hasQuiz && stored ? gradeQuiz(questions, stored) : null,
      };
    });
    return Response.json({
      id: course.id,
      title: course.title,
      instructorName: course.instructor.name,
      sections,
      progress: {
        ...progressSummary(completedIds.size, sections.length),
        completedAt: enrollment.completedAt,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
