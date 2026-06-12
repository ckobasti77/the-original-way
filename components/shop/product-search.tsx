"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";

import { api } from "@/convex/_generated/api";
import { sampleShopProducts } from "@/lib/shop-sample-data";
import { formatShopPrice, slugify, type ShopProduct } from "@/lib/shop-taxonomy";

type SearchVariant = "desktop" | "mobile";

type SearchProduct = Pick<
  ShopProduct,
  | "brandName"
  | "category"
  | "description"
  | "id"
  | "imageUrls"
  | "name"
  | "salePrice"
  | "slug"
  | "tags"
>;

type RawSearchProduct = {
  _id: string;
  name: string;
  description: string;
  slug?: string;
  imageUrls?: string[];
  salePrice: number;
  brand?: { name: string } | null;
  category?: { name: string; slug?: string } | null;
};

function normalizeSearchProduct(product: RawSearchProduct): SearchProduct {
  const categoryName = product.category?.name;
  const categorySlug = product.category?.slug ?? (categoryName ? slugify(categoryName) : "");
  const brandName = product.brand?.name ?? "Bez brenda";

  return {
    id: product._id,
    slug: product.slug ?? `${slugify(product.name)}-${product._id.slice(-6)}`,
    name: product.name,
    description: product.description,
    brandName,
    category: categoryName
      ? {
          name: categoryName,
          slug: categorySlug,
          type: "clothing",
          sortOrder: 0,
        }
      : null,
    salePrice: product.salePrice,
    imageUrls: product.imageUrls ?? [],
    tags: [brandName, categoryName ?? "", categorySlug].filter(Boolean),
  };
}

function getCatalogHref(query: string) {
  const normalized = query.trim();
  return `/proizvodi${normalized ? `?q=${encodeURIComponent(normalized)}` : ""}`;
}

function SearchResults({
  onNavigate,
  query,
  results,
}: {
  onNavigate?: () => void;
  query: string;
  results: SearchProduct[];
}) {
  const normalizedQuery = query.trim();

  return (
    <div className="mt-3 grid gap-2">
      {normalizedQuery.length >= 2 && results.length === 0 ? (
        <p className="rounded-md border border-[var(--border-soft)] bg-[var(--surface)] px-3 py-3 text-sm text-[var(--text-muted)]">
          Nema rezultata za &quot;{normalizedQuery}&quot;.
        </p>
      ) : null}

      {results.map((product) => (
        <Link
          key={product.id}
          href={`/proizvodi/${product.slug}`}
          onClick={onNavigate}
          className="grid grid-cols-[4rem_1fr_auto] items-center gap-3 rounded-md border border-[var(--border-soft)] bg-[var(--surface)] p-2 hover:border-[var(--border-strong)]"
        >
          <span className="relative aspect-square overflow-hidden rounded-md bg-[rgba(var(--accent-rgb),0.08)]">
            {product.imageUrls[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.imageUrls[0]}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : null}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-bold text-[var(--text-primary)]">
              {product.name}
            </span>
            <span className="mt-0.5 block truncate text-xs text-[var(--text-muted)]">
              {product.brandName}
            </span>
          </span>
          <span className="text-right text-xs font-bold text-[var(--text-primary)]">
            {formatShopPrice(product.salePrice)}
          </span>
        </Link>
      ))}
    </div>
  );
}

function SearchShell({
  className,
  onNavigate,
  products,
  variant,
}: {
  className: string;
  onNavigate?: () => void;
  products: SearchProduct[];
  variant: SearchVariant;
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const frame = window.requestAnimationFrame(() => {
      inputRef.current?.focus();
    });

    const handleOutsideClick = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current?.contains(event.target as Node)) return;
      setIsOpen(false);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (normalized.length < 2) return [];

    return products
      .filter((product) => {
        const haystack = [
          product.name,
          product.description,
          product.brandName,
          product.category?.name,
          product.category?.slug,
          product.slug,
          ...product.tags,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return haystack.includes(normalized);
      })
      .slice(0, variant === "mobile" ? 4 : 5);
  }, [products, query, variant]);

  function navigateToCatalog() {
    setIsOpen(false);
    onNavigate?.();
    router.push(getCatalogHref(query));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    navigateToCatalog();
  }

  if (variant === "mobile") {
    return (
      <div className={className}>
        <form onSubmit={handleSubmit} className="grid grid-cols-[1fr_auto] gap-2">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            type="search"
            className="min-h-11 rounded-md border border-[var(--border-soft)] bg-[var(--surface)] px-3 text-sm font-semibold text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
            placeholder="Pretrazi proizvode"
          />
          <button
            type="submit"
            className="tow-on-primary rounded-md bg-[var(--text-primary)] px-4 text-xs font-bold uppercase tracking-[0.14em]"
          >
            Trazi
          </button>
        </form>
        <SearchResults
          onNavigate={onNavigate}
          query={query}
          results={results}
        />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative hidden lg:block">
      <button
        type="button"
        aria-label="Pretraga"
        title="Pretraga"
        onClick={() => setIsOpen((current) => !current)}
        className={className}
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
          <circle cx="11" cy="11" r="6.5" />
          <path d="M16 16l4.5 4.5" />
        </svg>
      </button>

      <div
        className={`absolute right-0 top-full z-40 mt-3 w-[min(28rem,calc(100vw-2rem))] transition duration-200 ${
          isOpen
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-2 opacity-0"
        }`}
      >
        <div className="glass-panel rounded-[1.2rem] border border-[var(--border-soft)] p-3 shadow-[0_24px_58px_rgba(var(--shadow-rgb),0.2)]">
          <form onSubmit={handleSubmit} className="grid grid-cols-[1fr_auto] gap-2">
            <input
              ref={inputRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              type="search"
              className="min-h-11 rounded-md border border-[var(--border-soft)] bg-[var(--surface)] px-3 text-sm font-semibold text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
              placeholder="Pretrazi proizvode"
            />
            <button
              type="submit"
              className="tow-on-primary inline-flex min-h-11 items-center rounded-md bg-[var(--text-primary)] px-4 text-xs font-bold uppercase tracking-[0.16em]"
            >
              Katalog
            </button>
          </form>

          <SearchResults
            onNavigate={() => {
              setIsOpen(false);
              onNavigate?.();
            }}
            query={query}
            results={results}
          />
        </div>
      </div>
    </div>
  );
}

function ConvexProductSearch({
  className,
  onNavigate,
  variant,
}: {
  className: string;
  onNavigate?: () => void;
  variant: SearchVariant;
}) {
  const products = useQuery(api.products.list) as RawSearchProduct[] | undefined;
  const normalizedProducts = products?.map(normalizeSearchProduct) ?? sampleShopProducts;

  return (
    <SearchShell
      className={className}
      onNavigate={onNavigate}
      products={normalizedProducts}
      variant={variant}
    />
  );
}

export function ProductSearch({
  className,
  convexEnabled,
  onNavigate,
  variant = "desktop",
}: {
  className: string;
  convexEnabled: boolean;
  onNavigate?: () => void;
  variant?: SearchVariant;
}) {
  if (convexEnabled) {
    return (
      <ConvexProductSearch
        className={className}
        onNavigate={onNavigate}
        variant={variant}
      />
    );
  }

  return (
    <SearchShell
      className={className}
      onNavigate={onNavigate}
      products={sampleShopProducts}
      variant={variant}
    />
  );
}
