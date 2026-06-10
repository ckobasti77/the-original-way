"use client";

import { useEffect, useMemo, useRef } from "react";

type HeroAnimatedTextProps = {
  text: string;
  fontSize?: number | string;
  minWeight?: number;
  maxWeight?: number;
  animationDuration?: number;
  cycleDuration?: number;
  delayMultiplier?: number;
  phaseOffset?: number;
  className?: string;
  textClassName?: string;
  align?: "left" | "center" | "right";
};

function cn(...classes: Array<string | undefined | null | false>) {
  return classes.filter(Boolean).join(" ");
}

function formatFontSize(fontSize: number | string) {
  return typeof fontSize === "number" ? `${fontSize}px` : fontSize;
}

export function HeroAnimatedText({
  text,
  fontSize = "clamp(1.35rem, 3vw, 1.9rem)",
  minWeight = 300,
  maxWeight = 700,
  animationDuration = 1.8,
  cycleDuration = 7.2,
  delayMultiplier = 0.08,
  phaseOffset = 0,
  className,
  textClassName,
  align = "left",
}: HeroAnimatedTextProps) {
  const containerRef = useRef<HTMLParagraphElement>(null);

  const characters = useMemo(() => Array.from(text), [text]);
  const peakPoint = (animationDuration / cycleDuration) * 100;
  const settlePoint = ((animationDuration * 2) / cycleDuration) * 100;

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const spans = containerRef.current.querySelectorAll("span");
    const numLetters = spans.length;

    spans.forEach((span, index) => {
      const mappedIndex = index - (numLetters - 1) / 2;
      span.style.animationDelay = `${phaseOffset + mappedIndex * delayMultiplier}s`;
    });
  }, [text, delayMultiplier, phaseOffset]);

  return (
    <div
      className={cn(
        "flex w-full",
        align === "left"
          ? "justify-start"
          : align === "right"
            ? "justify-end"
            : "justify-center",
        className,
      )}
    >
      <p
        ref={containerRef}
        aria-label={text}
        aria-live="polite"
        aria-atomic="true"
        className={cn("m-0 font-sans leading-none", textClassName)}
        style={{
          fontSize: formatFontSize(fontSize),
          letterSpacing: "0em",
          whiteSpace: "pre-wrap",
        }}
      >
        {characters.map((character, index) => (
          <span
            key={`${character}-${index}`}
            aria-hidden="true"
            style={{
              animation: `breath ${cycleDuration}s cubic-bezier(0.37, 0, 0.63, 1) infinite`,
              animationFillMode: "both",
              fontVariationSettings: `"wght" ${minWeight}`,
              fontWeight: minWeight,
            }}
          >
            {character === " " ? "\u00A0" : character}
          </span>
        ))}

        <style jsx>{`
          @keyframes breath {
            0% {
              font-variation-settings: "wght" ${minWeight};
              font-weight: ${minWeight};
            }

            ${peakPoint}% {
              font-variation-settings: "wght" ${maxWeight};
              font-weight: ${maxWeight};
            }

            ${settlePoint}%,
            100% {
              font-variation-settings: "wght" ${minWeight};
              font-weight: ${minWeight};
            }
          }

          @media (prefers-reduced-motion: reduce) {
            span {
              animation: none !important;
              font-variation-settings: "wght" ${maxWeight};
              font-weight: ${maxWeight};
            }
          }
        `}</style>
      </p>
    </div>
  );
}
