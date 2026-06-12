import Link from "next/link";
import { notFound } from "next/navigation";

import { Navbar } from "@/components/home/navbar";
import { ProductPurchasePanel } from "@/components/shop/add-to-cart-button";
import { ProductCard } from "@/components/shop/product-card";
import { getShopProduct } from "@/lib/shop-data";
import {
  formatShopPrice,
  productGenderLabels,
  productTypeLabels,
} from "@/lib/shop-taxonomy";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { catalog, product } = await getShopProduct(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = catalog.products
    .filter((item) => item.id !== product.id)
    .filter(
      (item) =>
        item.categorySlug === product.categorySlug ||
        item.brandName === product.brandName ||
        item.gender === product.gender,
    )
    .slice(0, 3);
  const gallery = product.imageUrls.length > 0 ? product.imageUrls : [""];

  return (
    <main className="min-h-screen bg-[var(--page-bg)] text-[var(--text-primary)]">
      <Navbar />

      <section className="border-b border-[var(--border-soft)] px-4 pb-10 pt-28 md:px-8 md:pb-14">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
            <Link href="/proizvodi" className="hover:text-[var(--text-primary)]">
              Proizvodi
            </Link>
            <span>/</span>
            <span>{product.category?.name ?? productTypeLabels[product.type]}</span>
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(22rem,0.75fr)] lg:items-start">
            <div className="grid gap-3 sm:grid-cols-[1fr_0.42fr]">
              <div className="relative aspect-[4/5] overflow-hidden rounded-lg border border-[var(--border-soft)] bg-[rgba(var(--accent-rgb),0.08)] shadow-[0_24px_70px_rgba(var(--shadow-rgb),0.16)]">
                {gallery[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={gallery[0]}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="grid h-full place-items-center text-sm font-bold uppercase tracking-[0.22em] text-[var(--text-muted)]">
                    The Original Way
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-1">
                {gallery.slice(1, 4).map((imageUrl, index) => (
                  <div
                    key={`${imageUrl}-${index}`}
                    className="relative aspect-square overflow-hidden rounded-lg border border-[var(--border-soft)] bg-[rgba(var(--accent-rgb),0.08)]"
                  >
                    {imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={imageUrl}
                        alt={`${product.name} ${index + 2}`}
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:sticky lg:top-24">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--text-muted)]">
                {product.brandName}
              </p>
              <h1 className="font-display mt-3 text-5xl font-semibold leading-[0.95] md:text-7xl">
                {product.name}
              </h1>
              <p className="mt-5 text-3xl font-bold">
                {formatShopPrice(product.salePrice)}
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-md border border-[var(--border-soft)] px-3 py-1.5 text-sm font-bold text-[var(--text-secondary)]">
                  {productTypeLabels[product.type]}
                </span>
                <span className="rounded-md border border-[var(--border-soft)] px-3 py-1.5 text-sm font-bold text-[var(--text-secondary)]">
                  {productGenderLabels[product.gender]}
                </span>
                {product.category ? (
                  <span className="rounded-md bg-[rgba(var(--accent-rgb),0.10)] px-3 py-1.5 text-sm font-bold text-[var(--text-primary)]">
                    {product.category.name}
                  </span>
                ) : null}
              </div>

              <p className="mt-6 text-lg font-semibold leading-8 text-[var(--text-secondary)]">
                {product.description}
              </p>

              <div className="mt-6">
                <ProductPurchasePanel product={product} />
              </div>

              <div className="mt-5 grid grid-cols-3 gap-2 text-center text-xs font-bold uppercase tracking-[0.13em] text-[var(--text-muted)]">
                <div className="rounded-lg border border-[var(--border-soft)] bg-[var(--surface)] px-2 py-3">
                  Rezervacija
                </div>
                <div className="rounded-lg border border-[var(--border-soft)] bg-[var(--surface)] px-2 py-3">
                  Brza potvrda
                </div>
                <div className="rounded-lg border border-[var(--border-soft)] bg-[var(--surface)] px-2 py-3">
                  Lokalna isporuka
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-10 md:px-8 md:py-14">
        <div className="mx-auto max-w-7xl">
          <div className="mb-5 flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--text-muted)]">
                Nastavi pregled
              </p>
              <h2 className="mt-1 text-3xl font-semibold">Slicni proizvodi</h2>
            </div>
            <Link
              href="/proizvodi"
              className="rounded-md border border-[var(--border-soft)] px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[var(--text-secondary)]"
            >
              Svi proizvodi
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(relatedProducts.length > 0
              ? relatedProducts
              : catalog.products.filter((item) => item.id !== product.id).slice(0, 3)
            ).map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
