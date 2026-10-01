"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useOptimistic,
  useRef,
  useTransition,
  type ReactNode,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  countActiveFilters,
  countMatches,
  filtersToSearchParams,
  parseShopFilters,
  type FilterGroup,
  type FilterRecord,
} from "@/lib/shop-filtering";
import type { ShopCategory, ShopFilters } from "@/lib/shop-taxonomy";
import { STORE_COPY, type StoreLocale } from "@/lib/storefront-i18n";

export type FiltersCopy = (typeof STORE_COPY)[StoreLocale]["filters"];

export type FilterOption = { value: string; label: string };

export type FilterTaxonomy = {
  brands: FilterOption[];
  categories: ShopCategory[];
  collections: FilterOption[];
  sizes: string[];
};

export type MultiGroup = "type" | "gender" | "category" | "brand" | "collection" | "size";

const FILTER_PARAM_KEYS = [
  "availability",
  "brand",
  "category",
  "collection",
  "gender",
  "max",
  "min",
  "q",
  "size",
  "sort",
  "type",
] as const;

function filtersFromQuery(query: string) {
  const params = new URLSearchParams(query);
  const input: Record<string, string[]> = {};
  for (const key of FILTER_PARAM_KEYS) {
    input[key] = params.getAll(key);
  }
  return parseShopFilters(input);
}

export const EMPTY_FILTERS: ShopFilters = parseShopFilters({});

export function toggleValue(
  filters: ShopFilters,
  group: MultiGroup,
  value: string,
): ShopFilters {
  const current = filters[group] as string[];
  const next = current.includes(value)
    ? current.filter((item) => item !== value)
    : [...current, value];
  return { ...filters, [group]: next } as ShopFilters;
}

export function clearGroup(filters: ShopFilters, group: FilterGroup): ShopFilters {
  if (group === "price") return { ...filters, min: undefined, max: undefined };
  if (group === "availability") return { ...filters, availability: undefined };
  return { ...filters, [group]: [] } as ShopFilters;
}

/** Brise sve izbore, a zadrzava sortiranje. */
export function clearAllFilters(filters: ShopFilters): ShopFilters {
  return { ...EMPTY_FILTERS, sort: filters.sort };
}

export function isGroupActive(filters: ShopFilters, group: FilterGroup) {
  if (group === "price") return filters.min !== undefined || filters.max !== undefined;
  if (group === "availability") return filters.availability === "in-stock";
  return filters[group].length > 0;
}

export function sameFilters(a: ShopFilters, b: ShopFilters) {
  return (
    filtersToSearchParams(a).toString() === filtersToSearchParams(b).toString()
  );
}

type ShopFiltersContextValue = {
  locale: StoreLocale;
  copy: FiltersCopy;
  records: FilterRecord[];
  taxonomy: FilterTaxonomy;
  /** Primenjeni filteri (optimisticki — menjaju se odmah na klik). */
  filters: ShopFilters;
  activeCount: number;
  /** Broj rezultata za `filters`; racuna se na klijentu, pa je odmah tacan. */
  resultCount: number;
  /** Broj rezultata za proizvoljan (npr. draft) skup filtera. */
  countFor: (filters: ShopFilters) => number;
  isPending: boolean;
  apply: (next: ShopFilters) => void;
};

const ShopFiltersContext = createContext<ShopFiltersContextValue | null>(null);

function resultsAreAboveViewport() {
  const results = document.getElementById("shop-results");
  return Boolean(results && results.getBoundingClientRect().top < 0);
}

function scrollToResults() {
  const results = document.getElementById("shop-results");
  if (!results) return;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  results.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
}

export function ShopFiltersProvider({
  children,
  locale,
  records,
  recordsQuery,
  serverCount,
  taxonomy,
}: {
  children: ReactNode;
  locale: StoreLocale;
  records: FilterRecord[];
  /** `q` za koji je server suzio `records` (pretraga ostaje na serveru). */
  recordsQuery: string | undefined;
  serverCount: number;
  taxonomy: FilterTaxonomy;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const actualQuery = searchParams.toString();
  const [isPending, startTransition] = useTransition();
  const [optimisticQuery, setOptimisticQuery] = useOptimistic<string, string>(
    actualQuery,
    (_current, next) => next,
  );

  const filters = useMemo(() => filtersFromQuery(optimisticQuery), [optimisticQuery]);
  // Ako je korisnik bio ispod pocetka rezultata, vracamo ga na njihov vrh —
  // i jos jednom kad stigne novi render, jer se sadrzaj iznad moze pomeriti.
  const scrollAfterCommitRef = useRef(false);

  useEffect(() => {
    if (isPending || !scrollAfterCommitRef.current) return;
    scrollAfterCommitRef.current = false;
    scrollToResults();
  }, [isPending]);

  const canonicalOrder = useMemo(
    () => ({
      brand: taxonomy.brands.map((option) => option.value),
      category: taxonomy.categories.map((category) => category.slug),
      collection: taxonomy.collections.map((option) => option.value),
      size: taxonomy.sizes,
    }),
    [taxonomy],
  );

  const value = useMemo<ShopFiltersContextValue>(() => {
    // Dok nova pretraga ne stigne sa servera, `records` su za stari `q`.
    const recordsAreStale = (filters.q ?? undefined) !== (recordsQuery ?? undefined);

    return {
      locale,
      copy: STORE_COPY[locale].filters,
      records,
      taxonomy,
      filters,
      activeCount: countActiveFilters(filters),
      resultCount: recordsAreStale ? serverCount : countMatches(records, filters),
      countFor: (next) => countMatches(records, next),
      isPending,
      apply: (next) => {
        const params = new URLSearchParams(optimisticQuery);
        for (const key of FILTER_PARAM_KEYS) params.delete(key);
        filtersToSearchParams(next, canonicalOrder).forEach((paramValue, key) => {
          params.append(key, paramValue);
        });
        const query = params.toString();
        if (query === optimisticQuery) return;

        startTransition(() => {
          setOptimisticQuery(query);
          router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
        });
        if (resultsAreAboveViewport()) {
          scrollAfterCommitRef.current = true;
          scrollToResults();
        }
      },
    };
  }, [
    canonicalOrder,
    filters,
    isPending,
    locale,
    optimisticQuery,
    pathname,
    records,
    recordsQuery,
    router,
    serverCount,
    setOptimisticQuery,
    taxonomy,
  ]);

  return (
    <ShopFiltersContext.Provider value={value}>{children}</ShopFiltersContext.Provider>
  );
}

/** Za komponente koje mogu da se renderuju i van providera (Suspense fallback). */
export function useOptionalShopFilters() {
  return useContext(ShopFiltersContext);
}

export function useShopFilters() {
  const context = useContext(ShopFiltersContext);
  if (!context) {
    throw new Error("useShopFilters must be used within ShopFiltersProvider.");
  }
  return context;
}
