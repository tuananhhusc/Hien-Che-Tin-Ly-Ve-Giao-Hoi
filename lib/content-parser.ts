export type FootnoteMap = Record<number, string>;

export type ReferenceType = "primary" | "secondary";

export interface ReferenceEntry {
  index: number;
  raw: string;
  author: string | null;
  title: string;
  source: string | null;
  year: number | null;
  url?: string;
  accessedAt: string | null;
  type: ReferenceType;
  citationText: string;
  bibtex: string;
}

export interface Section {
  id: string;
  level: number;
  title: string;
  content: string[];
  subsections?: Section[];
}

interface ParsedSection {
  id: string;
  level: number;
  title: string;
  rawLines: string[];
  subsections?: ParsedSection[];
}

export interface StructuredContent {
  documentTitle: string;
  sections: Section[];
  footnotes: FootnoteMap;
  references: ReferenceEntry[];
  stats: {
    wordCount: number;
    readingMinutes: number;
  };
}

const topHeadingPattern = /^(\d+)\.\s+(.+)$/;
const subsectionPattern = /^(\d+\.\d+)\.\s+(.+)$/;
const urlPattern = /https?:\/\/[^\s<>"')]+/i;
const yearPattern = /\b(19|20)\d{2}\b/g;

const primarySourceDomains = [
  "vatican.va",
  "usccb.org",
  "holysee.va",
  "vaticannews.va",
];

function stripDiacritics(value: string) {
  return value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

function slugify(value: string) {
  return stripDiacritics(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function isReferencesHeading(line: string) {
  const folded = stripDiacritics(line.trim());
  return (
    folded === "nguon trich dan" ||
    folded === "tai lieu tham khao" ||
    folded === "nguon tham khao"
  );
}

function compactParagraphs(lines: string[]) {
  const paragraphs: string[] = [];
  let current = "";

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      if (current) {
        paragraphs.push(current.trim());
        current = "";
      }
      continue;
    }

    current = current ? `${current} ${line}` : line;
  }

  if (current) {
    paragraphs.push(current.trim());
  }

  return paragraphs;
}

function toSection(section: ParsedSection): Section {
  const normalized: Section = {
    id: section.id,
    level: section.level,
    title: section.title,
    content: compactParagraphs(section.rawLines),
  };

  if (section.subsections?.length) {
    normalized.subsections = section.subsections.map(toSection);
  }

  return normalized;
}

function extractUrl(line: string) {
  const match = line.match(urlPattern);
  if (!match) {
    return undefined;
  }

  return match[0].replace(/[)\],.;]+$/, "");
}

function extractAccessedAt(line: string) {
  const folded = stripDiacritics(line);
  const markerIndex = folded.indexOf("truy cap");

  if (markerIndex === -1) {
    return null;
  }

  let tail = line.slice(markerIndex + "truy cap".length).trim();
  tail = tail.replace(/^v(?:\u00e0o|ao)\s+/i, "");
  tail = tail.split(/,\s*https?:\/\//i)[0]?.trim() ?? "";
  tail = tail.replace(/[.;,\s]+$/, "");
  return tail || null;
}

function extractYear(line: string, url?: string) {
  const lineWithoutAccess = line.split(/,\s*truy\s+c/i)[0] ?? line;
  const yearMatches = lineWithoutAccess.match(yearPattern);
  if (yearMatches?.length) {
    return Number(yearMatches[yearMatches.length - 1]);
  }

  if (!url) {
    return null;
  }

  const fromUrl = url.match(/(19|20)\d{2}/);
  return fromUrl ? Number(fromUrl[0]) : null;
}

function splitTitleAndSource(line: string, url?: string) {
  const withoutUrl = url ? line.replace(url, "").trim() : line.trim();
  const accessIndex = stripDiacritics(withoutUrl).indexOf("truy cap");
  const withoutAccess =
    accessIndex >= 0
      ? withoutUrl.slice(0, accessIndex).replace(/[;,]\s*$/, "").trim()
      : withoutUrl.trim();

  if (withoutAccess.includes(" - ")) {
    const [title, ...rest] = withoutAccess.split(" - ");
    return { title: title.trim(), source: rest.join(" - ").trim() || null };
  }

  if (withoutAccess.includes(" | ")) {
    const [title, ...rest] = withoutAccess.split(" | ");
    return { title: title.trim(), source: rest.join(" | ").trim() || null };
  }

  return { title: withoutAccess, source: null };
}

function detectAuthorFromTitle(rawTitle: string) {
  const authorMatch = rawTitle.match(
    /^([\p{Lu}][\p{L}'.-]+(?:\s+[\p{Lu}][\p{L}'.-]+){0,3})\s*:\s*(.+)$/u,
  );

  if (!authorMatch) {
    return { author: null, title: rawTitle.trim() };
  }

  return {
    author: authorMatch[1].trim(),
    title: authorMatch[2].trim(),
  };
}

function deriveSourceFromUrl(url?: string) {
  if (!url) {
    return null;
  }

  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    return host;
  } catch {
    return null;
  }
}

function determineReferenceType(source: string | null, url?: string): ReferenceType {
  const haystack = `${source ?? ""} ${url ?? ""}`.toLowerCase();
  return primarySourceDomains.some((domain) => haystack.includes(domain))
    ? "primary"
    : "secondary";
}

function toChicagoCitation(entry: {
  author: string | null;
  title: string;
  source: string | null;
  year: number | null;
  url?: string;
  accessedAt: string | null;
}) {
  const parts: string[] = [];

  if (entry.author) {
    parts.push(`${entry.author}.`);
  }

  parts.push(`"${entry.title}."`);

  if (entry.source) {
    parts.push(`${entry.source}.`);
  }

  if (entry.year) {
    parts.push(`${entry.year}.`);
  }

  if (entry.url) {
    parts.push(entry.url);
  }

  if (entry.accessedAt) {
    parts.push(`Truy c\u1eadp ${entry.accessedAt}.`);
  }

  return parts.join(" ").replace(/\s+/g, " ").trim();
}

function escapeBibtex(value: string) {
  return value.replace(/[{}]/g, "\\$&");
}

function toBibtex(entry: {
  index: number;
  author: string | null;
  title: string;
  source: string | null;
  year: number | null;
  url?: string;
  accessedAt: string | null;
}) {
  const keySeed = slugify(entry.author ?? entry.source ?? entry.title).slice(0, 24);
  const key = `${keySeed || "ref"}${entry.year ?? "nd"}${entry.index}`;
  const fields: string[] = [];

  if (entry.author) {
    fields.push(`  author = {${escapeBibtex(entry.author)}}`);
  }

  fields.push(`  title = {${escapeBibtex(entry.title)}}`);

  if (entry.source) {
    fields.push(`  howpublished = {${escapeBibtex(entry.source)}}`);
  }

  if (entry.year) {
    fields.push(`  year = {${entry.year}}`);
  }

  if (entry.url) {
    fields.push(`  url = {${entry.url}}`);
  }

  if (entry.accessedAt) {
    fields.push(`  note = {Truy c\u1eadp ${escapeBibtex(entry.accessedAt)}}`);
  }

  return `@misc{${key},\n${fields.join(",\n")}\n}`;
}

function toReferences(lines: string[]): ReferenceEntry[] {
  const cleaned = lines.map((line) => line.trim()).filter(Boolean);

  return cleaned.map((raw, index) => {
    const entryIndex = index + 1;
    const url = extractUrl(raw);
    const { title: rawTitle, source: detectedSource } = splitTitleAndSource(raw, url);
    const { author, title } = detectAuthorFromTitle(rawTitle);
    const source = detectedSource ?? deriveSourceFromUrl(url);
    const accessedAt = extractAccessedAt(raw);
    const year = extractYear(raw, url);
    const type = determineReferenceType(source, url);

    const citationText = toChicagoCitation({
      author,
      title,
      source,
      year,
      url,
      accessedAt,
    });

    return {
      index: entryIndex,
      raw,
      author,
      title,
      source,
      year,
      url,
      accessedAt,
      type,
      citationText,
      bibtex: toBibtex({
        index: entryIndex,
        author,
        title,
        source,
        year,
        url,
        accessedAt,
      }),
    };
  });
}

function toFootnotes(references: ReferenceEntry[]): FootnoteMap {
  return references.reduce<FootnoteMap>((map, reference) => {
    map[reference.index] = reference.citationText;
    return map;
  }, {});
}

function countWords(value: string) {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

function computeWordCount(sections: Section[]) {
  return sections.reduce((total, section) => {
    const sectionWords = section.content.reduce((sum, p) => sum + countWords(p), 0);
    const subsectionWords =
      section.subsections?.reduce(
        (subTotal, subsection) =>
          subTotal +
          subsection.content.reduce((sum, paragraph) => sum + countWords(paragraph), 0),
        0,
      ) ?? 0;
    return total + sectionWords + subsectionWords;
  }, 0);
}

export function parseStructuredContent(rawContent: string): StructuredContent {
  const normalizedText = rawContent.replace(/\uFEFF/g, "").replace(/\r\n?/g, "\n");
  const lines = normalizedText.split("\n");

  const referencesStart = lines.findIndex((line) => isReferencesHeading(line));
  const bodyLines = referencesStart === -1 ? lines : lines.slice(0, referencesStart);
  const referenceLines =
    referencesStart === -1 ? [] : lines.slice(referencesStart + 1);

  const parsedSections: ParsedSection[] = [];
  let documentTitle = "Hi\u1ebfn Ch\u1ebf T\u00edn L\u00fd Lumen Gentium";
  let hasTitle = false;

  let currentTopSection: ParsedSection | null = null;
  let currentSubsection: ParsedSection | null = null;

  for (const line of bodyLines) {
    const trimmed = line.trim();

    if (!trimmed) {
      if (currentSubsection) {
        currentSubsection.rawLines.push("");
      } else if (currentTopSection) {
        currentTopSection.rawLines.push("");
      }
      continue;
    }

    if (!hasTitle && !topHeadingPattern.test(trimmed)) {
      documentTitle = trimmed;
      hasTitle = true;
      continue;
    }

    const topMatch = trimmed.match(topHeadingPattern);
    if (topMatch) {
      if (currentSubsection && currentTopSection) {
        currentTopSection.subsections = currentTopSection.subsections ?? [];
        currentTopSection.subsections.push(currentSubsection);
        currentSubsection = null;
      }

      if (currentTopSection) {
        parsedSections.push(currentTopSection);
      }

      const topIndex = topMatch[1];
      const topTitle = topMatch[2].trim();
      currentTopSection = {
        id: `section-${topIndex}-${slugify(topTitle).slice(0, 48)}`,
        level: 1,
        title: `${topIndex}. ${topTitle}`,
        rawLines: [],
        subsections: [],
      };
      continue;
    }

    const subsectionMatch = trimmed.match(subsectionPattern);
    if (subsectionMatch && currentTopSection) {
      if (currentSubsection) {
        currentTopSection.subsections = currentTopSection.subsections ?? [];
        currentTopSection.subsections.push(currentSubsection);
      }

      const subsectionIndex = subsectionMatch[1];
      const subsectionTitle = subsectionMatch[2].trim();
      currentSubsection = {
        id: `section-${subsectionIndex.replace(/\./g, "-")}-${slugify(
          subsectionTitle,
        ).slice(0, 40)}`,
        level: 2,
        title: `${subsectionIndex}. ${subsectionTitle}`,
        rawLines: [],
      };
      continue;
    }

    if (currentSubsection) {
      currentSubsection.rawLines.push(line);
    } else if (currentTopSection) {
      currentTopSection.rawLines.push(line);
    }
  }

  if (currentSubsection && currentTopSection) {
    currentTopSection.subsections = currentTopSection.subsections ?? [];
    currentTopSection.subsections.push(currentSubsection);
  }

  if (currentTopSection) {
    parsedSections.push(currentTopSection);
  }

  const sections = parsedSections.map(toSection);
  const references = toReferences(referenceLines);
  const wordCount = computeWordCount(sections);

  return {
    documentTitle,
    sections,
    footnotes: toFootnotes(references),
    references,
    stats: {
      wordCount,
      readingMinutes: Math.max(1, Math.ceil(wordCount / 210)),
    },
  };
}
