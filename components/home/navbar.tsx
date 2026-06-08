"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { useSettings } from "@/components/settings-provider";
import logo from "@/public/logos/logo.png";

import { BRAND_NAME, NAV_GROUPS, UI_COPY } from "./content";
import { DropdownNavItem } from "./dropdown-nav-item";

function ThemeToggle() {
  const { language, theme, toggleTheme } = useSettings();
  const copy = UI_COPY[language];
  const isLight = theme === "light";

  return (
    <button
      type="button"
      aria-label={isLight ? copy.switchToDark : copy.switchToLight}
      onClick={toggleTheme}
      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-[var(--border-soft)] bg-[var(--surface)] px-2.5 text-[0.7rem] uppercase tracking-[0.22em] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)] focus-visible:border-[var(--border-strong)] focus-visible:text-[var(--text-primary)] min-[460px]:px-3"
    >
      <span
        aria-hidden="true"
        className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[rgba(var(--accent-rgb),0.12)] text-[var(--text-primary)]"
      >
        {isLight ? (
          <svg
            viewBox="0 0 24 24"
            className="h-3.5 w-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="M12 3v2.5M12 18.5V21M5.64 5.64l1.77 1.77M16.59 16.59l1.77 1.77M3 12h2.5M18.5 12H21M5.64 18.36l1.77-1.77M16.59 7.41l1.77-1.77" />
            <circle cx="12" cy="12" r="3.4" />
          </svg>
        ) : (
          <svg
            viewBox="0 0 24 24"
            className="h-3.5 w-3.5"
            fill="currentColor"
          >
            <path d="M18.4 14.2a7.4 7.4 0 0 1-8.6-8.59A8.47 8.47 0 1 0 18.4 14.2Z" />
          </svg>
        )}
      </span>
      <span className="hidden min-[460px]:inline">{isLight ? copy.light : copy.dark}</span>
    </button>
  );
}

function LanguageToggle() {
  const { language, setLanguage } = useSettings();
  const copy = UI_COPY[language];

  return (
    <div
      className="inline-flex min-h-10 shrink-0 items-center rounded-full border border-[var(--border-soft)] bg-[var(--surface)] p-1"
      aria-label={copy.language}
      role="group"
    >
      {(["sr", "en"] as const).map((option) => {
        const isActive = option === language;

        return (
          <button
            key={option}
            type="button"
            onClick={() => setLanguage(option)}
            aria-pressed={isActive}
            aria-label={
              option === "sr" ? copy.switchToSerbian : copy.switchToEnglish
            }
            className={`rounded-full px-2.5 py-2 text-[0.64rem] uppercase tracking-[0.24em] transition min-[460px]:px-3 min-[460px]:text-[0.68rem] ${
              isActive
                ? "bg-[var(--text-primary)] text-[var(--surface-elevated)]"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            {option.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}

export function Navbar() {
  const { language } = useSettings();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const copy = UI_COPY[language];

  useEffect(() => {
    if (!drawerOpen) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setDrawerOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [drawerOpen]);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-30 px-4 py-4 md:px-8">
      <div className="pointer-events-auto mx-auto flex max-w-7xl flex-col">
        <div className="glass-shell grid grid-cols-[auto_1fr] items-center gap-2 rounded-[2rem] px-3 py-3 md:grid-cols-[auto_1fr_auto] md:px-6">
          <Link
            href="/"
            scroll={false}
            className="inline-flex min-w-0 items-center gap-3 rounded-full pr-2"
            aria-label={BRAND_NAME}
          >
            <div className="relative h-12 w-12 overflow-hidden rounded-full ring-1 ring-[var(--border-soft)]">
              <Image
                src={logo}
                alt=""
                preload
                sizes="48px"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="hidden min-[440px]:block">
              <p className="font-display text-[1.05rem] tracking-[0.22em] text-[var(--text-primary)]">
                THE ORIGINAL WAY
              </p>
              <p className="mt-1 text-[0.66rem] uppercase tracking-[0.34em] text-[var(--text-muted)]">
                Editorial alpine luxury
              </p>
            </div>
          </Link>

          <nav
            aria-label={copy.desktopNavigation}
            className="hidden items-center justify-center gap-1 md:flex"
          >
            {NAV_GROUPS.map((group) => (
              <DropdownNavItem
                key={group.href}
                group={group}
                language={language}
              />
            ))}
          </nav>

          <div className="flex min-w-0 items-center justify-end gap-1.5 sm:gap-2">
            <LanguageToggle />
            <ThemeToggle />
            <button
              type="button"
              aria-controls="mobile-navigation"
              aria-expanded={drawerOpen}
              aria-label={drawerOpen ? copy.closeMenu : copy.openMenu}
              onClick={() => setDrawerOpen((currentState) => !currentState)}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-[var(--border-soft)] bg-[var(--surface)] px-2.5 text-[0.68rem] uppercase tracking-[0.22em] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)] focus-visible:border-[var(--border-strong)] focus-visible:text-[var(--text-primary)] min-[430px]:px-3 md:hidden"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                {drawerOpen ? (
                  <path d="M6 6l12 12M18 6L6 18" />
                ) : (
                  <path d="M4 7h16M4 12h16M4 17h16" />
                )}
              </svg>
              <span className="hidden min-[430px]:inline">
                {drawerOpen ? copy.closeMenu : copy.menu}
              </span>
            </button>
          </div>
        </div>

        <div
          id="mobile-navigation"
          className={`overflow-hidden transition-[max-height,opacity,margin] duration-300 md:hidden ${
            drawerOpen ? "mt-3 max-h-[36rem] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="glass-panel-solid rounded-[1.9rem] px-4 py-4 shadow-[0_26px_72px_rgba(var(--shadow-rgb),0.2)]">
            <nav
              aria-label={copy.mobileNavigation}
              className="grid gap-5"
            >
              {NAV_GROUPS.map((group) => (
                <div key={group.href} className="grid gap-3">
                  <Link
                    href={group.href}
                    prefetch={false}
                    onClick={() => setDrawerOpen(false)}
                    className="text-[0.72rem] uppercase tracking-[0.34em] text-[var(--text-muted)]"
                  >
                    {group.label[language]}
                  </Link>
                  <div className="grid gap-2">
                    {group.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        prefetch={false}
                        aria-label={item.ariaLabel[language]}
                        onClick={() => setDrawerOpen(false)}
                        className="rounded-[1.3rem] border border-transparent bg-[rgba(var(--accent-rgb),0.06)] px-4 py-3 hover:border-[var(--border-soft)] hover:bg-[rgba(var(--accent-rgb),0.1)] focus-visible:border-[var(--border-strong)] focus-visible:bg-[rgba(var(--accent-rgb),0.1)]"
                      >
                        <p className="text-[0.68rem] uppercase tracking-[0.3em] text-[var(--text-muted)]">
                          {item.label[language]}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-[var(--text-primary)]">
                          {item.description[language]}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
