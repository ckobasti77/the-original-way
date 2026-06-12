import {
  getFirstParam,
  type ShopFilters,
  type ShopProduct,
  type SortMode,
  slugify,
} from "@/lib/shop-taxonomy";

type SearchParamsInput = Record<string, string | string[] | undefined>;

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
    gender: asEnumList(params.gender, ["men", "women", "kids"] as const),
    max,
    min,
    q: getFirstParam(params.q)?.trim() || undefined,
    size: asUniqueList(asList(params.size)),
    sort: asSort(getFirstParam(params.sort)),
    type: asEnumList(params.type, ["clothing", "footwear"] as const),
  };
}

export function applyShopFilters(products: ShopProduct[], filters: ShopFilters) {
  const query = filters.q?.toLowerCase();
  const selectedTypes = new Set(filters.type);
  const selectedGenders = new Set(filters.gender);
  const selectedCategories = new Set(filters.category);
  const selectedBrands = new Set(filters.brand);
  const selectedCollections = new Set(filters.collection);
  const selectedSizes = new Set(filters.size);

  const filtered = products.filter((product) => {
    if (selectedGenders.size > 0 && !selectedGenders.has(product.gender)) {
      return false;
    }
    if (selectedTypes.size > 0 && !selectedTypes.has(product.type)) return false;

    const categorySlug = product.categorySlug ?? product.category?.slug;
    if (
      selectedCategories.size > 0 &&
      (!categorySlug || !selectedCategories.has(categorySlug))
    ) {
      return false;
    }

    const brandSlug = product.brand?.slug ?? slugify(product.brandName);
    if (selectedBrands.size > 0 && !selectedBrands.has(brandSlug)) return false;

    if (
      selectedCollections.size > 0 &&
      !product.collectionSlugs.some((slug) => selectedCollections.has(slug))
    ) {
      return false;
    }

    if (
      selectedSizes.size > 0 &&
      !product.sizes.some((size) => selectedSizes.has(size))
    ) {
      return false;
    }

    if (filters.min !== undefined && product.salePrice < filters.min) return false;
    if (filters.max !== undefined && product.salePrice > filters.max) return false;
    if (filters.availability === "in-stock" && product.sizes.length === 0) {
      return false;
    }
    if (query) {
      const haystack = [
        product.name,
        product.description,
        product.brandName,
        product.category?.name,
        product.categorySlug,
        ...product.tags,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (!haystack.includes(query)) return false;
    }

    return true;
  });

  if (filters.sort === "price-asc") {
    return filtered.sort((a, b) => a.salePrice - b.salePrice);
  }

  if (filters.sort === "price-desc") {
    return filtered.sort((a, b) => b.salePrice - a.salePrice);
  }

  return filtered.sort((a, b) => b.createdAt - a.createdAt);
}
