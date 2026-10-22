"use client";

import { useState, type FormEvent } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Link from "next/link";
import {
  ArrowDown,
  ArrowUp,
  Check,
  GripVertical,
  LoaderCircle,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import {
  useAddSection,
  useDeleteSection,
  useReorderSections,
  useSections,
  useUpdateSection,
} from "@/hooks/use-courses";
import type { SectionItem } from "@/types";

export function SectionBuilder({ courseId }: { courseId: string }) {
  const sections = useSections(courseId);
  const addSection = useAddSection(courseId);
  const reorder = useReorderSections(courseId);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const [newTitle, setNewTitle] = useState("");

  function moveSection(event: DragEndEvent) {
    if (
      reorder.isPending ||
      !event.over ||
      event.active.id === event.over.id ||
      !sections.data
    ) {
      return;
    }
    const oldIndex = sections.data.findIndex(
      (section) => section.id === event.active.id,
    );
    const newIndex = sections.data.findIndex(
      (section) => section.id === event.over?.id,
    );
    if (oldIndex < 0 || newIndex < 0) return;
    const next = arrayMove(sections.data, oldIndex, newIndex);
    reorder.mutate(next.map((section) => section.id));
  }

  function moveByButton(index: number, offset: number) {
    if (!sections.data) return;
    const target = index + offset;
    if (target < 0 || target >= sections.data.length) return;
    const next = arrayMove(sections.data, index, target);
    reorder.mutate(next.map((section) => section.id));
  }

  function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = newTitle.trim();
    if (title.length < 2) return;
    addSection.mutate(title, { onSuccess: () => setNewTitle("") });
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-slate-900">Course sections</h2>
        <p className="mt-1 text-sm leading-6 text-slate-500">
          Add and arrange the sections learners will follow. Use the drag handle
          or the move buttons to reorder.
        </p>
      </div>

      {sections.isPending ? (
        <div className="space-y-3" aria-label="Loading course sections">
          {[1, 2].map((row) => (
            <div
              key={row}
              className="h-16 animate-pulse rounded-xl bg-slate-100"
            />
          ))}
        </div>
      ) : sections.isError ? (
        <div role="alert" className="rounded-lg bg-red-50 p-4 text-sm text-red-800">
          <p>{sections.error.message}</p>
          <Button
            variant="outline"
            className="mt-3"
            onClick={() => void sections.refetch()}
          >
            Retry
          </Button>
        </div>
      ) : sections.data.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
          No sections yet. Add your first section below.
        </p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={moveSection}
        >
          <SortableContext
            items={sections.data.map((section) => section.id)}
            strategy={verticalListSortingStrategy}
          >
            <ol className="space-y-3">
              {sections.data.map((section, index) => (
                <SortableSection
                  key={section.id}
                  courseId={courseId}
                  section={section}
                  index={index}
                  total={sections.data.length}
                  reorderDisabled={reorder.isPending}
                  onMove={moveByButton}
                />
              ))}
            </ol>
          </SortableContext>
        </DndContext>
      )}

      <form
        onSubmit={(event) => void handleAdd(event)}
        className="mt-5 flex flex-col gap-2 border-t border-slate-100 pt-5 sm:flex-row"
      >
        <Input
          value={newTitle}
          onChange={(event) => setNewTitle(event.currentTarget.value)}
          minLength={2}
          maxLength={100}
          placeholder="Section title"
          aria-label="New section title"
          disabled={addSection.isPending}
          className="sm:flex-1"
        />
        <Button
          type="submit"
          disabled={addSection.isPending || newTitle.trim().length < 2}
        >
          {addSection.isPending ? (
            <LoaderCircle className="animate-spin" aria-hidden="true" />
          ) : (
            <Plus aria-hidden="true" />
          )}
          Add section
        </Button>
      </form>
    </section>
  );
}

function SortableSection({
  section,
  courseId,
  index,
  total,
  reorderDisabled,
  onMove,
}: {
  section: SectionItem;
  courseId: string;
  index: number;
  total: number;
  reorderDisabled: boolean;
  onMove: (index: number, offset: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(section.title);
  const update = useUpdateSection(courseId);
  const remove = useDeleteSection(courseId);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  function saveTitle(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextTitle = title.trim();
    if (nextTitle.length < 2) return;
    update.mutate(
      { sectionId: section.id, title: nextTitle },
      { onSuccess: () => setEditing(false) },
    );
  }

  function cancelEdit() {
    setTitle(section.title);
    setEditing(false);
  }

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`rounded-xl border bg-white p-3 transition-shadow sm:p-4 ${
        isDragging
          ? "z-10 border-primary/40 shadow-lg"
          : "border-slate-200 shadow-sm"
      }`}
    >
      <div className="flex items-center gap-2 sm:gap-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="cursor-grab touch-none text-slate-400 active:cursor-grabbing"
          aria-label={`Reorder section ${section.title}. Use Space to pick up and arrow keys to move.`}
          disabled={reorderDisabled}
          {...attributes}
          {...listeners}
        >
          <GripVertical aria-hidden="true" />
        </Button>
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-semibold text-slate-600">
          {index + 1}
        </span>

        {editing ? (
          <form onSubmit={(event) => void saveTitle(event)} className="flex min-w-0 flex-1 gap-2">
            <Input
              value={title}
              onChange={(event) => setTitle(event.currentTarget.value)}
              minLength={2}
              maxLength={100}
              aria-label={`Rename section ${section.title}`}
              autoFocus
              disabled={update.isPending}
              className="h-9"
            />
            <Button
              type="submit"
              variant="ghost"
              size="icon"
              aria-label="Save section name"
              disabled={update.isPending || title.trim().length < 2}
            >
              {update.isPending ? (
                <LoaderCircle className="animate-spin" aria-hidden="true" />
              ) : (
                <Check aria-hidden="true" />
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Cancel rename"
              disabled={update.isPending}
              onClick={cancelEdit}
            >
              <X aria-hidden="true" />
            </Button>
          </form>
        ) : (
          <>
            <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-800">
              {section.title}
            </span>
            <div className="flex items-center gap-1">
              <Button
                asChild
                type="button"
                variant="outline"
                size="sm"
              >
                <Link
                  href={`/instructor/courses/${courseId}/sections/${section.id}`}
                >
                  Edit content
                </Link>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={`Move ${section.title} up`}
                disabled={reorderDisabled || index === 0}
                onClick={() => onMove(index, -1)}
              >
                <ArrowUp aria-hidden="true" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={`Move ${section.title} down`}
                disabled={reorderDisabled || index === total - 1}
                onClick={() => onMove(index, 1)}
              >
                <ArrowDown aria-hidden="true" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={`Rename ${section.title}`}
                onClick={() => setEditing(true)}
              >
                <span className="text-xs font-semibold">Edit</span>
              </Button>
              <ConfirmDialog
                trigger={
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Delete ${section.title}`}
                  >
                    <Trash2 className="text-destructive" aria-hidden="true" />
                  </Button>
                }
                title="Delete this section?"
                description={`“${section.title}” will be permanently deleted.`}
                onConfirm={() => remove.mutateAsync(section.id)}
              />
            </div>
          </>
        )}
      </div>
    </li>
  );
}
