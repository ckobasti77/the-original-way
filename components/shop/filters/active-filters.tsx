"use client";

import { useMemo } from "react";

import { computePriceStats } from "@/lib/shop-filtering";
import type { ShopFilters } from "@/lib/shop-taxonomy";

import { CloseIcon, usePriceLabel, useValueLabels } from "./filter-controls";
import {
  clearAllFilters,
  clearGroup,
  toggleValue,
  useShopFilters,
  type MultiGroup,
} from "./filter-state";

export type ActiveChip = {
  key: string;
  label: string;
  next: ShopFilters;
};

const MULTI_GROUPS: MultiGroup[] = ["gender", "type", "category", "brand", "size", "collection"];

/** Svaki aktivni izbor kao zaseban chip, sa filterima kakvi bi bili bez njega. */
export function useActiveChips(): ActiveChip[] {
  const { copy, filters, records, taxonomy } = useShopFilters();
  const labelFor = useValueLabels(taxonomy, copy);
  const priceLabel = usePriceLabel(copy);
  const priceStats = useMemo(() => computePriceStats(records, filters), [filters, records]);

  const chips: ActiveChip[] = [];

  if (filters.q) {
    chips.push({ key: "q", label: `„${filters.q}“`, next: { ...filters, q: undefined } });
  }

  for (const group of MULTI_GROUPS) {
    for (const value of filters[group] as string[]) {
      chips.push({
        key: `${group}:${value}`,
        label: group === "size" ? `${copy.groups.size} ${value}` : labelFor(group, value),
        next: toggleValue(filters, group, value),
      });
    }
  }

  if (filters.min !== undefined || filters.max !== undefined) {
    chips.push({
      key: "price",
      label: priceLabel(filters, priceStats),
      next: clearGroup(filters, "price"),
    });
  }

  if (filters.availability === "in-stock") {
    chips.push({
      key: "availability",
      label: copy.inStock,
      next: clearGroup(filters, "availability"),
    });
  }

  return chips;
}

export function RemovableChip({
  chip,
  onRemove,
  removeLabel,
}: {
  chip: ActiveChip;
  onRemove: () => void;
  removeLabel: string;
}) {
  return (
    <button
      type="button"
      onClick={onRemove}
      aria-label={`${removeLabel}: ${chip.label}`}
      className="tow-on-primary group inline-flex h-9 max-w-[16rem] shrink-0 items-center gap-1.5 rounded-full border border-[var(--text-primary)] bg-[var(--text-primary)] pl-3.5 pr-2.5 text-[0.8rem] font-semibold transition hover:opacity-85"
    >
      <span className="min-w-0 truncate">{chip.label}</span>
      <CloseIcon className="h-3.5 w-3.5 shrink-0 opacity-70 transition group-hover:opacity-100" />
    </button>
  );
}

/** Red aktivnih filtera ispod desktop trake (prelama se u vise redova). */
export function ActiveFiltersRow() {
  const { apply, copy, filters } = useShopFilters();
  const chips = useActiveChips();

  if (chips.length === 0) return null;

  return (
    <div className="mb-6 hidden flex-wrap items-center gap-2 lg:flex" aria-label={copy.active} role="group">
      {chips.map((chip) => (
        <RemovableChip
          key={chip.key}
          chip={chip}
          removeLabel={copy.remove}
          onRemove={() => apply(chip.next)}
        />
      ))}
      {chips.length > 1 ? (
        <button
          type="button"
          onClick={() => apply(clearAllFilters(filters))}
          className="ml-1 min-h-9 px-2 text-xs font-bold uppercase tracking-[0.14em] text-[var(--text-secondary)] underline-offset-4 transition hover:text-[var(--text-primary)] hover:underline"
        >
          {copy.clearAll}
        </button>
      ) : null}
    </div>
  );
}
