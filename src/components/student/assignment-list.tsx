"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { DueDate } from "@/components/shared/due-date";
import { SubmissionStatusBadge } from "@/components/shared/submission-status-badge";
import { Button } from "@/components/ui/button";
import { useMyAssignments } from "@/hooks/use-assignments";
import type { SubmissionStatus } from "@/types";

const tabs: { key: "all" | SubmissionStatus; label: string }[] = [
  { key: "all", label: "All" },
  { key: "not_submitted", label: "To do" },
  { key: "submitted", label: "Submitted" },
  { key: "graded", label: "Graded" },
];

export function AssignmentList({ courseId }: { courseId?: string }) {
  const assignments = useMyAssignments(courseId);
  const [tab, setTab] = useState<(typeof tabs)[number]["key"]>("all");

  if (assignments.isPending) {
    return (
      <div className="flex items-center gap-2 py-12 text-sm text-slate-500">
        <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
        Loading assignments...
      </div>
    );
  }
  if (assignments.isError) {
    return (
      <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">
        <p>{assignments.error.message}</p>
        <Button variant="outline" className="mt-3" onClick={() => void assignments.refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  const items = assignments.data.filter(
    (assignment) => tab === "all" || assignment.status === tab,
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter assignments">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              tab === key
                ? "bg-primary text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center">
          <h2 className="font-semibold text-slate-800">
            {assignments.data.length ? "No assignments in this view" : "No assignments yet"}
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            {assignments.data.length
              ? "Choose another tab to see your assignments."
              : "Enroll in a course to see its assignments here."}
          </p>
          {!assignments.data.length && (
            <Button asChild variant="outline" className="mt-4">
              <Link href="/student/courses">Browse courses</Link>
            </Button>
          )}
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((assignment) => (
            <li key={assignment.id}>
              <Link
                href={`/student/assignments/${assignment.id}`}
                className="group flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-primary/30 hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold text-slate-900">{assignment.title}</h2>
                    <SubmissionStatusBadge
                      status={assignment.status ?? "not_submitted"}
                      isLate={assignment.isLate}
                    />
                  </div>
                  <p className="text-sm text-slate-500">{assignment.courseTitle}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-2">
                    <DueDate dueDate={assignment.dueDate} />
                    <span className="text-sm text-slate-500">Max score: {assignment.maxScore}</span>
                    {assignment.score !== null && assignment.score !== undefined && (
                      <span className="text-sm font-medium text-slate-700">Score: {assignment.score}</span>
                    )}
                  </div>
                </div>
                <ArrowRight className="size-5 shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-primary" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
