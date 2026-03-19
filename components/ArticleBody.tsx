import { Fragment, type ReactNode } from "react";
import { Link2 } from "lucide-react";
import { Footnote } from "@/components/Footnote";
import { ReferenceActions } from "@/components/ReferenceActions";
import type { FootnoteMap, ReferenceEntry, Section } from "@/lib/content";

interface ArticleBodyProps {
  title: string;
  sections: Section[];
  footnotes: FootnoteMap;
  references?: ReferenceEntry[];
}

const citationPattern = /(?<!\d)(\.)(\d{1,3})(?=(?:\s|$|["')\],;:]))/g;

function SectionHeading({
  level,
  id,
  children,
}: {
  level: 2 | 3;
  id: string;
  children: ReactNode;
}) {
  const Tag = level === 2 ? "h2" : "h3";

  return (
    <Tag>
      <span>{children}</span>
      <a
        href={`#${id}`}
        className="heading-anchor"
        aria-label={`Liên kết đến mục ${id}`}
      >
        <Link2 className="h-3.5 w-3.5" />
      </a>
    </Tag>
  );
}

function renderWithFootnotes(
  paragraph: string,
  footnotes: FootnoteMap,
  citationCounts: Record<number, number>,
) {
  const parts: ReactNode[] = [];
  let cursor = 0;
  let match: RegExpExecArray | null;
  citationPattern.lastIndex = 0;

  while ((match = citationPattern.exec(paragraph)) !== null) {
    const [fullMatch, punctuation, rawIndex] = match;
    const citationIndex = Number(rawIndex);
    const punctuationEnd = match.index + punctuation.length;

    if (punctuationEnd > cursor) {
      parts.push(paragraph.slice(cursor, punctuationEnd));
    }

    if (!(citationIndex in footnotes)) {
      parts.push(fullMatch);
      cursor = match.index + fullMatch.length;
      continue;
    }

    citationCounts[citationIndex] = (citationCounts[citationIndex] ?? 0) + 1;
    const occurrence = citationCounts[citationIndex];
    const citationAnchorId =
      occurrence === 1 ? `cite-${citationIndex}` : `cite-${citationIndex}-${occurrence}`;

    parts.push(
      <Footnote
        key={`footnote-${citationIndex}-${match.index}`}
        index={citationIndex}
        content={footnotes[citationIndex] ?? `Trích dẫn số ${citationIndex}.`}
        referenceId={`reference-${citationIndex}`}
        citationAnchorId={citationAnchorId}
      />,
    );

    cursor = match.index + fullMatch.length;
  }

  if (cursor < paragraph.length) {
    parts.push(paragraph.slice(cursor));
  }

  return parts.length > 0 ? parts : [paragraph];
}

function renderParagraph(
  paragraph: string,
  footnotes: FootnoteMap,
  key: string,
  citationCounts: Record<number, number>,
) {
  const normalized = paragraph.trim();
  const looksLikeQuote =
    (normalized.startsWith('"') && normalized.endsWith('"')) ||
    (normalized.startsWith("“") && normalized.endsWith("”"));

  if (looksLikeQuote) {
    return (
      <blockquote key={key}>
        {renderWithFootnotes(normalized, footnotes, citationCounts)}
      </blockquote>
    );
  }

  return <p key={key}>{renderWithFootnotes(normalized, footnotes, citationCounts)}</p>;
}

function renderSubsection(
  subsection: Section,
  footnotes: FootnoteMap,
  parentKey: string,
  citationCounts: Record<number, number>,
) {
  return (
    <section
      key={`${parentKey}-${subsection.id}`}
      id={subsection.id}
      data-section-level={subsection.level}
      className="border-t border-gold/25 pt-5"
    >
      <SectionHeading level={3} id={subsection.id}>
        {subsection.title}
      </SectionHeading>
      {subsection.content.map((paragraph, index) =>
        renderParagraph(paragraph, footnotes, `${subsection.id}-${index}`, citationCounts),
      )}
    </section>
  );
}

function renderReferenceText(reference: ReferenceEntry) {
  const lines = [
    reference.author,
    `"${reference.title}"`,
    reference.source,
    reference.year ? String(reference.year) : null,
  ].filter(Boolean);

  return lines.join(". ");
}

function ReferenceTypeBadge({ type }: { type: ReferenceEntry["type"] }) {
  const label = type === "primary" ? "Nguồn sơ cấp" : "Nguồn thứ cấp";
  const toneClass =
    type === "primary"
      ? "border-royal/45 bg-royal/10 text-royal"
      : "border-purple/45 bg-purple/10 text-purple";

  return (
    <span
      className={`inline-flex rounded-full border px-2 py-0.5 text-[0.7rem] font-semibold uppercase tracking-wide ${toneClass}`}
    >
      {label}
    </span>
  );
}

export function ArticleBody({
  title,
  sections,
  footnotes,
  references = [],
}: ArticleBodyProps) {
  const citationCounts: Record<number, number> = {};

  return (
    <article
      id="article-content"
      className="reader-article journal-prose relative mx-auto rounded-2xl border border-gold/30 bg-offwhite px-4 py-8 shadow-md sm:px-12 sm:py-16"
    >
      <header className="mb-16 border-b-2 border-gold/25 pb-10">
        <div className="mb-4 flex items-center gap-3">
          <span className="h-px w-8 bg-purple/60" />
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.3em] text-purple">
            Báo Cáo Nghiên Cứu Chuyên Sâu
          </p>
        </div>
        <h1 className="mb-6 text-balance font-heading text-4xl font-extrabold leading-[1.15] text-ink sm:text-5xl lg:text-6xl">
          {title}
        </h1>
        <p className="max-w-3xl font-body text-lg italic leading-relaxed text-ink/75">
          Trình bày học thuật về lịch sử hình thành, cấu trúc thần học và ảnh hưởng
          đương đại của Hiến Chế Tín Lý Lumen Gentium.
        </p>
      </header>

      {sections.map((section, sectionIndex) => (
        <Fragment key={section.id}>
          <section id={section.id} data-section-level={section.level}>
            <SectionHeading level={2} id={section.id}>
              {section.title}
            </SectionHeading>
            {section.content.map((paragraph, index) =>
              renderParagraph(paragraph, footnotes, `${section.id}-${index}`, citationCounts),
            )}
          </section>

          {section.subsections?.map((subsection, subsectionIndex) =>
            renderSubsection(
              subsection,
              footnotes,
              `${section.id}-${sectionIndex}-${subsectionIndex}`,
              citationCounts,
            ),
          )}
        </Fragment>
      ))}

      {references.length > 0 && (
        <section id="references" data-section-level={1} className="mt-6">
          <SectionHeading level={2} id="references">
            Nguồn Trích Dẫn
          </SectionHeading>
          <p className="text-sm text-ink/75">
            Danh mục tài liệu tham khảo theo chuẩn số thứ tự học thuật (numeric
            style), có liên kết hai chiều với chú thích trong nội dung.
          </p>
          <ol className="references-list">
            {references.map((reference) => (
              <li key={reference.index} id={`reference-${reference.index}`}>
                <div className="not-prose mb-1 flex items-center gap-2">
                  <ReferenceTypeBadge type={reference.type} />
                  <a
                    href={`#cite-${reference.index}`}
                    className="text-xs font-semibold text-royal no-underline"
                  >
                    Về lần trích dẫn đầu tiên
                  </a>
                </div>

                <p className="!my-0">{renderReferenceText(reference)}</p>
                {reference.url && (
                  <p className="!my-0.5 break-all">
                    <a href={reference.url} target="_blank" rel="noopener noreferrer">
                      {reference.url}
                    </a>
                  </p>
                )}
                {reference.accessedAt && (
                  <p className="!my-0 text-sm text-ink/75">Truy cập: {reference.accessedAt}</p>
                )}

                <ReferenceActions
                  citationText={`${reference.index}. ${reference.citationText}`}
                  bibtex={reference.bibtex}
                />
              </li>
            ))}
          </ol>
        </section>
      )}
    </article>
  );
}
