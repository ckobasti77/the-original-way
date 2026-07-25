"use client";

import Link from "next/link";
import {
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useQuery } from "convex/react";

import { useSettings } from "@/components/settings-provider";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { sampleShopProducts } from "@/lib/shop-sample-data";
import { formatShopPrice, type ProductGender, type ProductType } from "@/lib/shop-taxonomy";

const fallbackRecommendedProducts: RecommendedProduct[] = sampleShopProducts.map((p) => ({
  _id: p.id as Id<"products">,
  name: p.name,
  description: p.description,
  slug: p.slug,
  type: p.type,
  gender: p.gender,
  salePrice: p.salePrice,
  imageUrls: p.imageUrls,
  brand: p.brand ? { _id: p.brand.id as Id<"brands">, name: p.brand.name } : null,
  isRecommended: true,
  recommendationOrder: 1,
}));

type RecommendedProduct = {
  _id: Id<"products">;
  name: string;
  description: string;
  slug: string;
  type: ProductType;
  gender: ProductGender;
  salePrice: number;
  imageUrls: string[];
  brand?: { _id: Id<"brands">; name: string } | null;
  isRecommended?: boolean;
  recommendationOrder?: number;
};

const COPY = {
  sr: {
    eyebrow: "Preporuceno",
    title: "Komadi izdvojeni za prvi pogled.",
    ariaLabel: "Preporuceni proizvodi",
  },
  en: {
    eyebrow: "Recommended",
    title: "Pieces selected for the first look.",
    ariaLabel: "Recommended products",
  },
} as const;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function getWrappedOffset(index: number, activeIndex: number, count: number) {
  let offset = index - activeIndex;

  if (offset > count / 2) {
    offset -= count;
  }

  if (offset < -count / 2) {
    offset += count;
  }

  return offset;
}

function ProductVisual({
  product,
  compact = false,
}: {
  compact?: boolean;
  product: RecommendedProduct;
}) {
  const imageUrl = product.imageUrls[0];
  const brandName = product.brand?.name ?? "The Original Way";

  return (
    <article className="group relative flex h-full min-h-0 flex-col overflow-hidden rounded-lg border border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--surface-strong)_78%,transparent)] shadow-[0_34px_90px_rgba(var(--shadow-rgb),0.18)] backdrop-blur-2xl">
      <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_50%_42%,rgba(var(--accent-rgb),0.20),transparent_45%),linear-gradient(180deg,rgba(255,255,255,0.08),rgba(var(--shadow-rgb),0.08))] px-5 py-7">
        <span
          aria-hidden="true"
          className="absolute inset-x-[18%] bottom-8 h-10 rounded-full bg-[rgba(var(--shadow-rgb),0.22)] blur-xl"
        />
        {imageUrl ? (
          // Dynamic Convex/external URLs intentionally use a plain img.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={product.name}
            draggable={false}
            className="relative z-10 h-full max-h-[13rem] md:max-h-[16rem] w-full object-contain drop-shadow-[0_34px_38px_rgba(var(--shadow-rgb),0.26)] transition duration-500 group-hover:scale-[1.035]"
          />
        ) : (
          <div className="relative z-10 grid aspect-[4/5] w-full max-w-[16rem] place-items-center rounded-lg border border-[var(--border-soft)] bg-[rgba(var(--accent-rgb),0.08)] text-sm font-bold uppercase tracking-[0.26em] text-[var(--text-muted)]">
            TOW
          </div>
        )}
      </div>

      <div className={`${compact ? "p-4" : "p-5"} bg-[rgba(var(--shadow-rgb),0.035)]`}>
        <p className="text-[0.68rem] font-bold uppercase tracking-[0.24em] text-[var(--text-muted)]">
          {brandName}
        </p>
        <h3 className="mt-2 text-xl font-semibold leading-tight text-[var(--text-primary)]">
          {product.name}
        </h3>
        <p className="mt-3 text-sm font-bold text-[var(--text-primary)]">
          {formatShopPrice(product.salePrice)}
        </p>
      </div>
    </article>
  );
}

function SingleProductFallback({ product }: { product: RecommendedProduct }) {
  return (
    <div className="mx-auto mt-10 max-w-sm">
      <Link href={`/proizvodi/${product.slug}`} prefetch={false} className="block h-[26rem]">
        <ProductVisual product={product} compact />
      </Link>
    </div>
  );
}

function CarouselRing({ products }: { products: RecommendedProduct[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartXRef = useRef<number | null>(null);
  const hasDraggedRef = useRef(false);
  const count = products.length;

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const sync = () => setIsMobile(media.matches);

    sync();
    media.addEventListener("change", sync);

    return () => {
      media.removeEventListener("change", sync);
    };
  }, []);

  const step = (direction: -1 | 1) => {
    setActiveIndex((current) => (current + direction + count) % count);
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    dragStartXRef.current = event.clientX;
    hasDraggedRef.current = false;
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const startX = dragStartXRef.current;

    if (startX === null) {
      return;
    }

    const deltaX = event.clientX - startX;

    if (Math.abs(deltaX) > 10) {
      hasDraggedRef.current = true;
    }

    if (Math.abs(deltaX) < 42) {
      return;
    }

    step(deltaX > 0 ? -1 : 1);
    dragStartXRef.current = event.clientX;
  };

  const handlePointerUp = () => {
    dragStartXRef.current = null;
    setIsDragging(false);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      step(1);
    }

    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      step(-1);
    }
  };

  const geometry = useMemo(() => {
    const angleStep = 360 / count;
    const radius = isMobile ? 140 : clamp(240 + count * 18, 300, 440);

    return products.map((product, index) => {
      const offset = getWrappedOffset(index, activeIndex, count);
      const angle = isMobile ? -offset * 11 : offset * angleStep;
      const depth = isMobile
        ? 1 - Math.min(Math.abs(offset) * 0.28, 0.9)
        : Math.cos((angle * Math.PI) / 180);
      const distance = Math.abs(offset);
      const scale = clamp(0.78 + (depth + 1) * 0.12, 0.74, 1);
      const opacity = isMobile
        ? distance > 2
          ? 0
          : clamp(1 - distance * 0.26, 0.36, 1)
        : distance > Math.ceil(count / 2)
          ? 0
          : clamp(0.28 + (depth + 1) * 0.32, 0.24, 1);
      const transform = isMobile
        ? `translate(-50%, -50%) translateX(${offset * 44}px) translateZ(${-distance * 48}px) rotateY(${angle}deg) scale(${scale})`
        : `translate(-50%, -50%) rotateY(${angle}deg) translateZ(${radius}px) scale(${scale})`;

      return {
        angle,
        isActive: offset === 0,
        opacity,
        product,
        scale,
        zIndex: Math.round((depth + 1) * 100),
        transform,
      };
    });
  }, [activeIndex, count, isMobile, products]);

  return (
    <div
      aria-roledescription="carousel"
      className="recommended-carousel-stage relative mx-auto mt-10 h-[29rem] w-full max-w-6xl select-none outline-none md:h-[32rem]"
      onKeyDown={handleKeyDown}
      onPointerCancel={handlePointerUp}
      onPointerDown={handlePointerDown}
      onPointerLeave={handlePointerUp}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      role="region"
      style={{
        perspective: isMobile ? "950px" : "1400px",
        cursor: isDragging ? "grabbing" : "grab",
        touchAction: "pan-y",
      }}
      tabIndex={0}
    >
      <div className="absolute inset-0 rounded-[50%] border border-[var(--border-soft)] opacity-40" />

      {/* Left and Right Arrow Buttons */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          step(-1);
        }}
        aria-label="Prethodni proizvod"
        className="absolute left-2 top-1/2 z-30 -translate-y-1/2 flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full border border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--surface-strong)_85%,transparent)] text-[var(--text-primary)] shadow-[0_4px_20px_rgba(var(--shadow-rgb),0.15)] backdrop-blur-md transition hover:bg-[var(--surface-strong)] hover:scale-105 active:scale-95 cursor-pointer"
      >
        <svg className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          step(1);
        }}
        aria-label="Sledeci proizvod"
        className="absolute right-2 top-1/2 z-30 -translate-y-1/2 flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full border border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--surface-strong)_85%,transparent)] text-[var(--text-primary)] shadow-[0_4px_20px_rgba(var(--shadow-rgb),0.15)] backdrop-blur-md transition hover:bg-[var(--surface-strong)] hover:scale-105 active:scale-95 cursor-pointer"
      >
        <svg className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <div
        className="absolute left-1/2 top-1/2 h-[25rem] w-[15rem] md:h-[28rem] md:w-[18rem]"
        style={{ transform: "translate(-50%, -50%)", transformStyle: "preserve-3d" }}
      >
        {geometry.map(({ isActive, opacity, product, transform, zIndex }) => {
          const style = {
            opacity,
            transform,
            transformStyle: "preserve-3d",
            zIndex,
          } satisfies CSSProperties;

          return (
            <Link
              aria-current={isActive ? "true" : undefined}
              className="recommended-carousel-item absolute left-1/2 top-1/2 block h-[24rem] w-[15rem] rounded-lg transition-[opacity,transform,filter] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform md:h-[27rem] md:w-[18rem]"
              href={`/proizvodi/${product.slug}`}
              key={product._id}
              prefetch={false}
              style={style}
              tabIndex={isActive ? 0 : -1}
              onDragStart={(e) => e.preventDefault()}
              onClick={(e) => {
                if (hasDraggedRef.current) {
                  e.preventDefault();
                }
              }}
            >
              <ProductVisual product={product} />
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function RecommendedProductsCarouselLayout({ products }: { products: RecommendedProduct[] }) {
  const { language } = useSettings();
  const copy = COPY[language];

  return (
    <section
      aria-label={copy.ariaLabel}
      className="relative isolate overflow-hidden border-t border-[var(--border-soft)] bg-transparent px-4 py-16 text-[var(--text-primary)] md:px-8 md:py-24"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_20%,rgba(var(--accent-rgb),0.14),transparent_38%),linear-gradient(180deg,color-mix(in_srgb,var(--page-bg)_58%,transparent),color-mix(in_srgb,var(--page-bg-deep)_66%,transparent))]"
      />
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-[var(--text-muted)]">
            {copy.eyebrow}
          </p>
          <h2 className="font-display mt-4 text-[clamp(3.4rem,7vw,7rem)] font-semibold leading-[0.88] tracking-normal text-[var(--text-primary)]">
            {copy.title}
          </h2>
        </div>

        {products.length === 1 ? (
          <SingleProductFallback product={products[0]} />
        ) : (
          <CarouselRing products={products} />
        )}
      </div>
    </section>
  );
}

function RecommendedProductsCarouselConvex() {
  const productsResult = useQuery(api.products.listRecommended, { limit: 10 });

  const products = useMemo(() => {
    if (productsResult === undefined) {
      return undefined; // loading
    }
    if (productsResult.length > 0) {
      return productsResult as RecommendedProduct[];
    }
    return fallbackRecommendedProducts;
  }, [productsResult]);

  if (products === undefined) {
    return null;
  }

  return <RecommendedProductsCarouselLayout products={products} />;
}

export function RecommendedProductsCarousel() {
  if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
    return <RecommendedProductsCarouselLayout products={fallbackRecommendedProducts} />;
  }

  return <RecommendedProductsCarouselConvex />;
}
