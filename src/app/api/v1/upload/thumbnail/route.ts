import { handleApiError, HttpError } from "@/lib/api-error";
import { IMAGE_RULES, detectImageType } from "@/lib/file-validation";
import { isCloudinaryConfigured, uploadImageBuffer } from "@/lib/cloudinary";
import { requireRole } from "@/lib/rbac";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    await requireRole("INSTRUCTOR", "ADMIN");

    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) throw new HttpError(400, "No file provided");
    if (file.size === 0) throw new HttpError(400, "The image file is empty");
    if (file.size > IMAGE_RULES.maxBytes) {
      throw new HttpError(413, "Image must be 2 MB or smaller");
    }
    if (!(IMAGE_RULES.mimeTypes as readonly string[]).includes(file.type)) {
      throw new HttpError(415, "Only JPG, PNG or WebP images are allowed");
    }
    if (!isCloudinaryConfigured()) {
      throw new HttpError(503, "Thumbnail uploads are not configured yet");
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    if (detectImageType(buffer) !== file.type) {
      throw new HttpError(415, "File content does not match its type");
    }

    const { url } = await uploadImageBuffer(buffer, "scholarflow/thumbnails");
    return Response.json({ url }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
