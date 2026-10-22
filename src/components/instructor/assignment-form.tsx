"use client";

import { useEffect, useState, type FormEvent } from "react";
import { LoaderCircle, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  assignmentSchema,
  type AssignmentInput,
} from "@/lib/validators/assignment";

type FormValues = {
  title: string;
  prompt: string;
  dueDate: string;
  maxScore: string;
};

function localDateTime(value: string) {
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export function AssignmentForm({
  mode,
  defaultValues,
  onSubmit,
  submitLabel,
  loading = false,
  onCancel,
}: {
  mode: "create" | "edit";
  defaultValues?: Partial<AssignmentInput>;
  onSubmit: (values: AssignmentInput) => Promise<unknown>;
  submitLabel: string;
  loading?: boolean;
  onCancel?: () => void;
}) {
  const [values, setValues] = useState<FormValues>({
    title: "",
    prompt: "",
    dueDate: "",
    maxScore: "100",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (defaultValues) {
      setValues({
        title: defaultValues.title ?? "",
        prompt: defaultValues.prompt ?? "",
        dueDate: defaultValues.dueDate
          ? localDateTime(String(defaultValues.dueDate))
          : "",
        maxScore: String(defaultValues.maxScore ?? 100),
      });
    }
  }, [defaultValues]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const parsed = assignmentSchema.safeParse({
      title: values.title,
      prompt: values.prompt,
      dueDate: values.dueDate
        ? new Date(values.dueDate).toISOString()
        : "",
      maxScore: Number(values.maxScore),
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check the assignment details");
      return;
    }
    try {
      await onSubmit(parsed.data);
      if (mode === "create") {
        setValues({ title: "", prompt: "", dueDate: "", maxScore: "100" });
      }
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "The assignment could not be saved",
      );
    }
  }

  function setField(field: keyof FormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={`assignment-title-${mode}`}>Title</Label>
        <Input
          id={`assignment-title-${mode}`}
          value={values.title}
          onChange={(event) => setField("title", event.currentTarget.value)}
          minLength={3}
          maxLength={120}
          required
          disabled={loading}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`assignment-prompt-${mode}`}>Instructions</Label>
        <Textarea
          id={`assignment-prompt-${mode}`}
          value={values.prompt}
          onChange={(event) => setField("prompt", event.currentTarget.value)}
          rows={5}
          minLength={10}
          maxLength={5000}
          required
          disabled={loading}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`assignment-due-${mode}`}>Due date and time</Label>
          <Input
            id={`assignment-due-${mode}`}
            type="datetime-local"
            value={values.dueDate}
            onChange={(event) => setField("dueDate", event.currentTarget.value)}
            required
            disabled={loading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`assignment-score-${mode}`}>Maximum score</Label>
          <Input
            id={`assignment-score-${mode}`}
            type="number"
            value={values.maxScore}
            onChange={(event) => setField("maxScore", event.currentTarget.value)}
            min={1}
            max={1000}
            step={1}
            required
            disabled={loading}
          />
        </div>
      </div>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? (
            <LoaderCircle className="animate-spin" aria-hidden="true" />
          ) : (
            <Save aria-hidden="true" />
          )}
          {loading ? "Saving..." : submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
