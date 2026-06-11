"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

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

  const handleToggle = () => {
    setLanguage(language === "sr" ? "en" : "sr");
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={language === "sr" ? copy.switchToEnglish : copy.switchToSerbian}
      className="nav-text mr-1 inline-flex h-10 w-10 items-center justify-center rounded-full text-[0.7rem] font-sans font-semibold tracking-[0.15em] text-[var(--text-secondary)] transition hover:bg-[rgba(var(--accent-rgb),0.08)] hover:text-[var(--text-primary)] focus-visible:text-[var(--text-primary)] cursor-pointer select-none"
    >
      {language === "sr" ? "SR" : "EN"}
    </button>
  );
}

export function Navbar() {
  const { language } = useSettings();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const copy = UI_COPY[language];

  const sidebarRef = useRef<HTMLDivElement>(null);
  const burgerButtonRef = useRef<HTMLButtonElement>(null);

  const toggleAccordion = (href: string) => {
    setExpandedSection((prev) => (prev === href ? null : href));
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setExpandedSection(null);
  };

  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  useEffect(() => {
    const handleStart = () => {
      setIsHidden(true);
      closeDrawer();
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
        closeDrawer();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [drawerOpen]);

  useEffect(() => {
    if (!drawerOpen) {
      return;
    }

    const handleOutsideClick = (event: MouseEvent | TouchEvent) => {
      if (sidebarRef.current && sidebarRef.current.contains(event.target as Node)) {
        return;
      }
      if (
        burgerButtonRef.current &&
        burgerButtonRef.current.contains(event.target as Node)
      ) {
        return;
      }

      closeDrawer();
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
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
      <div className="pointer-events-auto relative h-20 w-full">
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
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 md:px-8">
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
              className="hidden items-center gap-2 lg:flex"
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
              className="hidden items-center gap-2 lg:flex"
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

            <div className="flex items-center gap-1.5 sm:gap-2.5">
              <LanguageToggle />
              <ThemeToggle />
              <Link
                href="/admin"
                className="hidden sm:inline-flex nav-text min-h-[2.2rem] items-center justify-center rounded-full border border-[var(--border-soft)] bg-[var(--surface)] px-4 text-[0.72rem] font-bold uppercase tracking-[0.2em] text-[var(--text-secondary)] transition hover:border-[var(--border-strong)] hover:bg-[var(--surface-strong)] hover:text-[var(--text-primary)] active:scale-95 cursor-pointer"
              >
                Admin
              </Link>
              <button
                ref={burgerButtonRef}
                type="button"
                aria-controls="mobile-navigation"
                aria-expanded={drawerOpen}
                aria-label={drawerOpen ? copy.closeMenu : copy.openMenu}
                onClick={() => setDrawerOpen((currentState) => !currentState)}
                className="nav-text inline-flex h-10 w-10 items-center justify-center rounded-full text-[var(--text-secondary)] transition hover:bg-[rgba(var(--accent-rgb),0.08)] hover:text-[var(--text-primary)] focus-visible:text-[var(--text-primary)] lg:hidden"
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

      {/* Backdrop Scrim */}
      <div
        className={`fixed inset-0 z-40 bg-black/45 backdrop-blur-sm transition-opacity duration-500 lg:hidden ${
          drawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* Right Sidebar Drawer */}
      <div
        ref={sidebarRef}
        id="mobile-navigation"
        className={`fixed right-0 top-0 bottom-0 z-50 flex h-screen w-full sm:w-[420px] max-w-[85vw] flex-col border-l border-[var(--border-soft)] bg-gradient-to-b from-[var(--surface-elevated)] to-[var(--surface-opaque)] backdrop-blur-[32px] shadow-[-25px_0_60px_rgba(var(--shadow-rgb),0.18)] transition-transform duration-600 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-auto lg:hidden ${
          drawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="flex h-20 items-center justify-between border-b border-[var(--border-soft)] px-6">
          <Link
            href="/"
            onClick={closeDrawer}
            scroll={false}
            className="inline-flex items-center justify-center transition hover:opacity-85"
            aria-label={BRAND_NAME}
          >
            <div className="relative h-12 w-12 flex items-center justify-center">
              <Image
                src={logo}
                alt={BRAND_NAME}
                priority
                sizes="48px"
                className="h-full w-full object-contain"
              />
            </div>
          </Link>
          <button
            type="button"
            onClick={closeDrawer}
            aria-label={copy.closeMenu}
            className="group flex h-10 w-10 items-center justify-center rounded-full text-[var(--text-secondary)] transition hover:bg-[rgba(var(--accent-rgb),0.08)] hover:text-[var(--text-primary)] active:scale-95"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-0.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto px-6 py-8">
          <nav aria-label={copy.mobileNavigation} className="flex flex-col gap-6">
            {NAV_LINKS.map((link, index) => {
              // Staggered slide/fade animation values
              const delay = drawerOpen ? `${index * 60 + 100}ms` : "0ms";
              const transitionStyle = {
                transitionDelay: delay,
              };

              const animateClass = `transform transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                drawerOpen
                  ? "translate-x-0 opacity-100"
                  : "translate-x-12 opacity-0"
              }`;

              if (link.type === "simple") {
                return (
                  <div key={link.href} className={animateClass} style={transitionStyle}>
                    <Link
                      href={link.href}
                      prefetch={false}
                      onClick={closeDrawer}
                      className="nav-text block py-2 text-[0.82rem] font-bold uppercase tracking-[0.24em] text-[var(--text-primary)] transition hover:text-[var(--accent)]"
                    >
                      {link.label[language]}
                    </Link>
                  </div>
                );
              }

              const isExpanded = expandedSection === link.href;

              return (
                <div
                  key={link.href}
                  className={`flex flex-col ${animateClass}`}
                  style={transitionStyle}
                >
                  <button
                    type="button"
                    onClick={() => toggleAccordion(link.href)}
                    aria-expanded={isExpanded}
                    className="flex w-full items-center justify-between py-2 text-[0.82rem] font-bold uppercase tracking-[0.24em] text-[var(--text-primary)] transition hover:text-[var(--accent)]"
                  >
                    <span>{link.label[language]}</span>
                    <svg
                      viewBox="0 0 24 24"
                      className={`h-4 w-4 text-[var(--text-secondary)] transition-transform duration-300 ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>

                  <div
                    className={`grid transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                      isExpanded
                        ? "grid-rows-[1fr] opacity-100 mt-2"
                        : "grid-rows-[0fr] opacity-0 pointer-events-none"
                    }`}
                  >
                    <div className="overflow-hidden pl-3 border-l border-[var(--border-soft)] flex flex-col gap-3">
                      {link.items?.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          prefetch={false}
                          aria-label={item.ariaLabel[language]}
                          onClick={closeDrawer}
                          className="group block rounded-[0.9rem] border border-[var(--border-soft)] bg-[rgba(var(--accent-rgb),0.02)] px-4 py-3 hover:border-[var(--accent)] hover:bg-[rgba(var(--accent-rgb),0.06)] transition-all duration-300"
                        >
                          <p className="nav-text text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
                            {item.label[language]}
                          </p>
                          <p className="story-subcopy mt-1 text-xs font-normal leading-relaxed text-[var(--text-muted)] group-hover:text-[var(--text-secondary)] transition-colors">
                            {item.description[language]}
                          </p>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </nav>
        </div>

        {/* Drawer Footer */}
        <div className="border-t border-[var(--border-soft)] px-6 py-6 bg-[rgba(var(--shadow-rgb),0.02)] flex flex-col gap-4">
          <Link
            href="/admin"
            onClick={closeDrawer}
            className="w-full flex min-h-[2.6rem] items-center justify-center rounded-full border border-[var(--border-soft)] bg-[var(--surface)] text-[0.78rem] font-bold uppercase tracking-[0.2em] text-[#276c56] hover:bg-[var(--surface-strong)] hover:border-[#276c56]/50 active:scale-95 transition-all text-center"
          >
            Admin Panel
          </Link>
          <div className="flex items-center justify-between">
            <LanguageToggle />
            <ThemeToggle />
          </div>
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.25em] text-[var(--text-muted)] text-center mt-1">
            © 2026 {BRAND_NAME} • EST.
          </p>
        </div>
      </div>
    </header>
  );
}
