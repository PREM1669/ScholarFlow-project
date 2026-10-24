import { computeAchievements } from "@/lib/achievements";
import { progressSummary } from "@/lib/progress";
import { gradeQuiz, parseAnswers } from "@/lib/quiz-grading";

describe("progressSummary", () => {
  it("is empty and incomplete when a course has no sections", () => {
    expect(progressSummary(0, 0)).toEqual({
      completedSections: 0,
      totalSections: 0,
      percent: 0,
      isCompleted: false,
    });
  });

  it("rounds the percentage and caps it at 100", () => {
    expect(progressSummary(1, 3).percent).toBe(33);
    expect(progressSummary(2, 3).percent).toBe(67);
    expect(progressSummary(5, 4).percent).toBe(100);
  });

  it("marks a course completed only when all sections are done", () => {
    expect(progressSummary(3, 4).isCompleted).toBe(false);
    expect(progressSummary(4, 4)).toMatchObject({
      percent: 100,
      isCompleted: true,
    });
  });
});

describe("gradeQuiz", () => {
  const questions = [
    { id: "q1", correctIndex: 1 },
    { id: "q2", correctIndex: 0 },
    { id: "q3", correctIndex: 2 },
  ];

  it("scores answers and returns per-question correctness", () => {
    const graded = gradeQuiz(questions, { q1: 1, q2: 1, q3: 2 });
    expect(graded).toMatchObject({ score: 2, total: 3, percent: 67 });
    expect(graded.results.map((result) => result.isCorrect)).toEqual([
      true,
      false,
      true,
    ]);
    expect(graded.results[1]).toMatchObject({
      selectedIndex: 1,
      correctIndex: 0,
    });
  });

  it("treats missing and non-integer answers as incorrect", () => {
    const graded = gradeQuiz(questions, { q1: 1.5 });
    expect(graded.score).toBe(0);
    expect(graded.results.every((result) => result.selectedIndex === null)).toBe(
      true,
    );
  });

  it("ignores unknown question IDs and handles empty quizzes", () => {
    expect(gradeQuiz(questions, { q1: 1, ghost: 3 }).score).toBe(1);
    expect(gradeQuiz([], {})).toEqual({
      score: 0,
      total: 0,
      percent: 0,
      results: [],
    });
  });
});

describe("parseAnswers", () => {
  it("keeps only integer answers", () => {
    expect(parseAnswers({ a: 1, b: "2", c: 1.5, d: null })).toEqual({ a: 1 });
  });

  it("returns empty answers for non-plain-object values", () => {
    for (const value of [null, undefined, "x", 5, [1, 2]]) {
      expect(parseAnswers(value)).toEqual({});
    }
  });
});

describe("computeAchievements", () => {
  const none = {
    enrollments: 0,
    completedSections: 0,
    perfectQuizzes: 0,
    completedCourses: 0,
  };
  const earned = (stats: typeof none) =>
    computeAchievements(stats)
      .filter((achievement) => achievement.earned)
      .map((achievement) => achievement.key);

  it("awards nothing with no activity", () => {
    expect(earned(none)).toEqual([]);
  });

  it("awards badges from their matching statistics", () => {
    expect(earned({ ...none, enrollments: 1 })).toEqual(["first-steps"]);
    expect(earned({ ...none, completedSections: 1 })).toEqual([
      "getting-started",
    ]);
    expect(earned({ ...none, perfectQuizzes: 1 })).toEqual(["quiz-ace"]);
    expect(earned({ ...none, completedCourses: 1 })).toEqual(["graduate"]);
  });
});
