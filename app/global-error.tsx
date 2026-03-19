"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="vi">
      <body className="bg-parchment p-6 text-ink">
        <main className="mx-auto max-w-2xl rounded-xl border border-crimson/35 bg-offwhite p-6 shadow-sm">
          <h1 className="font-heading text-2xl">Đã xảy ra lỗi không mong muốn</h1>
          <p className="mt-3 text-sm leading-relaxed text-ink/80">
            Hệ thống đã ghi nhận lỗi để theo dõi. Bạn có thể thử tải lại trang hoặc
            quay lại sau.
          </p>
          <p className="mt-3 text-xs text-ink/70">{error.message}</p>
          <button
            type="button"
            onClick={reset}
            className="mt-4 rounded-md border border-gold/60 bg-parchment px-3 py-2 text-sm font-semibold text-ink hover:bg-gold/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-royal"
          >
            Thử lại
          </button>
        </main>
      </body>
    </html>
  );
}
