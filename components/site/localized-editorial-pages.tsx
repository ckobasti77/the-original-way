"use client";

import Image from "next/image";
import Link from "next/link";

import { Navbar } from "@/components/home/navbar";
import { useSettings } from "@/components/settings-provider";
import { localizeHref, STORE_COPY } from "@/lib/storefront-i18n";
import {
  CONTACT_EMAIL,
  CONTACT_PHONE,
  CONTACT_PHONE_HREF,
  SOCIAL_LINKS,
} from "@/lib/site-contact";

import { ContactForm } from "./contact-form";

export function LocalizedAboutPage() {
  const { language } = useSettings();
  const copy = STORE_COPY[language].about;

  return (
    <main className="store-shell min-h-screen overflow-hidden text-[var(--text-primary)]">
      <Navbar />
      <section className="mx-auto grid max-w-7xl gap-14 px-5 pb-20 pt-32 lg:grid-cols-[1fr_0.8fr] lg:items-center lg:px-8 lg:pt-40">
        <div>
          <p className="store-eyebrow">{copy.eyebrow}</p>
          <h1 className="font-display mt-5 max-w-4xl text-6xl leading-[0.88] md:text-8xl">{copy.title}</h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-[var(--text-secondary)]">{copy.intro}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link className="store-button-primary" href={localizeHref("/proizvodi", language)}>
              {language === "sr" ? "Pogledajte kolekciju" : "Explore the edit"}
            </Link>
            <Link className="store-button-secondary" href={localizeHref("/kontakt", language)}>
              {STORE_COPY[language].common.contact}
            </Link>
          </div>
        </div>
        <div className="atelier-visual relative min-h-[34rem]">
          <div className="absolute inset-x-[7%] bottom-4 h-32 rounded-[50%] bg-[radial-gradient(ellipse,rgba(var(--accent-rgb),0.2),transparent_70%)] blur-xl" />
          <div className="absolute left-0 top-0 w-[68%] overflow-hidden rounded-[2rem] border border-[var(--border-soft)] shadow-[0_34px_90px_rgba(var(--shadow-rgb),0.2)]">
            <Image src="/assets/images/lacoste.avif" alt="" width={700} height={880} priority className="aspect-[4/5] object-cover" />
          </div>
          <div className="absolute bottom-0 right-0 w-[58%] overflow-hidden rounded-[2rem] border border-[var(--border-soft)] bg-[var(--surface-elevated)] p-5 shadow-[0_34px_90px_rgba(var(--shadow-rgb),0.22)]">
            <Image src="/assets/images/air-max.avif" alt="" width={640} height={640} className="aspect-square object-contain" />
          </div>
          <p className="premium-panel absolute bottom-[8%] left-[4%] max-w-[16rem] p-5 text-sm font-semibold leading-6">{copy.statement}</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <div className="grid gap-5 md:grid-cols-3">
          {copy.values.map(([title, text], index) => (
            <article key={title} className="premium-panel p-6">
              <span className="font-display text-4xl text-[var(--accent)]">0{index + 1}</span>
              <h2 className="mt-8 text-xl font-semibold">{title}</h2>
              <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">{text}</p>
            </article>
          ))}
        </div>
        <div className="mt-24 grid gap-10 lg:grid-cols-[0.8fr_1fr]">
          <div>
            <p className="store-eyebrow">{copy.sectionEyebrow}</p>
            <h2 className="font-display mt-4 text-5xl leading-[0.95] md:text-7xl">{copy.sectionTitle}</h2>
          </div>
          <div className="grid gap-6 text-lg leading-8 text-[var(--text-secondary)]">
            {copy.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
        </div>
      </section>
    </main>
  );
}

export function LocalizedContactPage() {
  const { language } = useSettings();
  const copy = STORE_COPY[language].contact;

  return (
    <main className="store-shell min-h-screen text-[var(--text-primary)]">
      <Navbar />
      <section className="mx-auto max-w-7xl px-5 pb-16 pt-32 lg:px-8 lg:pt-40">
        <p className="store-eyebrow">{copy.eyebrow}</p>
        <h1 className="font-display mt-5 max-w-4xl text-6xl leading-[0.88] md:text-8xl">{copy.title}</h1>
        <p className="mt-7 max-w-2xl text-lg leading-8 text-[var(--text-secondary)]">{copy.intro}</p>
      </section>
      <section className="mx-auto grid max-w-7xl gap-7 px-5 pb-24 lg:grid-cols-[1fr_0.62fr] lg:px-8">
        <ContactForm />
        <aside className="premium-panel p-6">
          <p className="store-eyebrow">{copy.direct}</p>
          <div className="mt-5 grid gap-3">
            <a className="store-button-secondary justify-start normal-case tracking-normal" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
            <a className="store-button-secondary justify-start normal-case tracking-normal" href={CONTACT_PHONE_HREF}>{CONTACT_PHONE}</a>
          </div>
          <p className="store-eyebrow mt-10">{copy.socials}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            {SOCIAL_LINKS.map((social) => (
              <a key={social.id} href={social.href} target="_blank" rel="noreferrer" className="store-button-secondary">{social.label}</a>
            ))}
          </div>
        </aside>
      </section>
    </main>
  );
}
