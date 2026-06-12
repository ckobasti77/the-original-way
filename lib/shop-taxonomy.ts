export type ProductType = "clothing" | "footwear";
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
  sizes: string[];
  imageUrls: string[];
  collectionSlugs: string[];
  tags: string[];
  createdAt: number;
  isDemo?: boolean;
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
  { name: "Patike", slug: "patike", type: "footwear", sortOrder: 210 },
  { name: "Duboke patike", slug: "duboke-patike", type: "footwear", sortOrder: 220 },
  { name: "Cipele", slug: "cipele", type: "footwear", sortOrder: 230 },
  { name: "Papuce", slug: "papuce", type: "footwear", sortOrder: 240 },
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

export function formatShopPrice(value: number) {
  return `${value.toLocaleString("sr-RS")} RSD`;
}

export function getFirstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function toBrandSlug(name: string) {
  return slugify(name || "bez-brenda");
}
