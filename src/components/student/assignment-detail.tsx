"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, LoaderCircle, Upload, X } from "lucide-react";
import { DueDate } from "@/components/shared/due-date";
import { FileLink } from "@/components/shared/file-link";
import { SubmissionStatusBadge } from "@/components/shared/submission-status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMyAssignment, useSubmitAssignment } from "@/hooks/use-assignments";

const MAX_FILE_BYTES = 4 * 1024 * 1024;

export function StudentAssignmentDetail({ assignmentId }: { assignmentId: string }) {
  const assignment = useMyAssignment(assignmentId);
  const [file, setFile] = useState<File | null>(null);
  const [removeFile, setRemoveFile] = useState(false);
  const [textAnswer, setTextAnswer] = useState("");
  const submit = useSubmitAssignment(assignmentId);

  useEffect(() => {
    setTextAnswer(assignment.data?.submission?.textAnswer ?? "");
  }, [assignment.data?.submission?.submittedAt, assignment.data?.submission?.textAnswer]);

  if (assignment.isPending) {
    return <div className="h-64 animate-pulse rounded-2xl bg-white" aria-label="Loading assignment" />;
  }
  if (assignment.isError) {
    return (
      <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">
        <p>{assignment.error.message}</p>
        <Button variant="outline" className="mt-3" onClick={() => void assignment.refetch()}>
          Retry
        </Button>
      </div>
    );
  }
  const detail = assignment.data;
  const submission = detail.submission;
  const graded = Boolean(submission?.gradedAt);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (file && file.size > MAX_FILE_BYTES) return;
    const form = new FormData();
    form.set("textAnswer", textAnswer);
    form.set("removeFile", String(removeFile));
    if (file) form.set("file", file);
    await submit.mutateAsync(form);
    setFile(null);
    setRemoveFile(false);
    setTextAnswer("");
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Button asChild variant="outline">
        <Link href="/student/assignments">
          <ArrowLeft aria-hidden="true" />
          All assignments
        </Link>
      </Button>
      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <p className="text-sm font-medium text-primary">{detail.courseTitle}</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
          {detail.title}
        </h1>
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
          <DueDate dueDate={detail.dueDate} />
          <span className="text-sm text-slate-500">Maximum score: {detail.maxScore}</span>
          <SubmissionStatusBadge
            status={graded ? "graded" : submission ? "submitted" : "not_submitted"}
            isLate={submission?.isLate}
          />
        </div>
        <div className="mt-6 whitespace-pre-wrap text-sm leading-7 text-slate-700">
          {detail.prompt}
        </div>
      </article>

      {graded && submission ? (
        <section className="rounded-2xl border border-green-200 bg-white p-5 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-900">Graded submission</h2>
            <p className="rounded-full bg-green-50 px-4 py-2 text-sm font-semibold text-green-800">
              Score: {submission.score} / {detail.maxScore}
            </p>
          </div>
          {submission.textAnswer && (
            <div className="mt-5 whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
              {submission.textAnswer}
            </div>
          )}
          {submission.fileUrl && (
            <div className="mt-4">
              <FileLink url={submission.fileUrl} name={submission.fileName} />
            </div>
          )}
          <div className="mt-5 border-t border-slate-100 pt-5">
            <h3 className="font-medium text-slate-800">Instructor feedback</h3>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
              {submission.feedback || "No written feedback was provided."}
            </p>
          </div>
        </section>
      ) : (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-slate-900">
              {submission ? "Update your submission" : "Submit your work"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              You can update your work until it has been graded. Submit text, a file, or both.
            </p>
          </div>
          <form onSubmit={(event) => void handleSubmit(event)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="assignment-answer">Text answer</Label>
              <Textarea
                id="assignment-answer"
                value={textAnswer}
                onChange={(event) => setTextAnswer(event.currentTarget.value)}
                maxLength={5000}
                rows={7}
                placeholder="Write your response..."
                disabled={submit.isPending}
              />
              <p className="text-right text-xs text-slate-500">{textAnswer.length} / 5000</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="assignment-file">Attachment (optional)</Label>
              {submission?.fileUrl && !removeFile && !file && (
                <div className="flex flex-wrap items-center gap-3 rounded-xl bg-slate-50 p-3">
                  <FileLink url={submission.fileUrl} name={submission.fileName} />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setRemoveFile(true)}
                    disabled={submit.isPending}
                  >
                    <X aria-hidden="true" />
                    Remove
                  </Button>
                </div>
              )}
              {removeFile && (
                <p className="text-sm text-amber-700">The current attachment will be removed when you save.</p>
              )}
              <Input
                id="assignment-file"
                type="file"
                accept=".pdf,.docx,.txt,.png,.jpg,.jpeg"
                onChange={(event) => {
                  const selected = event.currentTarget.files?.[0] ?? null;
                  setFile(selected);
                  setRemoveFile(false);
                }}
                disabled={submit.isPending}
              />
              <p className="text-xs text-slate-500">
                PDF, DOCX, TXT, PNG, or JPG · up to 4 MB
              </p>
              {file && file.size > MAX_FILE_BYTES && (
                <p role="alert" className="text-sm text-destructive">File must be 4 MB or smaller.</p>
              )}
              {file && (
                <p className="text-sm text-slate-600">
                  <Upload className="mr-1 inline size-4" aria-hidden="true" />
                  {file.name}
                </p>
              )}
            </div>
            <Button
              type="submit"
              disabled={
                submit.isPending ||
                Boolean(file && file.size > MAX_FILE_BYTES) ||
                (!textAnswer.trim() && !file && (!submission?.fileUrl || removeFile))
              }
            >
              {submit.isPending && <LoaderCircle className="animate-spin" aria-hidden="true" />}
              {submit.isPending ? "Saving..." : submission ? "Save changes" : "Submit assignment"}
            </Button>
          </form>
        </section>
      )}
    </div>
  );
}
