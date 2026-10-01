"use client";

import { useId, useMemo, useState, type ReactNode } from "react";

import {
  computeFacets,
  computePriceStats,
  countActiveFilters,
  type FilterGroup,
} from "@/lib/shop-filtering";
import type { ShopFilters, SortMode } from "@/lib/shop-taxonomy";
import { formatProductCount } from "@/lib/storefront-i18n";

import {
  CloseIcon,
  ChevronIcon,
  FilterGroupBody,
  SortOptions,
  usePriceLabel,
  useValueLabels,
} from "./filter-controls";
import { clearAllFilters, isGroupActive, useShopFilters } from "./filter-state";
import { Sheet } from "./sheet";

const SHEET_GROUPS: FilterGroup[] = [
  "gender",
  "type",
  "category",
  "size",
  "brand",
  "price",
  "collection",
];

// Ove sekcije su otvorene odmah; ostale se otvaraju ako imaju izbor.
const OPEN_BY_DEFAULT = new Set<FilterGroup>(["gender", "type", "category", "size"]);

function SheetSection({
  children,
  defaultOpen,
  summary,
  title,
}: {
  children: ReactNode;
  defaultOpen: boolean;
  summary?: string;
  title: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  return (
    <section className="border-b border-[var(--border-soft)] last:border-b-0">
      <h3>
        <button
          type="button"
          aria-controls={panelId}
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
          className="flex min-h-14 w-full items-center justify-between gap-3 text-left"
        >
          <span className="text-[0.95rem] font-semibold">{title}</span>
          <span className="flex min-w-0 items-center gap-2 text-[var(--text-muted)]">
            {summary ? (
              <span className="max-w-[11rem] truncate text-xs font-semibold text-[var(--text-secondary)]">
                {summary}
              </span>
            ) : null}
            <ChevronIcon
              className={`h-4 w-4 shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
            />
          </span>
        </button>
      </h3>
      <div
        id={panelId}
        inert={!open}
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="pb-5 pt-0.5">{children}</div>
        </div>
      </div>
    </section>
  );
}

/**
 * Svi filteri u fioci (dno ekrana na telefonu, desno na desktopu). Izmene su
 * nacrt dok se ne pritisne "Prikazi N" — broj se racuna uzivo na klijentu.
 */
export function FiltersSheet({
  onClose,
  open,
  side,
}: {
  onClose: () => void;
  open: boolean;
  side: "bottom" | "right";
}) {
  const { apply, copy, countFor, filters, locale, records, taxonomy } = useShopFilters();
  const [draft, setDraft] = useState(filters);
  const [previousOpen, setPreviousOpen] = useState(open);

  // Svako otvaranje krece od trenutno primenjenih filtera.
  if (open !== previousOpen) {
    setPreviousOpen(open);
    if (open) setDraft(filters);
  }

  const facets = useMemo(() => computeFacets(records, draft), [draft, records]);
  const priceStats = useMemo(() => computePriceStats(records, draft), [draft, records]);
  const availableTypes = useMemo(() => new Set<string>(records.map((record) => record.type)), [records]);
  const availableGenders = useMemo(
    () => new Set<string>(records.map((record) => record.gender)),
    [records],
  );
  const labelFor = useValueLabels(taxonomy, copy);
  const priceLabel = usePriceLabel(copy);
  const draftCount = countFor(draft);
  const draftActive = countActiveFilters(draft) > 0;

  function summaryFor(group: FilterGroup) {
    if (!isGroupActive(draft, group)) return undefined;
    if (group === "price") return priceLabel(draft, priceStats);
    if (group === "availability") return copy.inStock;
    const values = draft[group] as string[];
    return values.map((value) => labelFor(group, value)).join(", ");
  }

  const groups = SHEET_GROUPS.filter(
    (group) => group !== "collection" || taxonomy.collections.length > 0,
  );

  return (
    <Sheet
      open={open}
      onClose={onClose}
      side={side}
      label={copy.title}
      header={
        <div
          className={`flex items-center justify-between gap-3 px-4 sm:px-5 ${
            side === "bottom" ? "pb-3 pt-1" : "pb-4 pt-5"
          }`}
        >
          <div className="flex items-baseline gap-2">
            <h2 className="font-display text-[1.7rem] font-semibold leading-none">{copy.title}</h2>
            {draftActive ? (
              <span className="text-sm font-bold tabular-nums text-[var(--text-muted)]">
                {countActiveFilters(draft)}
              </span>
            ) : null}
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={!draftActive}
              onClick={() => setDraft(clearAllFilters(draft))}
              className={`min-h-10 rounded-full px-3 text-xs font-bold uppercase tracking-[0.14em] text-[var(--text-secondary)] transition hover:text-[var(--text-primary)] ${
                draftActive ? "" : "invisible"
              }`}
            >
              {copy.clearAll}
            </button>
            <button
              type="button"
              data-autofocus
              onClick={onClose}
              aria-label={copy.close}
              className="grid h-10 w-10 place-items-center rounded-full border border-[var(--border-soft)] text-[var(--text-secondary)] transition hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]"
            >
              <CloseIcon className="h-[1.1rem] w-[1.1rem]" />
            </button>
          </div>
        </div>
      }
      footer={
        <button
          type="button"
          disabled={draftCount === 0}
          onClick={() => {
            onClose();
            apply(draft);
          }}
          className="store-button-primary w-full"
        >
          {draftCount === 0
            ? copy.showNone
            : `${copy.show} ${formatProductCount(draftCount, locale)}`}
        </button>
      }
    >
      <div className="px-4 sm:px-5">
        {groups.map((group) => (
          <SheetSection
            key={group}
            title={copy.groups[group]}
            summary={summaryFor(group)}
            defaultOpen={OPEN_BY_DEFAULT.has(group) || isGroupActive(draft, group)}
          >
            <FilterGroupBody
              group={group}
              value={draft}
              onChange={setDraft}
              facets={facets}
              priceStats={priceStats}
              taxonomy={taxonomy}
              copy={copy}
              availableTypes={availableTypes}
              availableGenders={availableGenders}
            />
          </SheetSection>
        ))}
        <div className="py-5">
          <FilterGroupBody
            group="availability"
            value={draft}
            onChange={setDraft}
            facets={facets}
            priceStats={priceStats}
            taxonomy={taxonomy}
            copy={copy}
            availableTypes={availableTypes}
            availableGenders={availableGenders}
          />
        </div>
      </div>
    </Sheet>
  );
}

/** Mali sheet za sortiranje (telefon): izbor se primenjuje odmah. */
export function SortSheet({ onClose, open }: { onClose: () => void; open: boolean }) {
  const { apply, copy, filters } = useShopFilters();

  function select(sort: SortMode) {
    onClose();
    if (sort !== filters.sort) apply({ ...filters, sort } satisfies ShopFilters);
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      side="bottom"
      label={copy.sort}
      header={
        <div className="flex items-center justify-between gap-3 px-4 pb-3 pt-1">
          <h2 className="font-display text-[1.7rem] font-semibold leading-none">{copy.sort}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={copy.close}
            className="grid h-10 w-10 place-items-center rounded-full border border-[var(--border-soft)] text-[var(--text-secondary)]"
          >
            <CloseIcon className="h-[1.1rem] w-[1.1rem]" />
          </button>
        </div>
      }
    >
      <div className="px-2 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-2">
        <SortOptions copy={copy} value={filters.sort} onSelect={select} />
      </div>
    </Sheet>
  );
}
