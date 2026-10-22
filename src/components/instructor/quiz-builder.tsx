"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import {
  QuestionEditor,
  type DraftQuestion,
} from "@/components/instructor/question-editor";
import { useDeleteQuiz, useSaveQuiz } from "@/hooks/use-quiz";
import { quizSchema } from "@/lib/validators/quiz";
import type { QuestionType, QuizDetail, QuizQuestion } from "@/types";

const MAX_QUESTIONS = 20;
let uidCounter = 0;
const nextUid = () => `question-${++uidCounter}`;

function toDraft({
  type,
  text,
  options,
  correctIndex,
}: QuizQuestion): DraftQuestion {
  return { type, text, options: [...options], correctIndex, uid: nextUid() };
}

function blankQuestion(type: QuestionType): DraftQuestion {
  return {
    uid: nextUid(),
    type,
    text: "",
    options: type === "TRUE_FALSE" ? ["True", "False"] : ["", "", "", ""],
    correctIndex: -1,
  };
}

export function QuizBuilder({
  courseId,
  sectionId,
  quiz,
}: {
  courseId: string;
  sectionId: string;
  quiz: QuizDetail | null;
}) {
  const save = useSaveQuiz(courseId, sectionId);
  const remove = useDeleteQuiz(courseId, sectionId);
  const [questions, setQuestions] = useState<DraftQuestion[]>(
    () => quiz?.questions.map(toDraft) ?? [],
  );
  const [errors, setErrors] = useState<Record<number, string[]>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [attemptCount, setAttemptCount] = useState(quiz?.attemptCount ?? 0);
  const [hasQuiz, setHasQuiz] = useState(Boolean(quiz));

  function add(type: QuestionType) {
    setQuestions((current) =>
      current.length >= MAX_QUESTIONS
        ? current
        : [...current, blankQuestion(type)],
    );
    setFormError(null);
  }

  function update(index: number, next: DraftQuestion) {
    setQuestions((current) =>
      current.map((question, currentIndex) =>
        currentIndex === index ? next : question,
      ),
    );
    setErrors((previous) => ({ ...previous, [index]: [] }));
  }

  function removeAt(index: number) {
    setQuestions((current) =>
      current.filter((_question, currentIndex) => currentIndex !== index),
    );
    setErrors({});
  }

  function move(index: number, direction: -1 | 1) {
    setQuestions((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    setErrors({});
  }

  function validatedPayload() {
    const result = quizSchema.safeParse({
      questions: questions.map(
        ({ type, text, options, correctIndex }) => ({
          type,
          text,
          options,
          correctIndex,
        }),
      ),
    });

    if (!result.success) {
      const questionErrors: Record<number, string[]> = {};
      let generalError: string | null = null;
      for (const issue of result.error.issues) {
        const index = issue.path[1];
        if (issue.path[0] === "questions" && typeof index === "number") {
          (questionErrors[index] ??= []).push(issue.message);
        } else {
          generalError = issue.message;
        }
      }
      setErrors(questionErrors);
      setFormError(generalError ?? "Fix the highlighted questions");
      return null;
    }

    setErrors({});
    setFormError(null);
    return result.data;
  }

  async function saveQuiz() {
    const payload = validatedPayload();
    if (!payload) return;
    const savedQuiz = await save.mutateAsync(payload);
    setAttemptCount(savedQuiz.attemptCount);
    setHasQuiz(true);
  }

  async function deleteQuiz() {
    await remove.mutateAsync();
    setQuestions([]);
    setErrors({});
    setFormError(null);
    setAttemptCount(0);
    setHasQuiz(false);
  }

  return (
    <div className="max-w-3xl space-y-4">
      {attemptCount > 0 && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
          {attemptCount} student attempt{attemptCount === 1 ? "" : "s"} recorded.
          Saving replaces the questions and resets these attempts so scores
          always match the current quiz.
        </div>
      )}

      {questions.length === 0 && (
        <EmptyState
          title="No questions yet"
          description="Add multiple-choice or true/false questions to create a quiz for this section."
        />
      )}

      {questions.map((question, index) => (
        <QuestionEditor
          key={question.uid}
          question={question}
          index={index}
          total={questions.length}
          errors={errors[index] ?? []}
          onChange={(next) => update(index, next)}
          onRemove={() => removeAt(index)}
          onMove={(direction) => move(index, direction)}
        />
      ))}

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={questions.length >= MAX_QUESTIONS}
          onClick={() => add("MCQ")}
        >
          <Plus aria-hidden="true" />
          Multiple choice
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={questions.length >= MAX_QUESTIONS}
          onClick={() => add("TRUE_FALSE")}
        >
          <Plus aria-hidden="true" />
          True / False
        </Button>
        <span className="self-center text-xs text-slate-500">
          {questions.length} / {MAX_QUESTIONS} questions
        </span>
      </div>

      {formError && (
        <p className="text-sm text-destructive" role="alert">
          {formError}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {attemptCount > 0 ? (
          <ConfirmDialog
            trigger={
              <Button type="button" disabled={save.isPending}>
                {save.isPending ? "Saving..." : "Save quiz"}
              </Button>
            }
            title="Replace quiz and reset attempts?"
            description={`Saving these questions will delete ${attemptCount} existing student attempt${attemptCount === 1 ? "" : "s"}. This cannot be undone.`}
            confirmLabel="Replace quiz"
            onConfirm={saveQuiz}
          />
        ) : (
          <Button
            type="button"
            onClick={() =>
              void saveQuiz().catch((error: unknown) =>
                toast.error(
                  error instanceof Error ? error.message : "Unable to save quiz",
                ),
              )
            }
            disabled={save.isPending}
          >
            {save.isPending ? "Saving..." : "Save quiz"}
          </Button>
        )}

        {hasQuiz && (
          <ConfirmDialog
            trigger={
              <Button
                type="button"
                variant="destructive"
                disabled={remove.isPending}
              >
                Delete quiz
              </Button>
            }
            title="Delete this quiz?"
            description="All questions and student attempts for this section will be removed."
            onConfirm={deleteQuiz}
          />
        )}
      </div>
    </div>
  );
}
