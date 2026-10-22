ALTER TABLE "Course" ADD COLUMN "category" TEXT NOT NULL DEFAULT 'General';

CREATE INDEX "Course_published_category_idx" ON "Course"("published", "category");
