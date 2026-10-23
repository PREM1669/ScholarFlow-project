import type { Chunk } from "@/lib/ai/chunking";

export type ScoredChunk = { chunk: Chunk; score: number };

const STOPWORDS = new Set(
  (
    "a an and are as at be but by can could do does did for from had has have how i if in into is it its me my " +
    "of on or our please should so tell than that the their them then there these they this to us was we were " +
    "what when where which who why will with would you your about explain describe give show"
  ).split(" "),
);

function stem(word: string): string {
  if (word.length > 4 && word.endsWith("ies")) return `${word.slice(0, -3)}y`;
  if (word.length > 5 && word.endsWith("ing")) return word.slice(0, -3);
  if (word.length > 4 && word.endsWith("ed")) return word.slice(0, -2);
  if (word.length > 3 && word.endsWith("s") && !/(ss|us|is)$/.test(word)) {
    return word.slice(0, -1);
  }
  return word;
}

const WORD = new RegExp("[\\p{L}\\p{M}\\p{N}]+", "gu");

export function tokenize(text: string): string[] {
  const words = text.toLowerCase().match(WORD) ?? [];
  return words.filter((word) => !STOPWORDS.has(word)).map(stem);
}

const K1 = 1.4;
const B = 0.75;

export function rankChunks(
  chunks: Chunk[],
  query: string,
  topK: number,
): ScoredChunk[] {
  const queryTerms = Array.from(new Set(tokenize(query)));
  if (queryTerms.length === 0 || chunks.length === 0 || topK <= 0) return [];

  const documents = chunks.map((chunk) =>
    tokenize(`${chunk.sectionTitle} ${chunk.text}`),
  );
  const averageLength =
    documents.reduce((total, document) => total + document.length, 0) /
      documents.length || 1;

  const documentFrequency = new Map<string, number>();
  for (const document of documents) {
    for (const term of Array.from(new Set(document))) {
      documentFrequency.set(term, (documentFrequency.get(term) ?? 0) + 1);
    }
  }

  const scored = chunks.map((chunk, index) => {
    const counts = new Map<string, number>();
    for (const term of documents[index]) {
      counts.set(term, (counts.get(term) ?? 0) + 1);
    }

    let score = 0;
    for (const term of queryTerms) {
      const frequency = counts.get(term) ?? 0;
      if (!frequency) continue;
      const documentFrequencyForTerm = documentFrequency.get(term) ?? 0;
      const idf = Math.log(
        1 +
          (documents.length - documentFrequencyForTerm + 0.5) /
            (documentFrequencyForTerm + 0.5),
      );
      score +=
        (idf * (frequency * (K1 + 1))) /
        (frequency +
          K1 *
            (1 - B + (B * documents[index].length) / averageLength));
    }
    return { chunk, score };
  });

  return scored
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

export function buildRetrievalQuery(
  question: string,
  previousQuestion?: string,
): string {
  const isShortFollowUp = tokenize(question).length <= 3;
  return isShortFollowUp && previousQuestion
    ? `${previousQuestion} ${question}`
    : question;
}
