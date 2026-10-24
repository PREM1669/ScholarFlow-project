import {
  detectAssignmentFileType,
  detectImageType,
  ASSIGNMENT_FILE_RULES,
  IMAGE_RULES,
} from "@/lib/file-validation";
import { fakeFile } from "./helpers";

describe("detectImageType", () => {
  it("recognizes JPEG, PNG and WebP from their bytes", () => {
    expect(detectImageType(new Uint8Array([0xff, 0xd8, 0xff, 0xe0]))).toBe(
      "image/jpeg",
    );
    expect(
      detectImageType(
        new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      ),
    ).toBe("image/png");
    expect(
      detectImageType(
        new Uint8Array([
          0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50,
        ]),
      ),
    ).toBe("image/webp");
  });

  it("rejects unknown and empty content", () => {
    expect(detectImageType(new Uint8Array([0x25, 0x50, 0x44, 0x46]))).toBeNull();
    expect(detectImageType(new Uint8Array())).toBeNull();
  });
});

describe("detectAssignmentFileType", () => {
  it("recognizes supported file signatures", () => {
    expect(
      detectAssignmentFileType(new TextEncoder().encode("%PDF-1.7 content")),
    ).toBe("application/pdf");
    expect(
      detectAssignmentFileType(
        new Uint8Array([
          0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
        ]),
      ),
    ).toBe("image/png");
    expect(
      detectAssignmentFileType(new Uint8Array([0xff, 0xd8, 0xff, 0xe0])),
    ).toBe("image/jpeg");
    const docx = new TextEncoder().encode(
      "PK\u0003\u0004...word/document.xml...",
    );
    expect(detectAssignmentFileType(docx)).toBe(
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    );
  });

  it("accepts valid UTF-8 text and rejects binary or malformed content", () => {
    expect(
      detectAssignmentFileType(new TextEncoder().encode("plain notes, café")),
    ).toBe("text/plain");
    expect(
      detectAssignmentFileType(new Uint8Array([0x00, 0x01, 0x02, 0xff])),
    ).toBeNull();
    expect(detectAssignmentFileType(new Uint8Array([0xc3, 0x28]))).toBeNull();
    expect(detectAssignmentFileType(new Uint8Array())).toBeNull();
  });

  it("exposes the configured upload bounds and accepted types", () => {
    expect(IMAGE_RULES.maxBytes).toBe(2 * 1024 * 1024);
    expect(ASSIGNMENT_FILE_RULES.maxBytes).toBe(4 * 1024 * 1024);
    expect(Object.keys(ASSIGNMENT_FILE_RULES.mimeTypes)).toEqual(
      expect.arrayContaining(["application/pdf", "text/plain", "image/png"]),
    );
  });
});

describe("file input test doubles", () => {
  it("creates lightweight files with the requested name and size", () => {
    expect(fakeFile("essay.pdf", 123)).toMatchObject({
      name: "essay.pdf",
      size: 123,
    });
  });
});
