import { Suspense } from "react";

import { Navbar } from "@/components/home/navbar";
import { ProductCard } from "@/components/shop/product-card";
import { ProductFilters } from "@/components/shop/product-filters";
import { getShopCatalog } from "@/lib/shop-data";
import { applyShopFilters, parseShopFilters } from "@/lib/shop-filtering";
import { formatShopPrice } from "@/lib/shop-taxonomy";

function sortSizes(sizes: string[]) {
  return [...sizes].sort((a, b) => {
    const left = Number(a);
    const right = Number(b);
    if (Number.isFinite(left) && Number.isFinite(right)) return left - right;
    return a.localeCompare(b);
  });
}

function getSingleValue(values: string[]) {
  return values.length === 1 ? values[0] : undefined;
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const catalog = await getShopCatalog();
  const filters = parseShopFilters(params);
  const filteredProducts = applyShopFilters(catalog.products, filters);
  const prices = catalog.products.map((product) => product.salePrice);
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
  const allSizes = sortSizes(
    Array.from(new Set(catalog.products.flatMap((product) => product.sizes))),
  );
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

  const heroTitle = selectedCollection?.name ?? "Proizvodi";
  const heroSubtitle = hasActiveFilters
    ? "Visestruki izbor filtera je ukljucen, pa mozes da kombinujes vise kategorija, brendova i polova odjednom."
    : "Jedna stranica za sve ulaze: kolekcije, muskarci, zene, odeca, obuca i pretraga.";

  return (
    <main className="min-h-screen bg-[var(--page-bg)] text-[var(--text-primary)]">
      <Navbar />

      <section className="relative overflow-hidden border-b border-[var(--border-soft)] px-4 pb-10 pt-28 md:px-8 md:pb-14">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(135deg,rgba(var(--accent-rgb),0.20),transparent_34%),radial-gradient(circle_at_78%_18%,rgba(178,74,53,0.18),transparent_28%),linear-gradient(180deg,var(--page-bg),var(--page-bg-deep))]" />
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_22rem] lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.26em] text-[var(--text-muted)]">
              The Original Way katalog
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
                Artikli
              </p>
              <p className="mt-1 text-2xl font-bold">{filteredProducts.length}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                Brendovi
              </p>
              <p className="mt-1 text-2xl font-bold">{catalog.brands.length}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                Od
              </p>
              <p className="mt-1 text-lg font-bold">
                {catalog.products.length > 0
                  ? formatShopPrice(Math.min(...prices))
                  : "0 RSD"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-8 md:px-8 md:py-10">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[20rem_minmax(0,1fr)]">
          <Suspense
            fallback={
              <div className="rounded-lg border border-[var(--border-soft)] bg-[var(--surface)] p-4 text-sm font-bold text-[var(--text-muted)]">
                Filteri se ucitavaju...
              </div>
            }
          >
            <ProductFilters
              activeFilters={filters}
              brands={catalog.brands}
              categories={catalog.categories}
              collections={catalog.collections}
              maxPrice={maxPrice}
              sizes={allSizes}
            />
          </Suspense>

          <div className="min-w-0">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--text-muted)]">
                  Rezultati
                </p>
                <h2 className="mt-1 text-2xl font-semibold">
                  {filteredProducts.length} proizvoda
                </h2>
              </div>
              <p className="text-sm font-semibold text-[var(--text-muted)]">
                Sortiranje:{" "}
                {filters.sort === "price-asc"
                  ? "cena uzbrdo"
                  : filters.sort === "price-desc"
                    ? "cena nizbrdo"
                    : "najnovije"}
              </p>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="grid min-h-[24rem] place-items-center rounded-lg border border-dashed border-[var(--border-soft)] bg-[var(--surface)] p-6 text-center">
                <div>
                  <p className="font-display text-4xl font-semibold">Nema poklapanja</p>
                  <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">
                    Resetuj deo filtera ili promeni cenu, velicinu i brend.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
