import { Suspense } from "react";

import { Navbar } from "@/components/home/navbar";
import { Price } from "@/components/currency-provider";
import { ProductCard } from "@/components/shop/product-card";
import { ActiveFiltersRow } from "@/components/shop/filters/active-filters";
import { DesktopFilterBar } from "@/components/shop/filters/desktop-filter-bar";
import { ShopFiltersProvider } from "@/components/shop/filters/filter-state";
import { MobileFilterToolbar } from "@/components/shop/filters/mobile-filter-toolbar";
import { ClearFiltersButton, ResultsPane } from "@/components/shop/filters/results-pane";
import { getShopCatalog } from "@/lib/shop-data";
import {
  applyShopFilters,
  filterBySearch,
  parseShopFilters,
  toFilterRecord,
} from "@/lib/shop-filtering";
import { sortSizes } from "@/lib/shop-taxonomy";
import { STORE_COPY, type StoreLocale } from "@/lib/storefront-i18n";

function getSingleValue(values: string[]) {
  return values.length === 1 ? values[0] : undefined;
}

export default async function ProductsPage({
  searchParams,
  params: routeParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
  params?: Promise<{ locale?: string }>;
}) {
  const route = routeParams ? await routeParams : undefined;
  const locale: StoreLocale = route?.locale === "en" ? "en" : "sr";
  const copy = STORE_COPY[locale].catalog;
  const params = await searchParams;
  const catalog = await getShopCatalog();
  const filters = parseShopFilters(params);
  const filteredProducts = applyShopFilters(catalog.products, filters);
  const prices = catalog.products.map((product) => product.salePrice);
  // Klijent dobija samo slim zapise (bez opisa/slika) za brojace u filterima;
  // tekstualna pretraga ostaje na serveru kao "opseg".
  const filterRecords = filterBySearch(catalog.products, filters.q).map(toFilterRecord);
  const filterTaxonomy = {
    brands: catalog.brands
      .map((brand) => ({ value: brand.slug, label: brand.name }))
      .sort((a, b) => a.label.localeCompare(b.label, "sr")),
    categories: catalog.categories,
    collections: catalog.collections.map((collection) => ({
      value: collection.slug,
      label: collection.name,
    })),
    sizes: sortSizes(
      Array.from(new Set(catalog.products.flatMap((product) => product.sizes))),
    ),
  };
  const selectedCollectionSlug = getSingleValue(filters.collection);
  const selectedCollection = selectedCollectionSlug
    ? catalog.collections.find((collection) => collection.slug === selectedCollectionSlug)
    : null;
  const hasActiveFilters = [
    filters.q,
    filters.gender.length > 0,
    filters.type.length > 0,
    filters.category.length > 0,
    filters.brand.length > 0,
    filters.collection.length > 0,
    filters.size.length > 0,
    filters.min !== undefined,
    filters.max !== undefined,
    filters.availability === "in-stock",
  ].some(Boolean);

  const heroTitle = selectedCollection?.name ?? copy.title;
  const heroSubtitle = hasActiveFilters
    ? copy.filtered
    : copy.intro;

  const productGrid =
    filteredProducts.length === 0 ? (
      <div className="grid min-h-[24rem] place-items-center rounded-lg border border-dashed border-[var(--border-soft)] bg-[var(--surface)] p-6 text-center">
        <div>
          <p className="font-display text-4xl font-semibold">{copy.emptyTitle}</p>
          <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">
            {copy.emptyText}
          </p>
          {hasActiveFilters ? <ClearFiltersButton /> : null}
        </div>
      </div>
    ) : (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    );

  return (
    <main className="store-shell min-h-screen text-[var(--text-primary)]">
      <Navbar />

      <section className="relative overflow-hidden border-b border-[var(--border-soft)] px-4 pb-10 pt-28 md:px-8 md:pb-14">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(135deg,rgba(var(--accent-rgb),0.20),transparent_34%),radial-gradient(circle_at_78%_18%,rgba(178,74,53,0.18),transparent_28%),linear-gradient(180deg,var(--page-bg),var(--page-bg-deep))]" />
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_22rem] lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.26em] text-[var(--text-muted)]">
              {copy.eyebrow}
            </p>
            <h1 className="font-display mt-4 text-6xl font-semibold leading-[0.9] tracking-normal md:text-8xl">
              {heroTitle}
            </h1>
            <p className="mt-5 max-w-2xl text-lg font-semibold leading-7 text-[var(--text-secondary)]">
              {heroSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 rounded-lg border border-[var(--border-soft)] bg-[var(--surface-strong)] p-3 backdrop-blur-xl">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                {copy.items}
              </p>
              <p className="mt-1 text-2xl font-bold">{filteredProducts.length}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                {copy.brands}
              </p>
              <p className="mt-1 text-2xl font-bold">{catalog.brands.length}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                {copy.from}
              </p>
              <p className="mt-1 text-lg font-bold">
                <Price value={catalog.products.length > 0 ? Math.min(...prices) : 0} />
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bez horizontalnog paddinga: sticky traka ide od ivice do ivice, a
          sekcija je njen "kontejner" pa ostaje zalepljena do kraja proizvoda. */}
      <section>
        <Suspense fallback={<div className="px-4 py-8 md:px-8 md:py-10">{productGrid}</div>}>
          <ShopFiltersProvider
            locale={locale}
            records={filterRecords}
            recordsQuery={filters.q}
            serverCount={filteredProducts.length}
            taxonomy={filterTaxonomy}
          >
            <MobileFilterToolbar />
            <DesktopFilterBar />
            <div className="mx-auto max-w-7xl px-4 pb-12 pt-6 md:px-8 lg:pt-6">
              <ActiveFiltersRow />
              <ResultsPane>{productGrid}</ResultsPane>
            </div>
          </ShopFiltersProvider>
        </Suspense>
      </section>
    </main>
  );
}
