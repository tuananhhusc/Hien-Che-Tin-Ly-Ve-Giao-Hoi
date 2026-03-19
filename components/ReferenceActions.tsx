"use client";

import { useState } from "react";

interface ReferenceActionsProps {
  citationText: string;
  bibtex: string;
}

export function ReferenceActions({ citationText, bibtex }: ReferenceActionsProps) {
  const [status, setStatus] = useState<"idle" | "citation" | "bibtex">("idle");

  const copy = async (payload: string, mode: "citation" | "bibtex") => {
    try {
      await navigator.clipboard.writeText(payload);
      setStatus(mode);
      window.setTimeout(() => setStatus("idle"), 1200);
    } catch {
      setStatus("idle");
    }
  };

  return (
    <div className="not-prose mt-2 flex flex-wrap items-center gap-2 text-xs">
      <button
        type="button"
        onClick={() => copy(citationText, "citation")}
        className="rounded border border-gold/60 px-2 py-1 font-semibold text-ink hover:bg-gold/12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-royal"
      >
        Sao chép trích dẫn
      </button>
      <button
        type="button"
        onClick={() => copy(bibtex, "bibtex")}
        className="rounded border border-gold/60 px-2 py-1 font-semibold text-ink hover:bg-gold/12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-royal"
      >
        Sao chép BibTeX
      </button>
      {status !== "idle" && (
        <span className="text-royal">
          {status === "citation" ? "Đã sao chép trích dẫn." : "Đã sao chép BibTeX."}
        </span>
      )}
    </div>
  );
}
