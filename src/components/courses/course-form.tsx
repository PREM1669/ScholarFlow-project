"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ThumbnailUploader } from "@/components/courses/thumbnail-uploader";
import { courseSchema, type CourseInput } from "@/lib/validators/course";
import type { CourseDetail } from "@/types";

export function CourseForm({
  course,
  busy,
  onSubmit,
}: {
  course?: CourseDetail;
  busy: boolean;
  onSubmit: (values: CourseInput, published?: boolean) => Promise<unknown>;
}) {
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const form = useForm<CourseInput>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: course?.title ?? "",
      description: course?.description ?? "",
      price: course?.price ?? 0,
      thumbnailUrl: course?.thumbnailUrl ?? null,
    },
  });

  useEffect(() => {
    if (course) {
      form.reset({
        title: course.title,
        description: course.description,
        price: course.price,
        thumbnailUrl: course.thumbnailUrl,
      });
    }
  }, [course, form]);

  const errors = form.formState.errors;

  return (
    <form
      onSubmit={form.handleSubmit((values) => onSubmit(values))}
      className="space-y-6"
      noValidate
    >
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-900">Course details</h2>
          <p className="mt-1 text-sm text-slate-500">
            Give learners a clear idea of what they will learn.
          </p>
        </div>
        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="course-title">Course title</Label>
            <Input
              id="course-title"
              placeholder="e.g. Introduction to data science"
              aria-invalid={Boolean(errors.title)}
              {...form.register("title")}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="course-description">Description</Label>
            <Textarea
              id="course-description"
              rows={5}
              placeholder="Describe the course outcomes and what students will learn."
              aria-invalid={Boolean(errors.description)}
              {...form.register("description")}
            />
            {errors.description && (
              <p className="text-sm text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>
          <div className="max-w-xs space-y-2">
            <Label htmlFor="course-price">Price (USD)</Label>
            <Input
              id="course-price"
              type="number"
              min="0"
              max="100000"
              step="0.01"
              aria-invalid={Boolean(errors.price)}
              {...form.register("price", { valueAsNumber: true })}
            />
            {errors.price && (
              <p className="text-sm text-destructive">{errors.price.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Course thumbnail</Label>
            <ThumbnailUploader
              value={form.watch("thumbnailUrl")}
              disabled={busy}
              onUploadingChange={setUploadingThumbnail}
              onChange={(value) =>
                form.setValue("thumbnailUrl", value, { shouldDirty: true })
              }
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap justify-end gap-3">
        {course && (
          <Button
            type="button"
            variant={course.published ? "outline" : "secondary"}
            disabled={busy || uploadingThumbnail}
            onClick={form.handleSubmit((values) =>
              onSubmit(values, !course.published),
            )}
          >
            {course.published ? "Unpublish" : "Publish course"}
          </Button>
        )}
        <Button type="submit" disabled={busy || uploadingThumbnail}>
          {busy || uploadingThumbnail ? (
            <LoaderCircle className="animate-spin" aria-hidden="true" />
          ) : (
            <Save aria-hidden="true" />
          )}
          {uploadingThumbnail
            ? "Uploading thumbnail..."
            : busy
              ? "Saving..."
              : "Save course"}
        </Button>
      </div>
    </form>
  );
}
