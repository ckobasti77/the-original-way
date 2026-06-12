import { Navbar } from "@/components/home/navbar";
import { CheckoutClient } from "@/components/shop/checkout-client";

export default function CheckoutPage() {
  return (
    <main className="min-h-screen bg-[var(--page-bg)] text-[var(--text-primary)]">
      <Navbar />

      <section className="border-b border-[var(--border-soft)] px-4 pb-8 pt-28 md:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-bold uppercase tracking-[0.26em] text-[var(--text-muted)]">
            The Original Way checkout
          </p>
          <h1 className="font-display mt-4 text-6xl font-semibold leading-[0.9] md:text-8xl">
            Placanje
          </h1>
          <p className="mt-5 max-w-2xl text-lg font-semibold leading-7 text-[var(--text-secondary)]">
            Kratak tok porudzbine za katalog, proizvod i korpu.
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
