"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useConvexAuth } from "convex/react";

import { useSettings } from "@/components/settings-provider";
import { CartDrawer, CartNavButton } from "@/components/shop/cart-drawer";
import { ProductSearch } from "@/components/shop/product-search";
import logo from "@/public/logos/logo.png";

import { BRAND_NAME, NAV_LINKS, UI_COPY } from "./content";
import { DropdownNavItem } from "./dropdown-nav-item";

const NAVBAR_BACKGROUND_IMAGE =
  "linear-gradient(var(--navbar-bg), var(--navbar-bg))";

const NAVBAR_CENTER_MASK =
  "var(--navbar-center-mask, linear-gradient(to right, black 0%, black 31%, transparent 43%, transparent 57%, black 69%, black 100%))";

const NAVBAR_BOTTOM_MASK =
  "linear-gradient(to bottom, black 0%, black 66%, transparent 100%)";

const ICON_BUTTON_CLASS =
  "nav-text inline-flex h-10 w-10 items-center justify-center rounded-full text-[var(--text-secondary)] transition hover:bg-[rgba(var(--accent-rgb),0.08)] hover:text-[var(--text-primary)] focus-visible:text-[var(--text-primary)]";

const MENU_ROW_CLASS =
  "flex w-full items-center justify-between rounded-[1.1rem] border border-[var(--border-soft)] bg-[var(--surface)] px-4 py-3 text-left transition hover:border-[var(--border-strong)] hover:bg-[var(--surface-strong)]";

const AUTH_CTA_CLASS =
  "inline-flex w-full items-center justify-center rounded-full px-4 font-bold uppercase tracking-[0.2em] shadow-[0_10px_24px_rgba(var(--shadow-rgb),0.12)] transition hover:opacity-95";

function ThemeToggle({ variant = "icon" }: { variant?: "icon" | "menu" }) {
  const { language, theme, toggleTheme } = useSettings();
  const copy = UI_COPY[language];
  const isLight = theme === "light";
  const isMenuVariant = variant === "menu";

  if (isMenuVariant) {
    return (
      <button
        type="button"
        aria-label={isLight ? copy.switchToDark : copy.switchToLight}
        onClick={toggleTheme}
        className={MENU_ROW_CLASS}
      >
        <span className="min-w-0">
          <span className="nav-text block text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">
            {copy.theme}
          </span>
          <span className="mt-1 block text-sm font-semibold text-[var(--text-primary)]">
            {isLight ? copy.light : copy.dark}
          </span>
        </span>
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--border-soft)] bg-[rgba(var(--accent-rgb),0.08)] text-[var(--text-primary)]">
          {isLight ? (
            <svg
              viewBox="0 0 24 24"
              className="h-[1rem] w-[1rem]"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
            </svg>
          ) : (
            <svg
              viewBox="0 0 24 24"
              className="h-[1rem] w-[1rem]"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
            </svg>
          )}
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      aria-label={isLight ? copy.switchToDark : copy.switchToLight}
      onClick={toggleTheme}
      className={ICON_BUTTON_CLASS}
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

function LanguageToggle({ variant = "icon" }: { variant?: "icon" | "menu" }) {
  const { language, setLanguage } = useSettings();
  const copy = UI_COPY[language];
  const isMenuVariant = variant === "menu";

  const handleToggle = () => {
    setLanguage(language === "sr" ? "en" : "sr");
  };

  if (isMenuVariant) {
    return (
      <button
        type="button"
        onClick={handleToggle}
        aria-label={language === "sr" ? copy.switchToEnglish : copy.switchToSerbian}
        className={MENU_ROW_CLASS}
      >
        <span className="min-w-0">
          <span className="nav-text block text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">
            {copy.language}
          </span>
          <span className="mt-1 block text-sm font-semibold text-[var(--text-primary)]">
            {language === "sr" ? "Srpski" : "English"}
          </span>
        </span>
        <span className="inline-flex h-9 min-w-9 shrink-0 items-center justify-center rounded-full border border-[var(--border-soft)] bg-[rgba(var(--accent-rgb),0.08)] px-3 text-[0.72rem] font-bold uppercase tracking-[0.15em] text-[var(--text-primary)]">
          {language === "sr" ? "SR" : "EN"}
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={language === "sr" ? copy.switchToEnglish : copy.switchToSerbian}
      className={`${ICON_BUTTON_CLASS} mr-1 text-[0.7rem] font-sans font-semibold tracking-[0.15em] cursor-pointer select-none`}
    >
      {language === "sr" ? "SR" : "EN"}
    </button>
  );
}

function ProfileMenu({
  authHref,
  authLabel,
}: {
  authHref: string;
  authLabel: string;
}) {
  const { language } = useSettings();
  const copy = UI_COPY[language];
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleStart = () => {
      setIsOpen(false);
    };

    window.addEventListener("tow-transition-start", handleStart);

    return () => {
      window.removeEventListener("tow-transition-start", handleStart);
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

  return (
    <div ref={containerRef} className="relative hidden lg:block">
      <button
        type="button"
        aria-label={copy.profile}
        aria-haspopup="menu"
        aria-controls="profile-menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((currentState) => !currentState)}
        className={`${ICON_BUTTON_CLASS} ${isOpen ? "bg-[rgba(var(--accent-rgb),0.08)] text-[var(--text-primary)]" : ""}`}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-[1.15rem] w-[1.15rem]"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 21a8 8 0 0 0-16 0" />
          <circle cx="12" cy="8" r="4" />
        </svg>
      </button>

      <div
        id="profile-menu"
        className={`absolute right-0 top-full z-30 mt-3 w-[min(22rem,calc(100vw-2rem))] origin-top-right transition duration-200 ${
          isOpen
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-2 opacity-0"
        }`}
      >
        <div className="glass-panel rounded-[1.4rem] border border-[var(--border-soft)] p-3 shadow-[0_24px_58px_rgba(var(--shadow-rgb),0.2)]">
          <div className="rounded-[1.15rem] border border-[var(--border-soft)] bg-[rgba(var(--accent-rgb),0.04)] p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--border-soft)] bg-[rgba(var(--accent-rgb),0.08)] text-[var(--text-primary)]">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 21a8 8 0 0 0-16 0" />
                  <circle cx="12" cy="8" r="4" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="nav-text text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[var(--text-muted)]">
                  {copy.profile}
                </p>
                <p className="mt-1 text-sm font-semibold text-[var(--text-primary)]">
                  {copy.profileDescription}
                </p>
              </div>
            </div>

            <div className="mt-4">
              <Link
                href={authHref}
                prefetch={false}
                onClick={() => setIsOpen(false)}
                className={`${AUTH_CTA_CLASS} min-h-10 text-[0.72rem]`}
                style={{
                  backgroundColor: "var(--text-primary)",
                  color: "var(--page-bg)",
                }}
              >
                {authLabel}
              </Link>
            </div>
          </div>

          <div className="mt-3 grid gap-2">
            <LanguageToggle variant="menu" />
            <ThemeToggle variant="menu" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function Navbar() {
  const { language } = useSettings();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const { isAuthenticated } = useConvexAuth();
  const copy = UI_COPY[language];
  const authHref = isAuthenticated ? "/profil" : "/prijava";
  const authLabel = isAuthenticated ? copy.profileCta : copy.loginCta;
  const convexEnabled = Boolean(process.env.NEXT_PUBLIC_CONVEX_URL);

  const sidebarRef = useRef<HTMLDivElement>(null);
  const burgerButtonRef = useRef<HTMLButtonElement>(null);
  const transitionHiddenRef = useRef(false);

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
      transitionHiddenRef.current = true;
      setIsHidden(true);
      closeDrawer();
    };
    const handleEnd = () => {
      transitionHiddenRef.current = false;
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
    let lastScrollY = window.scrollY;
    let ticking = false;

    const isInsideScrollytelling = () => {
      const storyElement = document.querySelector<HTMLElement>(
        "[data-tow-scrollytelling='true']",
      );

      if (!storyElement) {
        return false;
      }

      const bounds = storyElement.getBoundingClientRect();
      return bounds.top < 96 && bounds.bottom > 96;
    };

    const updateNavbar = () => {
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - lastScrollY;

      if (drawerOpen || transitionHiddenRef.current || isInsideScrollytelling()) {
        if (drawerOpen) {
          setIsHidden(false);
        }
        lastScrollY = currentScrollY;
        ticking = false;
        return;
      }

      if (currentScrollY <= 24) {
        setIsHidden(false);
      } else if (delta > 8) {
        setIsHidden(true);
      } else if (delta < -8) {
        setIsHidden(false);
      }

      lastScrollY = currentScrollY;
      ticking = false;
    };

    const handleScroll = () => {
      if (ticking) {
        return;
      }

      window.requestAnimationFrame(updateNavbar);
      ticking = true;
    };

    updateNavbar();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [drawerOpen]);

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
    <>
    <header 
      className={`pointer-events-none fixed inset-x-0 top-0 z-30 flex flex-col transition-all ${
        isHidden 
          ? "duration-300 ease-[cubic-bezier(0.3,0,0.8,0.15)] -translate-y-full opacity-0" 
          : "duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] translate-y-0 opacity-100"
      }`}
    >
      <div className="pointer-events-auto relative h-20 w-full px-4 md:px-8">
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
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between">
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

          {/* Right Side: Last 3 Navlinks and Actions */}
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

            <div className="hidden items-center gap-1.5 sm:gap-2.5 lg:flex">
              <ProductSearch
                className={ICON_BUTTON_CLASS}
                convexEnabled={convexEnabled}
              />
              <CartNavButton className={ICON_BUTTON_CLASS} />
              <ProfileMenu authHref={authHref} authLabel={authLabel} />
            </div>

            <div className="flex items-center gap-1 lg:hidden">
              <CartNavButton className={ICON_BUTTON_CLASS} />
              <button
                ref={burgerButtonRef}
                type="button"
                aria-controls="mobile-navigation"
                aria-expanded={drawerOpen}
                aria-label={drawerOpen ? copy.closeMenu : copy.openMenu}
                onClick={() => setDrawerOpen((currentState) => !currentState)}
                className={ICON_BUTTON_CLASS}
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
          <ProductSearch
            className="mb-7 grid gap-3 rounded-[1.2rem] border border-[var(--border-soft)] bg-[rgba(var(--accent-rgb),0.035)] p-3"
            convexEnabled={convexEnabled}
            onNavigate={closeDrawer}
            variant="mobile"
          />

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
            href={authHref}
            onClick={closeDrawer}
            className={`${AUTH_CTA_CLASS} min-h-[2.6rem] text-[0.78rem] active:scale-95 transition-all text-center`}
            style={{
              backgroundColor: "var(--text-primary)",
              color: "var(--page-bg)",
            }}
          >
            {authLabel}
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
    <CartDrawer />
    </>
  );
}
