"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MarkdownContent } from "@/components/shared/markdown-content";
import { RichTextEditor } from "@/components/instructor/rich-text-editor";
import { useSaveSection } from "@/hooks/use-sections";
import { cn } from "@/lib/utils";
import { normalizeLegacyMarkdown } from "@/lib/markdown";
import type { SectionDetail } from "@/types";

export function SectionNotesTab({
  courseId,
  section,
}: {
  courseId: string;
  section: SectionDetail;
}) {
  const save = useSaveSection(courseId, section.id);
  const [markdown, setMarkdown] = useState(() =>
    normalizeLegacyMarkdown(section.content),
  );
  const [preview, setPreview] = useState(false);
  const dirty = markdown !== section.content;

  return (
    <div className="max-w-3xl space-y-3">
      <div className={cn(preview && "hidden")}>
        <RichTextEditor
          value={markdown}
          onChange={setMarkdown}
        />
      </div>
      {preview &&
        (markdown.trim() ? (
          <div className="rounded-xl border bg-white p-4 sm:p-6">
            <MarkdownContent>{markdown}</MarkdownContent>
          </div>
        ) : (
          <p className="text-sm text-slate-500">Nothing to preview yet.</p>
        ))}

      <div className="flex flex-wrap items-center gap-2">
        <Button
          disabled={!dirty || save.isPending}
          onClick={() => save.mutate({ content: markdown })}
        >
          {save.isPending ? "Saving..." : "Save notes"}
        </Button>
        <Button
          variant="outline"
          onClick={() => setPreview((current) => !current)}
        >
          {preview ? "Back to editor" : "Preview as student"}
        </Button>
        {dirty && (
          <span className="text-sm text-amber-700">Unsaved changes</span>
        )}
      </div>
    </div>
  );
}
