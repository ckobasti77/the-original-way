"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { Navbar } from "@/components/home/navbar";
import { useSettings } from "@/components/settings-provider";
import { formatShopPrice } from "@/lib/shop-taxonomy";
import { localizeHref } from "@/lib/storefront-i18n";

const COPY = {
  sr: {
    eyebrow: "Potvrda",
    title: "Porudžbina je primljena",
    intro:
      "Hvala na poverenju. Kontaktiraćemo vas radi potvrde isporuke u najkraćem roku.",
    orderNumber: "Broj porudžbine",
    total: "Ukupno",
    note: "Sačuvajte broj porudžbine — potreban je za sva pitanja o isporuci.",
    catalog: "Nastavi kupovinu",
    profile: "Moje porudžbine",
    missing: "Nema podataka o porudžbini.",
    missingText: "Ako ste upravo poručili, proverite istoriju u svom profilu.",
  },
  en: {
    eyebrow: "Confirmation",
    title: "Your order is in",
    intro:
      "Thank you. We will contact you shortly to confirm delivery details.",
    orderNumber: "Order number",
    total: "Total",
    note: "Keep your order number — you will need it for any delivery questions.",
    catalog: "Continue shopping",
    profile: "My orders",
    missing: "No order details found.",
    missingText: "If you just ordered, check the history in your profile.",
  },
} as const;

function SuccessContent() {
  const { language } = useSettings();
  const copy = COPY[language];
  const params = useSearchParams();
  const orderNumber = params.get("broj");
  const totalRaw = params.get("iznos");
  const total = totalRaw !== null ? Number(totalRaw) : NaN;

  if (!orderNumber) {
    return (
      <div className="premium-panel grid min-h-[24rem] place-items-center p-8 text-center">
        <div>
          <p className="font-display text-4xl font-semibold">{copy.missing}</p>
          <p className="mt-4 text-[var(--text-secondary)]">{copy.missingText}</p>
          <Link
            className="store-button-primary mt-7"
            href={localizeHref("/profil", language)}
          >
            {copy.profile}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="premium-panel p-6 md:p-10">
      <p className="store-eyebrow">{copy.eyebrow}</p>
      <h2 className="font-display mt-3 text-4xl md:text-5xl">{copy.title}</h2>
      <p className="mt-4 max-w-xl text-[var(--text-secondary)]">{copy.intro}</p>

      <dl className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-[var(--border-soft)] bg-[var(--surface-soft)] p-4">
          <dt className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
            {copy.orderNumber}
          </dt>
          <dd className="font-display mt-2 text-3xl">{orderNumber}</dd>
        </div>
        {Number.isFinite(total) ? (
          <div className="rounded-xl border border-[var(--border-soft)] bg-[var(--surface-soft)] p-4">
            <dt className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
              {copy.total}
            </dt>
            <dd className="font-display mt-2 text-3xl">
              {formatShopPrice(total)}
            </dd>
          </div>
        ) : null}
      </dl>

      <p className="mt-6 text-sm text-[var(--text-muted)]">{copy.note}</p>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          className="store-button-primary"
          href={localizeHref("/proizvodi", language)}
        >
          {copy.catalog}
        </Link>
        <Link
          className="store-button-secondary"
          href={localizeHref("/profil", language)}
        >
          {copy.profile}
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <main className="store-shell min-h-screen text-[var(--text-primary)]">
      <Navbar />
      <section className="px-4 pb-16 pt-28 md:px-8">
        <div className="mx-auto max-w-3xl">
          <Suspense fallback={null}>
            <SuccessContent />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
