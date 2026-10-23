import { z } from "zod";
import { AI_LIMITS } from "@/lib/ai/constants";

export const chatSchema = z
  .object({
    courseId: z.string().min(1),
    messages: z
      .array(
        z.object({
          role: z.enum(["user", "assistant"]),
          content: z.string().trim().min(1).max(8000),
        }),
      )
      .min(1)
      .max(20),
  })
  .superRefine((data, context) => {
    const last = data.messages[data.messages.length - 1];
    if (last.role !== "user") {
      context.addIssue({
        code: "custom",
        path: ["messages"],
        message: "The last message must be a question",
      });
    } else if (last.content.length > AI_LIMITS.maxQuestionChars) {
      context.addIssue({
        code: "custom",
        path: ["messages"],
        message: `Questions can be at most ${AI_LIMITS.maxQuestionChars} characters`,
      });
    }
  });
