"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, LoaderCircle } from "lucide-react";
import { DueDate } from "@/components/shared/due-date";
import { FileLink } from "@/components/shared/file-link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAssignments, useGradeSubmission, useSubmissions } from "@/hooks/use-assignments";
import { SubmissionStatusBadge } from "@/components/shared/submission-status-badge";
import type { SubmissionRow } from "@/types";

export function AssignmentSubmissions({
  courseId,
  assignmentId,
}: {
  courseId: string;
  assignmentId: string;
}) {
  const assignments = useAssignments(courseId);
  const submissions = useSubmissions(courseId, assignmentId);
  const assignment = assignments.data?.find((item) => item.id === assignmentId);

  if (assignments.isPending || submissions.isPending) {
    return <div className="animate-pulse rounded-2xl bg-white p-10" aria-label="Loading submissions" />;
  }
  if (assignments.isError || submissions.isError) {
    const error = assignments.error ?? submissions.error;
    return <p role="alert" className="rounded-xl bg-red-50 p-5 text-sm text-red-800">{error?.message}</p>;
  }
  if (!assignment) {
    return <p role="alert" className="rounded-xl bg-red-50 p-5 text-sm text-red-800">Assignment not found.</p>;
  }

  return (
    <div className="space-y-6">
      <Button asChild variant="outline">
        <Link href={`/instructor/courses/${courseId}/edit`}>
          <ArrowLeft aria-hidden="true" />
          Back to course
        </Link>
      </Button>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <h1 className="text-2xl font-semibold text-slate-950">{assignment.title}</h1>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
          <DueDate dueDate={assignment.dueDate} />
          <span className="text-sm text-slate-500">Maximum score: {assignment.maxScore}</span>
          <span className="text-sm text-slate-500">
            {submissions.data.enrolledCount} enrolled · {submissions.data.submissions.length} submitted
          </span>
        </div>
      </section>
      {submissions.data.submissions.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-10 text-center text-sm text-slate-500">
          No submissions yet.
        </p>
      ) : (
        <ul className="space-y-4">
          {submissions.data.submissions.map((submission) => (
            <SubmissionCard
              key={submission.id}
              courseId={courseId}
              assignmentId={assignmentId}
              submission={submission}
              maxScore={assignment.maxScore}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function SubmissionCard({
  courseId,
  assignmentId,
  submission,
  maxScore,
}: {
  courseId: string;
  assignmentId: string;
  submission: SubmissionRow;
  maxScore: number;
}) {
  const [score, setScore] = useState(String(submission.score ?? ""));
  const [feedback, setFeedback] = useState(submission.feedback ?? "");
  const grade = useGradeSubmission(courseId, assignmentId);

  useEffect(() => {
    setScore(String(submission.score ?? ""));
    setFeedback(submission.feedback ?? "");
  }, [submission.score, submission.feedback, submission.gradedAt]);

  function saveGrade(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const numericScore = Number(score);
    if (!Number.isInteger(numericScore) || numericScore < 0 || numericScore > maxScore) return;
    grade.mutate({ submissionId: submission.id, score: numericScore, feedback });
  }

  return (
    <li className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-slate-900">{submission.studentName}</h2>
          <p className="mt-1 text-sm text-slate-500">{submission.studentEmail}</p>
        </div>
        <SubmissionStatusBadge status={submission.gradedAt ? "graded" : "submitted"} isLate={submission.isLate} />
      </div>
      <p className="mt-4 text-xs text-slate-500">
        Submitted {new Date(submission.submittedAt).toLocaleString()}
      </p>
      {submission.textAnswer && (
        <div className="mt-4 whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
          {submission.textAnswer}
        </div>
      )}
      {submission.fileUrl && (
        <div className="mt-4">
          <FileLink url={submission.fileUrl} name={submission.fileName} />
        </div>
      )}
      <form
        key={submission.id}
        onSubmit={saveGrade}
        className="mt-5 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-[10rem_1fr_auto]"
      >
        <div className="space-y-2">
          <Label htmlFor={`score-${submission.id}`}>Score (0–{maxScore})</Label>
          <Input
            id={`score-${submission.id}`}
            type="number"
            min={0}
            max={maxScore}
            step={1}
            value={score}
            onChange={(event) => setScore(event.currentTarget.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`feedback-${submission.id}`}>Feedback</Label>
          <Textarea
            id={`feedback-${submission.id}`}
            value={feedback}
            onChange={(event) => setFeedback(event.currentTarget.value)}
            maxLength={5000}
            rows={2}
          />
        </div>
        <Button type="submit" className="self-end" disabled={grade.isPending || score === ""}>
          {grade.isPending && <LoaderCircle className="animate-spin" aria-hidden="true" />}
          {grade.isPending ? "Saving..." : submission.gradedAt ? "Save regrade" : "Save grade"}
        </Button>
      </form>
    </li>
  );
}
