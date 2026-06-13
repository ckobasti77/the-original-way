"use client";

import Image from "next/image";
import Link from "next/link";

import { useSettings } from "@/components/settings-provider";

import {
  CURATED_COLLECTIONS_COPY,
  type CuratedTrustIcon,
} from "./content";

const backgroundImage = "/assets/home-2nd/pozadina.avif";
const jacketImage = "/assets/home-2nd/jakna.avif";
const pantsImage = "/assets/home-2nd/trenerka.avif";
const sneakerImage = "/assets/home-2nd/patike.avif";

type ProductTileId = "footwear" | "apparel" | "casual";

type ProductTile = {
  className: string;
  href: string;
  id: ProductTileId;
  image: string;
  imageClassName: string;
  imageSizes: string;
  mobileImageClassName: string;
};

type TileCopy = {
  alt: string;
  label: string;
};

type TrustItemCopy = {
  detail: string;
  icon: CuratedTrustIcon;
  title: string;
};

const productTiles: ProductTile[] = [
  {
    className:
      "right-[3.1%] top-[7.2%] h-[29.5%] w-[36.2%] min-h-[220px] 2xl:h-[31%] 2xl:min-h-[238px]",
    href: "/proizvodi?category=patike",
    id: "footwear",
    image: sneakerImage,
    imageClassName: "inset-x-[4%] bottom-[7%] top-[22%]",
    imageSizes: "(min-width: 1024px) 34vw, 92vw",
    mobileImageClassName: "inset-x-[3%] bottom-[9%] top-[23%]",
  },
  {
    className:
      "right-[21.6%] top-[39.8%] h-[41.8%] w-[17.4%] min-h-[292px] 2xl:min-h-[326px]",
    href: "/proizvodi?category=jakne",
    id: "apparel",
    image: jacketImage,
    imageClassName: "inset-x-[1%] bottom-[-18%] top-[4%] scale-[1.2]",
    imageSizes: "(min-width: 1024px) 17vw, 44vw",
    mobileImageClassName: "inset-x-[-12%] bottom-[-28%] top-[6%] scale-[1.25]",
  },
  {
    className:
      "right-[3.1%] top-[39.8%] h-[41.8%] w-[17.4%] min-h-[292px] 2xl:min-h-[326px]",
    href: "/proizvodi?category=trenerke",
    id: "casual",
    image: pantsImage,
    imageClassName: "inset-x-[8%] bottom-[-15%] top-[4%] scale-[1.16]",
    imageSizes: "(min-width: 1024px) 17vw, 44vw",
    mobileImageClassName: "inset-x-[6%] bottom-[-21%] top-[7%] scale-[1.15]",
  },
];

const glassCardClass =
  "absolute z-20 overflow-hidden rounded-[1.35rem] border border-[rgba(255,255,255,0.55)] bg-[rgba(255,255,255,0.13)] shadow-[inset_0_1px_0_rgba(255,255,255,0.42),0_30px_80px_rgba(var(--shadow-rgb),0.25)] backdrop-blur-[22px]";

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

function TrustIcon({ icon }: { icon: CuratedTrustIcon }) {
  if (icon === "truck") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-9 w-9">
        <path
          d="M3 7.5h11.5v8H3zM14.5 10h3.2l3.3 3.1v2.4h-6.5z"
          fill="none"
          stroke="currentColor"
          strokeLinejoin="round"
          strokeWidth="1.45"
        />
        <path
          d="M6.6 18.2a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6ZM17.3 18.2a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.45"
        />
      </svg>
    );
  }

  if (icon === "shield") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-9 w-9">
        <path
          d="M12 3.2 19 6v5.1c0 4.4-2.7 8.1-7 9.7-4.3-1.6-7-5.3-7-9.7V6z"
          fill="none"
          stroke="currentColor"
          strokeLinejoin="round"
          strokeWidth="1.45"
        />
        <path
          d="m8.8 12 2 2 4.4-4.8"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.45"
        />
      </svg>
    );
  }

  if (icon === "return") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-9 w-9">
        <path
          d="M7 8.2H4V5.1M4.3 8.2a8 8 0 1 1-1.1 6.2"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.45"
        />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-9 w-9">
      <path
        d="m8.2 13.4-1.4 7 5.2-3.1 5.2 3.1-1.4-7"
        fill="none"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.45"
      />
      <path
        d="M12 3.2 14.1 7l4.2.8-2.9 3.1.5 4.3-3.9-1.8-3.9 1.8.5-4.3-2.9-3.1L9.9 7z"
        fill="none"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.45"
      />
    </svg>
  );
}

function ProductCard({
  ariaPrefix,
  tile,
  tileCopy,
}: {
  ariaPrefix: string;
  tile: ProductTile;
  tileCopy: TileCopy;
}) {
  return (
    <Link
      href={tile.href}
      prefetch={false}
      className={`${glassCardClass} group ${tile.className}`}
      aria-label={`${ariaPrefix} ${tileCopy.label}`}
    >
      <span
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_62%_52%,rgba(255,255,255,0.34),transparent_31%),linear-gradient(135deg,rgba(255,255,255,0.20),rgba(255,255,255,0.04)_58%,rgba(var(--shadow-rgb),0.18))]"
      />
      <span
        aria-hidden="true"
        className="absolute -right-[22%] -top-[30%] h-[120%] w-[82%] rounded-full border border-[rgba(255,255,255,0.20)]"
      />
      <span className="absolute left-[8.5%] top-[9%] z-10">
        <span className="block text-[0.82rem] font-bold uppercase tracking-[0.26em] text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.22)]">
          {tileCopy.label}
        </span>
        <span className="mt-3 block h-px w-8 bg-[var(--accent)]" />
      </span>
      <span className={`absolute z-10 ${tile.imageClassName}`}>
        <Image
          src={tile.image}
          alt={tileCopy.alt}
          fill
          sizes={tile.imageSizes}
          unoptimized
          className="object-contain drop-shadow-[0_24px_30px_rgba(0,0,0,0.32)] transition duration-500 group-hover:scale-[1.035]"
        />
      </span>
      <span className="absolute bottom-[7%] right-[6.5%] z-20 inline-flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(255,255,255,0.60)] bg-white/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.42)] backdrop-blur-md transition group-hover:translate-x-1 group-hover:bg-white/18">
        <ArrowIcon className="h-4 w-4" />
      </span>
    </Link>
  );
}

function TrustBar({
  items,
}: {
  items: readonly TrustItemCopy[];
}) {
  return (
    <div className="absolute inset-x-[4.8%] bottom-[4.2%] z-30 grid h-[84px] grid-cols-4 overflow-hidden rounded-[1.25rem] border border-[rgba(255,255,255,0.55)] bg-[var(--surface-strong)] text-[var(--text-primary)] shadow-[inset_0_1px_0_rgba(255,255,255,0.38),0_22px_52px_rgba(var(--shadow-rgb),0.14)] backdrop-blur-[20px] 2xl:bottom-[6.5%]">
      {items.map((item, index) => (
        <div
          key={item.title}
          className="relative flex min-w-0 items-center gap-5 px-[10%]"
        >
          {index > 0 ? (
            <span className="absolute left-0 top-1/2 h-10 w-px -translate-y-1/2 bg-[rgba(var(--accent-rgb),0.55)]" />
          ) : null}
          <span className="shrink-0 text-[var(--text-primary)]">
            <TrustIcon icon={item.icon} />
          </span>
          <span className="min-w-0">
            <span className="block text-[0.75rem] font-bold uppercase leading-none tracking-[0.24em]">
              {item.title}
            </span>
            <span className="mt-2 block text-[0.9rem] leading-none text-[var(--text-secondary)]">
              {item.detail}
            </span>
          </span>
        </div>
      ))}
    </div>
  );
}

function MobileProductCard({
  ariaPrefix,
  tile,
  tileCopy,
}: {
  ariaPrefix: string;
  tile: ProductTile;
  tileCopy: TileCopy;
}) {
  return (
    <Link
      href={tile.href}
      prefetch={false}
      className="group relative min-h-[16rem] overflow-hidden rounded-[1.15rem] border border-[rgba(255,255,255,0.60)] bg-[rgba(var(--shadow-rgb),0.16)] shadow-[inset_0_1px_0_rgba(255,255,255,0.46),0_22px_58px_rgba(var(--shadow-rgb),0.22)] backdrop-blur-[20px]"
      aria-label={`${ariaPrefix} ${tileCopy.label}`}
    >
      <span
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_62%_54%,rgba(255,255,255,0.32),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.18),rgba(var(--accent-rgb),0.12)_48%,rgba(var(--shadow-rgb),0.34))]"
      />
      <span className="absolute left-5 top-5 z-10 text-[0.75rem] font-bold uppercase tracking-[0.24em] text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.28)]">
        {tileCopy.label}
      </span>
      <span className="absolute left-5 top-11 z-10 h-px w-8 bg-[var(--accent)]" />
      <span className={`absolute z-10 ${tile.mobileImageClassName}`}>
        <Image
          src={tile.image}
          alt={tileCopy.alt}
          fill
          sizes="(max-width: 1023px) 88vw"
          unoptimized
          className="object-contain drop-shadow-[0_22px_30px_rgba(0,0,0,0.3)] transition duration-500 group-hover:scale-[1.03]"
        />
      </span>
    </Link>
  );
}

export function CuratedCollections() {
  const { language } = useSettings();
  const copy = CURATED_COLLECTIONS_COPY[language];

  return (
    <section
      aria-labelledby="curated-collections-title"
      className="relative isolate overflow-hidden bg-[var(--page-bg)] text-[var(--text-primary)]"
    >
      <div className="relative mx-auto hidden h-[min(860px,100svh)] min-h-[720px] max-w-[1680px] overflow-hidden lg:block 2xl:h-[828px]">
        <div className="absolute inset-y-0 right-0 z-0 w-[52%] overflow-hidden">
          <Image
            src={backgroundImage}
            alt=""
            fill
            sizes="52vw"
            unoptimized
            className="scale-105 object-cover object-[96%_50%] blur-[3px]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(var(--shadow-rgb),0.03),rgba(var(--shadow-rgb),0.18)_22%,rgba(var(--shadow-rgb),0.64)_100%)]" />
        </div>

        <div
          aria-hidden="true"
          className="absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_17%_44%,rgba(255,255,255,0.34),transparent_37%),linear-gradient(90deg,var(--page-bg)_0%,color-mix(in_srgb,var(--page-bg)_95%,transparent)_31%,color-mix(in_srgb,var(--page-bg)_54%,transparent)_47%,color-mix(in_srgb,var(--page-bg)_8%,transparent)_67%,transparent_100%)]"
        />
        <div
          aria-hidden="true"
          className="absolute left-[-8%] top-[21%] z-[2] h-[76%] w-[49%] rounded-full border border-[var(--border-soft)]"
        />
        <div
          aria-hidden="true"
          className="absolute left-[34.2%] top-[1%] z-[2] h-[87%] w-[29.6%] rounded-full border border-[var(--border-soft)] 2xl:left-[31.6%] 2xl:top-[-3%] 2xl:h-[92%] 2xl:w-[31%]"
        />

        <div className="absolute left-[35.5%] top-[3%] z-10 h-[79%] w-[27.5%] overflow-hidden rounded-full border border-[var(--border-soft)] shadow-[0_42px_92px_rgba(var(--shadow-rgb),0.16)] 2xl:left-[33.1%] 2xl:top-[-1.4%] 2xl:h-[83%] 2xl:w-[28.8%]">
          <Image
            src={backgroundImage}
            alt=""
            fill
            sizes="29vw"
            unoptimized
            className="object-cover object-[50%_50%]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),transparent_48%,rgba(var(--shadow-rgb),0.16))]" />
        </div>

        <div className="absolute left-[5%] top-[24%] z-20 w-[27%] 2xl:top-[21%]">
          <p className="text-[0.85rem] font-bold uppercase tracking-[0.42em] text-[var(--text-primary)]">
            {copy.eyebrow}
          </p>
          <h2
            id="curated-collections-title"
            className="font-display mt-5 text-[clamp(4.6rem,5.25vw,5.75rem)] font-medium leading-[0.94] tracking-normal text-[var(--text-primary)]"
          >
            {copy.titleLines[0]}
            <br />
            {copy.titleLines[1]}
          </h2>
          <span className="mt-8 block h-px w-[3.4rem] bg-[var(--accent)]" />
          <p className="mt-6 max-w-[22rem] text-[1.32rem] leading-[1.34] text-[var(--text-secondary)]">
            {copy.description}
          </p>
          <div className="mt-9 flex items-center gap-4 2xl:gap-6">
            <Link
              href={copy.primaryCta.href}
              prefetch={false}
              aria-label={copy.primaryCta.ariaLabel}
              className="tow-on-primary group inline-flex h-[58px] min-w-[204px] items-center justify-center gap-3 rounded-full bg-[var(--text-primary)] px-6 text-[0.92rem] font-bold shadow-[0_18px_40px_rgba(var(--shadow-rgb),0.24)] transition hover:-translate-y-0.5 hover:opacity-[0.92] 2xl:min-w-[245px] 2xl:gap-5 2xl:px-8 2xl:text-[1rem]"
            >
              {copy.primaryCta.label}
              <ArrowIcon className="h-5 w-5 transition group-hover:translate-x-1" />
            </Link>
            <Link
              href={copy.secondaryCta.href}
              prefetch={false}
              aria-label={copy.secondaryCta.ariaLabel}
              className="inline-flex h-[58px] min-w-[112px] items-center justify-center rounded-full border border-[var(--border-strong)] bg-[var(--surface)] px-6 text-[0.92rem] font-semibold text-[var(--text-primary)] transition hover:-translate-y-0.5 hover:bg-[var(--surface-strong)] 2xl:min-w-[138px] 2xl:px-8 2xl:text-[1rem]"
            >
              {copy.secondaryCta.label}
            </Link>
          </div>
        </div>

        {productTiles.map((tile) => (
          <ProductCard
            key={tile.id}
            ariaPrefix={copy.categoryAriaPrefix}
            tile={tile}
            tileCopy={copy.tiles[tile.id]}
          />
        ))}

        <TrustBar items={copy.trustItems} />
      </div>

      <div className="mx-auto grid max-w-3xl gap-8 px-5 py-12 sm:px-8 lg:hidden">
        <div>
          <p className="text-[0.72rem] font-bold uppercase tracking-[0.34em] text-[var(--text-primary)]">
            {copy.eyebrow}
          </p>
          <h2 className="font-display mt-4 text-[clamp(3.5rem,16vw,5.1rem)] font-medium leading-[0.94] tracking-normal text-[var(--text-primary)]">
            {copy.titleLines[0]}
            <br />
            {copy.titleLines[1]}
          </h2>
          <span className="mt-7 block h-px w-14 bg-[var(--accent)]" />
          <p className="mt-5 max-w-[22rem] text-lg leading-[1.35] text-[var(--text-secondary)]">
            {copy.description}
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              href={copy.primaryCta.href}
              prefetch={false}
              aria-label={copy.primaryCta.ariaLabel}
              className="tow-on-primary group inline-flex h-13 items-center justify-center gap-4 rounded-full bg-[var(--text-primary)] px-7 text-[0.95rem] font-bold shadow-[0_16px_34px_rgba(var(--shadow-rgb),0.22)]"
            >
              {copy.primaryCta.label}
              <ArrowIcon className="h-4 w-4 transition group-hover:translate-x-1" />
            </Link>
            <Link
              href={copy.secondaryCta.href}
              prefetch={false}
              aria-label={copy.secondaryCta.ariaLabel}
              className="inline-flex h-13 items-center justify-center rounded-full border border-[var(--border-strong)] bg-[var(--surface)] px-7 text-[0.95rem] font-semibold text-[var(--text-primary)]"
            >
              {copy.secondaryCta.label}
            </Link>
          </div>
        </div>

        <div className="relative min-h-[28rem] overflow-hidden rounded-[1.4rem] border border-[var(--border-soft)] shadow-[0_30px_70px_rgba(var(--shadow-rgb),0.16)]">
          <Image
            src={backgroundImage}
            alt={copy.heroAlt}
            fill
            sizes="(max-width: 1023px) 92vw"
            unoptimized
            className="object-cover object-[52%_50%]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_50%,rgba(var(--shadow-rgb),0.34))]" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {productTiles.map((tile) => (
            <MobileProductCard
              key={tile.id}
              ariaPrefix={copy.categoryAriaPrefix}
              tile={tile}
              tileCopy={copy.tiles[tile.id]}
            />
          ))}
        </div>

        <div className="grid gap-3 rounded-[1.15rem] border border-[var(--border-soft)] bg-[var(--surface-strong)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.38),0_18px_42px_rgba(var(--shadow-rgb),0.11)] backdrop-blur-[18px] sm:grid-cols-2">
          {copy.trustItems.map((item) => (
            <div key={item.title} className="flex items-center gap-4">
              <span className="shrink-0 text-[var(--text-primary)]">
                <TrustIcon icon={item.icon} />
              </span>
              <span>
                <span className="block text-[0.7rem] font-bold uppercase tracking-[0.2em] text-[var(--text-primary)]">
                  {item.title}
                </span>
                <span className="mt-1 block text-sm text-[var(--text-secondary)]">
                  {item.detail}
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
