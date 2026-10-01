"use client";

import { useId, useMemo, useState, type ReactNode } from "react";

import { useCurrency } from "@/components/currency-provider";
import {
  SHOP_PRODUCT_GENDERS,
  SHOP_PRODUCT_TYPES,
  type FacetCounts,
  type FilterGroup,
  type PriceStats,
} from "@/lib/shop-filtering";
import { getSizeKind, type ShopFilters, type SortMode } from "@/lib/shop-taxonomy";

import {
  clearGroup,
  toggleValue,
  type FilterOption,
  type FiltersCopy,
  type FilterTaxonomy,
} from "./filter-state";

// ---------------------------------------------------------------------------
// Opcije i oznake
// ---------------------------------------------------------------------------

export function getTypeOptions(copy: FiltersCopy, available: Set<string>) {
  return SHOP_PRODUCT_TYPES.filter((type) => available.has(type)).map<FilterOption>(
    (type) => ({ value: type, label: copy.types[type] }),
  );
}

export function getGenderOptions(copy: FiltersCopy, available: Set<string>) {
  return SHOP_PRODUCT_GENDERS.filter((gender) => available.has(gender)).map<FilterOption>(
    (gender) => ({ value: gender, label: copy.genders[gender] }),
  );
}

export function useValueLabels(taxonomy: FilterTaxonomy, copy: FiltersCopy) {
  return useMemo(() => {
    const brand = new Map(taxonomy.brands.map((option) => [option.value, option.label]));
    const collection = new Map(
      taxonomy.collections.map((option) => [option.value, option.label]),
    );
    const category = new Map(
      taxonomy.categories.map((category) => [category.slug, category.name]),
    );

    return (group: FilterGroup, value: string) => {
      if (group === "type") return copy.types[value as keyof FiltersCopy["types"]] ?? value;
      if (group === "gender") {
        return copy.genders[value as keyof FiltersCopy["genders"]] ?? value;
      }
      if (group === "brand") return brand.get(value) ?? value;
      if (group === "collection") return collection.get(value) ?? value;
      if (group === "category") return category.get(value) ?? value;
      return value;
    };
  }, [copy, taxonomy]);
}

export function usePriceLabel(copy: FiltersCopy) {
  const { formatPrice } = useCurrency();
  return (filters: ShopFilters, stats: PriceStats) => {
    if (filters.min === undefined && filters.max !== undefined) {
      return `${copy.priceTo} ${formatPrice(filters.max)}`;
    }
    if (filters.max === undefined && filters.min !== undefined) {
      return `${copy.priceFrom} ${formatPrice(filters.min)}`;
    }
    return `${formatPrice(filters.min ?? stats.floor)} – ${formatPrice(filters.max ?? stats.ceil)}`;
  };
}

// ---------------------------------------------------------------------------
// Ikonice
// ---------------------------------------------------------------------------

export function ChevronIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function CloseIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export function FiltersIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.9" viewBox="0 0 24 24">
      <path d="M4 7h10M18 7h2M4 17h4M12 17h8" />
      <circle cx="16" cy="7" r="2" />
      <circle cx="10" cy="17" r="2" />
    </svg>
  );
}

export function SortIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.9" viewBox="0 0 24 24">
      <path d="M7 4v16M3.5 16.5 7 20l3.5-3.5M17 20V4M13.5 7.5 17 4l3.5 3.5" />
    </svg>
  );
}

function CheckIcon({ className = "h-3 w-3" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.6" viewBox="0 0 24 24">
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Chip / velicina / prekidac
// ---------------------------------------------------------------------------

const focusRing =
  "peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--accent)]";

export function OptionChip({
  checked,
  count,
  label,
  onToggle,
}: {
  checked: boolean;
  count?: number;
  label: string;
  onToggle: () => void;
}) {
  const disabled = !checked && count === 0;

  return (
    <label className={`inline-flex max-w-full ${disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer"}`}>
      <input
        type="checkbox"
        className="peer sr-only"
        checked={checked}
        disabled={disabled}
        onChange={onToggle}
      />
      <span
        className={`flex min-h-9 max-w-full items-center gap-2 rounded-full border px-3.5 text-[0.82rem] font-semibold transition duration-200 ${focusRing} ${
          checked
            ? "tow-on-primary border-[var(--text-primary)] bg-[var(--text-primary)]"
            : `border-[var(--border-soft)] bg-[var(--surface)] text-[var(--text-primary)] ${
                disabled ? "" : "hover:border-[var(--border-strong)]"
              }`
        }`}
      >
        {checked ? <CheckIcon className="-ml-0.5 h-3 w-3 shrink-0" /> : null}
        <span className="min-w-0 truncate">{label}</span>
        {count !== undefined ? (
          <span className="shrink-0 text-[0.7rem] font-bold tabular-nums opacity-55">{count}</span>
        ) : null}
      </span>
    </label>
  );
}

function SizeTile({
  checked,
  count,
  label,
  onToggle,
}: {
  checked: boolean;
  count: number;
  label: string;
  onToggle: () => void;
}) {
  const disabled = !checked && count === 0;

  return (
    <label className={disabled ? "cursor-not-allowed opacity-35" : "cursor-pointer"} title={`${label} · ${count}`}>
      <input
        type="checkbox"
        className="peer sr-only"
        checked={checked}
        disabled={disabled}
        onChange={onToggle}
      />
      <span
        className={`grid h-10 place-items-center rounded-xl border px-1 text-[0.82rem] font-bold tabular-nums transition duration-200 ${focusRing} ${
          checked
            ? "tow-on-primary border-[var(--text-primary)] bg-[var(--text-primary)]"
            : `border-[var(--border-soft)] bg-[var(--surface)] text-[var(--text-primary)] ${
                disabled ? "line-through decoration-[var(--text-muted)]" : "hover:border-[var(--border-strong)]"
              }`
        }`}
      >
        {label}
      </span>
    </label>
  );
}

export function Switch({
  checked,
  label,
  onToggle,
}: {
  checked: boolean;
  label: string;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] ${
        checked
          ? "border-[var(--text-primary)] bg-[var(--text-primary)]"
          : "border-[var(--border-strong)] bg-[rgba(var(--accent-rgb),0.08)]"
      }`}
    >
      <span
        className={`h-[1.1rem] w-[1.1rem] rounded-full shadow-[0_2px_6px_rgba(var(--shadow-rgb),0.25)] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          checked ? "translate-x-[1.3rem] bg-[var(--page-bg)]" : "translate-x-[0.15rem] bg-[var(--surface-opaque)]"
        }`}
      />
    </button>
  );
}

// ---------------------------------------------------------------------------
// Klizac cene sa histogramom
// ---------------------------------------------------------------------------

function priceStep(span: number) {
  if (span > 2000) return 10;
  if (span > 300) return 5;
  return 1;
}

export function PriceRange({
  copy,
  max,
  min,
  onChange,
  onCommit,
  stats,
}: {
  copy: FiltersCopy;
  max: number | undefined;
  min: number | undefined;
  /** Svaki pomeraj (draft mod). */
  onChange?: (min: number | undefined, max: number | undefined) => void;
  /** Kad korisnik pusti palac / zavrsi sa tastaturom (trenutna primena). */
  onCommit?: (min: number | undefined, max: number | undefined) => void;
  stats: PriceStats;
}) {
  const { formatPrice } = useCurrency();
  const { floor, ceil, histogram } = stats;
  const span = Math.max(0, ceil - floor);
  const step = priceStep(span);
  const clampLow = (value: number | undefined) => Math.max(floor, Math.min(value ?? floor, ceil));
  const clampHigh = (value: number | undefined) => Math.min(ceil, Math.max(value ?? ceil, floor));
  const [low, setLow] = useState(() => clampLow(min));
  const [high, setHigh] = useState(() => clampHigh(max));
  const [previous, setPrevious] = useState({ min, max });
  const peak = Math.max(1, ...histogram);

  // Spoljna promena (npr. "Obrisi" ili primena) sinhronizuje palceve bez
  // remount-a — remount bi korisniku tastature oduzeo fokus posle svakog koraka.
  if (previous.min !== min || previous.max !== max) {
    setPrevious({ min, max });
    setLow(clampLow(min));
    setHigh(clampHigh(max));
  }

  if (span === 0) {
    return (
      <p className="text-sm font-semibold text-[var(--text-muted)]">{formatPrice(floor)}</p>
    );
  }

  function normalize(nextLow: number, nextHigh: number) {
    return [nextLow <= floor ? undefined : nextLow, nextHigh >= ceil ? undefined : nextHigh] as const;
  }

  function update(nextLow: number, nextHigh: number) {
    setLow(nextLow);
    setHigh(nextHigh);
    onChange?.(...normalize(nextLow, nextHigh));
  }

  function commit() {
    onCommit?.(...normalize(low, high));
  }

  const lowPercent = ((low - floor) / span) * 100;
  const highPercent = ((high - floor) / span) * 100;
  const commitHandlers = {
    onPointerUp: commit,
    onKeyUp: commit,
    onTouchEnd: commit,
  };

  return (
    <div>
      <div className="flex h-14 items-end gap-[3px] px-[0.6875rem]" aria-hidden="true">
        {histogram.map((value, index) => {
          const bucketPercent = ((index + 0.5) / histogram.length) * 100;
          const inRange = bucketPercent >= lowPercent && bucketPercent <= highPercent;
          return (
            <span
              key={index}
              className={`flex-1 rounded-t-[3px] transition-colors duration-200 ${
                inRange && value > 0
                  ? "bg-[var(--text-primary)]"
                  : "bg-[rgba(var(--accent-rgb),0.14)]"
              }`}
              style={{ height: value === 0 ? 2 : `${Math.max(10, (value / peak) * 100)}%` }}
            />
          );
        })}
      </div>

      <div className="relative h-6">
        <div className="absolute inset-x-[0.6875rem] top-1/2 h-1 -translate-y-1/2 rounded-full bg-[rgba(var(--accent-rgb),0.14)]">
          <div
            className="absolute h-full rounded-full bg-[var(--text-primary)]"
            style={{ left: `${lowPercent}%`, right: `${100 - highPercent}%` }}
          />
        </div>
        <input
          type="range"
          className="tow-range"
          aria-label={copy.priceMin}
          aria-valuetext={formatPrice(low)}
          min={floor}
          max={ceil}
          step={step}
          value={low}
          // Kad su palcevi spojeni na desnom kraju, donji mora biti iznad.
          style={{ zIndex: lowPercent > 90 ? 3 : 2 }}
          onChange={(event) => update(Math.min(Number(event.target.value), high), high)}
          {...commitHandlers}
        />
        <input
          type="range"
          className="tow-range"
          aria-label={copy.priceMax}
          aria-valuetext={formatPrice(high)}
          min={floor}
          max={ceil}
          step={step}
          value={high}
          onChange={(event) => update(low, Math.max(Number(event.target.value), low))}
          {...commitHandlers}
        />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        {[
          [copy.priceFrom, low],
          [copy.priceTo, high],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-xl border border-[var(--border-soft)] bg-[var(--surface)] px-3 py-2"
          >
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-[var(--text-muted)]">
              {label}
            </p>
            <p className="mt-0.5 text-sm font-bold tabular-nums">{formatPrice(Number(value))}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sadrzaj jedne grupe (deli se izmedju popovera i sheet-ova)
// ---------------------------------------------------------------------------

/** Dugacke liste (kategorije, brendovi, kolekcije) kriju opcije bez rezultata. */
function visibleOptions(options: FilterOption[], counts: Record<string, number>, selected: string[]) {
  return options.filter(
    (option) => (counts[option.value] ?? 0) > 0 || selected.includes(option.value),
  );
}

function OptionList({
  counts,
  group,
  onChange,
  options,
  value,
}: {
  counts: Record<string, number>;
  group: "type" | "gender" | "category" | "brand" | "collection";
  onChange: (next: ShopFilters) => void;
  options: FilterOption[];
  value: ShopFilters;
}) {
  const selected = value[group] as string[];
  return (
    <div className="flex flex-wrap gap-2" role="group">
      {options.map((option) => (
        <OptionChip
          key={option.value}
          checked={selected.includes(option.value)}
          count={counts[option.value] ?? 0}
          label={option.label}
          onToggle={() => onChange(toggleValue(value, group, option.value))}
        />
      ))}
    </div>
  );
}

function BrandList({
  copy,
  counts,
  onChange,
  options,
  value,
}: {
  copy: FiltersCopy;
  counts: Record<string, number>;
  onChange: (next: ShopFilters) => void;
  options: FilterOption[];
  value: ShopFilters;
}) {
  const [query, setQuery] = useState("");
  const inputId = useId();
  const visible = visibleOptions(options, counts, value.brand);
  const normalized = query.trim().toLowerCase();
  const matching = normalized
    ? visible.filter((option) => option.label.toLowerCase().includes(normalized))
    : visible;

  return (
    <div className="grid gap-3">
      {visible.length > 8 ? (
        <div className="relative">
          <label htmlFor={inputId} className="sr-only">
            {copy.findBrand}
          </label>
          <svg aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="6.5" />
            <path d="m20 20-4.2-4.2" />
          </svg>
          <input
            id={inputId}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={copy.findBrand}
            className="h-10 w-full rounded-full border border-[var(--border-soft)] bg-[var(--surface)] pl-9 pr-3 text-sm font-semibold text-[var(--text-primary)] outline-none transition focus:border-[var(--accent)] focus:shadow-[0_0_0_4px_rgba(var(--accent-rgb),0.12)]"
          />
        </div>
      ) : null}
      {matching.length > 0 ? (
        <OptionList counts={counts} group="brand" onChange={onChange} options={matching} value={value} />
      ) : (
        <p className="text-sm font-semibold text-[var(--text-muted)]">{copy.noBrand}</p>
      )}
    </div>
  );
}

function SizeGrid({
  copy,
  counts,
  dense,
  onChange,
  sizes,
  value,
}: {
  copy: FiltersCopy;
  counts: Record<string, number>;
  dense?: boolean;
  onChange: (next: ShopFilters) => void;
  sizes: string[];
  value: ShopFilters;
}) {
  const groups = (["letter", "number", "other"] as const)
    .map((kind) => ({ kind, sizes: sizes.filter((size) => getSizeKind(size) === kind) }))
    .filter((group) => group.sizes.length > 0);

  return (
    <div className="grid gap-4">
      {groups.map((group) => (
        <div key={group.kind} className="grid gap-2">
          {groups.length > 1 ? (
            <p className="text-[0.66rem] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
              {copy.sizeKinds[group.kind]}
            </p>
          ) : null}
          <div className={`grid gap-1.5 ${dense ? "grid-cols-6" : "grid-cols-5 sm:grid-cols-6"}`} role="group">
            {group.sizes.map((size) => (
              <SizeTile
                key={size}
                checked={value.size.includes(size)}
                count={counts[size] ?? 0}
                label={size}
                onToggle={() => onChange(toggleValue(value, "size", size))}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function FilterGroupBody({
  availableGenders,
  availableTypes,
  copy,
  dense,
  facets,
  group,
  onChange,
  onPriceCommit,
  priceStats,
  taxonomy,
  value,
}: {
  availableGenders: Set<string>;
  availableTypes: Set<string>;
  copy: FiltersCopy;
  dense?: boolean;
  facets: FacetCounts;
  group: FilterGroup;
  onChange: (next: ShopFilters) => void;
  /** Ako postoji, klizac cene primenjuje tek na pustanje (trenutni mod). */
  onPriceCommit?: (next: ShopFilters) => void;
  priceStats: PriceStats;
  taxonomy: FilterTaxonomy;
  value: ShopFilters;
}) {
  if (group === "type") {
    return (
      <OptionList counts={facets.type} group="type" onChange={onChange} options={getTypeOptions(copy, availableTypes)} value={value} />
    );
  }

  if (group === "gender") {
    return (
      <OptionList counts={facets.gender} group="gender" onChange={onChange} options={getGenderOptions(copy, availableGenders)} value={value} />
    );
  }

  if (group === "category") {
    const byType = SHOP_PRODUCT_TYPES.map((type) => ({
      type,
      options: visibleOptions(
        taxonomy.categories
          .filter((category) => category.type === type)
          .map((category) => ({ value: category.slug, label: category.name })),
        facets.category,
        value.category,
      ),
    })).filter((entry) => entry.options.length > 0);

    return (
      <div className="grid gap-4">
        {byType.map((entry) => (
          <div key={entry.type} className="grid gap-2">
            {byType.length > 1 ? (
              <p className="text-[0.66rem] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                {copy.types[entry.type]}
              </p>
            ) : null}
            <OptionList counts={facets.category} group="category" onChange={onChange} options={entry.options} value={value} />
          </div>
        ))}
      </div>
    );
  }

  if (group === "brand") {
    return (
      <BrandList copy={copy} counts={facets.brand} onChange={onChange} options={taxonomy.brands} value={value} />
    );
  }

  if (group === "collection") {
    return (
      <OptionList
        counts={facets.collection}
        group="collection"
        onChange={onChange}
        options={visibleOptions(taxonomy.collections, facets.collection, value.collection)}
        value={value}
      />
    );
  }

  if (group === "size") {
    return (
      <SizeGrid copy={copy} counts={facets.size} dense={dense} onChange={onChange} sizes={taxonomy.sizes} value={value} />
    );
  }

  if (group === "price") {
    return (
      <PriceRange
        key={`${priceStats.floor}-${priceStats.ceil}`}
        copy={copy}
        min={value.min}
        max={value.max}
        stats={priceStats}
        onChange={
          onPriceCommit ? undefined : (min, max) => onChange({ ...value, min, max })
        }
        onCommit={
          onPriceCommit ? (min, max) => onPriceCommit({ ...value, min, max }) : undefined
        }
      />
    );
  }

  // availability
  const checked = value.availability === "in-stock";
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm font-semibold">{copy.inStock}</p>
        <p className="mt-0.5 text-xs font-medium text-[var(--text-muted)]">
          {copy.inStockHint} · {facets.inStock}
        </p>
      </div>
      <Switch
        checked={checked}
        label={copy.inStock}
        onToggle={() =>
          onChange(
            checked ? clearGroup(value, "availability") : { ...value, availability: "in-stock" },
          )
        }
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sortiranje
// ---------------------------------------------------------------------------

export const SORT_ORDER: SortMode[] = ["recommended", "price-asc", "price-desc"];

export function SortOptions({
  copy,
  onSelect,
  value,
}: {
  copy: FiltersCopy;
  onSelect: (sort: SortMode) => void;
  value: SortMode;
}) {
  const name = useId();
  return (
    <fieldset className="grid gap-1">
      <legend className="sr-only">{copy.sort}</legend>
      {SORT_ORDER.map((sort) => {
        const checked = sort === value;
        return (
          <label
            key={sort}
            className={`flex min-h-11 cursor-pointer items-center justify-between gap-4 rounded-xl px-3 text-sm font-semibold transition hover:bg-[rgba(var(--accent-rgb),0.06)] has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-[var(--accent)] ${
              checked ? "bg-[rgba(var(--accent-rgb),0.08)]" : ""
            }`}
          >
            <input
              type="radio"
              name={name}
              className="sr-only"
              checked={checked}
              onChange={() => onSelect(sort)}
            />
            <span>{copy.sortOptions[sort]}</span>
            <span
              className={`grid h-5 w-5 place-items-center rounded-full border transition ${
                checked
                  ? "tow-on-primary border-[var(--text-primary)] bg-[var(--text-primary)]"
                  : "border-[var(--border-strong)]"
              }`}
            >
              {checked ? <CheckIcon className="h-3 w-3" /> : null}
            </span>
          </label>
        );
      })}
    </fieldset>
  );
}

export function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <p className="text-[0.7rem] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">
      {children}
    </p>
  );
}
