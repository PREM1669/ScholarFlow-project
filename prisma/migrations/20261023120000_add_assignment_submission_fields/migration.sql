ALTER TABLE "Assignment"
ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "Submission"
ADD COLUMN "fileName" TEXT,
ADD COLUMN "filePublicId" TEXT,
ADD COLUMN "isLate" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX "Assignment_courseId_dueDate_idx" ON "Assignment"("courseId", "dueDate");
CREATE INDEX "Submission_studentId_idx" ON "Submission"("studentId");
