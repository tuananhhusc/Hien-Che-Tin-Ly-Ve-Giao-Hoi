"use client";

import * as Popover from "@radix-ui/react-popover";
import * as Tooltip from "@radix-ui/react-tooltip";

export interface FootnoteProps {
  index: number;
  content: string;
  label?: string;
  referenceId?: string;
  citationAnchorId?: string;
}

function CitationTrigger({
  index,
  label,
  citationAnchorId,
}: {
  index: number;
  label: string;
  citationAnchorId?: string;
}) {
  return (
    <button
      id={citationAnchorId}
      type="button"
      aria-label={label}
      className="footnote-trigger not-prose mx-[0.15em] inline-flex items-center justify-center align-super whitespace-nowrap rounded-[0.2rem] border border-gold/50 bg-gold/10 px-[0.25em] py-[0.1em] text-[0.7em] font-bold text-royal shadow-sm transition-all hover:scale-105 hover:bg-gold/25 hover:text-purple hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-royal focus-visible:ring-offset-2 focus-visible:ring-offset-offwhite"
    >
      <span className="leading-none tracking-tighter">[{index}]</span>
    </button>
  );
}

function NoteContent({
  index,
  note,
  referenceId,
}: {
  index: number;
  note: string;
  referenceId?: string;
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-purple/85">
        Chú thích {index}
      </p>
      <p className="text-[0.8rem] leading-relaxed text-ink">{note}</p>
      {referenceId && (
        <a
          href={`#${referenceId}`}
          className="inline-flex text-[0.72rem] font-semibold text-royal no-underline hover:text-purple focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-royal"
        >
          Xem nguồn trích dẫn
        </a>
      )}
    </div>
  );
}

export function Footnote({
  index,
  content,
  label,
  referenceId,
  citationAnchorId,
}: FootnoteProps) {
  const note = content.trim() || `Trích dẫn số ${index}.`;
  const triggerLabel = label ?? `Mở chú thích ${index}`;

  return (
    <>
      <span className="hidden md:inline">
        <Tooltip.Provider delayDuration={120}>
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <span className="not-prose align-super">
                <CitationTrigger
                  index={index}
                  label={triggerLabel}
                  citationAnchorId={citationAnchorId}
                />
              </span>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content
                side="top"
                sideOffset={8}
                className="z-[90] max-w-sm rounded-md border border-gold/40 bg-offwhite px-3 py-2.5 text-left shadow-lg"
              >
                <NoteContent index={index} note={note} referenceId={referenceId} />
                <Tooltip.Arrow className="fill-offwhite" />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        </Tooltip.Provider>
      </span>

      <span className="md:hidden">
        <Popover.Root>
          <Popover.Trigger asChild>
            <span className="not-prose align-super">
              <CitationTrigger
                index={index}
                label={triggerLabel}
                citationAnchorId={citationAnchorId}
              />
            </span>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content
              side="top"
              align="start"
              sideOffset={10}
              collisionPadding={16}
              className="z-[95] max-w-[88vw] rounded-md border border-gold/40 bg-offwhite px-3 py-2.5 shadow-xl"
            >
              <NoteContent index={index} note={note} referenceId={referenceId} />
              <Popover.Arrow className="fill-offwhite" />
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      </span>
    </>
  );
}
