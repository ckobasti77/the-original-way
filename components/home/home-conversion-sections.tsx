"use client";

import Image from "next/image";
import Link from "next/link";

import { useSettings } from "@/components/settings-provider";
import { ContactIcon } from "@/components/site/contact-icons";
import {
  CONTACT_EMAIL,
  CONTACT_PHONE,
  CONTACT_PHONE_HREF,
  SOCIAL_LINKS,
} from "@/lib/site-contact";
import logo from "@/public/logos/logo.png";

import { BRAND_NAME, HOME_CONVERSION_COPY } from "./content";
import { RecommendedProductsCarousel } from "./recommended-products-carousel";

type ProofCopy = {
  benefits: readonly {
    text: string;
    title: string;
  }[];
  description: string;
  eyebrow: string;
  quote: string;
  quoteByline: string;
  stats: readonly {
    label: string;
    value: string;
  }[];
  title: string;
};

type FinalCtaCopy = {
  description: string;
  eyebrow: string;
  faqs: readonly {
    answer: string;
    question: string;
  }[];
  primaryCta: string;
  secondaryCta: string;
  title: string;
};

type FooterCopy = {
  contactHeading: string;
  legal: string;
  links: readonly {
    href: string;
    label: string;
  }[];
  shopHeading: string;
  socialHeading: string;
  supportHeading: string;
  tagline: string;
};

function ArrowIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.7"
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

function ProofSection({
  copy,
}: {
  copy: ProofCopy;
}) {
  return (
    <section className="relative overflow-hidden border-y border-[var(--border-soft)] bg-[rgba(var(--accent-rgb),0.045)] px-4 py-14 md:px-8 md:py-20">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,0.78fr)_minmax(22rem,0.62fr)] lg:items-start">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-[var(--text-muted)]">
            {copy.eyebrow}
          </p>
          <h2 className="font-display mt-4 text-[clamp(3.2rem,6.5vw,6.6rem)] font-semibold leading-[0.9] tracking-normal text-[var(--text-primary)]">
            {copy.title}
          </h2>
          <p className="mt-6 max-w-2xl text-lg font-semibold leading-8 text-[var(--text-secondary)]">
            {copy.description}
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {copy.stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-lg border border-[var(--border-soft)] bg-[var(--surface)] p-4 backdrop-blur-xl"
              >
                <p className="text-[0.68rem] font-bold uppercase tracking-[0.22em] text-[var(--text-muted)]">
                  {stat.label}
                </p>
                <p className="mt-2 text-2xl font-bold text-[var(--text-primary)]">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-lg border border-[var(--border-soft)] bg-[var(--surface-strong)] p-5 shadow-[0_24px_64px_rgba(var(--shadow-rgb),0.12)] backdrop-blur-2xl">
            <p className="font-display text-3xl font-semibold leading-tight text-[var(--text-primary)]">
              &quot;{copy.quote}&quot;
            </p>
            <p className="mt-5 text-xs font-bold uppercase tracking-[0.24em] text-[var(--text-muted)]">
              {copy.quoteByline}
            </p>
          </div>

          <div className="grid gap-3">
            {copy.benefits.map((benefit, index) => (
              <article
                key={benefit.title}
                className="grid grid-cols-[2.75rem_1fr] gap-4 rounded-lg border border-[var(--border-soft)] bg-[var(--surface)] p-4 backdrop-blur-xl"
              >
                <span className="grid h-11 w-11 place-items-center rounded-full border border-[var(--border-soft)] bg-[rgba(var(--accent-rgb),0.10)] text-sm font-bold text-[var(--text-primary)]">
                  0{index + 1}
                </span>
                <span>
                  <span className="block text-base font-bold text-[var(--text-primary)]">
                    {benefit.title}
                  </span>
                  <span className="mt-1 block text-sm font-semibold leading-6 text-[var(--text-secondary)]">
                    {benefit.text}
                  </span>
                </span>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FinalCtaSection({
  copy,
}: {
  copy: FinalCtaCopy;
}) {
  return (
    <section className="relative overflow-hidden px-4 py-14 md:px-8 md:py-20">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,0.76fr)_minmax(23rem,0.64fr)] lg:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-[var(--text-muted)]">
            {copy.eyebrow}
          </p>
          <h2 className="font-display mt-4 text-[clamp(3.5rem,7vw,7rem)] font-semibold leading-[0.88] tracking-normal text-[var(--text-primary)]">
            {copy.title}
          </h2>
          <p className="mt-6 max-w-2xl text-lg font-semibold leading-8 text-[var(--text-secondary)]">
            {copy.description}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/proizvodi"
              prefetch={false}
              className="tow-on-primary inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-[var(--text-primary)] px-7 text-sm font-bold uppercase tracking-[0.16em] shadow-[0_18px_42px_rgba(var(--shadow-rgb),0.18)] hover:-translate-y-0.5"
            >
              {copy.primaryCta}
              <ArrowIcon className="h-4 w-4" />
            </Link>
            <Link
              href="/kontakt"
              prefetch={false}
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--border-soft)] bg-[var(--surface)] px-7 text-sm font-bold uppercase tracking-[0.16em] text-[var(--text-primary)] hover:-translate-y-0.5 hover:border-[var(--border-strong)]"
            >
              {copy.secondaryCta}
            </Link>
          </div>
        </div>

        <div className="grid gap-3">
          {copy.faqs.map((faq) => (
            <article
              key={faq.question}
              className="rounded-lg border border-[var(--border-soft)] bg-[var(--surface-strong)] p-5 shadow-[0_18px_48px_rgba(var(--shadow-rgb),0.08)] backdrop-blur-xl"
            >
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                {faq.question}
              </h3>
              <p className="mt-2 text-sm font-semibold leading-6 text-[var(--text-secondary)]">
                {faq.answer}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HomeFooter({
  copy,
}: {
  copy: FooterCopy;
}) {
  const shopLinks = copy.links.slice(0, 3);
  const supportLinks = copy.links.slice(3);

  return (
    <footer className="border-t border-[var(--border-soft)] bg-[var(--page-bg-deep)] px-4 py-10 text-[var(--text-primary)] md:px-8 md:py-12">
      <div className="mx-auto grid max-w-7xl gap-9 lg:grid-cols-[minmax(0,1fr)_minmax(34rem,0.9fr)]">
        <div>
          <Link
            href="/"
            scroll={false}
            className="inline-flex items-center gap-3 whitespace-nowrap"
            aria-label={BRAND_NAME}
          >
            <Image
              src={logo}
              alt=""
              aria-hidden="true"
              className="h-12 w-12 shrink-0 object-contain md:h-14 md:w-14"
              sizes="56px"
            />
            <span className="font-display text-4xl font-semibold leading-none tracking-normal">
              {BRAND_NAME}
            </span>
          </Link>
          <p className="mt-5 max-w-xl text-base font-semibold leading-7 text-[var(--text-secondary)]">
            {copy.tagline}
          </p>
          <div className="mt-6 grid gap-2 text-sm font-bold text-[var(--text-secondary)]">
            <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-[var(--text-primary)]">
              {CONTACT_EMAIL}
            </a>
            <a href={CONTACT_PHONE_HREF} className="hover:text-[var(--text-primary)]">
              {CONTACT_PHONE}
            </a>
          </div>
        </div>

        <div className="grid gap-7 sm:grid-cols-3">
          <nav aria-label={copy.shopHeading}>
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-[var(--text-muted)]">
              {copy.shopHeading}
            </p>
            <div className="mt-4 grid gap-3">
              {shopLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  prefetch={false}
                  className="text-sm font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>

          <nav aria-label={copy.supportHeading}>
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-[var(--text-muted)]">
              {copy.supportHeading}
            </p>
            <div className="mt-4 grid gap-3">
              {supportLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  prefetch={false}
                  className="text-sm font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>

          <div>
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-[var(--text-muted)]">
              {copy.socialHeading}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.id}
                  href={social.href}
                  rel="noreferrer"
                  target="_blank"
                  aria-label={social.label}
                  className="grid h-10 w-10 place-items-center rounded-full border border-[var(--border-soft)] bg-[var(--surface)] text-[var(--text-primary)] hover:-translate-y-0.5 hover:border-[var(--border-strong)]"
                >
                  <ContactIcon className="h-4 w-4" id={social.id} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-10 flex max-w-7xl flex-col gap-3 border-t border-[var(--border-soft)] pt-5 text-[0.72rem] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)] sm:flex-row sm:items-center sm:justify-between">
        <p>
          &copy; 2026 {BRAND_NAME}. {copy.legal}
        </p>
        <p>{copy.contactHeading}</p>
      </div>
    </footer>
  );
}

export function HomeConversionSections() {
  const { language } = useSettings();
  const copy = HOME_CONVERSION_COPY[language];

  return (
    <>
      <RecommendedProductsCarousel />
      <ProofSection copy={copy.proof} />
      <FinalCtaSection copy={copy.finalCta} />
    </>
  );
}
