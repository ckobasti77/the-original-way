"use client";

import { Navbar } from "@/components/home/navbar";
import { CheckoutClient } from "@/components/shop/checkout-client";
import { useSettings } from "@/components/settings-provider";
import { STORE_COPY } from "@/lib/storefront-i18n";

export default function CheckoutPage() {
  const { language } = useSettings();
  const copy = STORE_COPY[language].checkout;
  return (
    <main className="store-shell min-h-screen text-[var(--text-primary)]">
      <Navbar />

      <section className="border-b border-[var(--border-soft)] px-4 pb-8 pt-28 md:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-bold uppercase tracking-[0.26em] text-[var(--text-muted)]">
            {copy.eyebrow}
          </p>
          <h1 className="font-display mt-4 text-6xl font-semibold leading-[0.9] md:text-8xl">
            {copy.title}
          </h1>
          <p className="mt-5 max-w-2xl text-lg font-semibold leading-7 text-[var(--text-secondary)]">
            {copy.intro}
          </p>
        </div>
      </section>

      <section className="px-4 py-8 md:px-8 md:py-10">
        <div className="mx-auto max-w-7xl">
          <CheckoutClient convexEnabled={Boolean(process.env.NEXT_PUBLIC_CONVEX_URL)} />
        </div>
      </section>
    </main>
  );
}
