import { handleApiError } from "@/lib/api-error";
import { getManagedSection } from "@/lib/ownership";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { quizSchema } from "@/lib/validators/quiz";

type RouteContext = { params: { id: string; sectionId: string } };

async function loadQuiz(sectionId: string) {
  const quiz = await prisma.quiz.findUnique({
    where: { sectionId },
    include: {
      questions: { orderBy: { order: "asc" } },
      _count: { select: { attempts: true } },
    },
  });
  if (!quiz) return null;

  return {
    id: quiz.id,
    attemptCount: quiz._count.attempts,
    questions: quiz.questions.map((question) => ({
      id: question.id,
      type: question.type,
      text: question.text,
      options: Array.isArray(question.options)
        ? question.options.filter(
            (option): option is string => typeof option === "string",
          )
        : [],
      correctIndex: question.correctIndex,
    })),
  };
}

export async function GET(_req: Request, { params }: RouteContext) {
  try {
    const user = await requireRole("INSTRUCTOR", "ADMIN");
    await getManagedSection(params.id, params.sectionId, user);
    return Response.json(await loadQuiz(params.sectionId));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(req: Request, { params }: RouteContext) {
  try {
    const user = await requireRole("INSTRUCTOR", "ADMIN");
    await getManagedSection(params.id, params.sectionId, user);
    const { questions } = quizSchema.parse(await req.json());

    await prisma.$transaction(async (transaction) => {
      const quiz = await transaction.quiz.upsert({
        where: { sectionId: params.sectionId },
        update: {},
        create: { sectionId: params.sectionId },
      });

      await transaction.quizAttempt.deleteMany({ where: { quizId: quiz.id } });
      await transaction.question.deleteMany({ where: { quizId: quiz.id } });
      await transaction.question.createMany({
        data: questions.map((question, order) => ({
          quizId: quiz.id,
          type: question.type,
          text: question.text,
          options: question.options,
          correctIndex: question.correctIndex,
          order,
        })),
      });
    });

    return Response.json(await loadQuiz(params.sectionId));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_req: Request, { params }: RouteContext) {
  try {
    const user = await requireRole("INSTRUCTOR", "ADMIN");
    await getManagedSection(params.id, params.sectionId, user);
    await prisma.quiz.deleteMany({ where: { sectionId: params.sectionId } });
    return Response.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
