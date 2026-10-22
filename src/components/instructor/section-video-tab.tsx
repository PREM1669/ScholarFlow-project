"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VideoEmbed } from "@/components/shared/video-embed";
import { useSaveSection } from "@/hooks/use-sections";
import { parseVideoUrl } from "@/lib/video";
import type { SectionDetail } from "@/types";

export function SectionVideoTab({
  courseId,
  section,
}: {
  courseId: string;
  section: SectionDetail;
}) {
  const save = useSaveSection(courseId, section.id);
  const [url, setUrl] = useState(section.videoUrl ?? "");
  const trimmed = url.trim();
  const parsed = trimmed ? parseVideoUrl(trimmed) : null;
  const invalid = trimmed !== "" && !parsed;
  const dirty = trimmed !== (section.videoUrl ?? "");

  return (
    <div className="max-w-2xl space-y-4">
      <div className="space-y-2">
        <Label htmlFor="video-url">Video link (YouTube or Vimeo)</Label>
        <Input
          id="video-url"
          type="url"
          placeholder="https://www.youtube.com/watch?v=..."
          value={url}
          aria-invalid={invalid}
          onChange={(event) => setUrl(event.currentTarget.value)}
        />
        {invalid && (
          <p className="text-sm text-destructive">
            Use a valid YouTube or Vimeo link
          </p>
        )}
      </div>
      {parsed && <VideoEmbed url={trimmed} title={section.title} />}

      <div className="flex flex-wrap gap-2">
        <Button
          disabled={!dirty || invalid || save.isPending}
          onClick={() => save.mutate({ videoUrl: trimmed || null })}
        >
          {save.isPending ? "Saving..." : "Save video"}
        </Button>
        {section.videoUrl && (
          <Button
            variant="outline"
            disabled={save.isPending || !url}
            onClick={() => {
              setUrl("");
              save.mutate({ videoUrl: null });
            }}
          >
            Remove video
          </Button>
        )}
      </div>
    </div>
  );
}
