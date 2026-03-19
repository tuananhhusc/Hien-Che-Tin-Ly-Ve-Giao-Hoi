import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseStructuredContent } from "../lib/content-parser";

async function run() {
  const projectRoot = process.cwd();
  const sourcePath = path.join(projectRoot, "hienche.txt");
  const outputDir = path.join(projectRoot, "data");
  const outputPath = path.join(outputDir, "structured-content.json");

  const source = await readFile(sourcePath, "utf8");
  const structured = parseStructuredContent(source);

  await mkdir(outputDir, { recursive: true });
  await writeFile(outputPath, JSON.stringify(structured, null, 2), "utf8");

  console.log(
    `Built content: ${structured.sections.length} sections, ${structured.references.length} references -> ${outputPath}`,
  );
}

run().catch((error) => {
  console.error("Failed to build structured content:", error);
  process.exitCode = 1;
});
