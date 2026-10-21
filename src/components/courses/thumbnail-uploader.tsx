"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ImagePlus, LoaderCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { IMAGE_RULES } from "@/lib/file-validation";
import { uploadCourseThumbnail } from "@/hooks/use-courses";

export function ThumbnailUploader({
  value,
  onChange,
  onUploadingChange,
  disabled = false,
}: {
  value: string | null | undefined;
  onChange: (value: string | null) => void;
  onUploadingChange?: (uploading: boolean) => void;
  disabled?: boolean;
}) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file?: File) {
    if (!file) return;
    if (!(IMAGE_RULES.mimeTypes as readonly string[]).includes(file.type)) {
      toast.error("Choose a JPG, PNG or WebP image");
      return;
    }
    if (file.size > IMAGE_RULES.maxBytes) {
      toast.error("Image must be 2 MB or smaller");
      return;
    }
    setUploading(true);
    onUploadingChange?.(true);
    try {
      const result = await uploadCourseThumbnail(file);
      onChange(result.url);
      toast.success("Thumbnail uploaded");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
      onUploadingChange?.(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="relative aspect-[16/7] overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
        {value ? (
          <Image
            src={value}
            alt="Course thumbnail preview"
            fill
            sizes="(max-width: 768px) 100vw, 640px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-400">
            <ImagePlus className="size-7" aria-hidden="true" />
            <span className="text-sm">No thumbnail selected</span>
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/75">
            <LoaderCircle className="size-6 animate-spin text-primary" />
            <span className="sr-only">Uploading image</span>
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          disabled={disabled || uploading}
          onChange={(event) => {
            void handleFile(event.currentTarget.files?.[0]);
            event.currentTarget.value = "";
          }}
        />
        <Button
          type="button"
          variant="outline"
          disabled={disabled || uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? (
            <LoaderCircle className="animate-spin" aria-hidden="true" />
          ) : (
            <ImagePlus aria-hidden="true" />
          )}
          {value ? "Replace thumbnail" : "Upload thumbnail"}
        </Button>
        {value && (
          <Button
            type="button"
            variant="ghost"
            disabled={disabled || uploading}
            onClick={() => onChange(null)}
          >
            <Trash2 aria-hidden="true" />
            Remove
          </Button>
        )}
        <span className="self-center text-xs text-slate-500">
          JPG, PNG or WebP · max 2 MB
        </span>
      </div>
    </div>
  );
}
