"use client";

import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";

import {
  computeFacets,
  computePriceStats,
  type FilterGroup,
} from "@/lib/shop-filtering";
import type { ShopFilters, SortMode } from "@/lib/shop-taxonomy";
import { formatProductCount } from "@/lib/storefront-i18n";

import {
  ChevronIcon,
  FilterGroupBody,
  FiltersIcon,
  SortOptions,
  usePriceLabel,
  useValueLabels,
} from "./filter-controls";
import { FiltersSheet } from "./filter-sheet";
import { clearGroup, isGroupActive, useShopFilters } from "./filter-state";

const BAR_GROUPS: FilterGroup[] = ["gender", "type", "category", "brand", "size", "price"];

type PanelId = FilterGroup | "sort";

// Sirina panela po grupi — dovoljno za sadrzaj, bez praznog prostora.
const PANEL_WIDTH: Partial<Record<PanelId, string>> = {
  gender: "w-[19rem]",
  type: "w-[19rem]",
  category: "w-[30rem]",
  brand: "w-[24rem]",
  size: "w-[24rem]",
  price: "w-[22rem]",
  sort: "w-[16.5rem]",
};

function Pill({
  active,
  buttonRef,
  controls,
  label,
  onClick,
  open,
}: {
  active: boolean;
  buttonRef: (node: HTMLButtonElement | null) => void;
  controls: string;
  label: string;
  onClick: () => void;
  open: boolean;
}) {
  return (
    <button
      ref={buttonRef}
      type="button"
      aria-controls={controls}
      aria-expanded={open}
      aria-haspopup="dialog"
      onClick={onClick}
      className={`inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full border px-4 text-[0.82rem] font-semibold transition duration-200 ${
        active
          ? "tow-on-primary border-[var(--text-primary)] bg-[var(--text-primary)]"
          : open
            ? "border-[var(--border-strong)] bg-[var(--surface-opaque)] text-[var(--text-primary)]"
            : "border-[var(--border-soft)] bg-[var(--surface)] text-[var(--text-primary)] hover:border-[var(--border-strong)]"
      }`}
    >
      <span className="max-w-[12rem] truncate">{label}</span>
      <ChevronIcon
        className={`h-3.5 w-3.5 shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
      />
    </button>
  );
}

/**
 * Desktop (lg+): sticky traka iznad proizvoda. Svaka grupa je pill koji otvara
 * mali panel; izbor se primenjuje odmah. "Filteri" otvara sve grupe u fioci.
 */
export function DesktopFilterBar() {
  const { activeCount, apply, copy, filters, locale, records, resultCount, taxonomy } =
    useShopFilters();
  const [openPanel, setOpenPanel] = useState<PanelId | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const barRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const triggerRefs = useRef<Partial<Record<PanelId, HTMLButtonElement | null>>>({});
  const panelId = useId();

  const facets = useMemo(() => computeFacets(records, filters), [filters, records]);
  const priceStats = useMemo(() => computePriceStats(records, filters), [filters, records]);
  const availableTypes = useMemo(() => new Set<string>(records.map((record) => record.type)), [records]);
  const availableGenders = useMemo(
    () => new Set<string>(records.map((record) => record.gender)),
    [records],
  );
  const labelFor = useValueLabels(taxonomy, copy);
  const priceLabel = usePriceLabel(copy);

  // Panel se pozicionira ispod svog dugmeta, ali unutar trake (traka ima
  // horizontalni skrol, pa panel ne sme da bude u njemu — bio bi odsecen).
  useLayoutEffect(() => {
    if (!openPanel) return;
    const bar = barRef.current;
    const panel = panelRef.current;
    const trigger = triggerRefs.current[openPanel];
    if (!bar || !panel || !trigger) return;

    const place = () => {
      const barRect = bar.getBoundingClientRect();
      const triggerRect = trigger.getBoundingClientRect();
      const width = panel.offsetWidth;
      const preferred =
        openPanel === "sort"
          ? triggerRect.right - barRect.left - width
          : triggerRect.left - barRect.left;
      const left = Math.max(16, Math.min(preferred, barRect.width - width - 16));
      panel.style.left = `${left}px`;
    };

    place();
    panel.focus({ preventScroll: true });
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [openPanel]);

  useEffect(() => {
    if (!openPanel) return;

    const close = (returnFocus: boolean) => {
      const trigger = triggerRefs.current[openPanel];
      setOpenPanel(null);
      if (returnFocus) trigger?.focus();
    };

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (panelRef.current?.contains(target)) return;
      if (triggerRefs.current[openPanel]?.contains(target)) return;
      close(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close(true);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [openPanel]);

  function togglePanel(id: PanelId) {
    setOpenPanel((current) => (current === id ? null : id));
  }

  function pillLabel(group: FilterGroup) {
    const title = copy.groups[group];
    if (!isGroupActive(filters, group)) return title;
    if (group === "price") return priceLabel(filters, priceStats);
    const values = filters[group] as string[];
    if (values.length === 1) {
      const value = labelFor(group, values[0]);
      return group === "size" ? `${title} ${value}` : value;
    }
    return `${title} · ${values.length}`;
  }

  const panelTitle = openPanel === "sort" ? copy.sort : openPanel ? copy.groups[openPanel] : "";
  const inStock = filters.availability === "in-stock";

  return (
    <>
      <div className="shop-filter-bar sticky z-20 hidden border-b border-[var(--border-soft)] bg-[var(--surface-strong)] backdrop-blur-xl lg:block">
        <div ref={barRef} className="relative mx-auto flex h-16 max-w-7xl items-center gap-4 px-8">
          <button
            type="button"
            onClick={() => {
              setOpenPanel(null);
              setSheetOpen(true);
            }}
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full border border-[var(--border-strong)] bg-[var(--surface-opaque)] px-4 text-[0.82rem] font-bold text-[var(--text-primary)] transition hover:border-[var(--text-primary)]"
          >
            <FiltersIcon />
            {copy.allFilters}
            {activeCount > 0 ? (
              <span className="tow-on-primary grid h-5 min-w-5 place-items-center rounded-full bg-[var(--text-primary)] px-1.5 text-[0.68rem] font-bold tabular-nums">
                {activeCount}
              </span>
            ) : null}
          </button>

          <span aria-hidden="true" className="h-6 w-px shrink-0 bg-[var(--border-soft)]" />

          <div
            onScroll={() => setOpenPanel(null)}
            className="tow-scroll-x flex min-w-0 flex-1 items-center gap-2 overflow-x-auto py-1 [mask-image:linear-gradient(to_right,black_calc(100%-2.5rem),transparent)] pr-10"
            role="group"
            aria-label={copy.title}
          >
            {BAR_GROUPS.map((group) => (
              <Pill
                key={group}
                active={isGroupActive(filters, group)}
                open={openPanel === group}
                controls={panelId}
                label={pillLabel(group)}
                onClick={() => togglePanel(group)}
                buttonRef={(node) => {
                  triggerRefs.current[group] = node;
                }}
              />
            ))}
            <button
              type="button"
              aria-pressed={inStock}
              onClick={() =>
                apply(inStock ? clearGroup(filters, "availability") : { ...filters, availability: "in-stock" })
              }
              className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-full border px-4 text-[0.82rem] font-semibold transition duration-200 ${
                inStock
                  ? "tow-on-primary border-[var(--text-primary)] bg-[var(--text-primary)]"
                  : "border-[var(--border-soft)] bg-[var(--surface)] text-[var(--text-primary)] hover:border-[var(--border-strong)]"
              }`}
            >
              <span
                aria-hidden="true"
                className={`h-2 w-2 rounded-full ${inStock ? "bg-[var(--page-bg)]" : "bg-[#3f8f5a]"}`}
              />
              {copy.inStock}
            </button>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <p className="hidden text-sm font-semibold tabular-nums text-[var(--text-muted)] xl:block" aria-live="polite">
              {formatProductCount(resultCount, locale)}
            </p>
            <button
              ref={(node) => {
                triggerRefs.current.sort = node;
              }}
              type="button"
              aria-controls={panelId}
              aria-expanded={openPanel === "sort"}
              aria-haspopup="dialog"
              onClick={() => togglePanel("sort")}
              className="inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-[0.82rem] font-semibold text-[var(--text-primary)] transition hover:bg-[rgba(var(--accent-rgb),0.06)]"
            >
              <span className="text-[var(--text-muted)]">{copy.sort}:</span>
              {copy.sortOptions[filters.sort]}
              <ChevronIcon
                className={`h-3.5 w-3.5 transition-transform duration-300 ${openPanel === "sort" ? "rotate-180" : ""}`}
              />
            </button>
          </div>

          {openPanel ? (
            <div
              ref={panelRef}
              id={panelId}
              role="dialog"
              aria-label={panelTitle}
              tabIndex={-1}
              className={`tow-pop-in glass-panel-solid absolute top-[calc(100%-0.35rem)] z-30 max-h-[min(34rem,calc(100dvh-10rem))] overflow-y-auto overscroll-contain rounded-[1.25rem] shadow-[0_28px_70px_rgba(var(--shadow-rgb),0.2)] outline-none ${
                PANEL_WIDTH[openPanel] ?? "w-[22rem]"
              }`}
            >
              {openPanel === "sort" ? (
                <div className="p-2">
                  <SortOptions
                    copy={copy}
                    value={filters.sort}
                    onSelect={(sort: SortMode) => {
                      setOpenPanel(null);
                      triggerRefs.current.sort?.focus();
                      if (sort !== filters.sort) apply({ ...filters, sort } satisfies ShopFilters);
                    }}
                  />
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between gap-3 px-5 pb-3 pt-4">
                    <p className="text-[0.7rem] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">
                      {panelTitle}
                    </p>
                    <button
                      type="button"
                      disabled={!isGroupActive(filters, openPanel)}
                      onClick={() => apply(clearGroup(filters, openPanel))}
                      // Globalni `button:disabled` (van Tailwind slojeva) pobedjuje
                      // `disabled:` varijante, pa se neaktivno dugme samo sakriva.
                      className={`text-xs font-bold uppercase tracking-[0.14em] text-[var(--text-secondary)] transition hover:text-[var(--text-primary)] ${
                        isGroupActive(filters, openPanel) ? "" : "invisible"
                      }`}
                    >
                      {copy.clear}
                    </button>
                  </div>
                  <div className="px-5 pb-4">
                    <FilterGroupBody
                      group={openPanel}
                      value={filters}
                      onChange={apply}
                      onPriceCommit={apply}
                      facets={facets}
                      priceStats={priceStats}
                      taxonomy={taxonomy}
                      copy={copy}
                      availableTypes={availableTypes}
                      availableGenders={availableGenders}
                      dense
                    />
                  </div>
                  <div className="flex items-center justify-between gap-3 border-t border-[var(--border-soft)] px-5 py-3">
                    <p className="text-sm font-semibold tabular-nums text-[var(--text-muted)]" aria-live="polite">
                      {formatProductCount(resultCount, locale)}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        const trigger = triggerRefs.current[openPanel];
                        setOpenPanel(null);
                        trigger?.focus();
                      }}
                      className="tow-on-primary min-h-9 rounded-full bg-[var(--text-primary)] px-4 text-xs font-bold uppercase tracking-[0.14em]"
                    >
                      {copy.close}
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : null}
        </div>
      </div>

      <FiltersSheet open={sheetOpen} onClose={() => setSheetOpen(false)} side="right" />
    </>
  );
}
