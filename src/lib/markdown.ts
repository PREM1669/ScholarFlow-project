export function normalizeLegacyMarkdown(markdown: string) {
  return markdown
    .replace(/^\\(#{1,6}\s)/gm, "$1")
    .replace(/^(\d+)\\\./gm, "$1.")
    .replace(/^&gt;(?=\s)/gm, ">");
}
