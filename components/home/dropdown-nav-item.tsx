"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";

import type { Language } from "@/components/settings-provider";
import { localizeHref } from "@/lib/storefront-i18n";

import { NAV_MENU_COPY, type NavLinkItem } from "./content";
import type { NavMenuColumn, NavMenuEntry } from "./use-nav-menu";

type DropdownNavItemProps = {
  columns: NavMenuColumn[];
  entries: NavMenuEntry[];
  isActive: boolean;
  kind: "categories" | "collections";
  language: Language;
  link: NavLinkItem;
};

const CLOSE_DELAY = 140;

// Colours come from the unlayered `.nav-menu-*` classes in globals.css because
// `a { color: inherit }` there outranks Tailwind's layered colour utilities.
const PANEL_LINK_CLASS =
  "nav-menu-link flex min-h-9 items-center rounded-[0.7rem] px-2.5 text-[0.82rem] font-semibold hover:bg-[rgba(var(--accent-rgb),0.07)] focus-visible:bg-[rgba(var(--accent-rgb),0.07)] focus-visible:outline-none";

const COLUMN_TITLE_CLASS =
  "nav-menu-title flex items-center gap-2 rounded-[0.7rem] px-2.5 py-1.5 text-[0.62rem] font-bold uppercase tracking-[0.22em] focus-visible:outline-none";

export function DropdownNavItem({
  columns,
  entries,
  isActive,
  kind,
  language,
  link,
}: DropdownNavItemProps) {
  const copy = NAV_MENU_COPY[language];
  const panelId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLAnchorElement>(null);
  const closeTimer = useRef<number | null>(null);

  const cancelClose = () => {
    if (closeTimer.current !== null) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const open = () => {
    cancelClose();
    setIsOpen(true);
  };

  // A short delay keeps the menu open while the pointer crosses the trigger gap
  // or moves diagonally between columns.
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = window.setTimeout(() => setIsOpen(false), CLOSE_DELAY);
  };

  useEffect(() => cancelClose, []);

  useEffect(() => {
    const close = () => {
      cancelClose();
      setIsOpen(false);
    };

    window.addEventListener("tow-transition-start", close);
    return () => window.removeEventListener("tow-transition-start", close);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        cancelClose();
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    const handleFocusOut = () => {
      if (!containerRef.current?.contains(document.activeElement)) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeydown);
    document.addEventListener("focusin", handleFocusOut);

    return () => {
      window.removeEventListener("keydown", handleKeydown);
      document.removeEventListener("focusin", handleFocusOut);
    };
  }, [isOpen]);

  // A long group (clothing) is split into two item columns so the panel stays
  // short and both groups line up instead of one tall list next to a short one.
  const spans = columns.map((column) => (column.items.length > 6 ? 2 : 1));
  const totalSpan = spans.reduce((sum, span) => sum + span, 0);
  const panelWidth =
    kind === "collections"
      ? "23rem"
      : totalSpan >= 3
        ? "42rem"
        : totalSpan === 2
          ? "31rem"
          : "20rem";

  return (
    <div
      ref={containerRef}
      className="relative"
      onPointerEnter={(event) => {
        if (event.pointerType === "touch") return;
        open();
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === "touch") return;
        scheduleClose();
      }}
    >
      <Link
        ref={triggerRef}
        href={localizeHref(link.href, language)}
        prefetch={false}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onFocus={open}
        onClick={() => {
          cancelClose();
          setIsOpen(false);
        }}
        className={`nav-text inline-flex min-h-10 items-center gap-1 whitespace-nowrap rounded-full px-2 text-[0.72rem] font-semibold uppercase tracking-[0.18em] transition-colors duration-200 focus-visible:outline-none xl:gap-1.5 xl:px-3 xl:text-[0.78rem] xl:tracking-[0.24em] ${
          isOpen || isActive
            ? "text-[var(--text-primary)]"
            : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        }`}
      >
        <span className="relative">
          {link.label[language]}
          <span
            aria-hidden="true"
            className={`absolute -bottom-1 left-0 h-[1.5px] w-full origin-left rounded-full bg-current transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              isOpen || isActive ? "scale-x-100" : "scale-x-0"
            }`}
          />
        </span>
        <svg
          viewBox="0 0 24 24"
          className={`h-3 w-3 opacity-60 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </Link>

      {/* pt-2 (not mt-2) keeps the trigger-to-panel gap inside the hover area */}
      <div
        id={panelId}
        // Keeps the faded-out panel out of the tab order without dropping the
        // exit transition.
        inert={!isOpen}
        style={{ width: panelWidth }}
        className={`absolute left-1/2 top-full z-20 max-w-[calc(100vw-2rem)] -translate-x-1/2 pt-2.5 transition duration-200 ease-out ${
          isOpen
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-1.5 opacity-0"
        }`}
      >
        <div className="glass-panel max-h-[min(30rem,calc(100vh-7rem))] overflow-y-auto rounded-[1.4rem] p-3 shadow-[0_24px_58px_rgba(var(--shadow-rgb),0.2)]">
          <div className="mb-2 flex items-center justify-between gap-3 px-2.5">
            <p className="nav-menu-eyebrow text-[0.62rem] font-bold uppercase tracking-[0.24em]">
              {kind === "categories" ? copy.categories : copy.collections}
            </p>
            <Link
              href={localizeHref(link.href, language)}
              prefetch={false}
              onClick={() => setIsOpen(false)}
              className="nav-menu-link inline-flex items-center gap-1 text-[0.68rem] font-bold uppercase tracking-[0.14em] focus-visible:outline-none"
            >
              {kind === "categories" ? copy.viewAll : copy.viewAllCollections}
              <svg
                viewBox="0 0 24 24"
                className="h-3 w-3"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {kind === "categories" ? (
            columns.length === 0 ? (
              <p className="px-2.5 py-3 text-xs font-semibold text-[var(--text-muted)]">
                {copy.empty}
              </p>
            ) : (
              <div
                className="grid gap-x-3 gap-y-1"
                style={{
                  gridTemplateColumns: `repeat(${totalSpan}, minmax(0, 1fr))`,
                }}
              >
                {columns.map((column, columnIndex) => (
                  <div
                    key={column.type}
                    style={{ gridColumn: `span ${spans[columnIndex]}` }}
                    className={
                      columnIndex > 0
                        ? "border-l border-[var(--border-soft)] pl-3"
                        : undefined
                    }
                  >
                    <Link
                      href={localizeHref(column.href, language)}
                      prefetch={false}
                      onClick={() => setIsOpen(false)}
                      className={COLUMN_TITLE_CLASS}
                    >
                      <span>{copy[column.type]}</span>
                      <span className="text-[0.6rem] tabular-nums opacity-70">
                        {column.items.length}
                      </span>
                    </Link>
                    <div
                      className="mt-1 grid gap-0.5"
                      style={{
                        gridTemplateColumns: `repeat(${spans[columnIndex]}, minmax(0, 1fr))`,
                      }}
                    >
                      {column.items.map((item) => (
                        <Link
                          key={item.slug}
                          href={localizeHref(item.href, language)}
                          prefetch={false}
                          onClick={() => setIsOpen(false)}
                          className={PANEL_LINK_CLASS}
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            <div className="grid gap-1">
              {entries.map((entry) => (
                <Link
                  key={entry.slug}
                  href={localizeHref(entry.href, language)}
                  prefetch={false}
                  onClick={() => setIsOpen(false)}
                  className="nav-menu-card group rounded-[1.1rem] border border-transparent px-3 py-2.5 transition hover:border-[var(--border-soft)] hover:bg-[rgba(var(--accent-rgb),0.06)] focus-visible:border-[var(--border-strong)] focus-visible:bg-[rgba(var(--accent-rgb),0.06)] focus-visible:outline-none"
                >
                  <p className="nav-menu-link flex items-center justify-between gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.22em]">
                    <span>{entry.label}</span>
                    <svg
                      viewBox="0 0 24 24"
                      className="h-3 w-3 shrink-0 -translate-x-1 opacity-0 transition duration-200 group-hover:translate-x-0 group-hover:opacity-70"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </p>
                  {entry.description ? (
                    <p className="story-subcopy mt-1 text-xs leading-5">
                      {entry.description}
                    </p>
                  ) : null}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
