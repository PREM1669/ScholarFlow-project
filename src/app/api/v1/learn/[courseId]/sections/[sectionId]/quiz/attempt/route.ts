import { HttpError, handleApiError } from "@/lib/api-error";
import { getEnrolledSection } from "@/lib/enrollment";
import { gradeQuiz } from "@/lib/quiz-grading";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { attemptSchema } from "@/lib/validators/learning";

export const dynamic = "force-dynamic";

type Context = { params: { courseId: string; sectionId: string } };

export async function PUT(request: Request, { params }: Context) {
  try {
    const user = await requireRole("STUDENT");
    const { answers } = attemptSchema.parse(await request.json());
    const { section } = await getEnrolledSection(
      user.id,
      params.courseId,
      params.sectionId,
    );
    const quiz = await prisma.quiz.findUnique({
      where: { sectionId: section.id },
      include: { questions: { orderBy: { order: "asc" } } },
    });
    if (!quiz || quiz.questions.length === 0) {
      throw new HttpError(404, "This section has no quiz");
    }
    const clean: Record<string, number> = {};
    for (const question of quiz.questions) {
      const selected = answers[question.id];
      if (selected === undefined) {
        throw new HttpError(400, "Answer every question before submitting");
      }
      if (selected >= (question.options as string[]).length) {
        throw new HttpError(400, "Invalid answer selected");
      }
      clean[question.id] = selected;
    }
    const graded = gradeQuiz(quiz.questions, clean);
    await prisma.quizAttempt.upsert({
      where: { userId_quizId: { userId: user.id, quizId: quiz.id } },
      update: { answers: clean, score: graded.score, total: graded.total },
      create: {
        userId: user.id,
        quizId: quiz.id,
        answers: clean,
        score: graded.score,
        total: graded.total,
      },
    });
    return Response.json(graded);
  } catch (error) {
    return handleApiError(error);
  }
}
