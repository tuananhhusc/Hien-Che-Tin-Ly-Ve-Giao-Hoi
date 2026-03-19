"use client";

import { useEffect, useRef, useState } from "react";

export function ProgressBar() {
  const [progress, setProgress] = useState(0);
  const ticking = useRef(false);

  useEffect(() => {
    const updateProgress = () => {
      const root = document.documentElement;
      const scrollableHeight = root.scrollHeight - root.clientHeight;
      const nextProgress =
        scrollableHeight <= 0 ? 0 : (root.scrollTop / scrollableHeight) * 100;
      setProgress(Math.min(100, Math.max(0, nextProgress)));
      ticking.current = false;
    };

    const requestUpdate = () => {
      if (!ticking.current) {
        ticking.current = true;
        window.requestAnimationFrame(updateProgress);
      }
    };

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    requestUpdate();

    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, []);

  return (
    <div
      className="fixed left-0 top-0 z-50 h-1 w-full bg-transparent"
      role="presentation"
      aria-hidden="true"
    >
      <div
        className="h-full bg-gold transition-[width] duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
