"use client";

import { useState } from "react";

import type { ShopProduct } from "@/lib/shop-taxonomy";

import { useCart } from "./cart-provider";

type ProductCartSnapshot = Pick<
  ShopProduct,
  "brandName" | "id" | "imageUrls" | "name" | "salePrice" | "sizes" | "slug"
>;

export function QuickAddToCart({ product }: { product: ProductCartSnapshot }) {
  const { addItem } = useCart();
  const [size, setSize] = useState(product.sizes[0] ?? "");

  return (
    <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
      <select
        value={size}
        onChange={(event) => setSize(event.target.value)}
        aria-label="Velicina"
        className="min-h-10 rounded-md border border-[var(--border-soft)] bg-[var(--surface)] px-3 text-sm font-bold text-[var(--text-primary)] outline-none"
      >
        {product.sizes.length === 0 ? <option value="">Nema velicina</option> : null}
        {product.sizes.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
      <button
        type="button"
        disabled={!size}
        onClick={() =>
          addItem({
            productId: product.id,
            slug: product.slug,
            name: product.name,
            brandName: product.brandName,
            imageUrl: product.imageUrls[0],
            price: product.salePrice,
            size,
            quantity: 1,
          })
        }
        className="tow-on-primary min-h-10 rounded-md bg-[var(--text-primary)] px-4 text-xs font-bold uppercase tracking-[0.16em] disabled:opacity-40"
      >
        Dodaj
      </button>
    </div>
  );
}

export function ProductPurchasePanel({ product }: { product: ProductCartSnapshot }) {
  const { addItem } = useCart();
  const [size, setSize] = useState(product.sizes[0] ?? "");
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="rounded-lg border border-[var(--border-soft)] bg-[var(--surface-strong)] p-4 shadow-[0_18px_50px_rgba(var(--shadow-rgb),0.12)] backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
          Velicina / broj
        </p>
        <span className="text-xs font-bold text-[var(--text-muted)]">
          {product.sizes.length} opcija
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {product.sizes.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setSize(item)}
            className={`min-h-10 min-w-12 rounded-md border px-3 text-sm font-bold ${
              size === item
                ? "tow-on-primary border-[var(--text-primary)] bg-[var(--text-primary)]"
                : "border-[var(--border-soft)] bg-[var(--surface)] text-[var(--text-primary)]"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        <div className="inline-flex h-11 items-center rounded-md border border-[var(--border-soft)] bg-[var(--surface)]">
          <button
            type="button"
            onClick={() => setQuantity((current) => Math.max(1, current - 1))}
            className="h-11 w-11 text-lg font-semibold"
            aria-label="Smanji kolicinu"
          >
            -
          </button>
          <span className="min-w-9 text-center text-sm font-bold">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((current) => current + 1)}
            className="h-11 w-11 text-lg font-semibold"
            aria-label="Povecaj kolicinu"
          >
            +
          </button>
        </div>

        <button
          type="button"
          disabled={!size}
          onClick={() =>
            addItem({
              productId: product.id,
              slug: product.slug,
              name: product.name,
              brandName: product.brandName,
              imageUrl: product.imageUrls[0],
              price: product.salePrice,
              size,
              quantity,
            })
          }
          className="tow-on-primary min-h-11 flex-1 rounded-md bg-[var(--text-primary)] px-5 text-sm font-bold uppercase tracking-[0.16em] disabled:opacity-40"
        >
          Dodaj u korpu
        </button>
      </div>
    </div>
  );
}
