import { api } from "@/convex/_generated/api";
import { createServerConvexClient } from "@/lib/convex/server-client";
import { sampleShopCatalog } from "@/lib/shop-sample-data";
import {
  defaultShopCategories,
  defaultShopCollections,
  type ProductGender,
  type ProductType,
  type ShopBrand,
  type ShopCatalog,
  type ShopCategory,
  type ShopCollection,
  type ShopProduct,
  slugify,
  toBrandSlug,
} from "@/lib/shop-taxonomy";

type RawBrand = {
  _id: string;
  name: string;
  logoUrl?: string;
};

type RawCategory = {
  _id: string;
  name: string;
  slug: string;
  type: ProductType;
  sortOrder: number;
};

type RawCollection = {
  _id: string;
  name: string;
  imageUrl?: string;
  productIds: string[];
};

type RawProduct = {
  _id: string;
  name: string;
  description: string;
  slug?: string;
  type: ProductType;
  gender: ProductGender;
  categorySlug?: string;
  category?: RawCategory | null;
  costPrice?: number;
  salePrice: number;
  sizes: string[];
  imageUrls?: string[];
  externalImageUrls?: string[];
  brandId?: string;
  brand?: { _id: string; name: string } | null;
  createdAt: number;
};

function normalizeCollectionSlug(name: string) {
  const slug = slugify(name);
  if (slug === "zimska-kolekcija") return "alpska-kapsula";
  if (slug === "letnja-kolekcija") return "sunset-resort";
  if (slug === "casual-kolekcija") return "after-dark";
  return slug;
}

function normalizeCollection(collection: RawCollection): ShopCollection {
  const slug = normalizeCollectionSlug(collection.name);
  const fallback = defaultShopCollections.find((item) => item.slug === slug);

  return {
    id: collection._id,
    name: collection.name,
    slug,
    description: fallback?.description ?? "Rucno kurirana kolekcija.",
    imageUrl: collection.imageUrl,
    productIds: collection.productIds,
  };
}

function normalizeProduct(
  product: RawProduct,
  categoriesBySlug: Map<string, ShopCategory>,
  collectionSlugsByProductId: Map<string, string[]>,
): ShopProduct {
  const brand = product.brand
    ? {
        id: product.brand._id,
        name: product.brand.name,
        slug: toBrandSlug(product.brand.name),
      }
    : null;
  const categorySlug = product.categorySlug ?? product.category?.slug;
  const category = categorySlug
    ? categoriesBySlug.get(categorySlug) ??
      (product.category
        ? {
            id: product.category._id,
            name: product.category.name,
            slug: product.category.slug,
            type: product.category.type,
            sortOrder: product.category.sortOrder,
          }
        : null)
    : null;

  return {
    id: product._id,
    slug: product.slug ?? `${slugify(product.name)}-${product._id.slice(-6)}`,
    name: product.name,
    description: product.description,
    type: product.type,
    gender: product.gender,
    categorySlug,
    category,
    brand,
    brandName: brand?.name ?? "Bez brenda",
    costPrice: product.costPrice,
    salePrice: product.salePrice,
    sizes: product.sizes,
    imageUrls: product.imageUrls ?? product.externalImageUrls ?? [],
    collectionSlugs: collectionSlugsByProductId.get(product._id) ?? [],
    tags: [
      product.type,
      product.gender,
      product.categorySlug ?? "",
      product.category?.name ?? "",
      brand?.name ?? "",
    ].filter(Boolean),
    createdAt: product.createdAt,
  };
}

function normalizeCatalog(
  rawProducts: RawProduct[],
  rawBrands: RawBrand[],
  rawCategories: RawCategory[],
  rawCollections: RawCollection[],
): ShopCatalog {
  const categories =
    rawCategories.length > 0
      ? rawCategories
          .map<ShopCategory>((category) => ({
            id: category._id,
            name: category.name,
            slug: category.slug,
            type: category.type,
            sortOrder: category.sortOrder,
          }))
          .sort((a, b) => a.sortOrder - b.sortOrder)
      : defaultShopCategories;

  const categoriesBySlug = new Map(
    categories.map((category) => [category.slug, category]),
  );
  const collections =
    rawCollections.length > 0
      ? rawCollections.map(normalizeCollection)
      : defaultShopCollections;
  const collectionSlugsByProductId = new Map<string, string[]>();

  for (const collection of collections) {
    for (const productId of collection.productIds) {
      const existing = collectionSlugsByProductId.get(productId) ?? [];
      collectionSlugsByProductId.set(productId, [...existing, collection.slug]);
    }
  }

  const products = rawProducts.map((product) =>
    normalizeProduct(product, categoriesBySlug, collectionSlugsByProductId),
  );
  const productBrandSlugs = new Set(
    products.map((product) => product.brand?.slug).filter(Boolean),
  );
  const brands = rawBrands
    .map<ShopBrand>((brand) => ({
      id: brand._id,
      name: brand.name,
      slug: toBrandSlug(brand.name),
      logoUrl: brand.logoUrl,
    }))
    .filter(
      (brand, index, allBrands) =>
        productBrandSlugs.has(brand.slug) ||
        allBrands.findIndex((item) => item.slug === brand.slug) === index,
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  return {
    brands,
    categories,
    collections,
    products,
  };
}

function mergeBySlug<T extends { slug: string }>(primary: T[], additions: T[]) {
  const seen = new Set(primary.map((item) => item.slug));
  return [
    ...primary,
    ...additions.filter((item) => {
      if (seen.has(item.slug)) return false;
      seen.add(item.slug);
      return true;
    }),
  ];
}

function mergeCollectionProductIds(
  primary: ShopCollection[],
  additions: ShopCollection[],
) {
  const collectionsBySlug = new Map<string, ShopCollection>();

  for (const collection of [...primary, ...additions]) {
    const existing = collectionsBySlug.get(collection.slug);
    if (!existing) {
      collectionsBySlug.set(collection.slug, { ...collection });
      continue;
    }

    existing.productIds = Array.from(
      new Set([...existing.productIds, ...collection.productIds]),
    );
  }

  return Array.from(collectionsBySlug.values());
}

function withPreviewProducts(catalog: ShopCatalog): ShopCatalog {
  const productIds = new Set(catalog.products.map((product) => product.id));
  const previewProducts = sampleShopCatalog.products.filter(
    (product) => !productIds.has(product.id),
  );

  if (previewProducts.length === 0) {
    return catalog;
  }

  return {
    brands: mergeBySlug(catalog.brands, sampleShopCatalog.brands),
    categories: mergeBySlug(
      catalog.categories,
      sampleShopCatalog.categories,
    ).sort((a, b) => a.sortOrder - b.sortOrder),
    collections: mergeCollectionProductIds(
      catalog.collections,
      sampleShopCatalog.collections,
    ),
    products: [...catalog.products, ...previewProducts],
  };
}

export async function getShopCatalog(): Promise<ShopCatalog> {
  if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
    return sampleShopCatalog;
  }

  try {
    const client = createServerConvexClient();
    const [rawProducts, rawBrands, rawCollections] = await Promise.all([
      client.query(api.products.list, {}),
      client.query(api.brands.list, {}),
      client.query(api.collections.list, {}),
    ]);
    let rawCategories: RawCategory[] = [];

    try {
      const categoryResult = await client.query(api.categories.list, {});
      rawCategories = Array.isArray(categoryResult)
        ? (categoryResult as RawCategory[])
        : [];
    } catch {
      rawCategories = [];
    }

    if (!Array.isArray(rawProducts) || rawProducts.length === 0) {
      return sampleShopCatalog;
    }

    return withPreviewProducts(
      normalizeCatalog(
        rawProducts as RawProduct[],
        Array.isArray(rawBrands) ? (rawBrands as RawBrand[]) : [],
        rawCategories,
        Array.isArray(rawCollections) ? (rawCollections as RawCollection[]) : [],
      ),
    );
  } catch (error) {
    console.error("Shop catalog fallback:", error);
    return sampleShopCatalog;
  }
}

export async function getShopProduct(slug: string) {
  const catalog = await getShopCatalog();
  return {
    catalog,
    product: catalog.products.find((item) => item.slug === slug) ?? null,
  };
}
