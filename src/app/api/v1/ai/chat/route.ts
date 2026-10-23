import { handleApiError, HttpError } from "@/lib/api-error";
import { buildCourseChunks } from "@/lib/ai/chunking";
import { AI_LIMITS, REFUSAL_MESSAGE } from "@/lib/ai/constants";
import { prepareHistory } from "@/lib/ai/messages";
import { buildSystemPrompt } from "@/lib/ai/prompt";
import { buildRetrievalQuery, rankChunks } from "@/lib/ai/retrieval";
import { smallTalkReply } from "@/lib/ai/small-talk";
import { streamChat } from "@/lib/ai/provider";
import { requireEnrollment } from "@/lib/enrollment";
import { getManagedCourse } from "@/lib/ownership";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { chatSchema } from "@/lib/validators/ai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const encoder = new TextEncoder();

function plainText(body: BodyInit, sources: string[] = []) {
  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store, no-transform",
      "X-Accel-Buffering": "no",
      "X-Sources": encodeURIComponent(JSON.stringify(sources)),
    },
  });
}

export async function POST(request: Request) {
  try {
    const user = await requireRole("STUDENT", "INSTRUCTOR", "ADMIN");
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      throw new HttpError(400, "Invalid JSON request");
    }
    const { courseId, messages } = chatSchema.parse(body);

    if (user.role === "STUDENT") {
      await requireEnrollment(user.id, courseId);
    } else {
      await getManagedCourse(courseId, user);
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: {
        title: true,
        description: true,
        instructor: { select: { name: true } },
        sections: {
          orderBy: { order: "asc" },
          select: { id: true, title: true, order: true, content: true },
        },
      },
    });
    if (!course) throw new HttpError(404, "Course not found");

    const history = prepareHistory(messages);
    const questions = history
      .filter((message) => message.role === "user")
      .map((message) => message.content);
    const question = questions[questions.length - 1];
    const canned = smallTalkReply(question, course.title);
    if (canned) return plainText(canned);

    const chunks = buildCourseChunks(course);
    const query = buildRetrievalQuery(question, questions[questions.length - 2]);
    const ranked = rankChunks(chunks, query, AI_LIMITS.maxContextChunks);
    if (ranked.length === 0) return plainText(REFUSAL_MESSAGE);

    const overview = chunks[0];
    const context = [
      overview,
      ...ranked
        .map((item) => item.chunk)
        .filter((chunk) => chunk.id !== overview.id),
    ].sort((a, b) => a.sectionOrder - b.sectionOrder);
    const sources = Array.from(
      new Set(
        ranked
          .filter((item) => item.chunk.sectionId !== null)
          .map(
            (item) =>
              `${item.chunk.sectionOrder}. ${item.chunk.sectionTitle}`,
          ),
      ),
    );

    const recentQuestions = await prisma.auditLog.count({
      where: {
        userId: user.id,
        action: "AI_QUESTION",
        createdAt: {
          gte: new Date(Date.now() - AI_LIMITS.rateLimitWindowMs),
        },
      },
    });
    if (recentQuestions >= AI_LIMITS.rateLimitCount) {
      throw new HttpError(
        429,
        "You've asked a lot of questions. Please wait a few minutes and try again.",
      );
    }

    const abort = new AbortController();
    request.signal.addEventListener("abort", () => abort.abort(), {
      once: true,
    });
    const generator = streamChat({
      system: buildSystemPrompt(
        { title: course.title, instructorName: course.instructor.name },
        context,
      ),
      messages: history,
      signal: abort.signal,
    });

    const first = await generator.next();
    if (first.done) {
      throw new HttpError(
        502,
        "The assistant returned an empty answer. Please try again.",
      );
    }
    try {
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: "AI_QUESTION",
          entity: "Course",
          entityId: courseId,
        },
      });
    } catch (error) {
      abort.abort();
      await generator.return(undefined).catch(() => undefined);
      throw error;
    }

    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          controller.enqueue(encoder.encode(first.value));
          for await (const piece of generator) {
            controller.enqueue(encoder.encode(piece));
          }
        } catch (error) {
          if (!abort.signal.aborted) {
            console.error("[ai] stream interrupted", error);
            controller.enqueue(
              encoder.encode(
                "\n\n_The answer was interrupted. Please try again._",
              ),
            );
          }
        } finally {
          try {
            controller.close();
          } catch {
            // The client may already have cancelled the stream.
          }
        }
      },
      cancel() {
        abort.abort();
      },
    });

    return plainText(stream, sources);
  } catch (error) {
    return handleApiError(error);
  }
}
