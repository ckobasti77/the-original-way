// Relativni `.ts` importi (umesto `@/`) da bi `node --test` mogao direktno da
// ucita ovaj modul — logika filtera se deli izmedju servera i klijenta.
import {
  getFirstParam,
  type ProductGender,
  type ProductType,
  type ShopFilters,
  type ShopProduct,
  type SortMode,
  slugify,
} from "./shop-taxonomy.ts";

type SearchParamsInput = Record<string, string | string[] | undefined>;

export const SHOP_PRODUCT_TYPES = ["clothing", "footwear", "accessories"] as const;
export const SHOP_PRODUCT_GENDERS = ["men", "women", "kids"] as const;
export const SHOP_SORT_MODES = ["recommended", "price-asc", "price-desc"] as const;

function asNumber(value: string | undefined) {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function asList(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value;
  if (typeof value === "string" && value.trim()) return [value];
  return [];
}

function asUniqueList(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

function asSort(value: string | undefined): SortMode {
  if (value === "price-asc" || value === "price-desc") return value;
  return "recommended";
}

function asSlugList(value: string | string[] | undefined) {
  return asUniqueList(asList(value).map((item) => slugify(item)));
}

function asEnumList<T extends string>(
  value: string | string[] | undefined,
  allowedValues: readonly T[],
) {
  const allowedSet = new Set(allowedValues);
  return asUniqueList(asList(value)).filter(
    (item): item is T => allowedSet.has(item as T),
  );
}

export function parseShopFilters(params: SearchParamsInput): ShopFilters {
  const min = asNumber(getFirstParam(params.min));
  const max = asNumber(getFirstParam(params.max));
  const availability = getFirstParam(params.availability);

  return {
    availability: availability === "in-stock" ? "in-stock" : undefined,
    brand: asSlugList(params.brand),
    category: asSlugList(params.category),
    collection: asSlugList(params.collection),
    gender: asEnumList(params.gender, SHOP_PRODUCT_GENDERS),
    max,
    min,
    q: getFirstParam(params.q)?.trim() || undefined,
    size: asUniqueList(asList(params.size)),
    sort: asSort(getFirstParam(params.sort)),
    type: asEnumList(params.type, SHOP_PRODUCT_TYPES),
  };
}

/** Grupe filtera koje se broje kao faseti (svaka moze da se izuzme). */
export type FilterGroup =
  | "type"
  | "gender"
  | "category"
  | "brand"
  | "collection"
  | "size"
  | "price"
  | "availability";

/**
 * Minimalan zapis proizvoda za filtriranje. Isti zapis koristi server
 * (`applyShopFilters`) i klijent (brojaci u filterima), pa se ne mogu razici.
 */
export type FilterRecord = {
  id: string;
  type: ProductType;
  gender: ProductGender;
  category: string | null;
  brand: string;
  collections: string[];
  sizes: string[];
  price: number;
};

export function toFilterRecord(product: ShopProduct): FilterRecord {
  return {
    id: product.id,
    type: product.type,
    gender: product.gender,
    category: product.categorySlug ?? product.category?.slug ?? null,
    brand: product.brand?.slug ?? slugify(product.brandName),
    collections: product.collectionSlugs,
    sizes: product.sizes,
    price: product.salePrice,
  };
}

/** Pravi proveru za date filtere; `ignore` preskace jednu grupu (za fasete). */
export function createFilterMatcher(filters: ShopFilters) {
  const types = new Set<string>(filters.type);
  const genders = new Set<string>(filters.gender);
  const categories = new Set(filters.category);
  const brands = new Set(filters.brand);
  const collections = new Set(filters.collection);
  const sizes = new Set(filters.size);
  const inStockOnly = filters.availability === "in-stock";

  return (record: FilterRecord, ignore?: FilterGroup) => {
    if (ignore !== "gender" && genders.size > 0 && !genders.has(record.gender)) {
      return false;
    }
    if (ignore !== "type" && types.size > 0 && !types.has(record.type)) {
      return false;
    }
    if (
      ignore !== "category" &&
      categories.size > 0 &&
      (!record.category || !categories.has(record.category))
    ) {
      return false;
    }
    if (ignore !== "brand" && brands.size > 0 && !brands.has(record.brand)) {
      return false;
    }
    if (
      ignore !== "collection" &&
      collections.size > 0 &&
      !record.collections.some((slug) => collections.has(slug))
    ) {
      return false;
    }
    if (
      ignore !== "size" &&
      sizes.size > 0 &&
      !record.sizes.some((size) => sizes.has(size))
    ) {
      return false;
    }
    if (ignore !== "price") {
      if (filters.min !== undefined && record.price < filters.min) return false;
      if (filters.max !== undefined && record.price > filters.max) return false;
    }
    if (ignore !== "availability" && inStockOnly && record.sizes.length === 0) {
      return false;
    }
    return true;
  };
}

/** Tekstualna pretraga ostaje na serveru (opis/tagovi se ne salju klijentu). */
export function filterBySearch(products: ShopProduct[], q: string | undefined) {
  const query = q?.trim().toLowerCase();
  if (!query) return products;

  return products.filter((product) =>
    [
      product.name,
      product.description,
      product.brandName,
      product.category?.name,
      product.categorySlug,
      ...product.tags,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(query),
  );
}

export function applyShopFilters(products: ShopProduct[], filters: ShopFilters) {
  const matches = createFilterMatcher(filters);
  const filtered = filterBySearch(products, filters.q).filter((product) =>
    matches(toFilterRecord(product)),
  );

  if (filters.sort === "price-asc") {
    return filtered.sort((a, b) => a.salePrice - b.salePrice);
  }

  if (filters.sort === "price-desc") {
    return filtered.sort((a, b) => b.salePrice - a.salePrice);
  }

  return filtered.sort((a, b) => b.createdAt - a.createdAt);
}

export function countMatches(records: FilterRecord[], filters: ShopFilters) {
  const matches = createFilterMatcher(filters);
  let count = 0;
  for (const record of records) {
    if (matches(record)) count += 1;
  }
  return count;
}

export type FacetCounts = {
  type: Record<string, number>;
  gender: Record<string, number>;
  category: Record<string, number>;
  brand: Record<string, number>;
  collection: Record<string, number>;
  size: Record<string, number>;
  inStock: number;
};

function bump(target: Record<string, number>, key: string) {
  target[key] = (target[key] ?? 0) + 1;
}

/**
 * Disjunktivni faseti: broj pored opcije u grupi X racuna se sa svim ostalim
 * aktivnim filterima, ali bez same grupe X — tako "Nike 12" znaci "dodavanjem
 * Nike-a dobijas 12 proizvoda", a izbor unutar grupe ne gasi ostale opcije.
 */
export function computeFacets(
  records: FilterRecord[],
  filters: ShopFilters,
): FacetCounts {
  const matches = createFilterMatcher(filters);
  const facets: FacetCounts = {
    type: {},
    gender: {},
    category: {},
    brand: {},
    collection: {},
    size: {},
    inStock: 0,
  };

  for (const record of records) {
    if (matches(record, "type")) bump(facets.type, record.type);
    if (matches(record, "gender")) bump(facets.gender, record.gender);
    if (record.category && matches(record, "category")) {
      bump(facets.category, record.category);
    }
    if (matches(record, "brand")) bump(facets.brand, record.brand);
    if (matches(record, "collection")) {
      for (const slug of record.collections) bump(facets.collection, slug);
    }
    if (matches(record, "size")) {
      for (const size of record.sizes) bump(facets.size, size);
    }
    if (record.sizes.length > 0 && matches(record, "availability")) {
      facets.inStock += 1;
    }
  }

  return facets;
}

export type PriceStats = {
  /** Granice klizaca — iz celog skupa, da se ne pomeraju dok korisnik bira. */
  floor: number;
  ceil: number;
  /** Raspodela cena proizvoda koji prolaze sve filtere osim cene. */
  histogram: number[];
};

export function computePriceStats(
  records: FilterRecord[],
  filters: ShopFilters,
  bucketCount = 24,
): PriceStats {
  if (records.length === 0) {
    return { floor: 0, ceil: 0, histogram: [] };
  }

  let floor = Infinity;
  let ceil = -Infinity;
  for (const record of records) {
    floor = Math.min(floor, record.price);
    ceil = Math.max(ceil, record.price);
  }
  floor = Math.floor(floor);
  ceil = Math.ceil(ceil);

  const histogram = new Array<number>(bucketCount).fill(0);
  const span = ceil - floor;
  const matches = createFilterMatcher(filters);

  for (const record of records) {
    if (!matches(record, "price")) continue;
    const index =
      span === 0
        ? 0
        : Math.min(
            bucketCount - 1,
            Math.floor(((record.price - floor) / span) * bucketCount),
          );
    histogram[index] += 1;
  }

  return { floor, ceil, histogram };
}

/** Broj aktivnih izbora (bez sortiranja); cena se racuna kao jedan filter. */
export function countActiveFilters(filters: ShopFilters) {
  return (
    filters.type.length +
    filters.gender.length +
    filters.category.length +
    filters.brand.length +
    filters.collection.length +
    filters.size.length +
    (filters.min !== undefined || filters.max !== undefined ? 1 : 0) +
    (filters.availability === "in-stock" ? 1 : 0) +
    (filters.q ? 1 : 0)
  );
}

/** Pretvara filtere nazad u kanonski query string (stabilan redosled kljuceva). */
export function filtersToSearchParams(
  filters: ShopFilters,
  order: Partial<Record<"brand" | "category" | "collection" | "size", string[]>> = {},
) {
  const params = new URLSearchParams();

  function appendAll(key: string, values: string[], canonical?: string[]) {
    const sorted = canonical
      ? [
          ...canonical.filter((value) => values.includes(value)),
          ...values.filter((value) => !canonical.includes(value)),
        ]
      : values;
    for (const value of sorted) params.append(key, value);
  }

  if (filters.q) params.set("q", filters.q);
  appendAll("type", filters.type, [...SHOP_PRODUCT_TYPES]);
  appendAll("gender", filters.gender, [...SHOP_PRODUCT_GENDERS]);
  appendAll("category", filters.category, order.category);
  appendAll("brand", filters.brand, order.brand);
  appendAll("collection", filters.collection, order.collection);
  appendAll("size", filters.size, order.size);
  if (filters.min !== undefined) params.set("min", String(filters.min));
  if (filters.max !== undefined) params.set("max", String(filters.max));
  if (filters.availability === "in-stock") params.set("availability", "in-stock");
  if (filters.sort !== "recommended") params.set("sort", filters.sort);

  return params;
}
