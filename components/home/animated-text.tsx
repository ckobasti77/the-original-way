"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";

import type { Language } from "@/components/settings-provider";

import type { Chapter } from "./content";
import { HeroAnimatedText } from "./hero-animated-text";
import { LiquidGlassCard } from "./liquid-glass-card";

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
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const leftPanel = leftPanelRef.current;
    const rightPanel = rightPanelRef.current;
    if (!leftPanel || !rightPanel) return;

    const ctx = gsap.context(() => {
      if (isTransitioning) {
        // Exit animation
        gsap.to(leftPanel, {
          x: -120,
          opacity: 0,
          rotateY: 15,
          scale: 0.95,
          duration: 0.45,
          ease: "power2.inOut",
          overwrite: "auto",
        });

        gsap.to(rightPanel, {
          x: 120,
          opacity: 0,
          rotateY: -15,
          scale: 0.95,
          duration: 0.45,
          ease: "power2.inOut",
          overwrite: "auto",
        });
      } else {
        // Entry animation
        gsap.fromTo(
          leftPanel,
          {
            x: -150,
            opacity: 0,
            rotateY: 20,
            scale: 0.93,
          },
          {
            x: 0,
            opacity: 1,
            rotateY: 0,
            scale: 1,
            duration: 0.85,
            ease: "power4.out",
            overwrite: "auto",
          }
        );

        gsap.fromTo(
          rightPanel,
          {
            x: 150,
            opacity: 0,
            rotateY: -20,
            scale: 0.93,
          },
          {
            x: 0,
            opacity: 1,
            rotateY: 0,
            scale: 1,
            duration: 0.85,
            ease: "power4.out",
            overwrite: "auto",
            delay: 0.08,
          }
        );

        // Stagger details (subtitle & CTA) inside left panel
        const leftChildren = leftPanel.querySelectorAll(".story-subcopy, .story-cta");
        gsap.fromTo(
          leftChildren,
          { opacity: 0, y: 15 },
          {
            opacity: 1,
            y: 0,
            duration: 0.65,
            stagger: 0.1,
            ease: "power3.out",
            delay: 0.2,
            overwrite: "auto",
          }
        );

        // Stagger details inside right panel
        const rightChildren = rightPanel.querySelectorAll(".story-subcopy, .story-cta");
        gsap.fromTo(
          rightChildren,
          { opacity: 0, y: 15 },
          {
            opacity: 1,
            y: 0,
            duration: 0.65,
            stagger: 0.1,
            ease: "power3.out",
            delay: 0.28,
            overwrite: "auto",
          }
        );
      }
    }, [leftPanel, rightPanel]);

    return () => ctx.revert();
  }, [isTransitioning, chapter.id]);

  return (
    <div aria-live="polite" className="pointer-events-none absolute inset-0">
      {/* LEFT PANEL */}
      <div
        ref={leftPanelRef}
        className="story-float absolute left-0 top-[9vh] lg:top-[14vh] max-w-[min(88vw,29rem)] sm:max-w-[30rem]"
        style={{ perspective: 1000, opacity: 0 }}
      >
        <LiquidGlassCard
          active={!isTransitioning}
          darkenFactor={0.55}
          className="w-full h-fit px-6 py-5 md:px-10 md:py-8 text-left items-start"
        >
          <div className="max-w-[19rem] sm:max-w-[21rem]">
            <HeroAnimatedText
              text={chapter.leftTitle[language]}
              fontSize="clamp(1.5rem,3.2vw,2.45rem)"
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
        </LiquidGlassCard>
      </div>

      {/* RIGHT PANEL */}
      <div
        ref={rightPanelRef}
        className="story-float absolute bottom-[10vh] lg:bottom-[15vh] right-0 max-w-[min(88vw,27rem)] sm:max-w-[28rem]"
        style={{ perspective: 1000, opacity: 0 }}
      >
        <LiquidGlassCard
          active={!isTransitioning}
          darkenFactor={0.55}
          className="w-full h-fit px-6 py-5 md:px-10 md:py-8 text-right items-end"
        >
          <div className="ml-auto max-w-[17rem] sm:max-w-[19rem] w-full text-right flex justify-end">
            <HeroAnimatedText
              text={chapter.rightTitle[language]}
              fontSize="clamp(1.35rem,2.8vw,2.2rem)"
              minWeight={360}
              maxWeight={740}
              animationDuration={TITLE_BURST_DURATION}
              cycleDuration={TITLE_CYCLE_DURATION}
              delayMultiplier={0.08}
              phaseOffset={TITLE_CYCLE_DURATION / 2}
              align="right"
              className="hero-whisper justify-end"
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
        </LiquidGlassCard>
      </div>
    </div>
  );
}
