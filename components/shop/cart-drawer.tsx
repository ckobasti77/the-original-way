"use client";

import Link from "next/link";

import { useSettings } from "@/components/settings-provider";
import { localizeHref } from "@/lib/storefront-i18n";
import { formatShopPrice } from "@/lib/shop-taxonomy";

import { useCart } from "./cart-provider";

export function CartNavButton({ className }: { className: string }) {
  const { language } = useSettings();
  const { itemCount, openCart } = useCart();

  return (
    <button
      type="button"
      aria-label={language === "sr" ? "Korpa" : "Cart"}
      title={language === "sr" ? "Korpa" : "Cart"}
      onClick={openCart}
      className={`${className} relative`}
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
        <path d="M4 5h2l2.2 9.3a2 2 0 0 0 2 1.5h6.7a2 2 0 0 0 1.9-1.4L21 8H7" />
        <circle cx="10" cy="19" r="1.4" />
        <circle cx="17" cy="19" r="1.4" />
      </svg>
      {itemCount > 0 ? (
        <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-[var(--text-primary)] px-1 text-[10px] font-bold leading-none text-[var(--page-bg)]">
          {itemCount}
        </span>
      ) : null}
    </button>
  );
}

export function CartDrawer() {
  const { language } = useSettings();
  const copy = language === "sr"
    ? { cart: "Korpa", close: "Zatvori korpu", empty: "Prazna korpa", emptyText: "Artikli koje dodate iz kataloga pojaviće se ovde.", remove: "Ukloni", decrease: "Smanji količinu", increase: "Povećaj količinu", total: "Ukupno", checkout: "Nastavi na plaćanje", clear: "Isprazni korpu", catalog: "Katalog" }
    : { cart: "Cart", close: "Close cart", empty: "Your cart is empty", emptyText: "Items you add from the catalog will appear here.", remove: "Remove", decrease: "Decrease quantity", increase: "Increase quantity", total: "Total", checkout: "Continue to checkout", clear: "Clear cart", catalog: "Catalog" };
  const {
    clearCart,
    closeCart,
    isCartOpen,
    items,
    removeItem,
    subtotal,
    updateQuantity,
  } = useCart();

  return (
    <>
      <div
        className={`fixed inset-0 z-[70] bg-black/45 backdrop-blur-sm transition-opacity duration-300 ${
          isCartOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={closeCart}
        aria-hidden="true"
      />
      <aside
        aria-label={copy.cart}
        className={`fixed right-0 top-0 z-[80] flex h-dvh w-full max-w-[440px] flex-col border-l border-[var(--border-soft)] bg-[var(--surface-opaque)] text-[var(--text-primary)] shadow-[-24px_0_70px_rgba(var(--shadow-rgb),0.22)] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isCartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-20 items-center justify-between border-b border-[var(--border-soft)] px-5">
          <div>
            <p className="nav-text text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[var(--text-muted)]">
              The Original Way
            </p>
            <h2 className="mt-1 text-2xl font-semibold leading-none">{copy.cart}</h2>
          </div>
          <button
            type="button"
            onClick={closeCart}
            className="grid h-10 w-10 place-items-center rounded-full border border-[var(--border-soft)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            aria-label={copy.close}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {items.length === 0 ? (
            <div className="grid h-full place-items-center text-center">
              <div>
                <p className="font-display text-4xl font-semibold">{copy.empty}</p>
                <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">
                  {copy.emptyText}
                </p>
                <Link
                  href={localizeHref("/proizvodi", language)}
                  onClick={closeCart}
                  className="tow-on-primary mt-6 inline-flex min-h-11 items-center justify-center rounded-md bg-[var(--text-primary)] px-5 text-sm font-bold uppercase tracking-[0.16em]"
                >
                  {copy.catalog}
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid gap-3">
              {items.map((item) => (
                <article
                  key={item.lineId}
                  className="grid grid-cols-[5.25rem_1fr] gap-3 rounded-lg border border-[var(--border-soft)] bg-[rgba(var(--accent-rgb),0.035)] p-2"
                >
                  <Link
                    href={localizeHref(`/proizvodi/${item.slug}`, language)}
                    onClick={closeCart}
                    className="relative block aspect-[4/5] overflow-hidden rounded-md bg-[rgba(var(--accent-rgb),0.08)]"
                  >
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="grid h-full place-items-center text-xs font-bold text-[var(--text-muted)]">
                        TOW
                      </span>
                    )}
                  </Link>
                  <div className="min-w-0 py-1 pr-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold">{item.name}</p>
                        <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                          {item.brandName} / {item.size}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.lineId)}
                        className="shrink-0 text-xs font-bold text-[var(--text-primary)]"
                      >
                        {copy.remove}
                      </button>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-3">
                      <div className="inline-flex h-9 items-center rounded-md border border-[var(--border-soft)] bg-[var(--surface)]">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.lineId, item.quantity - 1)}
                          className="h-9 w-9 text-lg font-semibold"
                          aria-label={copy.decrease}
                        >
                          -
                        </button>
                        <span className="min-w-7 text-center text-sm font-bold">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.lineId, item.quantity + 1)}
                          className="h-9 w-9 text-lg font-semibold"
                          aria-label={copy.increase}
                        >
                          +
                        </button>
                      </div>
                      <p className="text-sm font-bold">
                        {formatShopPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-[var(--border-soft)] p-5">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-[var(--text-muted)]">{copy.total}</span>
            <span className="text-xl font-bold">{formatShopPrice(subtotal)}</span>
          </div>
          <div className="mt-4 grid gap-2">
            {items.length > 0 ? (
              <Link
                href={localizeHref("/checkout", language)}
                onClick={closeCart}
                className="tow-on-primary inline-flex min-h-11 items-center justify-center rounded-md bg-[var(--text-primary)] px-4 text-sm font-bold uppercase tracking-[0.16em]"
              >
                {copy.checkout}
              </Link>
            ) : (
              <button
                type="button"
                disabled
                className="tow-on-primary min-h-11 rounded-md bg-[var(--text-primary)] px-4 text-sm font-bold uppercase tracking-[0.16em] opacity-40"
              >
                {copy.checkout}
              </button>
            )}
            <button
              type="button"
              onClick={clearCart}
              disabled={items.length === 0}
              className="min-h-10 rounded-md border border-[var(--border-soft)] text-sm font-bold text-[var(--text-secondary)] disabled:opacity-40"
            >
              {copy.clear}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
