"use client";

import Link from "next/link";

import { useSettings } from "@/components/settings-provider";
import { localizeHref, STORE_COPY } from "@/lib/storefront-i18n";
import {
  CONTACT_EMAIL,
  CONTACT_PHONE,
  CONTACT_PHONE_HREF,
  SOCIAL_LINKS,
} from "@/lib/site-contact";

export function StorefrontFooter() {
  const { language, toggleLanguage, toggleTheme, theme } = useSettings();
  const copy = STORE_COPY[language].footer;

  return (
    <footer className="store-footer border-t border-[var(--border-soft)]">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 md:grid-cols-[1.15fr_0.85fr_0.85fr] md:px-8 md:py-20">
        <div>
          <p className="font-display text-4xl leading-none">The Original Way</p>
          <p className="mt-5 max-w-sm text-sm leading-7 text-[var(--text-secondary)]">
            {copy.tagline}
          </p>
          <div className="mt-7 flex gap-2">
            <button className="store-icon-button" type="button" onClick={toggleLanguage}>
              <span className="sr-only">
                {language === "sr" ? "Switch to English" : "Prebaci na srpski"}
              </span>
              {language.toUpperCase()}
            </button>
            <button className="store-icon-button" type="button" onClick={toggleTheme}>
              <span className="sr-only">
                {language === "sr" ? "Promeni temu" : "Change theme"}
              </span>
              {theme === "light" ? "◐" : "◑"}
            </button>
          </div>
        </div>

        <div>
          <p className="store-eyebrow">{copy.shop}</p>
          <nav className="mt-5 grid gap-3">
            {copy.links.map(([label, href]) => (
              <Link
                key={href}
                href={localizeHref(href, language)}
                className="w-fit text-sm font-semibold text-[var(--text-secondary)] transition hover:text-[var(--accent)]"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>

        <div>
          <p className="store-eyebrow">{copy.support}</p>
          <div className="mt-5 grid gap-3 text-sm font-semibold text-[var(--text-secondary)]">
            <a href={`mailto:${CONTACT_EMAIL}`} className="w-fit hover:text-[var(--accent)]">
              {CONTACT_EMAIL}
            </a>
            <a href={CONTACT_PHONE_HREF} className="w-fit hover:text-[var(--accent)]">
              {CONTACT_PHONE}
            </a>
            <div className="mt-3 flex flex-wrap gap-4">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.id}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[var(--accent)]"
                >
                  {social.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-[var(--border-soft)] px-5 py-5 text-center text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
        © {new Date().getFullYear()} The Original Way · {copy.legal}
      </div>
    </footer>
  );
}
