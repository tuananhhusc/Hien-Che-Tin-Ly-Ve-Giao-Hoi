import { readFileSync } from "node:fs";
import path from "node:path";
import { parseStructuredContent } from "../../lib/content-parser";

describe("parseStructuredContent", () => {
  const sourcePath = path.join(process.cwd(), "hienche.txt");
  const source = readFileSync(sourcePath, "utf8");
  const parsed = parseStructuredContent(source);

  it("parses core article structure", () => {
    expect(parsed.documentTitle).toContain("Lumen Gentium");
    expect(parsed.sections.length).toBe(12);
    expect(parsed.sections[0].title.startsWith("1.")).toBe(true);
  });

  it("builds references and footnote mapping", () => {
    expect(parsed.references.length).toBeGreaterThan(40);
    expect(Object.keys(parsed.footnotes).length).toBe(parsed.references.length);

    const firstRef = parsed.references[0];
    expect(firstRef.title.length).toBeGreaterThan(5);
    expect(firstRef.citationText.length).toBeGreaterThan(15);
    expect(firstRef.bibtex.startsWith("@misc{")).toBe(true);
    expect(["primary", "secondary"]).toContain(firstRef.type);
  });

  it("computes reading statistics", () => {
    expect(parsed.stats.wordCount).toBeGreaterThan(6000);
    expect(parsed.stats.readingMinutes).toBeGreaterThan(20);
  });
});
