"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef } from "react";
import { useQuery } from "convex/react";

import { useSettings } from "@/components/settings-provider";
import { api } from "@/convex/_generated/api";
import { localizeHref } from "@/lib/storefront-i18n";
import { formatShopPrice } from "@/lib/shop-taxonomy";

const COPY = {
  sr: {
    openingEyebrow: "The Original Way edit",
    openingTitle: "Originalno,\nbez buke.",
    openingBody:
      "Evropski komadi birani po kroju, materijalu i načinu na koji se stvarno nose. Bez beskrajnog kataloga. Bez generičnog resellinga.",
    openingCta: "Pogledaj selekciju",
    storyEyebrow: "Kolekcija / 2026",
    storyTitle: "Manje stvari.\nBolje izabranih.",
    storyBody:
      "Svaki drop ostaje dovoljno mali da svaki komad ima razlog da bude tu.",
    categoriesEyebrow: "Izaberi pravac",
    categoriesTitle: "Tri ulaza. Jedan standard.",
    categories: [
      ["Obuća", "Patike i cipele", "/proizvodi?category=patike"],
      ["Garderoba", "Jakne i slojevi", "/proizvodi?category=jakne"],
      ["Casual", "Komadi za svaki dan", "/proizvodi?category=trenerke"],
    ],
    selectedEyebrow: "Izdvojeno",
    selectedTitle: "Komadi koji nose celu kombinaciju.",
    selectedCta: "Svi proizvodi",
    standards: [
      ["Poreklo", "Originalni proizvodi", "Jasno poreklo i pažljivo odabran asortiman."],
      ["Kontrola", "Provera pre slanja", "Svaki komad pregledamo pre pakovanja."],
      ["Ritam", "Dostava 1–3 dana", "Brza potvrda i direktna komunikacija."],
    ],
    finalEyebrow: "Treba vam pomoć?",
    finalTitle: "Pravi komad ne traži dugo objašnjenje.",
    finalBody:
      "Pošaljite nam veličinu ili model koji gledate. Odgovorićemo direktno.",
    finalPrimary: "Otvori katalog",
    finalSecondary: "Kontakt",
  },
  en: {
    openingEyebrow: "The Original Way edit",
    openingTitle: "Original,\nwithout noise.",
    openingBody:
      "European pieces selected for cut, material, and the way they are actually worn. No endless catalog. No generic reselling.",
    openingCta: "Explore the selection",
    storyEyebrow: "Collection / 2026",
    storyTitle: "Fewer pieces.\nBetter chosen.",
    storyBody:
      "Every drop stays small enough for each piece to have a reason to be there.",
    categoriesEyebrow: "Choose a direction",
    categoriesTitle: "Three entrances. One standard.",
    categories: [
      ["Footwear", "Sneakers and shoes", "/proizvodi?category=patike"],
      ["Apparel", "Jackets and layers", "/proizvodi?category=jakne"],
      ["Casual", "Pieces for every day", "/proizvodi?category=trenerke"],
    ],
    selectedEyebrow: "Selected",
    selectedTitle: "Pieces that carry the whole look.",
    selectedCta: "All products",
    standards: [
      ["Source", "Original products", "Clear provenance and a carefully selected range."],
      ["Control", "Checked before shipping", "Every piece is inspected before packing."],
      ["Timing", "Delivery in 1–3 days", "Fast confirmation and direct communication."],
    ],
    finalEyebrow: "Need help?",
    finalTitle: "The right piece does not need a long explanation.",
    finalBody:
      "Send the size or model you are considering. We will answer directly.",
    finalPrimary: "Open catalog",
    finalSecondary: "Contact",
  },
} as const;

const CATEGORY_IMAGES = [
  "/assets/home-2nd/patike.avif",
  "/assets/home-2nd/jakna.avif",
  "/assets/home-2nd/trenerka.avif",
] as const;

type FeaturedProduct = {
  _id: string;
  name: string;
  slug: string;
  salePrice: number;
  imageUrls: string[];
  brand?: { name: string } | null;
};

function Arrow() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 12h15M14 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PostHeroStorefront() {
  const { language } = useSettings();
  const copy = COPY[language];
  const rootRef = useRef<HTMLDivElement>(null);
  const productsResult = useQuery(api.products.list);
  const featured = useMemo<FeaturedProduct[]>(() => {
    return (productsResult?.slice(0, 3) ?? []) as FeaturedProduct[];
  }, [productsResult]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const elements = [...root.querySelectorAll<HTMLElement>("[data-editorial-reveal]")];
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.visible = "true";
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.08 },
    );
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={rootRef} className="post-hero-editorial">
      <section className="editorial-opening">
        <div className="editorial-wrap grid gap-16 lg:grid-cols-[1.15fr_0.65fr] lg:items-end">
          <div data-editorial-reveal>
            <p className="editorial-kicker">{copy.openingEyebrow}</p>
            <h2 className="editorial-display mt-8 whitespace-pre-line">{copy.openingTitle}</h2>
          </div>
          <div data-editorial-reveal className="max-w-md lg:pb-4">
            <p className="text-base leading-8 text-[var(--text-secondary)] md:text-lg">
              {copy.openingBody}
            </p>
            <Link href={localizeHref("/proizvodi", language)} className="editorial-text-link mt-8">
              {copy.openingCta}
              <Arrow />
            </Link>
          </div>
        </div>
      </section>

      <section className="editorial-story editorial-wrap">
        <div className="grid min-h-[42rem] overflow-hidden lg:grid-cols-[0.78fr_1.22fr]">
          <div className="relative z-10 flex flex-col justify-between bg-[var(--ink)] px-7 py-10 text-[var(--porcelain)] md:px-12 md:py-14">
            <p className="editorial-kicker !text-white/55">{copy.storyEyebrow}</p>
            <div data-editorial-reveal>
              <h2 className="font-display whitespace-pre-line text-5xl leading-[0.91] md:text-7xl">
                {copy.storyTitle}
              </h2>
              <p className="mt-7 max-w-sm text-base leading-7 text-white/68">{copy.storyBody}</p>
            </div>
          </div>
          <div className="relative min-h-[34rem] overflow-hidden">
            <Image
              src="/assets/home-2nd/pozadina.avif"
              alt=""
              fill
              sizes="(min-width: 1024px) 65vw, 100vw"
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(25,25,28,0.12),transparent_45%)]" />
          </div>
        </div>
      </section>

      <section className="editorial-categories">
        <div className="editorial-wrap">
          <div data-editorial-reveal className="grid gap-8 lg:grid-cols-[0.7fr_1fr] lg:items-end">
            <p className="editorial-kicker">{copy.categoriesEyebrow}</p>
            <h2 className="font-display text-5xl leading-[0.95] md:text-7xl">{copy.categoriesTitle}</h2>
          </div>
          <div className="mt-16 grid gap-px bg-[var(--border-soft)] md:grid-cols-3">
            {copy.categories.map(([title, subtitle, href], index) => (
              <Link
                key={title}
                href={localizeHref(href, language)}
                data-editorial-reveal
                className="editorial-category group bg-[var(--page-bg)] px-5 py-8 md:px-8 md:py-10"
              >
                <div className="atelier-product-plane relative aspect-[4/5] overflow-hidden">
                  <span aria-hidden="true" className="atelier-plane-shadow" />
                  <Image
                    src={CATEGORY_IMAGES[index]}
                    alt=""
                    fill
                    sizes="(min-width: 768px) 32vw, 92vw"
                    className="relative z-10 object-contain p-[10%] transition duration-700 group-hover:-translate-y-2 group-hover:scale-[1.025]"
                  />
                </div>
                <div className="mt-7 flex items-end justify-between gap-4">
                  <div>
                    <h3 className="font-display text-3xl">{title}</h3>
                    <p className="mt-2 text-sm text-[var(--text-muted)]">{subtitle}</p>
                  </div>
                  <span className="mb-1 transition group-hover:translate-x-1"><Arrow /></span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="editorial-featured">
        <div className="editorial-wrap">
          <div data-editorial-reveal className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="editorial-kicker">{copy.selectedEyebrow}</p>
              <h2 className="font-display mt-5 max-w-3xl text-5xl leading-[0.94] md:text-7xl">
                {copy.selectedTitle}
              </h2>
            </div>
            <Link href={localizeHref("/proizvodi", language)} className="editorial-text-link">
              {copy.selectedCta}
              <Arrow />
            </Link>
          </div>
          <div className="mt-16 grid gap-12 md:grid-cols-3">
            {featured.map((product, index) => (
              <Link
                key={product._id}
                href={localizeHref(`/proizvodi/${product.slug}`, language)}
                data-editorial-reveal
                className="editorial-product group"
                style={{ transitionDelay: `${index * 70}ms` }}
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-[var(--surface-soft)]">
                  <span aria-hidden="true" className="atelier-plane-shadow" />
                  {product.imageUrls[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.imageUrls[0]}
                      alt={product.name}
                      className="relative z-10 h-full w-full object-contain p-[9%] transition duration-700 group-hover:-translate-y-2 group-hover:scale-[1.025]"
                    />
                  ) : null}
                </div>
                <div className="mt-6 border-t border-[var(--border-soft)] pt-5">
                  <p className="editorial-kicker">{product.brand?.name ?? "The Original Way"}</p>
                  <div className="mt-3 flex items-start justify-between gap-5">
                    <h3 className="text-lg font-semibold">{product.name}</h3>
                    <p className="shrink-0 text-sm font-semibold">{formatShopPrice(product.salePrice)}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="editorial-standards border-y border-[var(--border-soft)]">
        <div className="editorial-wrap grid md:grid-cols-3">
          {copy.standards.map(([label, title, text], index) => (
            <article
              key={title}
              data-editorial-reveal
              className={`py-10 md:px-9 md:py-14 ${index ? "border-t border-[var(--border-soft)] md:border-l md:border-t-0" : ""}`}
            >
              <span className="editorial-kicker !text-[var(--accent)]">{label}</span>
              <h3 className="mt-8 text-lg font-semibold">{title}</h3>
              <p className="mt-3 max-w-xs text-sm leading-6 text-[var(--text-secondary)]">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="editorial-final">
        <div className="editorial-wrap grid gap-12 lg:grid-cols-[1fr_0.55fr] lg:items-end">
          <div data-editorial-reveal>
            <p className="editorial-kicker">{copy.finalEyebrow}</p>
            <h2 className="font-display mt-6 max-w-4xl text-6xl leading-[0.9] md:text-8xl">
              {copy.finalTitle}
            </h2>
          </div>
          <div data-editorial-reveal>
            <p className="text-base leading-7 text-[var(--text-secondary)]">{copy.finalBody}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={localizeHref("/proizvodi", language)} className="store-button-primary">
                {copy.finalPrimary}
              </Link>
              <Link href={localizeHref("/kontakt", language)} className="store-button-secondary">
                {copy.finalSecondary}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
