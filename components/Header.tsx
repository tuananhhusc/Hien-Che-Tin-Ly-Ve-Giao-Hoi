import { Cross } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-gold/55 bg-offwhite/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-[1320px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/70 bg-parchment text-royal">
            <Cross className="h-4 w-4" aria-hidden="true" />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-purple">
              Nghiên Cứu Thần Học
            </p>
            <p className="font-heading text-base font-semibold text-ink">
              Lumen Gentium
            </p>
          </div>
        </div>
        <p className="hidden text-sm text-ink/85 md:block">Vatican II • 21/11/1964</p>
      </div>
    </header>
  );
}
