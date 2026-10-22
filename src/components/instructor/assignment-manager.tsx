"use client";

import Link from "next/link";
import { useState } from "react";
import { ClipboardList, LoaderCircle, Pencil, Trash2 } from "lucide-react";
import { AssignmentForm } from "@/components/instructor/assignment-form";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DueDate } from "@/components/shared/due-date";
import { Button } from "@/components/ui/button";
import { useAssignments, useCreateAssignment, useDeleteAssignment, useUpdateAssignment } from "@/hooks/use-assignments";
import type { AssignmentInput } from "@/lib/validators/assignment";
import type { AssignmentListItem } from "@/types";

export function AssignmentManager({ courseId }: { courseId: string }) {
  const assignments = useAssignments(courseId);
  const create = useCreateAssignment(courseId);
  const [editing, setEditing] = useState<string | null>(null);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-slate-900">Assignments</h2>
        <p className="mt-1 text-sm leading-6 text-slate-500">
          Set a prompt and deadline, review submissions, and return scored feedback.
        </p>
      </div>

      <div className="mb-7 rounded-xl bg-slate-50 p-4 sm:p-5">
        <h3 className="mb-4 font-semibold text-slate-800">Create an assignment</h3>
        <AssignmentForm
          key="new-assignment"
          mode="create"
          submitLabel="Create assignment"
          loading={create.isPending}
          onSubmit={(values) => create.mutateAsync(values)}
        />
      </div>

      {assignments.isPending ? (
        <div className="flex items-center gap-2 py-8 text-sm text-slate-500">
          <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
          Loading assignments...
        </div>
      ) : assignments.isError ? (
        <div role="alert" className="rounded-lg bg-red-50 p-4 text-sm text-red-800">
          <p>{assignments.error.message}</p>
          <Button variant="outline" className="mt-3" onClick={() => void assignments.refetch()}>
            Retry
          </Button>
        </div>
      ) : assignments.data.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500">
          No assignments yet. Create the first one above.
        </p>
      ) : (
        <ul className="space-y-3">
          {assignments.data.map((assignment) => (
            <AssignmentRow
              key={assignment.id}
              courseId={courseId}
              assignment={assignment}
              editing={editing === assignment.id}
              onEdit={() => setEditing(assignment.id)}
              onCancelEdit={() => setEditing(null)}
              onSaved={() => setEditing(null)}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

function AssignmentRow({
  courseId,
  assignment,
  editing,
  onEdit,
  onCancelEdit,
  onSaved,
}: {
  courseId: string;
  assignment: AssignmentListItem;
  editing: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onSaved: () => void;
}) {
  const update = useUpdateAssignment(courseId, assignment.id);
  const remove = useDeleteAssignment(courseId, assignment.id);
  const defaults: Partial<AssignmentInput> = {
    title: assignment.title,
    prompt: assignment.prompt,
    dueDate: new Date(assignment.dueDate),
    maxScore: assignment.maxScore,
  };

  return (
    <li className="rounded-xl border border-slate-200 p-4 sm:p-5">
      {editing ? (
        <AssignmentForm
          mode="edit"
          defaultValues={defaults}
          submitLabel="Save changes"
          loading={update.isPending}
          onCancel={onCancelEdit}
          onSubmit={async (values) => {
            await update.mutateAsync(values);
            onSaved();
          }}
        />
      ) : (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 space-y-2">
            <h3 className="font-semibold text-slate-900">{assignment.title}</h3>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <DueDate dueDate={assignment.dueDate} />
              <span className="text-sm text-slate-500">Max score: {assignment.maxScore}</span>
              <span className="text-sm text-slate-500">
                {assignment.submittedCount ?? 0} submitted · {assignment.gradedCount ?? 0} graded
              </span>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href={`/instructor/courses/${courseId}/assignments/${assignment.id}/submissions`}>
                <ClipboardList aria-hidden="true" />
                Review
              </Link>
            </Button>
            <Button type="button" variant="ghost" size="icon-sm" aria-label={`Edit ${assignment.title}`} onClick={onEdit}>
              <Pencil aria-hidden="true" />
            </Button>
            <ConfirmDialog
              trigger={
                <Button type="button" variant="ghost" size="icon-sm" aria-label={`Delete ${assignment.title}`}>
                  <Trash2 className="text-destructive" aria-hidden="true" />
                </Button>
              }
              title="Delete this assignment?"
              description="All submissions will be deleted, and uploaded files will be removed."
              onConfirm={() => remove.mutateAsync()}
            />
          </div>
        </div>
      )}
    </li>
  );
}
