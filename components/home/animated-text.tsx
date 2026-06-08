"use client";

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
  return (
    <div aria-live="polite" className="pointer-events-none absolute inset-0">
      <div
        className={`story-float reveal-up absolute left-0 top-[15vh] max-w-[min(76vw,21rem)] rounded-[1.8rem] px-5 py-4 transition duration-500 sm:left-2 sm:max-w-[20rem] md:left-4 md:px-6 md:py-5 ${
          isTransitioning
            ? "translate-y-3 opacity-40 blur-[1px]"
            : "translate-y-0 opacity-100 blur-0"
        }`}
        style={{ animationDelay: "80ms" }}
      >
        <p className="text-[0.62rem] uppercase tracking-[0.34em] text-[var(--text-muted)]">
          {chapter.eyebrow[language]}
        </p>
        <div className="mt-3 flex items-center gap-3">
          <span className="block h-px w-10 bg-[rgba(var(--accent-rgb),0.34)]" />
          <p className="text-[0.66rem] uppercase tracking-[0.28em] text-[var(--text-secondary)]">
            {String(chapterIndex + 1).padStart(2, "0")} /{" "}
            {String(chapterCount).padStart(2, "0")}
          </p>
        </div>
        <p className="hero-whisper font-display mt-5 text-[1.6rem] leading-[0.98] tracking-[0.04em] text-[var(--text-primary)] sm:text-[2rem] md:text-[2.35rem]">
          {chapter.title[language]}
        </p>
      </div>

      <div
        className={`story-float reveal-up absolute bottom-[18vh] right-0 max-w-[min(78vw,19rem)] rounded-[1.8rem] px-5 py-4 text-right transition duration-500 sm:right-2 sm:max-w-[18rem] md:right-4 md:px-6 md:py-5 ${
          isTransitioning
            ? "translate-y-3 opacity-40 blur-[1px]"
            : "translate-y-0 opacity-100 blur-0"
        }`}
        style={{ animationDelay: "160ms" }}
      >
        <p className="text-[0.62rem] uppercase tracking-[0.34em] text-[var(--text-muted)]">
          {chapter.note[language]}
        </p>
        <p className="hero-whisper mt-4 text-[0.92rem] leading-7 text-[var(--text-secondary)] sm:text-[1rem]">
          {chapter.body[language]}
        </p>
      </div>
    </div>
  );
}
