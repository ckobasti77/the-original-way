"use client";

import type { ReactNode } from "react";

import { clearAllFilters, useOptionalShopFilters, useShopFilters } from "./filter-state";

/** Omotac oko server-renderovanih kartica: blago utisavanje dok stize novi rezultat. */
export function ResultsPane({ children }: { children: ReactNode }) {
  const { copy, isPending } = useShopFilters();

  return (
    <div
      id="shop-results"
      aria-busy={isPending}
      className={`relative min-w-0 scroll-mt-[9.5rem] transition-opacity duration-300 ${
        isPending ? "opacity-55" : "opacity-100"
      }`}
    >
      {isPending ? <span className="sr-only">{copy.updating}</span> : null}
      {children}
    </div>
  );
}

export function ClearFiltersButton() {
  const context = useOptionalShopFilters();
  if (!context) return null;
  const { apply, copy, filters } = context;

  return (
    <button
      type="button"
      onClick={() => apply(clearAllFilters(filters))}
      className="store-button-secondary mt-6"
    >
      {copy.clearFilters}
    </button>
  );
}
