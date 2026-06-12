import Link from "next/link";

import { formatShopPrice, productGenderLabels, type ShopProduct } from "@/lib/shop-taxonomy";

import { QuickAddToCart } from "./add-to-cart-button";

export function ProductCard({ product }: { product: ShopProduct }) {
  const imageUrl = product.imageUrls[0];

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-[var(--border-soft)] bg-[var(--surface-strong)] shadow-[0_20px_55px_rgba(var(--shadow-rgb),0.10)] backdrop-blur-xl">
      <Link
        href={`/proizvodi/${product.slug}`}
        className="relative block aspect-[4/5] overflow-hidden bg-[rgba(var(--accent-rgb),0.06)]"
      >
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.045]"
          />
        ) : (
          <div className="grid h-full place-items-center text-sm font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
            TOW
          </div>
        )}
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {product.isDemo ? (
            <span className="rounded-md bg-[#b24a35] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white">
              Demo
            </span>
          ) : null}
          {product.category ? (
            <span className="rounded-md bg-[rgba(255,255,255,0.86)] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#142133]">
              {product.category.name}
            </span>
          ) : null}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
              {product.brandName}
            </p>
            <Link
              href={`/proizvodi/${product.slug}`}
              className="mt-1 block text-lg font-semibold leading-tight text-[var(--text-primary)] hover:text-[var(--accent)]"
            >
              {product.name}
            </Link>
          </div>
          <p className="shrink-0 text-right text-sm font-bold">
            {formatShopPrice(product.salePrice)}
          </p>
        </div>

        <p className="mt-3 line-clamp-2 text-sm leading-6 text-[var(--text-secondary)]">
          {product.description}
        </p>

        <div className="mt-auto pt-4">
          <div className="flex flex-wrap gap-1.5">
            <span className="rounded-md border border-[var(--border-soft)] px-2 py-1 text-xs font-bold text-[var(--text-secondary)]">
              {productGenderLabels[product.gender]}
            </span>
            {product.sizes.slice(0, 4).map((size) => (
              <span
                key={size}
                className="rounded-md bg-[rgba(var(--accent-rgb),0.08)] px-2 py-1 text-xs font-bold text-[var(--text-primary)]"
              >
                {size}
              </span>
            ))}
            {product.sizes.length > 4 ? (
              <span className="rounded-md bg-[rgba(var(--accent-rgb),0.08)] px-2 py-1 text-xs font-bold text-[var(--text-muted)]">
                +{product.sizes.length - 4}
              </span>
            ) : null}
          </div>
          <QuickAddToCart product={product} />
        </div>
      </div>
    </article>
  );
}
