"use client";

import { useEffect, useRef, useState } from "react";

import { ContactIcon } from "@/components/site/contact-icons";
import { CONTACT_CHANNELS } from "@/lib/site-contact";

export function FloatingActions() {
  const [isOpen, setIsOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const syncScrollState = () => {
      setShowScrollTop(window.scrollY > 120);
    };

    syncScrollState();
    window.addEventListener("scroll", syncScrollState, { passive: true });

    return () => {
      window.removeEventListener("scroll", syncScrollState);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    const handleOutsideClick = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current?.contains(event.target as Node)) {
        return;
      }

      setIsOpen(false);
    };

    window.addEventListener("keydown", handleEscape);
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);

    return () => {
      window.removeEventListener("keydown", handleEscape);
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, [isOpen]);

  function scrollToTop() {
    window.scrollTo({ behavior: "smooth", top: 0 });
  }

  return (
    <>
      <div
        ref={containerRef}
        className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] left-4 z-[65] sm:left-5"
      >
        <div
          className={`absolute bottom-full left-0 mb-3 grid w-[min(19rem,calc(100vw-2rem))] gap-2 transition ${
            isOpen ? "pointer-events-auto" : "pointer-events-none"
          }`}
        >
          {CONTACT_CHANNELS.map((channel, index) => (
            <a
              key={channel.id}
              href={channel.href}
              rel={channel.target ? "noreferrer" : undefined}
              target={channel.target}
              style={{
                transitionDelay: isOpen
                  ? `${index * 38}ms`
                  : `${(CONTACT_CHANNELS.length - index) * 10}ms`,
              }}
              className={`group grid grid-cols-[2.35rem_1fr] items-center gap-3 rounded-lg border border-[var(--border-soft)] bg-[var(--surface-elevated)] px-3 py-2.5 text-[var(--text-primary)] shadow-[0_18px_46px_rgba(var(--shadow-rgb),0.16)] backdrop-blur-2xl transition duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:border-[var(--border-strong)] ${
                isOpen
                  ? "translate-y-0 scale-100 opacity-100"
                  : "translate-y-3 scale-95 opacity-0"
              }`}
              onClick={() => setIsOpen(false)}
            >
              <span className="grid h-9 w-9 place-items-center rounded-full border border-[var(--border-soft)] bg-[rgba(var(--accent-rgb),0.09)] text-[var(--text-primary)]">
                <ContactIcon className="h-[1.125rem] w-[1.125rem]" id={channel.id} />
              </span>
              <span className="min-w-0">
                <span className="block text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                  {channel.label}
                </span>
                <span className="mt-0.5 block truncate text-sm font-bold">
                  {channel.detail}
                </span>
              </span>
            </a>
          ))}
        </div>

        <button
          type="button"
          aria-controls="floating-contact-menu"
          aria-expanded={isOpen}
          aria-label={isOpen ? "Zatvori kontakt opcije" : "Otvori kontakt opcije"}
          onClick={() => setIsOpen((current) => !current)}
          className="tow-on-primary group grid h-[3.25rem] w-[3.25rem] place-items-center rounded-full border border-[var(--border-strong)] bg-[var(--text-primary)] shadow-[0_18px_42px_rgba(var(--shadow-rgb),0.26)] transition hover:-translate-y-0.5 sm:h-14 sm:w-14"
        >
          <ContactIcon
            className={`h-5 w-5 transition duration-300 ${isOpen ? "rotate-12 scale-95" : ""}`}
            id="message"
          />
        </button>
      </div>

      <button
        type="button"
        aria-label="Vrati se na vrh"
        onClick={scrollToTop}
        className={`fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] right-4 z-[65] grid h-12 w-12 place-items-center rounded-full border border-[var(--border-soft)] bg-[var(--surface-elevated)] text-[var(--text-primary)] shadow-[0_18px_42px_rgba(var(--shadow-rgb),0.18)] backdrop-blur-2xl transition duration-300 hover:-translate-y-0.5 hover:border-[var(--border-strong)] sm:right-5 ${
          showScrollTop
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none translate-y-4 opacity-0"
        }`}
      >
        <ContactIcon className="h-5 w-5" id="arrow-up" />
      </button>
    </>
  );
}
