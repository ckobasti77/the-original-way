"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { useSettings } from "@/components/settings-provider";
import logo from "@/public/logos/logo.png";

import { BRAND_NAME, NAV_LINKS, UI_COPY } from "./content";
import { DropdownNavItem } from "./dropdown-nav-item";

const NAVBAR_BACKGROUND_IMAGE =
  "linear-gradient(var(--navbar-bg), var(--navbar-bg))";

const NAVBAR_CENTER_MASK =
  "var(--navbar-center-mask, linear-gradient(to right, black 0%, black 31%, transparent 43%, transparent 57%, black 69%, black 100%))";

const NAVBAR_BOTTOM_MASK =
  "linear-gradient(to bottom, black 0%, black 66%, transparent 100%)";

function ThemeToggle() {
  const { language, theme, toggleTheme } = useSettings();
  const copy = UI_COPY[language];
  const isLight = theme === "light";

  return (
    <button
      type="button"
      aria-label={isLight ? copy.switchToDark : copy.switchToLight}
      onClick={toggleTheme}
      className="nav-text inline-flex h-10 w-10 items-center justify-center rounded-full text-[var(--text-secondary)] transition hover:bg-[rgba(var(--accent-rgb),0.08)] hover:text-[var(--text-primary)] focus-visible:text-[var(--text-primary)]"
    >
      {isLight ? (
        <svg
          viewBox="0 0 24 24"
          className="h-[1.1rem] w-[1.1rem]"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
      ) : (
        <svg
          viewBox="0 0 24 24"
          className="h-[1.1rem] w-[1.1rem]"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </svg>
      )}
    </button>
  );
}

function LanguageToggle() {
  const { language, setLanguage } = useSettings();
  const copy = UI_COPY[language];

  return (
    <div
      className="nav-text mr-2 inline-flex items-center gap-1.5 text-[0.7rem] font-sans font-semibold tracking-[0.18em] text-[var(--text-secondary)]"
      aria-label={copy.language}
      role="group"
    >
      <button
        type="button"
        onClick={() => setLanguage("sr")}
        aria-pressed={language === "sr"}
        aria-label={copy.switchToSerbian}
        className={`px-1 py-1 transition hover:text-[var(--text-primary)] ${
          language === "sr"
            ? "font-semibold text-[var(--text-primary)]"
            : "opacity-45"
        }`}
      >
        SR
      </button>
      <span className="opacity-30 select-none">/</span>
      <button
        type="button"
        onClick={() => setLanguage("en")}
        aria-pressed={language === "en"}
        aria-label={copy.switchToEnglish}
        className={`px-1 py-1 transition hover:text-[var(--text-primary)] ${
          language === "en"
            ? "font-semibold text-[var(--text-primary)]"
            : "opacity-45"
        }`}
      >
        EN
      </button>
    </div>
  );
}

export function Navbar() {
  const { language } = useSettings();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const copy = UI_COPY[language];

  useEffect(() => {
    const handleStart = () => {
      setIsHidden(true);
      setDrawerOpen(false);
    };
    const handleEnd = () => {
      setIsHidden(false);
    };

    window.addEventListener("tow-transition-start", handleStart);
    window.addEventListener("tow-transition-end", handleEnd);

    return () => {
      window.removeEventListener("tow-transition-start", handleStart);
      window.removeEventListener("tow-transition-end", handleEnd);
    };
  }, []);

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
    <header 
      className={`pointer-events-none fixed inset-x-0 top-0 z-30 flex flex-col transition-all ${
        isHidden 
          ? "duration-300 ease-[cubic-bezier(0.3,0,0.8,0.15)] -translate-y-full opacity-0" 
          : "duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] translate-y-0 opacity-100"
      }`}
    >
      <div className="pointer-events-auto relative h-20 w-full overflow-hidden">
        {/* Layered glass background with a bottom fade-out */}
        <div 
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[length:100%_100%] bg-no-repeat shadow-[0_1px_0_rgba(var(--shadow-rgb),0.08)] backdrop-blur-[14px] transition-all duration-500" 
          style={{
            backgroundImage: NAVBAR_BACKGROUND_IMAGE,
            maskComposite: "intersect",
            maskImage: `${NAVBAR_CENTER_MASK}, ${NAVBAR_BOTTOM_MASK}`,
            WebkitMaskComposite: "source-in",
            WebkitMaskImage: `${NAVBAR_CENTER_MASK}, ${NAVBAR_BOTTOM_MASK}`,
          }}
        />
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6 md:px-12">
          {/* Left Side: Logo and first 3 Navlinks */}
          <div className="flex items-center gap-8 lg:gap-12">
            <Link
              href="/"
              scroll={false}
              className="inline-flex items-center justify-center transition hover:opacity-85"
              aria-label={BRAND_NAME}
            >
              <div className="relative h-14 w-14 flex items-center justify-center">
                <Image
                  src={logo}
                  alt={BRAND_NAME}
                  priority
                  sizes="56px"
                  className="h-full w-full object-contain"
                />
              </div>
            </Link>

            <nav
              aria-label={copy.desktopNavigation}
              className="hidden items-center gap-2 md:flex"
            >
              {NAV_LINKS.slice(0, 3).map((link) =>
                link.type === "simple" ? (
                  <Link
                    key={link.href}
                    href={link.href}
                    prefetch={false}
                    className="nav-text inline-flex min-h-10 items-center px-3 text-[0.78rem] font-semibold uppercase tracking-[0.24em] text-[var(--text-secondary)] transition hover:text-[var(--text-primary)] focus-visible:text-[var(--text-primary)]"
                  >
                    {link.label[language]}
                  </Link>
                ) : (
                  <DropdownNavItem
                    key={link.href}
                    link={link}
                    language={language}
                  />
                )
              )}
            </nav>
          </div>

          {/* Right Side: Last 3 Navlinks and Toggles */}
          <div className="flex items-center gap-6 lg:gap-8">
            <nav
              aria-label={copy.desktopNavigation}
              className="hidden items-center gap-2 md:flex"
            >
              {NAV_LINKS.slice(3, 6).map((link) =>
                link.type === "simple" ? (
                  <Link
                    key={link.href}
                    href={link.href}
                    prefetch={false}
                    className="nav-text inline-flex min-h-10 items-center px-3 text-[0.78rem] font-semibold uppercase tracking-[0.24em] text-[var(--text-secondary)] transition hover:text-[var(--text-primary)] focus-visible:text-[var(--text-primary)]"
                  >
                    {link.label[language]}
                  </Link>
                ) : (
                  <DropdownNavItem
                    key={link.href}
                    link={link}
                    language={language}
                  />
                )
              )}
            </nav>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <LanguageToggle />
              <ThemeToggle />
              <button
                type="button"
                aria-controls="mobile-navigation"
                aria-expanded={drawerOpen}
                aria-label={drawerOpen ? copy.closeMenu : copy.openMenu}
                onClick={() => setDrawerOpen((currentState) => !currentState)}
                className="nav-text inline-flex h-10 w-10 items-center justify-center rounded-full text-[var(--text-secondary)] transition hover:bg-[rgba(var(--accent-rgb),0.08)] hover:text-[var(--text-primary)] focus-visible:text-[var(--text-primary)] md:hidden"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-[1.2rem] w-[1.2rem]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {drawerOpen ? (
                    <path d="M18 6L6 18M6 6l12 12" />
                  ) : (
                    <path d="M4 8h16M4 16h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <div className="pointer-events-auto mx-auto w-full max-w-7xl px-4">
        <div
          id="mobile-navigation"
          className={`overflow-hidden transition-[max-height,opacity,margin] duration-300 md:hidden ${
            drawerOpen ? "mt-3 max-h-[42rem] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="glass-panel-solid rounded-[1.6rem] px-5 py-5 shadow-[0_26px_72px_rgba(var(--shadow-rgb),0.2)]">
            <nav
              aria-label={copy.mobileNavigation}
              className="grid gap-6"
            >
              {NAV_LINKS.map((link) => {
                if (link.type === "simple") {
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      prefetch={false}
                      onClick={() => setDrawerOpen(false)}
                      className="nav-text py-1 text-[0.74rem] font-semibold uppercase tracking-[0.24em] text-[var(--text-primary)] transition hover:opacity-80"
                    >
                      {link.label[language]}
                    </Link>
                  );
                } else {
                  return (
                    <div key={link.href} className="grid gap-2.5">
                      <span className="nav-text text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-[var(--text-muted)]">
                        {link.label[language]}
                      </span>
                      <div className="grid gap-2 pl-3 border-l border-[var(--border-soft)]">
                        {link.items?.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            prefetch={false}
                            aria-label={item.ariaLabel[language]}
                            onClick={() => setDrawerOpen(false)}
                            className="rounded-[0.9rem] border border-transparent bg-[rgba(var(--accent-rgb),0.04)] px-3.5 py-2.5 hover:border-[var(--border-soft)] hover:bg-[rgba(var(--accent-rgb),0.08)] transition"
                          >
                            <p className="nav-text text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">
                              {item.label[language]}
                            </p>
                            <p className="story-subcopy mt-1.5 text-xs leading-5">
                              {item.description[language]}
                            </p>
                          </Link>
                        ))}
                      </div>
                    </div>
                  );
                }
              })}
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
