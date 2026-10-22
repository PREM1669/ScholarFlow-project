import { z } from "zod";

export const questionSchema = z
  .object({
    type: z.enum(["MCQ", "TRUE_FALSE"]),
    text: z
      .string()
      .trim()
      .min(3, "Question must be at least 3 characters")
      .max(500),
    options: z
      .array(z.string().trim().min(1, "Options can't be empty").max(200))
      .min(2, "At least 2 options")
      .max(6, "At most 6 options"),
    correctIndex: z.number().int().min(0, "Select the correct answer"),
  })
  .superRefine((question, context) => {
    if (question.correctIndex >= question.options.length) {
      context.addIssue({
        code: "custom",
        path: ["correctIndex"],
        message: "Select the correct answer",
      });
    }
    if (
      question.type === "TRUE_FALSE" &&
      (question.options.length !== 2 ||
        question.options[0] !== "True" ||
        question.options[1] !== "False")
    ) {
      context.addIssue({
        code: "custom",
        path: ["options"],
        message: "True/False questions must use True and False",
      });
    }
    const options = question.options.map((option) => option.toLowerCase());
    if (new Set(options).size !== options.length) {
      context.addIssue({
        code: "custom",
        path: ["options"],
        message: "Options must be different from each other",
      });
    }
  });

export const quizSchema = z.object({
  questions: z
    .array(questionSchema)
    .min(1, "Add at least one question")
    .max(20, "At most 20 questions"),
});

export type QuizInput = z.infer<typeof quizSchema>;
