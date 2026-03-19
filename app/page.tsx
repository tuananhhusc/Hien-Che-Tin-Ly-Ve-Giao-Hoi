import { ArticleBody } from "@/components/ArticleBody";
import { ReaderEnhancements } from "@/components/ReaderEnhancements";
import { SidebarTOC } from "@/components/SidebarTOC";
import { getStructuredContent } from "@/lib/content";

export default async function HomePage() {
  const { documentTitle, sections, footnotes, references, stats } =
    await getStructuredContent();

  const sectionItems = sections.flatMap((section) => {
    const topLevel = {
      id: section.id,
      title: section.title,
      level: section.level,
    };

    const subLevel =
      section.subsections?.map((subsection) => ({
        id: subsection.id,
        title: subsection.title,
        level: subsection.level,
      })) ?? [];

    return [topLevel, ...subLevel];
  });

  const referenceItem =
    references.length > 0
      ? [{ id: "references", title: "Nguồn trích dẫn", level: 1 as const }]
      : [];

  const tocItems = [...sectionItems, ...referenceItem];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ScholarlyArticle",
    headline: documentTitle,
    inLanguage: "vi",
    articleSection: sections.map((section) => section.title),
    wordCount: stats.wordCount,
    timeRequired: `PT${stats.readingMinutes}M`,
    citation: references.map((ref) => ref.citationText),
    about: ["Lumen Gentium", "Vatican II", "Ecclesiology"],
  };

  return (
    <main
      id="main-content"
      className="mx-auto w-full max-w-[1320px] px-1 pb-28 pt-6 sm:px-6 lg:px-8 lg:pb-20"
    >
      <div className="lg:grid lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-10">
        <SidebarTOC items={tocItems} mobileMode="sheet" />

        <section aria-label="Không gian đọc học thuật">
          <ReaderEnhancements
            sectionIds={tocItems.map((item) => item.id)}
            readingMinutes={stats.readingMinutes}
            wordCount={stats.wordCount}
          />

          <ArticleBody
            title={documentTitle}
            sections={sections}
            footnotes={footnotes}
            references={references}
          />
        </section>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </main>
  );
}
