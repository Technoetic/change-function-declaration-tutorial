import { describe, expect, it } from "vitest";
import { LESSONS, PRINCIPLES } from "../src/data/tutorial-data.js";

const forbiddenSnippetPatterns = [
  /function\s+\w+/i,
  /\w+\s*\([^)]*\)\s*\{/,
  /=>/,
  /const\s+\w+/i,
  /let\s+\w+/i,
];

describe("visible tutorial copy", () => {
  it("does not include code-like snippets in learner-facing content", () => {
    const visibleCopy = [
      ...LESSONS.flatMap((lesson) => [
        lesson.title,
        lesson.summary,
        lesson.concept,
        lesson.beforeLabel,
        lesson.afterLabel,
        lesson.badge,
      ]),
      ...PRINCIPLES,
    ]
      .filter(Boolean)
      .join("\n");

    for (const pattern of forbiddenSnippetPatterns) {
      expect(visibleCopy).not.toMatch(pattern);
    }
  });
});
