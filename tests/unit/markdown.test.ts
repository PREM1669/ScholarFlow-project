import { normalizeLegacyMarkdown } from "@/lib/markdown";

describe("normalizeLegacyMarkdown", () => {
  it("normalizes escaped headings, numbered lists, and blockquotes", () => {
    expect(
      normalizeLegacyMarkdown("\\## Heading\n1\\. item\n&gt; quote"),
    ).toBe("## Heading\n1. item\n> quote");
  });

  it("leaves unrelated content intact", () => {
    expect(normalizeLegacyMarkdown("plain **markdown**")).toBe(
      "plain **markdown**",
    );
  });
});
