export type GradedQuestion = {
  questionId: string;
  selectedIndex: number | null;
  correctIndex: number;
  isCorrect: boolean;
};

export function gradeQuiz(
  questions: { id: string; correctIndex: number }[],
  answers: Record<string, number>,
) {
  const results: GradedQuestion[] = questions.map((question) => {
    const selected = answers[question.id];
    const selectedIndex = Number.isInteger(selected) ? selected : null;
    return {
      questionId: question.id,
      selectedIndex,
      correctIndex: question.correctIndex,
      isCorrect: selectedIndex === question.correctIndex,
    };
  });
  const score = results.filter((result) => result.isCorrect).length;
  const total = questions.length;
  return {
    score,
    total,
    percent: total === 0 ? 0 : Math.round((score / total) * 100),
    results,
  };
}

export function parseAnswers(value: unknown): Record<string, number> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return {};
  const answers: Record<string, number> = {};
  for (const [questionId, selected] of Object.entries(value)) {
    if (typeof selected === "number" && Number.isInteger(selected)) {
      answers[questionId] = selected;
    }
  }
  return answers;
}
