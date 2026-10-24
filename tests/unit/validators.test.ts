import { COURSE_CATEGORIES } from "@/lib/constants";
import { loginSchema, registerSchema } from "@/lib/validators/auth";
import { courseSchema, courseUpdateSchema, reorderSchema, sectionSchema } from "@/lib/validators/course";
import { quizSchema } from "@/lib/validators/quiz";
import { sectionUpdateSchema } from "@/lib/validators/section";
import {
  assignmentSchema,
  assignmentUpdateSchema,
  gradeSchema,
} from "@/lib/validators/assignment";
import {
  attemptSchema,
  catalogQuerySchema,
  enrollSchema,
  progressSchema,
} from "@/lib/validators/learning";
import { chatSchema } from "@/lib/validators/ai";

const valid = (schema: { safeParse(value: unknown): { success: boolean } }, value: unknown) =>
  schema.safeParse(value).success;
const inDays = (days: number) =>
  new Date(Date.now() + days * 86_400_000).toISOString();

describe("authentication validators", () => {
  it("validates login and blocks self-registration as admin", () => {
    expect(valid(loginSchema, { email: "a@b.co", password: "x" })).toBe(true);
    expect(valid(loginSchema, { email: "bad", password: "x" })).toBe(false);
    expect(valid(loginSchema, { email: "a@b.co", password: "" })).toBe(false);

    const student = {
      name: "Sam Student",
      email: "sam@example.com",
      password: "Password1",
      role: "STUDENT",
    };
    expect(valid(registerSchema, student)).toBe(true);
    expect(valid(registerSchema, { ...student, role: "INSTRUCTOR" })).toBe(true);
    expect(valid(registerSchema, { ...student, role: "ADMIN" })).toBe(false);
    expect(valid(registerSchema, { ...student, password: "short1" })).toBe(false);
  });
});

describe("course and section validators", () => {
  const course = {
    title: "Intro to Web",
    description: "A sufficiently long course description.",
    category: COURSE_CATEGORIES[0],
    price: 0,
  };

  it("validates course fields, categories, and trusted thumbnail URLs", () => {
    expect(valid(courseSchema, course)).toBe(true);
    expect(valid(courseSchema, { ...course, category: "Cooking" })).toBe(false);
    expect(valid(courseSchema, { ...course, price: -1 })).toBe(false);
    expect(
      valid(courseSchema, {
        ...course,
        thumbnailUrl: "https://res.cloudinary.com/demo/image/upload/x.jpg",
      }),
    ).toBe(true);
    expect(
      valid(courseSchema, { ...course, thumbnailUrl: "https://evil.example/x.jpg" }),
    ).toBe(false);
    expect(valid(courseUpdateSchema, { published: true })).toBe(true);
  });

  it("validates section titles, ordering, and content updates", () => {
    expect(valid(sectionSchema, { title: "Intro" })).toBe(true);
    expect(valid(sectionSchema, { title: "I" })).toBe(false);
    expect(valid(reorderSchema, { orderedIds: ["one", "two"] })).toBe(true);
    expect(valid(reorderSchema, { orderedIds: [] })).toBe(false);
    expect(valid(sectionUpdateSchema, {})).toBe(false);
    expect(valid(sectionUpdateSchema, { title: "Intro" })).toBe(true);
    expect(valid(sectionUpdateSchema, { videoUrl: "https://youtu.be/dQw4w9WgXcQ" })).toBe(true);
    expect(valid(sectionUpdateSchema, { videoUrl: "https://example.com/video" })).toBe(false);
    expect(valid(sectionUpdateSchema, { content: "x".repeat(50_001) })).toBe(false);
  });
});

describe("quiz validator", () => {
  const mcq = {
    type: "MCQ",
    text: "Which tag?",
    options: ["first", "second"],
    correctIndex: 1,
  };

  it("accepts valid question types and rejects malformed choices", () => {
    expect(
      valid(quizSchema, {
        questions: [
          mcq,
          {
            type: "TRUE_FALSE",
            text: "HTML is a language.",
            options: ["True", "False"],
            correctIndex: 0,
          },
        ],
      }),
    ).toBe(true);
    expect(valid(quizSchema, { questions: [{ ...mcq, correctIndex: 2 }] })).toBe(false);
    expect(valid(quizSchema, { questions: [{ ...mcq, options: ["same", "same"] }] })).toBe(false);
    expect(
      valid(quizSchema, {
        questions: [
          { ...mcq, type: "TRUE_FALSE", options: ["Yes", "No"], correctIndex: 0 },
        ],
      }),
    ).toBe(false);
    expect(valid(quizSchema, { questions: [] })).toBe(false);
  });
});

describe("assignment validator", () => {
  const assignment = {
    title: "Essay one",
    prompt: "Write about flexbox in detail.",
    dueDate: inDays(7),
    maxScore: 100,
  };

  it("validates assignments and requires future dates only on creation semantics", () => {
    expect(valid(assignmentSchema, assignment)).toBe(true);
    expect(valid(assignmentSchema, { ...assignment, dueDate: "tomorrow" })).toBe(false);
    expect(valid(assignmentSchema, { ...assignment, maxScore: 0 })).toBe(false);
    expect(valid(assignmentUpdateSchema, { title: "Changed title" })).toBe(true);
    expect(valid(assignmentUpdateSchema, {})).toBe(false);
  });

  it("bounds grades and optional feedback", () => {
    expect(valid(gradeSchema, { score: 50, feedback: "Good" })).toBe(true);
    expect(valid(gradeSchema, { score: -1, feedback: "Bad" })).toBe(false);
    expect(valid(gradeSchema, { score: 50, feedback: "x".repeat(5001) })).toBe(
      false,
    );
  });
});

describe("learning and catalog validators", () => {
  it("validates attempt, enrollment, progress, catalog filters and defaults", () => {
    expect(valid(attemptSchema, { answers: { q1: 0, q2: 3 } })).toBe(true);
    expect(valid(attemptSchema, { answers: { q1: -1 } })).toBe(false);
    expect(valid(enrollSchema, { courseId: "c1" })).toBe(true);
    expect(valid(enrollSchema, { courseId: "" })).toBe(false);
    expect(valid(progressSchema, { completed: "true" })).toBe(false);
    expect(catalogQuerySchema.parse({})).toEqual({ sort: "newest", page: 1 });
    expect(catalogQuerySchema.parse({ page: "3" }).page).toBe(3);
    expect(valid(catalogQuerySchema, { page: "0" })).toBe(false);
    expect(valid(catalogQuerySchema, { category: "Cooking" })).toBe(false);
  });
});

describe("AI chat validator", () => {
  const user = (content: string) => ({ role: "user", content });
  const chat = (...messages: unknown[]) => ({ courseId: "course", messages });

  it("accepts a conversation with a final user question", () => {
    expect(
      valid(chatSchema, chat(user("hello"), { role: "assistant", content: "hi" }, user("more"))),
    ).toBe(true);
  });

  it("rejects invalid roles, empty messages, long final questions and oversized history", () => {
    expect(valid(chatSchema, chat({ role: "assistant", content: "last" }))).toBe(false);
    expect(valid(chatSchema, chat(user("   ")))).toBe(false);
    expect(valid(chatSchema, chat(user("x".repeat(2001))))).toBe(false);
    expect(valid(chatSchema, chat(...Array.from({ length: 21 }, () => user("q"))))).toBe(false);
    expect(valid(chatSchema, chat({ role: "system", content: "no" }, user("q")))).toBe(false);
  });
});
