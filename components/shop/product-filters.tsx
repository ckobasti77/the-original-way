"use client";

import type { ReactNode } from "react";
import { FormEvent, useMemo, useOptimistic, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { parseShopFilters } from "@/lib/shop-filtering";
import {
  productGenderLabels,
  productTypeLabels,
  type ShopBrand,
  type ShopCategory,
  type ShopCollection,
  type ShopFilters,
} from "@/lib/shop-taxonomy";

type ProductFiltersProps = {
  activeFilters: ShopFilters;
  brands: ShopBrand[];
  categories: ShopCategory[];
  collections: ShopCollection[];
  maxPrice: number;
  sizes: string[];
};

type CheckboxOption = {
  value: string;
  label: string;
};

const genderOptions: CheckboxOption[] = [
  { value: "men", label: productGenderLabels.men },
  { value: "women", label: productGenderLabels.women },
  { value: "kids", label: productGenderLabels.kids },
];

const typeOptions: CheckboxOption[] = [
  { value: "clothing", label: productTypeLabels.clothing },
  { value: "footwear", label: productTypeLabels.footwear },
];

const filterParamKeys = [
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

  for (const key of filterParamKeys) {
    input[key] = params.getAll(key);
  }

  return parseShopFilters(input);
}

function CheckboxChip({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: () => void;
}) {
  return (
    <label className="block cursor-pointer">
      <input
        checked={checked}
        onChange={onChange}
        type="checkbox"
        className="sr-only"
      />
      <span
        className={`flex min-h-10 items-center justify-between gap-3 rounded-md border px-3 text-sm font-bold transition duration-150 hover:border-[var(--border-strong)] ${
          checked
            ? "tow-on-primary border-[var(--text-primary)] bg-[var(--text-primary)]"
            : "border-[var(--border-soft)] bg-[var(--surface)] text-[var(--text-primary)]"
        }`}
      >
        <span className="min-w-0 truncate">{label}</span>
        <span
          className={`inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-current transition ${
            checked ? "scale-100 opacity-100" : "scale-75 opacity-0"
          }`}
        >
          <svg
            aria-hidden="true"
            className="h-2.5 w-2.5"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.4"
            viewBox="0 0 24 24"
          >
            <path d="m5 12 4 4L19 6" />
          </svg>
        </span>
      </span>
    </label>
  );
}

function CollapsibleSection({
  children,
  description,
  id,
  isOpen,
  onToggle,
  title,
}: {
  children: ReactNode;
  description?: string;
  id: string;
  isOpen: boolean;
  onToggle: (id: string) => void;
  title: string;
}) {
  const panelId = `filter-panel-${id}`;

  return (
    <section className="rounded-lg border border-[var(--border-soft)] bg-[rgba(var(--accent-rgb),0.03)]">
      <button
        type="button"
        aria-controls={panelId}
        aria-expanded={isOpen}
        onClick={() => onToggle(id)}
        className="flex w-full items-center justify-between gap-3 px-3 py-3 text-left"
      >
        <span className="min-w-0">
          <span className="block text-sm font-bold text-[var(--text-secondary)]">
            {title}
          </span>
          {description ? (
            <span className="mt-1 block text-xs font-medium leading-5 text-[var(--text-muted)]">
              {description}
            </span>
          ) : null}
        </span>
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-[var(--border-soft)] bg-[var(--surface)] text-[var(--text-secondary)]">
          <svg
            aria-hidden="true"
            className={`h-4 w-4 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </span>
      </button>
      <div
        id={panelId}
        className={`grid transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="px-3 pb-3">{children}</div>
        </div>
      </div>
    </section>
  );
}

function CheckboxGroup({
  description,
  gridClassName = "grid-cols-2",
  isOpen,
  onToggleSection,
  onToggleValue,
  options,
  sectionId,
  selectedValues,
  title,
}: {
  description?: string;
  gridClassName?: string;
  isOpen: boolean;
  onToggleSection: (id: string) => void;
  onToggleValue: (value: string) => void;
  options: CheckboxOption[];
  sectionId: string;
  selectedValues: string[];
  title: string;
}) {
  const selectedSet = new Set(selectedValues);

  if (options.length === 0) return null;

  return (
    <CollapsibleSection
      description={description}
      id={sectionId}
      isOpen={isOpen}
      onToggle={onToggleSection}
      title={title}
    >
      <div aria-label={title} className={`grid gap-2 ${gridClassName}`} role="group">
        {options.map((option) => (
          <CheckboxChip
            key={option.value}
            checked={selectedSet.has(option.value)}
            label={option.label}
            onChange={() => onToggleValue(option.value)}
          />
        ))}
      </div>
    </CollapsibleSection>
  );
}

function getOptionLabels<T extends { slug: string; name: string }>(items: T[]) {
  return new Map(items.map((item) => [item.slug, item.name]));
}

export function ProductFilters({
  brands,
  categories,
  collections,
  maxPrice,
  sizes,
}: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const actualQuery = searchParams.toString();
  const [, startTransition] = useTransition();
  const [optimisticQuery, setOptimisticQuery] = useOptimistic<string, string>(
    actualQuery,
    (_currentQuery, nextQuery) => nextQuery,
  );
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    search: true,
  });

  const currentFilters = useMemo(
    () => filtersFromQuery(optimisticQuery),
    [optimisticQuery],
  );

  const brandOptions = useMemo(
    () =>
      brands.map<CheckboxOption>((brand) => ({
        value: brand.slug,
        label: brand.name,
      })),
    [brands],
  );
  const collectionOptions = useMemo(
    () =>
      collections.map<CheckboxOption>((collection) => ({
        value: collection.slug,
        label: collection.name,
      })),
    [collections],
  );
  const sizeOptions = useMemo(
    () =>
      sizes.map<CheckboxOption>((size) => ({
        value: size,
        label: size,
      })),
    [sizes],
  );
  const categoryOrder = useMemo(
    () => categories.map((category) => category.slug),
    [categories],
  );
  const categoryGroups = useMemo(
    () =>
      [
        {
          title: productTypeLabels.clothing,
          options: categories
            .filter((category) => category.type === "clothing")
            .map<CheckboxOption>((category) => ({
              value: category.slug,
              label: category.name,
            })),
        },
        {
          title: productTypeLabels.footwear,
          options: categories
            .filter((category) => category.type === "footwear")
            .map<CheckboxOption>((category) => ({
              value: category.slug,
              label: category.name,
            })),
        },
      ].filter((group) => group.options.length > 0),
    [categories],
  );
  const brandLabelsBySlug = useMemo(() => getOptionLabels(brands), [brands]);
  const categoryLabelsBySlug = useMemo(
    () => getOptionLabels(categories),
    [categories],
  );
  const collectionLabelsBySlug = useMemo(
    () => getOptionLabels(collections),
    [collections],
  );

  function isSectionOpen(id: string) {
    return openSections[id] ?? false;
  }

  function toggleSection(id: string) {
    setOpenSections((current) => ({
      ...current,
      [id]: !(current[id] ?? false),
    }));
  }

  function commit(nextParams: URLSearchParams) {
    const query = nextParams.toString();
    startTransition(() => {
      setOptimisticQuery(query);
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    });
  }

  function updateParams(mutator: (params: URLSearchParams) => void) {
    const nextParams = new URLSearchParams(optimisticQuery);
    mutator(nextParams);
    commit(nextParams);
  }

  function setSingleParam(key: string, value: string) {
    updateParams((params) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
  }

  function toggleMultiParam(key: string, value: string, order: string[]) {
    updateParams((params) => {
      const selected = new Set(params.getAll(key));

      if (selected.has(value)) {
        selected.delete(value);
      } else {
        selected.add(value);
      }

      params.delete(key);
      order
        .filter((item) => selected.has(item))
        .forEach((item) => params.append(key, item));
    });
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const query = String(formData.get("q") ?? "").trim();

    updateParams((params) => {
      if (query) params.set("q", query);
      else params.delete("q");
    });
  }

  function submitPrice(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const min = String(formData.get("min") ?? "").trim();
    const max = String(formData.get("max") ?? "").trim();

    updateParams((params) => {
      if (min) params.set("min", min);
      else params.delete("min");
      if (max) params.set("max", max);
      else params.delete("max");
    });
  }

  const activeLabels = [
    currentFilters.q ? `Pretraga: ${currentFilters.q}` : "",
    ...currentFilters.gender.map((gender) => productGenderLabels[gender]),
    ...currentFilters.type.map((type) => productTypeLabels[type]),
    ...currentFilters.category.map(
      (slug) => categoryLabelsBySlug.get(slug) ?? slug,
    ),
    ...currentFilters.brand.map((slug) => brandLabelsBySlug.get(slug) ?? slug),
    ...currentFilters.collection.map(
      (slug) => collectionLabelsBySlug.get(slug) ?? slug,
    ),
    ...currentFilters.size.map((size) => `Velicina ${size}`),
    currentFilters.min !== undefined ? `Od ${currentFilters.min}` : "",
    currentFilters.max !== undefined ? `Do ${currentFilters.max}` : "",
    currentFilters.availability === "in-stock" ? "Na stanju" : "",
  ].filter((label): label is string => Boolean(label));

  return (
    <aside className="rounded-lg border border-[var(--border-soft)] bg-[var(--surface-strong)] p-4 shadow-[0_20px_55px_rgba(var(--shadow-rgb),0.10)] backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">
            Filteri
          </p>
          <h2 className="mt-1 text-xl font-semibold">Preciziraj izbor</h2>
        </div>
        <button
          type="button"
          onClick={() => commit(new URLSearchParams())}
          className="rounded-md border border-[var(--border-soft)] px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[var(--text-secondary)]"
        >
          Reset
        </button>
      </div>

      {activeLabels.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {activeLabels.map((label) => (
            <span
              key={label}
              className="rounded-md bg-[rgba(var(--accent-rgb),0.10)] px-2 py-1 text-xs font-bold text-[var(--text-primary)]"
            >
              {label}
            </span>
          ))}
        </div>
      ) : null}

      <div className="mt-5 grid gap-3">
        <CollapsibleSection
          id="search"
          isOpen={isSectionOpen("search")}
          onToggle={toggleSection}
          title="Pretraga"
        >
          <form key={`search-${currentFilters.q ?? ""}`} onSubmit={submitSearch}>
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <input
                name="q"
                defaultValue={currentFilters.q ?? ""}
                className="min-h-10 rounded-md border border-[var(--border-soft)] bg-[var(--surface)] px-3 text-sm font-semibold text-[var(--text-primary)] outline-none"
                placeholder="Naziv, brend, kategorija"
              />
              <button className="tow-on-primary rounded-md bg-[var(--text-primary)] px-3 text-xs font-bold uppercase tracking-[0.14em]">
                Trazi
              </button>
            </div>
          </form>
        </CollapsibleSection>

        <CheckboxGroup
          title="Tip"
          description="Mozes izabrati vise tipova odjednom."
          options={typeOptions}
          selectedValues={currentFilters.type}
          onToggleValue={(value) =>
            toggleMultiParam(
              "type",
              value,
              typeOptions.map((option) => option.value),
            )
          }
          sectionId="type"
          isOpen={isSectionOpen("type")}
          onToggleSection={toggleSection}
        />

        <CheckboxGroup
          title="Pol"
          description="Muskarci, zene i deca mogu da budu ukljuceni zajedno."
          options={genderOptions}
          selectedValues={currentFilters.gender}
          onToggleValue={(value) =>
            toggleMultiParam(
              "gender",
              value,
              genderOptions.map((option) => option.value),
            )
          }
          sectionId="gender"
          isOpen={isSectionOpen("gender")}
          onToggleSection={toggleSection}
        />

        <CollapsibleSection
          description="Mozes kombinovati vise kategorija iz odece i obuce."
          id="category"
          isOpen={isSectionOpen("category")}
          onToggle={toggleSection}
          title="Kategorija"
        >
          <div className="grid gap-4">
            {categoryGroups.map((group) => (
              <div key={group.title} className="grid gap-2">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                  {group.title}
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {group.options.map((option) => (
                    <CheckboxChip
                      key={option.value}
                      checked={currentFilters.category.includes(option.value)}
                      label={option.label}
                      onChange={() =>
                        toggleMultiParam("category", option.value, categoryOrder)
                      }
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CollapsibleSection>

        <CheckboxGroup
          title="Brend"
          description="Izaberi jedan ili vise brendova."
          options={brandOptions}
          selectedValues={currentFilters.brand}
          onToggleValue={(value) =>
            toggleMultiParam(
              "brand",
              value,
              brandOptions.map((option) => option.value),
            )
          }
          gridClassName="sm:grid-cols-2"
          sectionId="brand"
          isOpen={isSectionOpen("brand")}
          onToggleSection={toggleSection}
        />

        <CheckboxGroup
          title="Kolekcija"
          description="Kolekcije se mogu kombinovati sa ostalim filterima."
          options={collectionOptions}
          selectedValues={currentFilters.collection}
          onToggleValue={(value) =>
            toggleMultiParam(
              "collection",
              value,
              collectionOptions.map((option) => option.value),
            )
          }
          gridClassName="grid-cols-1"
          sectionId="collection"
          isOpen={isSectionOpen("collection")}
          onToggleSection={toggleSection}
        />

        <CheckboxGroup
          title="Velicina / broj"
          description="Mozes cekirati vise velicina ako trazis raspon."
          options={sizeOptions}
          selectedValues={currentFilters.size}
          onToggleValue={(value) =>
            toggleMultiParam(
              "size",
              value,
              sizeOptions.map((option) => option.value),
            )
          }
          gridClassName="grid-cols-3 sm:grid-cols-4"
          sectionId="size"
          isOpen={isSectionOpen("size")}
          onToggleSection={toggleSection}
        />

        <CollapsibleSection
          id="price"
          isOpen={isSectionOpen("price")}
          onToggle={toggleSection}
          title="Cena"
        >
          <form
            key={`price-${currentFilters.min ?? ""}-${currentFilters.max ?? ""}`}
            onSubmit={submitPrice}
            className="grid gap-2"
          >
            <div className="grid grid-cols-2 gap-2">
              <input
                name="min"
                defaultValue={
                  currentFilters.min !== undefined ? String(currentFilters.min) : ""
                }
                inputMode="numeric"
                className="min-h-10 rounded-md border border-[var(--border-soft)] bg-[var(--surface)] px-3 text-sm font-bold text-[var(--text-primary)] outline-none"
                placeholder="Od"
              />
              <input
                name="max"
                defaultValue={
                  currentFilters.max !== undefined ? String(currentFilters.max) : ""
                }
                inputMode="numeric"
                className="min-h-10 rounded-md border border-[var(--border-soft)] bg-[var(--surface)] px-3 text-sm font-bold text-[var(--text-primary)] outline-none"
                placeholder={`Do ${maxPrice}`}
              />
            </div>
            <button className="min-h-10 rounded-md border border-[var(--border-soft)] text-xs font-bold uppercase tracking-[0.14em] text-[var(--text-primary)]">
              Primeni cenu
            </button>
          </form>
        </CollapsibleSection>

        <CheckboxGroup
          title="Dostupnost"
          options={[{ value: "in-stock", label: "Samo artikli na stanju" }]}
          selectedValues={
            currentFilters.availability === "in-stock" ? ["in-stock"] : []
          }
          onToggleValue={(value) =>
            setSingleParam(
              "availability",
              currentFilters.availability === "in-stock" ? "" : value,
            )
          }
          gridClassName="grid-cols-1"
          sectionId="availability"
          isOpen={isSectionOpen("availability")}
          onToggleSection={toggleSection}
        />

        <CollapsibleSection
          id="sort"
          isOpen={isSectionOpen("sort")}
          onToggle={toggleSection}
          title="Sortiranje"
        >
          <select
            value={currentFilters.sort}
            onChange={(event) => setSingleParam("sort", event.target.value)}
            className="min-h-10 w-full rounded-md border border-[var(--border-soft)] bg-[var(--surface)] px-3 text-sm font-bold text-[var(--text-primary)] outline-none"
          >
            <option value="recommended">Najnovije</option>
            <option value="price-asc">Cena uzbrdo</option>
            <option value="price-desc">Cena nizbrdo</option>
          </select>
        </CollapsibleSection>
      </div>

    </aside>
  );
}
