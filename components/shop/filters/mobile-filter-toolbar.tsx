"use client";

import { useMemo, useState } from "react";

import { formatProductCount } from "@/lib/storefront-i18n";

import { RemovableChip, useActiveChips } from "./active-filters";
import { FiltersIcon, SortIcon, getGenderOptions, getTypeOptions } from "./filter-controls";
import { FiltersSheet, SortSheet } from "./filter-sheet";
import { clearAllFilters, toggleValue, useShopFilters } from "./filter-state";

/**
 * Telefon/tablet (< lg): kompaktna sticky traka "Filteri · Sortiraj · N" i
 * jedan horizontalni red — aktivni filteri (sa X) pa brzi izbori na jedan dodir.
 * Svi filteri se izvlace kao bottom sheet.
 */
export function MobileFilterToolbar() {
  const { activeCount, apply, copy, filters, locale, records, resultCount } = useShopFilters();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const chips = useActiveChips();

  const quickOptions = useMemo(() => {
    const genders = getGenderOptions(copy, new Set(records.map((record) => record.gender)));
    const types = getTypeOptions(copy, new Set(records.map((record) => record.type)));
    return [
      ...genders.map((option) => ({ ...option, group: "gender" as const })),
      ...types.map((option) => ({ ...option, group: "type" as const })),
    ];
  }, [copy, records]);

  const inactiveQuick = quickOptions.filter(
    (option) => !(filters[option.group] as string[]).includes(option.value),
  );
  const sortIsCustom = filters.sort !== "recommended";

  return (
    <>
      <div className="shop-filter-bar sticky z-20 border-b border-[var(--border-soft)] bg-[var(--surface-strong)] backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-2 px-4 md:px-8">
          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            className="tow-on-primary inline-flex h-10 items-center gap-2 rounded-full bg-[var(--text-primary)] pl-3.5 pr-4 text-[0.85rem] font-bold shadow-[0_10px_24px_rgba(var(--shadow-rgb),0.16)] transition active:scale-[0.97]"
          >
            <FiltersIcon />
            {copy.title}
            {activeCount > 0 ? (
              <span className="grid h-5 min-w-5 place-items-center rounded-full bg-[var(--page-bg)] px-1.5 text-[0.68rem] font-bold tabular-nums text-[var(--text-primary)]">
                {activeCount}
              </span>
            ) : null}
          </button>
          <button
            type="button"
            onClick={() => setSortOpen(true)}
            className="relative inline-flex h-10 items-center gap-2 rounded-full border border-[var(--border-soft)] bg-[var(--surface)] pl-3.5 pr-4 text-[0.85rem] font-semibold text-[var(--text-primary)] transition active:scale-[0.97]"
          >
            <SortIcon />
            {copy.sort}
            {sortIsCustom ? (
              <span aria-hidden="true" className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[var(--text-primary)]" />
            ) : null}
          </button>
          <p className="ml-auto truncate text-[0.8rem] font-semibold tabular-nums text-[var(--text-muted)]" aria-live="polite">
            {formatProductCount(resultCount, locale)}
          </p>
        </div>
      </div>

      <div
        className="tow-scroll-x -mb-2 flex gap-2 overflow-x-auto px-4 pb-1 pt-4 md:px-8 lg:hidden"
        role="group"
        aria-label={chips.length > 0 ? copy.active : copy.quick}
      >
        {chips.map((chip) => (
          <RemovableChip key={chip.key} chip={chip} removeLabel={copy.remove} onRemove={() => apply(chip.next)} />
        ))}
        {inactiveQuick.map((option) => (
          <button
            key={`${option.group}:${option.value}`}
            type="button"
            onClick={() => apply(toggleValue(filters, option.group, option.value))}
            className="inline-flex h-9 shrink-0 items-center rounded-full border border-[var(--border-soft)] bg-[var(--surface)] px-3.5 text-[0.8rem] font-semibold text-[var(--text-primary)] transition active:scale-[0.97]"
          >
            {option.label}
          </button>
        ))}
        {filters.availability !== "in-stock" ? (
          <button
            type="button"
            onClick={() => apply({ ...filters, availability: "in-stock" })}
            className="inline-flex h-9 shrink-0 items-center gap-2 rounded-full border border-[var(--border-soft)] bg-[var(--surface)] px-3.5 text-[0.8rem] font-semibold text-[var(--text-primary)] transition active:scale-[0.97]"
          >
            <span aria-hidden="true" className="h-2 w-2 rounded-full bg-[#3f8f5a]" />
            {copy.inStock}
          </button>
        ) : null}
        {chips.length > 1 ? (
          <button
            type="button"
            onClick={() => apply(clearAllFilters(filters))}
            className="inline-flex h-9 shrink-0 items-center px-2 text-xs font-bold uppercase tracking-[0.14em] text-[var(--text-secondary)]"
          >
            {copy.clearAll}
          </button>
        ) : null}
      </div>

      <FiltersSheet open={filtersOpen} onClose={() => setFiltersOpen(false)} side="bottom" />
      <SortSheet open={sortOpen} onClose={() => setSortOpen(false)} />
    </>
  );
}
