"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import type { Language } from "@/components/settings-provider";

import type { Chapter } from "./content";
import { HeroAnimatedText } from "./hero-animated-text";

type AnimatedTextProps = {
  chapter: Chapter;
  isTransitioning: boolean;
  language: Language;
};

type StoryCtaProps = {
  href: string;
  label: string;
  ariaLabel: string;
  variant: "primary" | "secondary";
};

const TITLE_BURST_DURATION = 1.8;
const TITLE_CYCLE_DURATION = 7.2;

function StoryCta({ href, label, ariaLabel, variant }: StoryCtaProps) {
  const isPrimary = variant === "primary";
  const style = isPrimary
    ? {
        backgroundColor: "var(--action-primary-bg)",
        color: "var(--action-primary-fg)",
      }
    : {
        backgroundColor: "color-mix(in srgb, var(--surface-strong) 76%, transparent)",
        borderColor: "rgba(var(--accent-rgb), 0.3)",
        color: "var(--text-primary)",
      };

  return (
    <Link
      href={href}
      prefetch={false}
      aria-label={ariaLabel}
      style={style}
      className={`story-cta pointer-events-auto inline-flex min-h-11 items-center justify-center rounded-full border px-5 py-3 text-[0.68rem] uppercase tracking-[0.24em] transition-all duration-300 sm:px-6 ${
        isPrimary
          ? "border-transparent shadow-[0_20px_40px_rgba(var(--shadow-rgb),0.2)] hover:-translate-y-0.5 hover:shadow-[0_26px_52px_rgba(var(--shadow-rgb),0.26)]"
          : "shadow-[0_18px_36px_rgba(var(--shadow-rgb),0.12)] backdrop-blur-xl hover:-translate-y-0.5 hover:border-[rgba(var(--accent-rgb),0.6)] hover:bg-[color-mix(in_srgb,var(--surface-strong)_92%,transparent)]"
      }`}
    >
      <span>{label}</span>
    </Link>
  );
}

export function AnimatedText({
  chapter,
  isTransitioning,
  language,
}: AnimatedTextProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIsMounted(true);
    }, 30);

    return () => window.clearTimeout(timer);
  }, []);

  const active = isMounted && !isTransitioning;

  return (
    <div aria-live="polite" className="pointer-events-none absolute inset-0">
      <div
        className={`story-float story-copy-panel absolute left-0 top-[14vh] max-w-[min(88vw,29rem)] px-6 py-5 transition-all duration-400 ease-[cubic-bezier(0.3,0,0.2,1)] sm:left-2 sm:max-w-[30rem] md:left-4 md:px-10 md:py-8 ${
          active
            ? "translate-y-0 scale-100 opacity-100 blur-0"
            : "translate-y-2 scale-[0.93] opacity-0 blur-[3px]"
        }`}
        style={{ transitionDelay: isTransitioning ? "0ms" : "80ms" }}
      >
        <div className="max-w-[19rem] sm:max-w-[21rem]">
          <HeroAnimatedText
            text={chapter.leftTitle[language]}
            fontSize="clamp(1.9rem,4.3vw,3.45rem)"
            minWeight={360}
            maxWeight={740}
            animationDuration={TITLE_BURST_DURATION}
            cycleDuration={TITLE_CYCLE_DURATION}
            delayMultiplier={0.08}
            phaseOffset={0}
            align="left"
            className="hero-whisper"
            textClassName="story-title text-[var(--text-primary)]"
          />
        </div>

        {chapter.leftSubtitle ? (
          <p className="story-subcopy mt-4 max-w-[17rem] text-sm leading-6 sm:text-[0.98rem]">
            {chapter.leftSubtitle[language]}
          </p>
        ) : null}

        <div className="mt-6">
          <StoryCta
            href={chapter.ctaPrimary.href}
            label={chapter.ctaPrimary.label[language]}
            ariaLabel={chapter.ctaPrimary.ariaLabel[language]}
            variant="primary"
          />
        </div>
      </div>

      <div
        className={`story-float story-copy-panel story-copy-panel-right absolute bottom-[15vh] right-0 max-w-[min(88vw,27rem)] px-6 py-5 text-right transition-all duration-400 ease-[cubic-bezier(0.3,0,0.2,1)] sm:right-2 sm:max-w-[28rem] md:right-4 md:px-10 md:py-8 ${
          active
            ? "translate-y-0 scale-100 opacity-100 blur-0"
            : "translate-y-2 scale-[0.93] opacity-0 blur-[3px]"
        }`}
        style={{ transitionDelay: isTransitioning ? "0ms" : "160ms" }}
      >
        <div className="ml-auto max-w-[17rem] sm:max-w-[19rem]">
          <HeroAnimatedText
            text={chapter.rightTitle[language]}
            fontSize="clamp(1.7rem,3.8vw,3.1rem)"
            minWeight={360}
            maxWeight={740}
            animationDuration={TITLE_BURST_DURATION}
            cycleDuration={TITLE_CYCLE_DURATION}
            delayMultiplier={0.08}
            phaseOffset={TITLE_CYCLE_DURATION / 2}
            align="right"
            className="hero-whisper"
            textClassName="story-title text-right text-[var(--text-primary)]"
          />
        </div>

        {chapter.rightSubtitle ? (
          <p className="story-subcopy mt-4 ml-auto max-w-[16rem] text-sm leading-6 sm:text-[0.96rem]">
            {chapter.rightSubtitle[language]}
          </p>
        ) : null}

        <div className="mt-6 flex justify-end">
          <StoryCta
            href={chapter.ctaSecondary.href}
            label={chapter.ctaSecondary.label[language]}
            ariaLabel={chapter.ctaSecondary.ariaLabel[language]}
            variant="secondary"
          />
        </div>
      </div>
    </div>
  );
}
