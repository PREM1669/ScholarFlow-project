import {
  PDFDocument,
  StandardFonts,
  rgb,
  type PDFFont,
  type PDFPage,
} from "pdf-lib";
import { HttpError, handleApiError } from "@/lib/api-error";
import { progressSummary } from "@/lib/progress";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const latin = (text: string) => text.replace(/[^\x20-\x7E\xA0-\xFF]/g, "?");

function drawCentered(
  page: PDFPage,
  text: string,
  y: number,
  font: PDFFont,
  size: number,
  maxWidth = 700,
  color = rgb(0.12, 0.14, 0.2),
) {
  let fontSize = size;
  while (fontSize > 10 && font.widthOfTextAtSize(text, fontSize) > maxWidth) {
    fontSize -= 1;
  }
  const width = font.widthOfTextAtSize(text, fontSize);
  page.drawText(text, {
    x: (page.getWidth() - width) / 2,
    y,
    size: fontSize,
    font,
    color,
  });
}

export async function GET(
  _request: Request,
  { params }: { params: { courseId: string } },
) {
  try {
    const user = await requireRole("STUDENT");
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: { userId: user.id, courseId: params.courseId },
      },
      include: {
        course: {
          select: {
            title: true,
            instructor: { select: { name: true } },
            _count: { select: { sections: true } },
          },
        },
        _count: { select: { progress: { where: { completed: true } } } },
      },
    });
    if (!enrollment) throw new HttpError(404, "Enrollment not found");
    const summary = progressSummary(
      enrollment._count.progress,
      enrollment.course._count.sections,
    );
    if (!summary.isCompleted) {
      throw new HttpError(403, "Complete every section to earn the certificate");
    }
    const issuedOn = (enrollment.completedAt ?? new Date()).toLocaleDateString(
      "en-GB",
      { day: "numeric", month: "long", year: "numeric" },
    );
    const pdf = await PDFDocument.create();
    const page = pdf.addPage([842, 595]);
    const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
    const regular = await pdf.embedFont(StandardFonts.Helvetica);
    const italic = await pdf.embedFont(StandardFonts.TimesRomanItalic);
    const accent = rgb(0.17, 0.32, 0.72);
    const muted = rgb(0.4, 0.42, 0.48);
    page.drawRectangle({
      x: 24,
      y: 24,
      width: 794,
      height: 547,
      borderColor: accent,
      borderWidth: 4,
    });
    page.drawRectangle({
      x: 36,
      y: 36,
      width: 770,
      height: 523,
      borderColor: accent,
      borderWidth: 1,
    });
    drawCentered(page, "SCHOLARFLOW", 505, bold, 16, 700, accent);
    drawCentered(page, "Certificate of Completion", 445, bold, 40);
    drawCentered(page, "This is to certify that", 385, italic, 18, 700, muted);
    drawCentered(page, latin(user.name), 335, bold, 34, 700, accent);
    drawCentered(
      page,
      "has successfully completed the course",
      290,
      italic,
      18,
      700,
      muted,
    );
    drawCentered(page, latin(enrollment.course.title), 240, bold, 26);
    drawCentered(
      page,
      `Instructor: ${latin(enrollment.course.instructor.name)}`,
      170,
      regular,
      14,
      700,
      muted,
    );
    drawCentered(page, `Completed on ${issuedOn}`, 148, regular, 14, 700, muted);
    drawCentered(
      page,
      `Certificate ID: ${enrollment.id}`,
      62,
      regular,
      9,
      700,
      muted,
    );
    const bytes = await pdf.save();
    const slug =
      enrollment.course.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") || "course";
    return new Response(new Uint8Array(bytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="certificate-${slug}.pdf"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
