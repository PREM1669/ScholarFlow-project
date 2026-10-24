"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSubmitQuiz } from "@/hooks/use-learn";
import type { LearnQuestion, QuizResult, QuizResultItem } from "@/types";
import { cn } from "@/lib/utils";

function ReviewQuestion({ question, index, result }: { question: LearnQuestion; index: number; result: QuizResultItem }) {
  return (
    <Card className="space-y-3 p-4">
      <p className="font-medium">{index + 1}. {question.text}</p>
      <ul className="space-y-2">
        {question.options.map((option, optionIndex) => {
          const isCorrect = optionIndex === result.correctIndex;
          const isSelected = optionIndex === result.selectedIndex;
          return (
            <li key={optionIndex} className={cn("flex items-center gap-2 rounded-md border p-2 text-sm", isCorrect && "border-green-600/40 bg-green-50", isSelected && !isCorrect && "border-red-500/40 bg-red-50")}>
              {isCorrect ? <Check className="h-4 w-4 text-green-600" /> : isSelected ? <X className="h-4 w-4 text-red-500" /> : <span className="h-4 w-4" />}
              <span>{option}</span>
              {isCorrect && <span className="sr-only">(correct answer)</span>}
              {isSelected && <span className="ml-auto text-xs text-muted-foreground">Your answer</span>}
            </li>
          );
        })}
      </ul>
      <p className={cn("text-sm font-medium", result.isCorrect ? "text-green-700" : "text-red-600")}>
        {result.isCorrect ? "Correct" : "Incorrect"}
      </p>
    </Card>
  );
}

export function QuizTaker({ courseId, sectionId, questions, attempt }: {
  courseId: string;
  sectionId: string;
  questions: LearnQuestion[];
  attempt: QuizResult | null;
}) {
  const submit = useSubmitQuiz(courseId, sectionId);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [editing, setEditing] = useState(attempt === null);
  const [latest, setLatest] = useState<QuizResult | null>(null);
  const result = latest ?? attempt;
  const allAnswered = questions.every((question) => answers[question.id] !== undefined);

  function handleSubmit() {
    submit.mutate(answers, {
      onSuccess: (graded) => {
        setLatest(graded);
        setEditing(false);
      },
    });
  }

  return (
    <section className="space-y-4 rounded-lg border p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">Section quiz</h2>
        {result && !editing && <Badge variant={result.percent === 100 ? "default" : "secondary"}>{result.score}/{result.total} · {result.percent}%</Badge>}
      </div>
      {editing ? (
        <>
          {questions.map((question, questionIndex) => (
            <Card key={question.id} className="space-y-3 p-4">
              <fieldset className="space-y-3">
                <legend className="font-medium">
                  {questionIndex + 1}. {question.text}
                </legend>
                <div className="space-y-2">
                  {question.options.map((option, optionIndex) => (
                    <label
                      key={optionIndex}
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2 transition-colors hover:bg-muted/60",
                        answers[question.id] === optionIndex &&
                          "border-primary bg-primary/5 ring-1 ring-primary/20",
                      )}
                    >
                      <input
                        type="radio"
                        name={`quiz-${sectionId}-${question.id}`}
                        value={optionIndex}
                        checked={answers[question.id] === optionIndex}
                        onChange={() =>
                          setAnswers((previous) => ({
                            ...previous,
                            [question.id]: optionIndex,
                          }))
                        }
                        className="h-4 w-4 shrink-0 accent-primary"
                      />
                      <span className="min-w-0 flex-1 break-words text-sm">{option}</span>
                      {answers[question.id] === optionIndex && (
                        <span className="text-xs font-semibold text-primary">
                          Selected answer
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              </fieldset>
            </Card>
          ))}
          <div className="flex flex-wrap items-center gap-2">
            <Button disabled={!allAnswered || submit.isPending} onClick={handleSubmit}>{submit.isPending ? "Grading..." : result ? "Resubmit" : "Submit answers"}</Button>
            {result && <Button variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>}
            {!allAnswered && <span className="text-xs text-muted-foreground">Answer every question to submit.</span>}
          </div>
        </>
      ) : result && (
        <>
          {questions.map((question, index) => {
            const item = result.results.find((entry) => entry.questionId === question.id);
            return item ? <ReviewQuestion key={question.id} question={question} index={index} result={item} /> : null;
          })}
          <Button variant="outline" onClick={() => { setAnswers({}); setEditing(true); }}>Retake quiz</Button>
        </>
      )}
    </section>
  );
}
