export type ProductType = "clothing" | "footwear" | "accessories";
export type ProductGender = "men" | "women" | "kids";
export type SortMode = "recommended" | "price-asc" | "price-desc";

export type ShopCategory = {
  id?: string;
  name: string;
  slug: string;
  type: ProductType;
  sortOrder: number;
};

export type ShopBrand = {
  id?: string;
  name: string;
  slug: string;
  logoUrl?: string;
};

export type ShopCollection = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  imageUrl?: string;
  productIds: string[];
};

export type ShopProduct = {
  id: string;
  slug: string;
  name: string;
  description: string;
  type: ProductType;
  gender: ProductGender;
  categorySlug?: string;
  category?: ShopCategory | null;
  brand?: ShopBrand | null;
  brandName: string;
  costPrice?: number;
  salePrice: number;
  salePriceRsd?: number;
  sizes: string[];
  imageUrls: string[];
  collectionSlugs: string[];
  tags: string[];
  createdAt: number;
  isRecommended?: boolean;
  recommendationOrder?: number;
};

export type ShopCatalog = {
  brands: ShopBrand[];
  categories: ShopCategory[];
  collections: ShopCollection[];
  products: ShopProduct[];
};

export type ShopFilters = {
  availability?: "in-stock";
  brand: string[];
  category: string[];
  collection: string[];
  gender: ProductGender[];
  max?: number;
  min?: number;
  q?: string;
  size: string[];
  sort: SortMode;
  type: ProductType[];
};

export const productTypeLabels: Record<ProductType, string> = {
  clothing: "Odeca",
  footwear: "Obuca",
  accessories: "Dodaci",
};

export const productGenderLabels: Record<ProductGender, string> = {
  men: "Muskarci",
  women: "Zene",
  kids: "Deca",
};

export const defaultShopCategories: ShopCategory[] = [
  { name: "Majice", slug: "majice", type: "clothing", sortOrder: 10 },
  { name: "Prsluci", slug: "prsluci", type: "clothing", sortOrder: 20 },
  { name: "Dzemperi", slug: "dzemperi", type: "clothing", sortOrder: 30 },
  { name: "Jakne", slug: "jakne", type: "clothing", sortOrder: 40 },
  { name: "Suskavci", slug: "suskavci", type: "clothing", sortOrder: 50 },
  { name: "Polo majice", slug: "polo-majice", type: "clothing", sortOrder: 60 },
  { name: "Skijaske jakne", slug: "skijaske-jakne", type: "clothing", sortOrder: 70 },
  { name: "Trenerke", slug: "trenerke", type: "clothing", sortOrder: 80 },
  { name: "Kompleti", slug: "kompleti", type: "clothing", sortOrder: 90 },
  { name: "Full-zip duksevi", slug: "full-zip-duksevi", type: "clothing", sortOrder: 100 },
  { name: "Half-zip duksevi", slug: "half-zip-duksevi", type: "clothing", sortOrder: 110 },
  { name: "Bomber jakne", slug: "bomber-jakne", type: "clothing", sortOrder: 120 },
  { name: "Duksevi", slug: "duksevi", type: "clothing", sortOrder: 95 },
  { name: "Duksevi sa kapuljacom", slug: "duksevi-sa-kapuljacom", type: "clothing", sortOrder: 105 },
  { name: "Skijaske pantalone", slug: "skijaske-pantalone", type: "clothing", sortOrder: 130 },
  { name: "Patike", slug: "patike", type: "footwear", sortOrder: 210 },
  { name: "Duboke patike", slug: "duboke-patike", type: "footwear", sortOrder: 220 },
  { name: "Cipele", slug: "cipele", type: "footwear", sortOrder: 230 },
  { name: "Papuce", slug: "papuce", type: "footwear", sortOrder: 240 },
  { name: "Dodaci", slug: "dodaci", type: "accessories", sortOrder: 310 },
];

export const defaultShopCollections: ShopCollection[] = [
  {
    name: "Zimska kolekcija",
    slug: "alpska-kapsula",
    description: "Topli slojevi, jakne i obuca za hladne dane.",
    productIds: [],
  },
  {
    name: "Letnja kolekcija",
    slug: "sunset-resort",
    description: "Laki materijali, sveze boje i udobna letnja obuca.",
    productIds: [],
  },
  {
    name: "Casual kolekcija",
    slug: "after-dark",
    description: "Urbani svakodnevni komadi za stabilan, cist izgled.",
    productIds: [],
  },
];

export function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function normalizeCollectionSlug(name: string) {
  const slug = slugify(name);
  if (slug === "zimska-kolekcija") return "alpska-kapsula";
  if (slug === "letnja-kolekcija") return "sunset-resort";
  if (slug === "casual-kolekcija") return "after-dark";
  return slug;
}

export function formatShopPrice(value: number) {
  return `${value.toLocaleString("sr-RS")} EUR`;
}

export function getFirstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function toBrandSlug(name: string) {
  return slugify(name || "bez-brenda");
}

// Odevne veličine po stvarnom redosledu (abecedno bi bilo L, M, S, XL...).
const LETTER_SIZE_RANK: Record<string, number> = {
  XXS: 0,
  XS: 1,
  S: 2,
  M: 3,
  L: 4,
  XL: 5,
  XXL: 6,
  "2XL": 6,
  XXXL: 7,
  "3XL": 7,
  "4XL": 8,
  "5XL": 9,
};

function sizeNumber(size: string) {
  const parsed = Number(size.trim().replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

export type SizeKind = "letter" | "number" | "other";

export function getSizeKind(size: string): SizeKind {
  if (LETTER_SIZE_RANK[size.trim().toUpperCase()] !== undefined) return "letter";
  if (sizeNumber(size) !== null) return "number";
  return "other";
}

/** Slovne veličine (XS→3XL), pa brojevi rastuće, pa ostalo abecedno. */
export function sortSizes(sizes: string[]) {
  const kindOrder: Record<SizeKind, number> = { letter: 0, number: 1, other: 2 };

  return [...sizes].sort((a, b) => {
    const kindA = getSizeKind(a);
    const kindB = getSizeKind(b);
    if (kindA !== kindB) return kindOrder[kindA] - kindOrder[kindB];
    if (kindA === "letter") {
      return (
        LETTER_SIZE_RANK[a.trim().toUpperCase()] -
        LETTER_SIZE_RANK[b.trim().toUpperCase()]
      );
    }
    if (kindA === "number") return (sizeNumber(a) ?? 0) - (sizeNumber(b) ?? 0);
    return a.localeCompare(b);
  });
}
