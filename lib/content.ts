import { cache } from "react";
import structuredContent from "@/data/structured-content.json";
import type {
  FootnoteMap,
  ReferenceEntry,
  Section,
  StructuredContent,
} from "@/lib/content-parser";

export type { FootnoteMap, ReferenceEntry, Section, StructuredContent };

export const getStructuredContent = cache(async (): Promise<StructuredContent> => {
  return structuredContent as StructuredContent;
});
