// Deljena logika za valute (EUR baza, RSD izvedeno po srednjem kursu NBS).
// Koristi se i na klijentu i u Convex funkcijama, pa ovde NE sme ništa
// browser/node-specifično — samo čiste funkcije i konstante.

export type Currency = "EUR" | "RSD";

export const CURRENCIES: readonly Currency[] = ["EUR", "RSD"] as const;

export const DEFAULT_CURRENCY: Currency = "EUR";

// Hardkodovani fallback kurs (srednji NBS, 2025). Garantuje da sajt NIKAD
// ne ostane bez cene ako i keš i eksterni API-ji zakažu.
export const FALLBACK_EUR_RSD = 117.3907;

export function isCurrency(value: unknown): value is Currency {
  return value === "EUR" || value === "RSD";
}

// Zaokruživanje preračunate dinarske cene NAVIŠE na 10 dinara.
// Primer: 99 * 117.3907 = 11621.7 -> 11630.
export function round10Up(value: number): number {
  return Math.ceil(value / 10) * 10;
}

// EUR baza -> prikazana RSD vrednost (zaokružena naviše na 10).
export function eurToRsd(eur: number, rate: number): number {
  return round10Up(eur * rate);
}

export function formatEur(value: number): string {
  return `${value.toLocaleString("sr-RS")} EUR`;
}

export function formatRsd(value: number): string {
  return `${value.toLocaleString("sr-RS")} RSD`;
}

// Čista funkcija za prikaz iznosa iz EUR baze, u zadatoj valuti/kursu.
// `rsdOverride` (ako postoji) preskače računanje i prikazuje ručno unetu RSD cenu
// (koristi se samo za prikaz u katalogu, ne za naplatu porudžbine).
export function formatMoneyFromEur(
  eur: number,
  options: { currency: Currency; rate: number; rsdOverride?: number | null },
): string {
  const { currency, rate, rsdOverride } = options;
  if (currency === "RSD") {
    const rsd =
      rsdOverride != null && Number.isFinite(rsdOverride)
        ? rsdOverride
        : eurToRsd(eur, rate);
    return formatRsd(rsd);
  }
  return formatEur(eur);
}
