"use client";

import {
  ArrowDown,
  ArrowUp,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import type { QuizQuestion } from "@/types";

export type DraftQuestion = QuizQuestion & { uid: string };

type Props = {
  question: DraftQuestion;
  index: number;
  total: number;
  errors: string[];
  onChange: (next: DraftQuestion) => void;
  onRemove: () => void;
  onMove: (direction: -1 | 1) => void;
};

export function QuestionEditor({
  question,
  index,
  total,
  errors,
  onChange,
  onRemove,
  onMove,
}: Props) {
  const trueFalse = question.type === "TRUE_FALSE";

  function setOption(optionIndex: number, value: string) {
    onChange({
      ...question,
      options: question.options.map((option, currentIndex) =>
        currentIndex === optionIndex ? value : option,
      ),
    });
  }

  function addOption() {
    if (question.options.length < 6) {
      onChange({ ...question, options: [...question.options, ""] });
    }
  }

  function removeOption(optionIndex: number) {
    if (question.options.length <= 2) return;
    let correctIndex = question.correctIndex;
    if (optionIndex === correctIndex) correctIndex = -1;
    else if (optionIndex < correctIndex) correctIndex -= 1;
    onChange({
      ...question,
      options: question.options.filter(
        (_option, currentIndex) => currentIndex !== optionIndex,
      ),
      correctIndex,
    });
  }

  return (
    <Card className="space-y-4 p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-slate-900">
            Question {index + 1}
          </span>
          <Badge variant="secondary">
            {trueFalse ? "True / False" : "Multiple choice"}
          </Badge>
        </div>
        <div className="flex shrink-0">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`Move question ${index + 1} up`}
            disabled={index === 0}
            onClick={() => onMove(-1)}
          >
            <ArrowUp aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`Move question ${index + 1} down`}
            disabled={index === total - 1}
            onClick={() => onMove(1)}
          >
            <ArrowDown aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`Delete question ${index + 1}`}
            onClick={onRemove}
          >
            <Trash2 aria-hidden="true" />
          </Button>
        </div>
      </div>

      <Textarea
        rows={2}
        maxLength={500}
        placeholder="Question text"
        aria-label={`Question ${index + 1} text`}
        value={question.text}
        onChange={(event) =>
          onChange({ ...question, text: event.currentTarget.value })
        }
      />

      <RadioGroup
        value={String(question.correctIndex)}
        onValueChange={(value) =>
          onChange({ ...question, correctIndex: Number(value) })
        }
        className="space-y-2"
        aria-label={`Correct answer for question ${index + 1}`}
      >
        {question.options.map((option, optionIndex) => {
          const optionId = `${question.uid}-${optionIndex}`;
          return (
            <div key={optionId} className="flex items-center gap-2">
              <RadioGroupItem value={String(optionIndex)} id={optionId} />
              {trueFalse ? (
                <Label htmlFor={optionId}>{option}</Label>
              ) : (
                <Input
                  aria-label={`Question ${index + 1}, option ${optionIndex + 1}`}
                  placeholder={`Option ${optionIndex + 1}`}
                  maxLength={200}
                  value={option}
                  onChange={(event) =>
                    setOption(optionIndex, event.currentTarget.value)
                  }
                />
              )}
              {!trueFalse && question.options.length > 2 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Remove option ${optionIndex + 1} from question ${index + 1}`}
                  onClick={() => removeOption(optionIndex)}
                >
                  <X aria-hidden="true" />
                </Button>
              )}
            </div>
          );
        })}
      </RadioGroup>

      {!trueFalse && question.options.length < 6 && (
        <Button type="button" variant="outline" size="sm" onClick={addOption}>
          <Plus aria-hidden="true" />
          Add option
        </Button>
      )}
      <p className="text-xs text-slate-500">
        Select the radio button next to the correct answer.
      </p>

      {errors.length > 0 && (
        <ul className="space-y-1 text-sm text-destructive" role="alert">
          {Array.from(new Set(errors)).map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      )}
    </Card>
  );
}
