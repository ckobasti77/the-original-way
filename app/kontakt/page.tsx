import type { Metadata } from "next";
import Link from "next/link";

import { Navbar } from "@/components/home/navbar";
import { ContactForm } from "@/components/site/contact-form";
import { ContactIcon } from "@/components/site/contact-icons";
import {
  CONTACT_CHANNELS,
  CONTACT_EMAIL,
  CONTACT_PHONE,
  CONTACT_PHONE_HREF,
  SOCIAL_LINKS,
} from "@/lib/site-contact";

export const metadata: Metadata = {
  title: "Kontakt | The Original Way",
  description:
    "Kontakt forma, email, telefon i social kanali za The Original Way butik.",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[var(--page-bg)] text-[var(--text-primary)]">
      <Navbar />

      <section className="relative border-b border-[var(--border-soft)] px-4 pb-12 pt-28 md:px-8 md:pb-16">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(135deg,rgba(var(--accent-rgb),0.18),transparent_32%),radial-gradient(circle_at_82%_18%,rgba(255,255,255,0.2),transparent_30%),linear-gradient(180deg,var(--page-bg),var(--page-bg-deep))]" />
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(22rem,0.7fr)] lg:items-end">
          <div>
            <p className="reveal-line" />
            <p className="mt-6 text-xs font-bold uppercase tracking-[0.28em] text-[var(--text-muted)]">
              Kontakt / The Original Way
            </p>
            <h1 className="font-display mt-5 text-6xl font-semibold leading-[0.9] tracking-normal md:text-8xl">
              Tu smo za svaki ozbiljan upit.
            </h1>
            <p className="mt-6 max-w-2xl text-lg font-semibold leading-8 text-[var(--text-secondary)]">
              Pitajte za velicinu, dostupnost, rezervaciju ili pomoc oko izbora.
              Najbrze je pozivom ili emailom, a aktivni smo i na social kanalima.
            </p>
          </div>

          <div className="grid gap-3 rounded-lg border border-[var(--border-soft)] bg-[var(--surface-strong)] p-4 shadow-[0_24px_64px_rgba(var(--shadow-rgb),0.12)] backdrop-blur-2xl">
            {CONTACT_CHANNELS.slice(0, 2).map((channel) => (
              <a
                key={channel.id}
                href={channel.href}
                className="grid grid-cols-[2.75rem_1fr] items-center gap-3 rounded-md border border-[var(--border-soft)] bg-[var(--surface)] p-3 hover:border-[var(--border-strong)]"
              >
                <span className="grid h-11 w-11 place-items-center rounded-full bg-[rgba(var(--accent-rgb),0.10)] text-[var(--text-primary)]">
                  <ContactIcon id={channel.id} />
                </span>
                <span className="min-w-0">
                  <span className="block text-[0.68rem] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">
                    {channel.label}
                  </span>
                  <span className="mt-1 block truncate text-base font-bold">
                    {channel.detail}
                  </span>
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-10 md:px-8 md:py-14">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,0.86fr)_minmax(20rem,0.64fr)]">
          <ContactForm />

          <aside className="grid gap-4">
            <div className="rounded-lg border border-[var(--border-soft)] bg-[var(--surface-strong)] p-5 backdrop-blur-xl">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--text-muted)]">
                Direktno
              </p>
              <div className="mt-5 grid gap-3">
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="rounded-md border border-[var(--border-soft)] bg-[var(--surface)] px-4 py-3 text-sm font-bold hover:border-[var(--border-strong)]"
                >
                  {CONTACT_EMAIL}
                </a>
                <a
                  href={CONTACT_PHONE_HREF}
                  className="rounded-md border border-[var(--border-soft)] bg-[var(--surface)] px-4 py-3 text-sm font-bold hover:border-[var(--border-strong)]"
                >
                  {CONTACT_PHONE}
                </a>
              </div>
            </div>

            <div className="rounded-lg border border-[var(--border-soft)] bg-[var(--surface-strong)] p-5 backdrop-blur-xl">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--text-muted)]">
                Socials
              </p>
              <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
                {SOCIAL_LINKS.map((social) => (
                  <a
                    key={social.id}
                    href={social.href}
                    rel="noreferrer"
                    target="_blank"
                    className="grid grid-cols-[2.25rem_1fr] items-center gap-3 rounded-md border border-[var(--border-soft)] bg-[var(--surface)] px-3 py-3 hover:border-[var(--border-strong)]"
                  >
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-[rgba(var(--accent-rgb),0.10)]">
                      <ContactIcon className="h-4 w-4" id={social.id} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-bold">{social.label}</span>
                      <span className="block truncate text-xs font-semibold text-[var(--text-muted)]">
                        {social.detail}
                      </span>
                    </span>
                  </a>
                ))}
              </div>
            </div>

            <Link
              href="/proizvodi"
              className="tow-on-primary inline-flex min-h-11 items-center justify-center rounded-md bg-[var(--text-primary)] px-5 text-xs font-bold uppercase tracking-[0.16em] hover:opacity-90"
            >
              Nazad na katalog
            </Link>
          </aside>
        </div>
      </section>
    </main>
  );
}
