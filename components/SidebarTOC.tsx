"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { ListTree, Menu, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

export interface SidebarTOCProps {
  items: Array<{ id: string; title: string; level: number }>;
  mobileMode?: "sheet" | "topbar";
}

function TocList({
  items,
  activeId,
  onSelect,
}: {
  items: Array<{ id: string; title: string; level: number }>;
  activeId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <ol className="space-y-1.5">
      {items.map((item) => (
        <li key={item.id}>
          <a
            href={`#${item.id}`}
            aria-current={activeId === item.id ? "location" : undefined}
            onClick={(event) => {
              event.preventDefault();
              onSelect(item.id);
            }}
            className={[
              "block rounded-md px-3 py-2 text-sm leading-snug transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-royal",
              item.level > 1 ? "ml-3 border-l border-gold/35 pl-4 text-ink/85" : "",
              activeId === item.id
                ? "bg-royal/15 font-semibold text-royal"
                : "text-ink/85 hover:bg-gold/12 hover:text-ink",
            ].join(" ")}
          >
            {item.title}
          </a>
        </li>
      ))}
    </ol>
  );
}

export function SidebarTOC({ items, mobileMode = "sheet" }: SidebarTOCProps) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileScrollSnapshotRef = useRef<number | null>(null);
  const itemIds = useMemo(() => items.map((item) => item.id), [items]);

  useEffect(() => {
    if (!itemIds.length) {
      return;
    }

    const sections = itemIds
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => Boolean(element));

    if (!sections.length) {
      return;
    }

    const syncActiveFromScroll = () => {
      const marker = window.innerHeight * 0.33;
      let current = sections[0].id;

      for (const section of sections) {
        if (section.getBoundingClientRect().top <= marker) {
          current = section.id;
        }
      }

      setActiveId(current);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) =>
              a.target.getBoundingClientRect().top -
              b.target.getBoundingClientRect().top,
          );

        if (visible[0]) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        threshold: [0.15, 0.4, 0.7],
        rootMargin: "-24% 0px -58% 0px",
      },
    );

    sections.forEach((section) => observer.observe(section));
    window.addEventListener("scroll", syncActiveFromScroll, { passive: true });
    syncActiveFromScroll();

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", syncActiveFromScroll);
    };
  }, [itemIds]);

  const handleSelect = (id: string) => {
    const target = document.getElementById(id);
    if (!target) {
      return;
    }

    target.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.replaceState(null, "", `#${id}`);
    setActiveId(id);
    setMobileOpen(false);
  };

  const activeItem = items.find((item) => item.id === activeId);

  return (
    <>
      {mobileMode === "sheet" ? (
        <Dialog.Root
          open={mobileOpen}
          onOpenChange={(open) => {
            setMobileOpen(open);
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
              className="fixed bottom-[calc(env(safe-area-inset-bottom)+1.25rem)] left-6 z-40 flex h-11 items-center gap-2 rounded-full border border-gold/60 bg-offwhite/98 px-5 py-2 text-sm font-bold text-ink shadow-lg ring-1 ring-gold/20 transition-all hover:scale-105 hover:bg-gold/5 active:scale-95 lg:hidden"
              aria-label="Mở mục lục"
            >
              <Menu className="h-4 w-4 text-royal" aria-hidden="true" />
              <span className="tracking-wide">Mục lục</span>
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
                  <Dialog.Title className="font-heading text-xl text-ink">Mục lục</Dialog.Title>
                  <Dialog.Description className="mt-1 text-sm text-ink/70">
                    {activeItem ? `Đang đọc: ${activeItem.title}` : "Chọn mục để di chuyển nhanh."}
                  </Dialog.Description>
                </div>
                <Dialog.Close asChild>
                  <button
                    type="button"
                    className="rounded-md p-2 text-ink/70 hover:bg-gold/12 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-royal"
                    aria-label="Đóng mục lục"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </Dialog.Close>
              </div>

              <nav aria-label="Mục lục bài viết">
                <TocList items={items} activeId={activeId} onSelect={handleSelect} />
              </nav>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      ) : (
        <nav className="mb-4 rounded-xl border border-gold/35 bg-offwhite/85 p-3 lg:hidden" aria-label="Mục lục bài viết">
          <div className="mb-2 flex items-center gap-2 border-b border-gold/30 pb-2">
            <ListTree className="h-4 w-4 text-royal" aria-hidden="true" />
            <p className="text-sm font-semibold text-ink">Mục lục</p>
          </div>
          <TocList items={items} activeId={activeId} onSelect={handleSelect} />
        </nav>
      )}

      <aside className="hidden lg:block">
        <nav
          className="sticky top-6 max-h-[calc(100vh-2.5rem)] overflow-y-auto rounded-xl border border-gold/35 bg-offwhite/80 p-4 shadow-sm"
          aria-label="Mục lục bài viết"
        >
          <h2 className="mb-3 border-b border-gold/30 pb-2 font-heading text-xl text-ink">
            Mục lục
          </h2>
          <TocList items={items} activeId={activeId} onSelect={handleSelect} />
        </nav>
      </aside>
    </>
  );
}
