"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Mark from "mark.js";
import {
  ArrowUp,
  ChevronDown,
  ChevronUp,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";

interface ReaderEnhancementsProps {
  sectionIds: string[];
  readingMinutes: number;
  wordCount: number;
  articleId?: string;
}

interface ReaderSettings {
  fontScale: number;
  lineHeight: number;
  maxWidth: number;
}

const SETTINGS_STORAGE_KEY = "lumen-gentium-reader-settings";

const fontScales = [0.95, 1, 1.08, 1.16] as const;
const lineHeights = [1.75, 1.85, 1.95, 2.05] as const;
const maxWidths = [50, 56, 62] as const;

const defaultSettings: ReaderSettings = {
  fontScale: 1,
  lineHeight: 1.85,
  maxWidth: 56,
};

function getInitialSettings() {
  if (typeof window === "undefined") {
    return defaultSettings;
  }

  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) {
      return defaultSettings;
    }

    const parsed = JSON.parse(raw) as Partial<ReaderSettings>;
    return {
      fontScale:
        typeof parsed.fontScale === "number"
          ? parsed.fontScale
          : defaultSettings.fontScale,
      lineHeight:
        typeof parsed.lineHeight === "number"
          ? parsed.lineHeight
          : defaultSettings.lineHeight,
      maxWidth:
        typeof parsed.maxWidth === "number"
          ? parsed.maxWidth
          : defaultSettings.maxWidth,
    };
  } catch {
    return defaultSettings;
  }
}

function clampIndex(values: readonly number[], current: number, delta: number) {
  const index = values.findIndex((value) => value === current);
  if (index === -1) {
    return values[0];
  }

  const nextIndex = Math.min(values.length - 1, Math.max(0, index + delta));
  return values[nextIndex];
}

function applyReaderSettings(settings: ReaderSettings) {
  const root = document.documentElement;
  root.style.setProperty("--reader-font-size", settings.fontScale.toString());
  root.style.setProperty("--reader-line-height", settings.lineHeight.toString());
  root.style.setProperty("--reader-max-width", `${settings.maxWidth}rem`);
}

function MetricPill({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-gold/45 bg-gold/5 px-2.5 py-1 text-[0.7rem] font-bold uppercase tracking-widest text-ink/75">
      {children}
    </span>
  );
}

function AdjustmentGroup({
  label,
  decreaseLabel,
  increaseLabel,
  onDecrease,
  onIncrease,
}: {
  label: string;
  decreaseLabel: string;
  increaseLabel: string;
  onDecrease: () => void;
  onIncrease: () => void;
}) {
  return (
    <div className="flex items-center gap-1.5 rounded-lg border border-gold/40 bg-parchment/50 px-2 py-1.5 backdrop-blur-sm">
      <span className="px-1 text-[0.7rem] font-bold uppercase tracking-wider text-ink/65">
        {label}
      </span>
      <button
        type="button"
        onClick={onDecrease}
        className="rounded px-2 py-0.5 text-sm font-semibold text-ink hover:bg-gold/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-royal"
        aria-label={decreaseLabel}
      >
        -
      </button>
      <button
        type="button"
        onClick={onIncrease}
        className="rounded px-2 py-0.5 text-sm font-semibold text-ink hover:bg-gold/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-royal"
        aria-label={increaseLabel}
      >
        +
      </button>
    </div>
  );
}

export function ReaderEnhancements({
  sectionIds,
  readingMinutes,
  wordCount,
  articleId = "article-content",
}: ReaderEnhancementsProps) {
  const [settings, setSettings] = useState<ReaderSettings>(getInitialSettings);
  const [query, setQuery] = useState("");
  const [resultCount, setResultCount] = useState(0);
  const [activeResult, setActiveResult] = useState(0);
  const [currentSection, setCurrentSection] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [mobileToolsOpen, setMobileToolsOpen] = useState(false);
  const highlightsRef = useRef<HTMLElement[]>([]);
  const mobileScrollSnapshotRef = useRef<number | null>(null);

  const sectionTotal = sectionIds.length;
  const currentSectionLabel = useMemo(() => {
    if (!sectionTotal) {
      return "0/0";
    }

    return `${Math.min(currentSection + 1, sectionTotal)}/${sectionTotal}`;
  }, [currentSection, sectionTotal]);

  useEffect(() => {
    applyReaderSettings(settings);
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    const article = document.getElementById(articleId);
    if (!article) {
      return;
    }

    const marker = new Mark(article);
    marker.unmark({
      done: () => {
        highlightsRef.current = [];
        setResultCount(0);
        setActiveResult(0);

        if (!query.trim()) {
          return;
        }

        marker.mark(query.trim(), {
          separateWordSearch: false,
          className: "reader-search-hit",
          diacritics: true,
          done: () => {
            const hits = Array.from(
              article.querySelectorAll<HTMLElement>("mark.reader-search-hit"),
            );
            highlightsRef.current = hits;
            setResultCount(hits.length);

            if (hits.length > 0) {
              hits[0].dataset.active = "true";
              hits[0].scrollIntoView({ behavior: "smooth", block: "center" });
              setActiveResult(1);
            }
          },
        });
      },
    });
  }, [query, articleId]);

  useEffect(() => {
    if (!sectionIds.length) {
      return;
    }

    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter((node): node is HTMLElement => Boolean(node));

    if (!sections.length) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) =>
              a.target.getBoundingClientRect().top -
              b.target.getBoundingClientRect().top,
          );

        if (!visible.length) {
          return;
        }

        const id = visible[0].target.id;
        const index = sectionIds.indexOf(id);
        if (index >= 0) {
          setCurrentSection(index);
        }
      },
      { rootMargin: "-30% 0px -56% 0px", threshold: [0.2, 0.5, 0.8] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [sectionIds]);

  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 560);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const goToResult = (delta: number) => {
    const hits = highlightsRef.current;
    if (!hits.length) {
      return;
    }

    const currentIndex = Math.max(0, activeResult - 1);
    const nextIndex = (currentIndex + delta + hits.length) % hits.length;

    hits.forEach((hit) => {
      delete hit.dataset.active;
    });

    const next = hits[nextIndex];
    next.dataset.active = "true";
    next.scrollIntoView({ behavior: "smooth", block: "center" });
    setActiveResult(nextIndex + 1);
  };

  const renderControls = (searchInputId: string) => (
    <>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <AdjustmentGroup
          label="Cỡ chữ"
          decreaseLabel="Giảm cỡ chữ"
          increaseLabel="Tăng cỡ chữ"
          onDecrease={() =>
            setSettings((prev) => ({
              ...prev,
              fontScale: clampIndex(fontScales, prev.fontScale, -1),
            }))
          }
          onIncrease={() =>
            setSettings((prev) => ({
              ...prev,
              fontScale: clampIndex(fontScales, prev.fontScale, 1),
            }))
          }
        />

        <AdjustmentGroup
          label="Dòng"
          decreaseLabel="Giảm khoảng cách dòng"
          increaseLabel="Tăng khoảng cách dòng"
          onDecrease={() =>
            setSettings((prev) => ({
              ...prev,
              lineHeight: clampIndex(lineHeights, prev.lineHeight, -1),
            }))
          }
          onIncrease={() =>
            setSettings((prev) => ({
              ...prev,
              lineHeight: clampIndex(lineHeights, prev.lineHeight, 1),
            }))
          }
        />

        <AdjustmentGroup
          label="Cột"
          decreaseLabel="Thu hẹp cột đọc"
          increaseLabel="Mở rộng cột đọc"
          onDecrease={() =>
            setSettings((prev) => ({
              ...prev,
              maxWidth: clampIndex(maxWidths, prev.maxWidth, -1),
            }))
          }
          onIncrease={() =>
            setSettings((prev) => ({
              ...prev,
              maxWidth: clampIndex(maxWidths, prev.maxWidth, 1),
            }))
          }
        />
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <label htmlFor={searchInputId} className="sr-only">
          Tìm kiếm trong bài viết
        </label>

        <div className="flex flex-1 items-center rounded-md border border-gold/55 bg-offwhite px-2">
          <Search className="h-4 w-4 text-ink/70" aria-hidden="true" />
          <input
            id={searchInputId}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm trong bài viết..."
            className="w-full bg-transparent px-2 py-1.5 text-sm text-ink placeholder:text-ink/55 focus-visible:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="min-w-16 text-right text-ink/80">
            {resultCount ? `${activeResult}/${resultCount}` : "0/0"}
          </span>
          <button
            type="button"
            onClick={() => goToResult(-1)}
            className="rounded border border-gold/60 px-2 py-1 text-ink hover:bg-gold/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-royal"
            aria-label="Kết quả trước"
          >
            <ChevronUp className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => goToResult(1)}
            className="rounded border border-gold/60 px-2 py-1 text-ink hover:bg-gold/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-royal"
            aria-label="Kết quả sau"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      <section
        className="reader-panel mb-5 hidden lg:block"
        aria-label="Công cụ hỗ trợ đọc"
      >
        <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
          <MetricPill>~{readingMinutes} phút đọc</MetricPill>
          <MetricPill>{wordCount.toLocaleString("vi-VN")} từ</MetricPill>
          <MetricPill>Mục {currentSectionLabel}</MetricPill>
        </div>

        {renderControls("article-search-desktop")}
      </section>

      <Dialog.Root
        open={mobileToolsOpen}
        onOpenChange={(open) => {
          setMobileToolsOpen(open);
          if (!open && mobileScrollSnapshotRef.current !== null) {
            const snapshot = mobileScrollSnapshotRef.current;
            window.requestAnimationFrame(() => window.scrollTo(0, snapshot));
          }
        }}
      >
        <Dialog.Trigger asChild>
          <button
            type="button"
            onClick={() => {
              mobileScrollSnapshotRef.current = window.scrollY;
            }}
            className="fixed bottom-[calc(env(safe-area-inset-bottom)+1.25rem)] right-6 z-40 flex h-11 items-center gap-2 rounded-full border border-gold/60 bg-offwhite/98 px-5 py-2 text-sm font-bold text-ink shadow-lg ring-1 ring-gold/20 transition-all hover:scale-105 hover:bg-gold/5 active:scale-95 lg:hidden"
            aria-label="Mở công cụ đọc"
          >
            <SlidersHorizontal className="h-4 w-4 text-royal" aria-hidden="true" />
            <span className="tracking-wide">Công cụ</span>
          </button>
        </Dialog.Trigger>

        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[100] bg-ink/40 backdrop-blur-[2px] lg:hidden" />
          <Dialog.Content
            onOpenAutoFocus={(event) => event.preventDefault()}
            onCloseAutoFocus={(event) => event.preventDefault()}
            className="fixed inset-x-0 bottom-0 z-[110] max-h-[85vh] overflow-y-auto rounded-t-[2rem] border-t border-gold/30 bg-offwhite px-5 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] pt-6 shadow-[0_-8px_30px_rgb(0,0,0,0.12)] lg:hidden"
          >
            <div className="mb-3 flex items-start justify-between gap-3 border-b border-gold/30 pb-3">
              <div>
                <Dialog.Title className="font-heading text-xl text-ink">
                  Công cụ đọc
                </Dialog.Title>
                <Dialog.Description className="mt-1 text-sm text-ink/70">
                  Tùy chỉnh trải nghiệm đọc mà không che nội dung chính.
                </Dialog.Description>
              </div>
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="rounded-md p-2 text-ink/70 hover:bg-gold/12 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-royal"
                  aria-label="Đóng công cụ đọc"
                >
                  <X className="h-5 w-5" />
                </button>
              </Dialog.Close>
            </div>

            <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
              <MetricPill>~{readingMinutes} phút đọc</MetricPill>
              <MetricPill>{wordCount.toLocaleString("vi-VN")} từ</MetricPill>
              <MetricPill>Mục {currentSectionLabel}</MetricPill>
            </div>

            {renderControls("article-search-mobile")}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {showBackToTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-[calc(env(safe-area-inset-bottom)+5.1rem)] right-4 z-40 inline-flex items-center gap-2 rounded-full border border-gold/70 bg-offwhite/95 px-3 py-2 text-sm font-semibold text-ink shadow-md transition hover:bg-gold/12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-royal lg:bottom-6"
        >
          <ArrowUp className="h-4 w-4" />
          Lên đầu trang
        </button>
      )}
    </>
  );
}
