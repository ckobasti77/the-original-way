"use client";

import { useEffect, useState } from "react";

import type { Language } from "@/components/settings-provider";

import type { Chapter } from "./content";

type AnimatedTextProps = {
  chapter: Chapter;
  chapterCount: number;
  chapterIndex: number;
  isTransitioning: boolean;
  language: Language;
};

export function AnimatedText({
  chapter,
  chapterCount,
  chapterIndex,
  isTransitioning,
  language,
}: AnimatedTextProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 30);
    return () => clearTimeout(timer);
  }, []);

  const active = isMounted && !isTransitioning;

  return (
    <div aria-live="polite" className="pointer-events-none absolute inset-0">
      <div
        className={`story-float absolute left-0 top-[15vh] max-w-[min(85vw,26rem)] px-6 py-5 transition-all duration-400 ease-[cubic-bezier(0.3,0,0.2,1)] sm:left-2 sm:max-w-[28rem] md:left-4 md:px-10 md:py-8 ${
          active
            ? "scale-100 translate-y-0 opacity-100 blur-0"
            : "scale-[0.93] translate-y-2 opacity-0 blur-[3px]"
        }`}
        style={{ transitionDelay: isTransitioning ? "0ms" : "80ms" }}
      >
        <p className="text-[0.68rem] sm:text-[0.74rem] uppercase tracking-[0.36em] text-[var(--text-muted)]">
          {chapter.eyebrow[language]}
        </p>
        <div className="mt-4 flex items-center gap-3">
          <span className="block h-px w-12 bg-[rgba(var(--accent-rgb),0.34)]" />
          <p className="text-[0.72rem] sm:text-[0.78rem] uppercase tracking-[0.3em] text-[var(--text-secondary)]">
            {String(chapterIndex + 1).padStart(2, "0")} /{" "}
            {String(chapterCount).padStart(2, "0")}
          </p>
        </div>
        <p className="hero-whisper font-display mt-6 text-[2rem] leading-[1.05] tracking-[0.03em] text-[var(--text-primary)] sm:text-[2.6rem] md:text-[3.15rem]">
          {chapter.title[language]}
        </p>
      </div>

      <div
        className={`story-float absolute bottom-[18vh] right-0 max-w-[min(85vw,24rem)] px-6 py-5 text-right transition-all duration-400 ease-[cubic-bezier(0.3,0,0.2,1)] sm:right-2 sm:max-w-[25rem] md:right-4 md:px-10 md:py-8 ${
          active
            ? "scale-100 translate-y-0 opacity-100 blur-0"
            : "scale-[0.93] translate-y-2 opacity-0 blur-[3px]"
        }`}
        style={{ transitionDelay: isTransitioning ? "0ms" : "160ms" }}
      >
        <p className="text-[0.68rem] sm:text-[0.74rem] uppercase tracking-[0.36em] text-[var(--text-muted)]">
          {chapter.note[language]}
        </p>
        <p className="hero-whisper mt-4 text-[1.05rem] leading-relaxed text-[var(--text-secondary)] sm:text-[1.15rem] md:text-[1.25rem] font-sans font-light">
          {chapter.body[language]}
        </p>
      </div>
    </div>
  );
}
