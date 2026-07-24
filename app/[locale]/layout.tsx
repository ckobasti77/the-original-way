import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { StorefrontFooter } from "@/components/site/storefront-footer";
import { isStoreLocale, STORE_LOCALES } from "@/lib/storefront-i18n";

export function generateStaticParams() {
  return STORE_LOCALES.map((locale) => ({ locale }));
}

const PAGE_META = {
  sr: {
    "": ["The Original Way", "Originalna evropska garderoba, pažljivo kurirana za svakodnevni ritam."],
    "o-nama": ["Ko smo mi", "Upoznajte The Original Way i naš pristup originalnoj evropskoj garderobi."],
    kontakt: ["Kontakt", "Kontaktirajte The Original Way za veličine, dostupnost i rezervacije."],
    proizvodi: ["Proizvodi", "Pregledajte kuriranu The Original Way selekciju."],
    checkout: ["Plaćanje", "Sigurna i jednostavna The Original Way porudžbina."],
    profil: ["Profil", "Sačuvani kontakt, dostava i istorija porudžbina."],
    prijava: ["Prijava", "Prijavite se na The Original Way nalog."],
    registracija: ["Registracija", "Napravite The Original Way nalog."],
  },
  en: {
    "": ["The Original Way", "Original European fashion, carefully curated for an everyday rhythm."],
    "o-nama": ["Our story", "Meet The Original Way and our approach to original European fashion."],
    kontakt: ["Contact", "Contact The Original Way about sizing, availability, and reservations."],
    proizvodi: ["Products", "Explore The Original Way's curated selection."],
    checkout: ["Checkout", "A secure and simple The Original Way order."],
    profil: ["Profile", "Saved contact, delivery, and order history."],
    prijava: ["Sign in", "Sign in to your The Original Way account."],
    registracija: ["Create account", "Create your The Original Way account."],
  },
} as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = rawLocale === "en" ? "en" : "sr";
  const pathname = (await headers()).get("x-tow-pathname") ?? `/${locale}`;
  const unprefixed = pathname.replace(new RegExp(`^/${locale}/?`), "");
  const section = unprefixed.split("/")[0] as keyof (typeof PAGE_META)[typeof locale];
  const [pageTitle, description] = PAGE_META[locale][section] ?? PAGE_META[locale][""];
  const alternatePath = unprefixed ? `/${unprefixed}` : "";

  return {
    title: pageTitle === "The Original Way" ? pageTitle : `${pageTitle} | The Original Way`,
    description,
    alternates: {
      canonical: `/${locale}${alternatePath}`,
      languages: {
        "sr-Latn-RS": `/sr${alternatePath}`,
        en: `/en${alternatePath}`,
      },
    },
  };
}

export default async function StorefrontLocaleLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!isStoreLocale(locale)) {
    notFound();
  }

  return (
    <>
      {children}
      <StorefrontFooter />
    </>
  );
}
