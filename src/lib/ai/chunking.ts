import { AI_LIMITS } from "@/lib/ai/constants";

export type Chunk = {
  id: string;
  sectionId: string | null;
  sectionOrder: number;
  sectionTitle: string;
  text: string;
};

export type CourseInput = {
  title: string;
  description: string;
  sections: { id: string; title: string; order: number; content: string }[];
};

function hardSplit(block: string, max: number): string[] {
  const output: string[] = [];
  let rest = block;
  while (rest.length > max) {
    let cut = rest.lastIndexOf("\n", max);
    if (cut < max * 0.5) cut = rest.lastIndexOf(" ", max);
    if (cut < max * 0.5) cut = max;
    output.push(rest.slice(0, cut).trim());
    rest = rest.slice(cut).trim();
  }
  if (rest) output.push(rest);
  return output;
}

export function splitIntoPieces(
  text: string,
  max = AI_LIMITS.chunkChars,
): string[] {
  const blocks = text
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);
  const pieces: string[] = [];
  let current = "";
  const flush = () => {
    if (current) pieces.push(current);
    current = "";
  };

  for (const block of blocks) {
    if (block.length > max) {
      flush();
      pieces.push(...hardSplit(block, max));
      continue;
    }
    if (current && current.length + block.length + 2 > max) flush();
    current = current ? `${current}\n\n${block}` : block;
  }
  flush();
  return pieces;
}

export function buildCourseChunks(course: CourseInput): Chunk[] {
  const outline = course.sections
    .map((section) => `${section.order}. ${section.title}`)
    .join("\n");
  const chunks: Chunk[] = [
    {
      id: "overview",
      sectionId: null,
      sectionOrder: 0,
      sectionTitle: "Course overview",
      text: `Course: ${course.title}\n${course.description}\n\nSections:\n${outline}`,
    },
  ];

  for (const section of course.sections) {
    const body = section.content.trim();
    if (!body) continue;
    splitIntoPieces(body).forEach((piece, index) =>
      chunks.push({
        id: `${section.id}:${index}`,
        sectionId: section.id,
        sectionOrder: section.order,
        sectionTitle: section.title,
        text: piece,
      }),
    );
  }
  return chunks;
}
