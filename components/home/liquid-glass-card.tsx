"use client";

import type { CSSProperties, ReactNode } from "react";

type LiquidGlassCardProps = {
  children: ReactNode;
  className?: string;
  active?: boolean;
  darkenFactor?: number;
};

type SafariGlassStyle = CSSProperties & {
  WebkitBackdropFilter: string;
};

export function LiquidGlassCard({
  active = true,
  children,
  className = "",
  darkenFactor = 1,
}: LiquidGlassCardProps) {
  const darkness = Math.min(Math.max(1 - darkenFactor, 0), 0.64);
  const style: SafariGlassStyle = {
    WebkitBackdropFilter: "blur(18px) saturate(145%)",
    backdropFilter: "blur(18px) saturate(145%)",
    background: `linear-gradient(rgba(0, 0, 0, ${darkness}), rgba(0, 0, 0, ${darkness})), color-mix(in srgb, var(--surface-strong) 68%, transparent)`,
    transition:
      "background-color 450ms ease, border-color 450ms ease, box-shadow 450ms ease, opacity 300ms ease",
  };

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border border-[var(--border-soft)] shadow-[0_24px_50px_rgba(var(--shadow-rgb),0.16)] ${className}`}
      data-glass-active={active ? "true" : "false"}
      style={style}
    >
      {children}
    </div>
  );
}
