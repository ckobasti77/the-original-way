"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useConvexAuth, useQuery } from "convex/react";

import { useSettings } from "@/components/settings-provider";
import { CartDrawer, CartNavButton } from "@/components/shop/cart-drawer";
import { ProductSearch } from "@/components/shop/product-search";
import { api } from "@/convex/_generated/api";
import { localizeHref, stripLocale } from "@/lib/storefront-i18n";
import logo from "@/public/logos/logo.png";

import {
  BRAND_NAME,
  NAV_LINKS,
  NAV_MENU_COPY,
  UI_COPY,
  type NavLinkItem,
} from "./content";
import { DropdownNavItem } from "./dropdown-nav-item";
import { useNavMenu } from "./use-nav-menu";

const NAVBAR_BACKGROUND_IMAGE =
  "linear-gradient(var(--navbar-bg), var(--navbar-bg))";

const NAVBAR_CENTER_MASK =
  "linear-gradient(to right, black 0%, black var(--navbar-mask-solid-left), transparent var(--navbar-mask-clear-left), transparent var(--navbar-mask-clear-right), black var(--navbar-mask-solid-right), black 100%)";

const NAVBAR_BOTTOM_MASK =
  "linear-gradient(to bottom, black 0%, black 66%, transparent 100%)";

const ICON_BUTTON_CLASS =
  "nav-text inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-soft)] bg-[var(--surface)] text-[var(--text-secondary)] transition hover:border-[var(--border-strong)] hover:bg-[var(--surface-strong)] hover:text-[var(--text-primary)] focus-visible:text-[var(--text-primary)]";

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

export function ProfileMenu({
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

// Colours come from the unlayered `.nav-menu-*` classes in globals.css because
// `a { color: inherit }` there outranks Tailwind's layered colour utilities.
const MOBILE_CHIP_CLASS =
  "nav-menu-link flex min-h-11 items-center rounded-[0.85rem] border border-[var(--border-soft)] bg-[rgba(var(--accent-rgb),0.03)] px-3 text-[0.7rem] font-semibold leading-tight transition active:scale-[0.97] active:border-[var(--accent)]";

const MOBILE_VIEW_ALL_CLASS =
  "nav-menu-strong flex min-h-11 items-center justify-between gap-2 rounded-[0.9rem] border border-[var(--border-strong)] bg-[rgba(var(--accent-rgb),0.07)] px-4 text-[0.68rem] font-bold uppercase tracking-[0.18em] transition active:scale-[0.98]";

export function Navbar() {
  const { language } = useSettings();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isHomePath = stripLocale(pathname) === "/";
  const [isInsideStory, setIsInsideStory] = useState(isHomePath);
  const [storyTone, setStoryTone] = useState<"light" | "dark">("light");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const { isAuthenticated } = useConvexAuth();
  const currentUser = useQuery(api.auth.me, isAuthenticated ? {} : "skip");
  const copy = UI_COPY[language];
  const authHref = localizeHref(isAuthenticated ? "/profil" : "/prijava", language);
  const avatarHref = currentUser?.isAdmin ? "/admin" : authHref;
  const authLabel = isAuthenticated ? copy.profileCta : copy.loginCta;
  const convexEnabled = Boolean(process.env.NEXT_PUBLIC_CONVEX_URL);
  const menuCopy = NAV_MENU_COPY[language];
  const navMenu = useNavMenu(language);

  const sidebarRef = useRef<HTMLDivElement>(null);
  const burgerButtonRef = useRef<HTMLButtonElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const mobileSectionRefs = useRef(new Map<string, HTMLDivElement | null>());

  const currentPath = stripLocale(pathname);
  const activeGender = searchParams.get("gender");

  const isLinkActive = (link: NavLinkItem) => {
    const [path] = link.href.split("?");
    if (stripLocale(path) !== currentPath) {
      return false;
    }
    if (link.gender) {
      return activeGender === link.gender;
    }
    if (link.menu === "collections") {
      return !activeGender;
    }
    return true;
  };

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

  // Keep a freshly expanded accordion in view once its panel has grown.
  useEffect(() => {
    if (!expandedSection) {
      return;
    }

    const element = mobileSectionRefs.current.get(expandedSection);
    if (!element) {
      return;
    }

    const timer = window.setTimeout(() => {
      element.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 240);

    return () => window.clearTimeout(timer);
  }, [expandedSection]);

  useEffect(() => {
    const handleStart = (event: Event) => {
      const detail = (
        event as CustomEvent<{ from?: number; to?: number }>
      ).detail;
      const nextStop = detail?.to ?? 0;
      setStoryTone(nextStop === 0 || nextStop === 2 ? "light" : "dark");
      setIsHidden(false);
      closeDrawer();
    };

    window.addEventListener("tow-transition-start", handleStart);

    return () => {
      window.removeEventListener("tow-transition-start", handleStart);
    };
  }, []);

  useEffect(() => {
    if (!isHomePath) {
      return;
    }

    const storyElement = document.querySelector<HTMLElement>(
      "[data-tow-scrollytelling='true']",
    );
    if (!storyElement) {
      return;
    }

    const syncTone = () => {
      setStoryTone(
        storyElement.dataset.storyTone === "dark" ? "dark" : "light",
      );
    };

    syncTone();
    const observer = new MutationObserver(syncTone);
    observer.observe(storyElement, {
      attributeFilter: ["data-story-tone"],
      attributes: true,
    });

    return () => observer.disconnect();
  }, [isHomePath]);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let accumulatedDelta = 0;
    let lastDirection = 0;
    let ticking = false;

    const isInsideScrollytelling = () => {
      if (!isHomePath) {
        return false;
      }

      const storyElement = document.querySelector<HTMLElement>(
        "[data-tow-scrollytelling='true']",
      );

      if (!storyElement) {
        return false;
      }

      const bounds = storyElement.getBoundingClientRect();
      const navbarHeight = headerRef.current?.offsetHeight ?? 80;

      return bounds.top < navbarHeight && bounds.bottom > 0;
    };

    const updateNavbar = () => {
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - lastScrollY;

      const inside = isInsideScrollytelling();
      setIsInsideStory(inside);
      if (drawerOpen || inside) {
        setIsHidden(false);
        accumulatedDelta = 0;
        lastDirection = 0;
        lastScrollY = currentScrollY;
        ticking = false;
        return;
      }

      if (currentScrollY <= 24) {
        setIsHidden(false);
        accumulatedDelta = 0;
        lastDirection = 0;
      } else if (Math.abs(delta) >= 1) {
        const direction = delta > 0 ? 1 : -1;

        if (direction !== lastDirection) {
          accumulatedDelta = delta;
          lastDirection = direction;
        } else {
          accumulatedDelta += delta;
        }

        if (accumulatedDelta >= 16) {
          setIsHidden(true);
          accumulatedDelta = 0;
        } else if (accumulatedDelta <= -16) {
          setIsHidden(false);
          accumulatedDelta = 0;
        }
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
  }, [drawerOpen, isHomePath]);

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

  const headerStyle = {
    ...(isInsideStory
      ? {
        "--navbar-bg":
          storyTone === "light"
            ? "rgba(248, 245, 239, 0.88)"
            : "rgba(18, 18, 20, 0.88)",
        "--page-bg": storyTone === "light" ? "#f3efe8" : "#111113",
        "--page-bg-deep": storyTone === "light" ? "#e8e3db" : "#09090a",
        "--text-primary": storyTone === "light" ? "#19191c" : "#fbf9f5",
        "--text-secondary":
          storyTone === "light"
            ? "rgba(25,25,28,0.76)"
            : "rgba(251,249,245,0.78)",
        "--text-muted":
          storyTone === "light"
            ? "rgba(25,25,28,0.54)"
            : "rgba(251,249,245,0.58)",
        "--surface":
          storyTone === "light"
            ? "rgba(251,249,245,0.72)"
            : "rgba(31,31,34,0.72)",
        "--surface-strong":
          storyTone === "light"
            ? "rgba(251,249,245,0.94)"
            : "rgba(42,42,46,0.92)",
        "--surface-elevated":
          storyTone === "light"
            ? "rgba(251,249,245,0.97)"
            : "rgba(30,30,33,0.97)",
        "--surface-opaque": storyTone === "light" ? "#fbf9f5" : "#1d1d20",
        "--border-soft":
          storyTone === "light"
            ? "rgba(25,25,28,0.16)"
            : "rgba(251,249,245,0.18)",
        "--border-strong":
          storyTone === "light"
            ? "rgba(25,25,28,0.34)"
            : "rgba(251,249,245,0.38)",
        "--accent": storyTone === "light" ? "#19191c" : "#fbf9f5",
        "--accent-strong": storyTone === "light" ? "#050506" : "#ffffff",
        "--accent-rgb": storyTone === "light" ? "25, 25, 28" : "251, 249, 245",
        "--shadow-rgb": storyTone === "light" ? "25, 25, 28" : "0, 0, 0",
        }
      : {}),
    transform: isHidden
      ? "translate3d(0, -115%, 0)"
      : "translate3d(0, 0, 0)",
    transition: [
      isHidden
        ? "transform 340ms cubic-bezier(0.4, 0, 1, 1)"
        : "transform 480ms cubic-bezier(0.16, 1, 0.3, 1)",
      `--navbar-mask-solid-left ${
        isInsideStory ? "560ms" : "680ms"
      } cubic-bezier(0.16, 1, 0.3, 1)`,
      `--navbar-mask-clear-left ${
        isInsideStory ? "560ms" : "680ms"
      } cubic-bezier(0.16, 1, 0.3, 1)`,
      `--navbar-mask-clear-right ${
        isInsideStory ? "560ms" : "680ms"
      } cubic-bezier(0.16, 1, 0.3, 1)`,
      `--navbar-mask-solid-right ${
        isInsideStory ? "560ms" : "680ms"
      } cubic-bezier(0.16, 1, 0.3, 1)`,
    ].join(", "),
  } as React.CSSProperties;

  return (
    <>
    <header
      ref={headerRef}
      data-story-navbar={isInsideStory ? "true" : "false"}
      data-story-tone={isInsideStory ? storyTone : undefined}
      data-navbar-hidden={isHidden ? "true" : "false"}
      className="pointer-events-none fixed inset-x-0 top-0 z-30 flex flex-col will-change-transform"
      style={headerStyle}
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
          <div className="flex items-center gap-6 lg:gap-5 xl:gap-12">
            <Link
              href={localizeHref("/", language)}
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
              className="hidden items-center gap-0.5 lg:flex xl:gap-2"
            >
              {NAV_LINKS.slice(0, 3).map((link) =>
                link.type === "simple" ? (
                  <Link
                    key={link.href}
                    href={localizeHref(link.href, language)}
                    prefetch={false}
                    aria-current={isLinkActive(link) ? "page" : undefined}
                    className={`nav-text inline-flex min-h-10 items-center whitespace-nowrap px-2 text-[0.72rem] font-semibold uppercase tracking-[0.18em] transition hover:text-[var(--text-primary)] focus-visible:text-[var(--text-primary)] xl:px-3 xl:text-[0.78rem] xl:tracking-[0.24em] ${
                      isLinkActive(link)
                        ? "text-[var(--text-primary)]"
                        : "text-[var(--text-secondary)]"
                    }`}
                  >
                    {link.label[language]}
                  </Link>
                ) : (
                  <DropdownNavItem
                    key={link.href}
                    link={link}
                    language={language}
                    isActive={isLinkActive(link)}
                    {...navMenu.resolve(link)}
                  />
                )
              )}
            </nav>
          </div>

          {/* Right Side: Last 3 Navlinks and Actions */}
          <div className="flex items-center gap-6 lg:gap-3 xl:gap-8">
            <nav
              aria-label={copy.desktopNavigation}
              className="hidden items-center gap-0.5 lg:flex xl:gap-2"
            >
              {NAV_LINKS.slice(3, 6).map((link) =>
                link.type === "simple" ? (
                  <Link
                    key={link.href}
                    href={localizeHref(link.href, language)}
                    prefetch={false}
                    aria-current={isLinkActive(link) ? "page" : undefined}
                    className={`nav-text inline-flex min-h-10 items-center whitespace-nowrap px-2 text-[0.72rem] font-semibold uppercase tracking-[0.18em] transition hover:text-[var(--text-primary)] focus-visible:text-[var(--text-primary)] xl:px-3 xl:text-[0.78rem] xl:tracking-[0.24em] ${
                      isLinkActive(link)
                        ? "text-[var(--text-primary)]"
                        : "text-[var(--text-secondary)]"
                    }`}
                  >
                    {link.label[language]}
                  </Link>
                ) : (
                  <DropdownNavItem
                    key={link.href}
                    link={link}
                    language={language}
                    isActive={isLinkActive(link)}
                    {...navMenu.resolve(link)}
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
              <LanguageToggle />
              <ThemeToggle />
              {isAuthenticated ? (
                <Link
                  href={avatarHref}
                  aria-label={copy.profile}
                  className={ICON_BUTTON_CLASS}
                >
                  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-[1.15rem] w-[1.15rem]" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21a8 8 0 0 0-16 0" />
                    <circle cx="12" cy="8" r="4" />
                  </svg>
                </Link>
              ) : (
                <Link
                  href={authHref}
                  className="nav-login-cta tow-on-primary inline-flex min-h-10 items-center rounded-md bg-[var(--text-primary)] px-5 text-[0.72rem] font-bold uppercase tracking-[0.16em] shadow-[0_12px_28px_rgba(var(--shadow-rgb),0.18)] transition hover:-translate-y-0.5"
                >
                  {authLabel}
                </Link>
              )}
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
        className={`fixed right-0 top-0 bottom-0 z-50 flex h-[100dvh] w-full max-w-[min(92vw,420px)] flex-col overflow-x-hidden border-l border-[var(--border-soft)] bg-gradient-to-b from-[var(--surface-elevated)] to-[var(--surface-opaque)] backdrop-blur-[32px] shadow-[-25px_0_60px_rgba(var(--shadow-rgb),0.18)] transition-transform duration-600 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-auto lg:hidden ${
          drawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="flex h-20 items-center justify-between border-b border-[var(--border-soft)] px-6">
          <Link
            href={localizeHref("/", language)}
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
        <div className="flex-1 overflow-x-hidden overflow-y-auto px-6 py-8">
          <ProductSearch
            className="mb-7 grid gap-3 rounded-[1.2rem] border border-[var(--border-soft)] bg-[rgba(var(--accent-rgb),0.035)] p-3"
            convexEnabled={convexEnabled}
            onNavigate={closeDrawer}
            variant="mobile"
          />

          <nav
            aria-label={copy.mobileNavigation}
            className="flex flex-col divide-y divide-[var(--border-soft)]"
          >
            {NAV_LINKS.map((link, index) => {
              // Staggered slide/fade animation values
              const delay = drawerOpen ? `${index * 45 + 90}ms` : "0ms";
              const transitionStyle = {
                transitionDelay: delay,
              };

              const animateClass = `transform transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                drawerOpen
                  ? "translate-x-0 opacity-100"
                  : "translate-x-12 opacity-0"
              }`;

              const isActive = isLinkActive(link);

              if (link.type === "simple") {
                return (
                  <div key={link.href} className={animateClass} style={transitionStyle}>
                    <Link
                      href={localizeHref(link.href, language)}
                      prefetch={false}
                      onClick={closeDrawer}
                      aria-current={isActive ? "page" : undefined}
                      className={`flex min-h-12 items-center text-[0.82rem] font-bold uppercase tracking-[0.24em] transition ${
                        isActive ? "nav-menu-strong" : "nav-menu-link"
                      }`}
                    >
                      {link.label[language]}
                    </Link>
                  </div>
                );
              }

              const isExpanded = expandedSection === link.href;
              const { columns, entries, kind } = navMenu.resolve(link);

              return (
                <div
                  key={link.href}
                  ref={(element) => {
                    mobileSectionRefs.current.set(link.href, element);
                  }}
                  className={`flex flex-col ${animateClass}`}
                  style={transitionStyle}
                >
                  <button
                    type="button"
                    onClick={() => toggleAccordion(link.href)}
                    aria-expanded={isExpanded}
                    className={`flex min-h-12 w-full items-center justify-between gap-3 text-[0.82rem] font-bold uppercase tracking-[0.24em] transition ${
                      isExpanded || isActive ? "nav-menu-strong" : "nav-menu-link"
                    }`}
                  >
                    <span>{link.label[language]}</span>
                    <span
                      className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
                        isExpanded
                          ? "rotate-180 border-[var(--border-strong)] bg-[rgba(var(--accent-rgb),0.08)]"
                          : "border-[var(--border-soft)]"
                      }`}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="h-3.5 w-3.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </span>
                  </button>

                  <div
                    className={`grid transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                      isExpanded
                        ? "mb-4 grid-rows-[1fr] opacity-100"
                        : "pointer-events-none grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="flex flex-col gap-3 overflow-hidden">
                      <Link
                        href={localizeHref(link.href, language)}
                        prefetch={false}
                        onClick={closeDrawer}
                        className={MOBILE_VIEW_ALL_CLASS}
                      >
                        <span>
                          {kind === "categories"
                            ? menuCopy.viewAll
                            : menuCopy.viewAllCollections}
                        </span>
                        <svg
                          viewBox="0 0 24 24"
                          className="h-3.5 w-3.5 shrink-0"
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

                      {kind === "categories" ? (
                        columns.length === 0 ? (
                          <p className="text-xs font-semibold text-[var(--text-muted)]">
                            {menuCopy.empty}
                          </p>
                        ) : (
                          columns.map((column) => (
                            <div key={column.type}>
                              <Link
                                href={localizeHref(column.href, language)}
                                prefetch={false}
                                onClick={closeDrawer}
                                className="nav-menu-title flex min-h-9 items-center justify-between gap-2 text-[0.62rem] font-bold uppercase tracking-[0.22em]"
                              >
                                <span>{menuCopy[column.type]}</span>
                                <span className="tabular-nums opacity-70">
                                  {column.items.length}
                                </span>
                              </Link>
                              <div className="mt-1.5 grid grid-cols-2 gap-2">
                                {column.items.map((item) => (
                                  <Link
                                    key={item.slug}
                                    href={localizeHref(item.href, language)}
                                    prefetch={false}
                                    onClick={closeDrawer}
                                    className={MOBILE_CHIP_CLASS}
                                  >
                                    {item.label}
                                  </Link>
                                ))}
                              </div>
                            </div>
                          ))
                        )
                      ) : (
                        entries.map((entry) => (
                          <Link
                            key={entry.slug}
                            href={localizeHref(entry.href, language)}
                            prefetch={false}
                            onClick={closeDrawer}
                            className="nav-menu-card block rounded-[0.9rem] border border-[var(--border-soft)] bg-[rgba(var(--accent-rgb),0.02)] px-4 py-3 transition active:scale-[0.99] active:border-[var(--accent)] active:bg-[rgba(var(--accent-rgb),0.06)]"
                          >
                            <p className="nav-menu-link text-[0.7rem] font-semibold uppercase tracking-[0.22em]">
                              {entry.label}
                            </p>
                            {entry.description ? (
                              <p className="story-subcopy mt-1 text-xs font-normal leading-relaxed text-[var(--text-muted)]">
                                {entry.description}
                              </p>
                            ) : null}
                          </Link>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </nav>
        </div>

        {/* Drawer Footer */}
        <div className="border-t border-[var(--border-soft)] px-6 py-6 bg-[rgba(var(--shadow-rgb),0.02)] flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <LanguageToggle />
            <ThemeToggle />
          </div>
          <Link
            href={avatarHref}
            onClick={closeDrawer}
            className={`${AUTH_CTA_CLASS} min-h-[2.6rem] text-[0.78rem] active:scale-95 transition-all text-center`}
            style={{
              backgroundColor: "var(--text-primary)",
              color: "var(--page-bg)",
            }}
          >
            {authLabel}
          </Link>
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
