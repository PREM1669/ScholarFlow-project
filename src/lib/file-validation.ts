export const IMAGE_RULES = {
  maxBytes: 2 * 1024 * 1024,
  mimeTypes: ["image/jpeg", "image/png", "image/webp"],
} as const;

export const ASSIGNMENT_FILE_RULES = {
  maxBytes: 4 * 1024 * 1024,
  mimeTypes: {
    "application/pdf": "pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      "docx",
    "text/plain": "txt",
    "image/png": "png",
    "image/jpeg": "jpg",
  },
} as const;

export type AssignmentFileType = keyof typeof ASSIGNMENT_FILE_RULES.mimeTypes;

export function detectAssignmentFileType(bytes: Uint8Array): AssignmentFileType | null {
  if (
    bytes.length >= 5 &&
    bytes[0] === 0x25 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x44 &&
    bytes[3] === 0x46 &&
    bytes[4] === 0x2d
  ) {
    return "application/pdf";
  }
  if (
    bytes.length >= 4 &&
    bytes[0] === 0x50 &&
    bytes[1] === 0x4b &&
    bytes[2] === 0x03 &&
    bytes[3] === 0x04 &&
    Buffer.from(bytes).includes(Buffer.from("word/document.xml"))
  ) {
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  }
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return "image/png";
  }
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  if (bytes.length > 0) {
    try {
      const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
      if (!text.includes("\u0000")) return "text/plain";
    } catch {
      return null;
    }
  }
  return null;
}

export function detectImageType(bytes: Uint8Array): string | null {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return "image/png";
  }
  if (
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return "image/webp";
  }
  return null;
}
