import { Prisma } from "@prisma/client";
import { handleApiError, HttpError } from "@/lib/api-error";
import { deleteRawAsset, uploadRawBuffer } from "@/lib/cloudinary";
import { getEnrolledAssignment } from "@/lib/enrollment";
import {
  ASSIGNMENT_FILE_RULES,
  detectAssignmentFileType,
} from "@/lib/file-validation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";

type RouteContext = { params: { assignmentId: string } };
type UploadedFile = {
  name: string;
  size: number;
  arrayBuffer: () => Promise<ArrayBuffer>;
};

function isUploadedFile(value: FormDataEntryValue | null): value is File & UploadedFile {
  return (
    typeof value === "object" &&
    value !== null &&
    "arrayBuffer" in value &&
    typeof value.arrayBuffer === "function" &&
    "name" in value &&
    typeof value.name === "string" &&
    "size" in value &&
    typeof value.size === "number"
  );
}

function safeFileName(name: string) {
  return name.split(/[\\/]/).pop()?.replace(/[\u0000-\u001f\u007f]/g, "").trim() ?? "";
}

const submissionSelect = {
  id: true,
  textAnswer: true,
  fileUrl: true,
  fileName: true,
  isLate: true,
  submittedAt: true,
  score: true,
  feedback: true,
  gradedAt: true,
} as const;

export const dynamic = "force-dynamic";

export async function PUT(request: Request, { params }: RouteContext) {
  let uploadedId: string | null = null;
  try {
    const user = await requireRole("STUDENT");
    const assignment = await getEnrolledAssignment(user.id, params.assignmentId);
    const formData = await request.formData();
    const rawText = formData.get("textAnswer");
    if (rawText !== null && typeof rawText !== "string") {
      throw new HttpError(400, "Text answer must be plain text");
    }
    const textAnswer = typeof rawText === "string" ? rawText.trim() : "";
    if (textAnswer.length > 5000) {
      throw new HttpError(400, "Text answer must be 5000 characters or fewer");
    }
    const removeFile = formData.get("removeFile") === "true";
    const incomingFile = formData.get("file");
    const newFile = isUploadedFile(incomingFile) && incomingFile.size > 0
      ? incomingFile
      : null;
    if (incomingFile !== null && !newFile && !removeFile && !isUploadedFile(incomingFile)) {
      throw new HttpError(400, "Uploaded file is invalid");
    }
    if (newFile && newFile.size > ASSIGNMENT_FILE_RULES.maxBytes) {
      throw new HttpError(400, "File must be 4 MB or smaller");
    }

    const existing = await prisma.submission.findUnique({
      where: {
        assignmentId_studentId: {
          assignmentId: assignment.id,
          studentId: user.id,
        },
      },
    });
    if (existing?.gradedAt) {
      throw new HttpError(409, "This submission has been graded and can no longer be changed");
    }
    const keepsOldFile = Boolean(existing?.fileUrl && !removeFile && !newFile);
    if (!textAnswer && !newFile && !keepsOldFile) {
      throw new HttpError(400, "Add a text answer or attach a file");
    }

    let fileData: {
      fileUrl?: string | null;
      fileName?: string | null;
      filePublicId?: string | null;
    } = {};
    if (newFile) {
      const buffer = Buffer.from(await newFile.arrayBuffer());
      if (buffer.byteLength > ASSIGNMENT_FILE_RULES.maxBytes) {
        throw new HttpError(400, "File must be 4 MB or smaller");
      }
      const detectedType = detectAssignmentFileType(buffer);
      if (!detectedType) {
        throw new HttpError(400, "File must be a valid PDF, DOCX, TXT, PNG or JPG");
      }
      const originalName = safeFileName(newFile.name);
      const extension = originalName.split(".").pop()?.toLowerCase();
      const expectedExtension = ASSIGNMENT_FILE_RULES.mimeTypes[detectedType];
      if (
        !extension ||
        (extension !== expectedExtension &&
          !(detectedType === "image/jpeg" && extension === "jpeg"))
      ) {
        throw new HttpError(400, "File extension does not match its actual type");
      }
      if (!originalName || originalName.length > 180) {
        throw new HttpError(400, "File name must be 180 characters or fewer");
      }
      const uploaded = await uploadRawBuffer(buffer, expectedExtension);
      uploadedId = uploaded.publicId;
      fileData = {
        fileUrl: uploaded.url,
        fileName: originalName,
        filePublicId: uploaded.publicId,
      };
    } else if (removeFile && existing?.fileUrl) {
      fileData = { fileUrl: null, fileName: null, filePublicId: null };
    }

    const now = new Date();
    const data = {
      textAnswer: textAnswer || null,
      isLate: now > assignment.dueDate,
      submittedAt: now,
      ...fileData,
    };

    let submission;
    if (existing) {
      const { count } = await prisma.submission.updateMany({
        where: { id: existing.id, gradedAt: null },
        data,
      });
      if (!count) {
        throw new HttpError(409, "This submission has just been graded and can no longer be changed");
      }
      submission = await prisma.submission.findUniqueOrThrow({
        where: { id: existing.id },
        select: submissionSelect,
      });
    } else {
      try {
        submission = await prisma.submission.create({
          data: { assignmentId: assignment.id, studentId: user.id, ...data },
          select: submissionSelect,
        });
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2002"
        ) {
          throw new HttpError(409, "A submission was just created. Refresh and try again.");
        }
        throw error;
      }
    }
    uploadedId = null;

    if (existing?.filePublicId && !keepsOldFile && existing.filePublicId !== fileData.filePublicId) {
      await deleteRawAsset(existing.filePublicId);
    }
    return Response.json({ status: submission.gradedAt ? "graded" : "submitted", submission });
  } catch (error) {
    if (uploadedId) await deleteRawAsset(uploadedId);
    return handleApiError(error);
  }
}
