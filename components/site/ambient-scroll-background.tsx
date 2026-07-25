"use client";

import { useEffect, useRef } from "react";

export function AmbientScrollBackground() {
  const fieldRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const field = fieldRef.current;
    if (!field) {
      return;
    }

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    let frameId = 0;

    const update = () => {
      frameId = 0;
      const scrollRange = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight,
      );
      const progress = Math.min(
        1,
        Math.max(0, window.scrollY / scrollRange),
      );
      field.style.setProperty("--ambient-progress", String(progress));

      if (reduceMotion.matches) {
        field.style.setProperty("--ambient-x-a", "0px");
        field.style.setProperty("--ambient-y-a", "0px");
        field.style.setProperty("--ambient-x-b", "0px");
        field.style.setProperty("--ambient-y-b", "0px");
        field.style.setProperty("--ambient-x-c", "0px");
        field.style.setProperty("--ambient-y-c", "0px");
        return;
      }

      const phase = progress * Math.PI * 2;
      field.style.setProperty(
        "--ambient-x-a",
        `${Math.sin(phase) * window.innerWidth * 0.12}px`,
      );
      field.style.setProperty(
        "--ambient-y-a",
        `${Math.cos(phase * 0.72) * window.innerHeight * 0.1}px`,
      );
      field.style.setProperty(
        "--ambient-x-b",
        `${Math.cos(phase * 0.84) * window.innerWidth * 0.1}px`,
      );
      field.style.setProperty(
        "--ambient-y-b",
        `${Math.sin(phase * 0.64) * window.innerHeight * 0.14}px`,
      );
      field.style.setProperty(
        "--ambient-x-c",
        `${Math.sin(phase * 0.58 + 1.4) * window.innerWidth * 0.07}px`,
      );
      field.style.setProperty(
        "--ambient-y-c",
        `${Math.cos(phase * 0.76 + 0.8) * window.innerHeight * 0.08}px`,
      );
    };

    const requestUpdate = () => {
      if (frameId === 0) {
        frameId = window.requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    reduceMotion.addEventListener("change", requestUpdate);

    return () => {
      if (frameId !== 0) {
        window.cancelAnimationFrame(frameId);
      }
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      reduceMotion.removeEventListener("change", requestUpdate);
    };
  }, []);

  return (
    <div
      ref={fieldRef}
      aria-hidden="true"
      className="ambient-scroll-field"
    >
      <span className="ambient-scroll-orb ambient-scroll-orb-a" />
      <span className="ambient-scroll-orb ambient-scroll-orb-b" />
      <span className="ambient-scroll-orb ambient-scroll-orb-c" />
    </div>
  );
}
