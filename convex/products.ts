import { v } from "convex/values";

import type { Id } from "./_generated/dataModel";
import { mutation, query, type QueryCtx } from "./_generated/server";
import { requireAdmin } from "./lib/authorization";

const productArgs = {
  name: v.string(),
  description: v.string(),
  type: v.union(v.literal("clothing"), v.literal("footwear")),
  gender: v.union(v.literal("men"), v.literal("women"), v.literal("kids")),
  categorySlug: v.optional(v.string()),
  costPrice: v.number(),
  salePrice: v.number(),
  sizes: v.array(v.string()),
  imageStorageIds: v.array(v.id("_storage")),
  externalImageUrls: v.array(v.string()),
  brandId: v.optional(v.id("brands")),
  isRecommended: v.optional(v.boolean()),
  recommendationOrder: v.optional(v.number()),
};

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

/**
 * Ucitava sve brendove koje koristi dati skup proizvoda u jednom prolazu.
 * Bez ovoga se radi `ctx.db.get(brandId)` po proizvodu — do 500 dodatnih
 * citanja po pozivu, na svakom renderu storefronta.
 */
async function loadBrandsFor(
  ctx: QueryCtx,
  products: { brandId?: Id<"brands"> }[],
) {
  const brandIds = [
    ...new Set(
      products
        .map((product) => product.brandId)
        .filter((id): id is Id<"brands"> => Boolean(id)),
    ),
  ];
  const brands = await Promise.all(brandIds.map((id) => ctx.db.get(id)));

  return new Map(
    brands
      .filter((brand) => brand !== null)
      .map((brand) => [brand._id, { _id: brand._id, name: brand.name }]),
  );
}

async function hydrateProducts(ctx: QueryCtx) {
    const products = await ctx.db.query("products").order("desc").take(500);
    const categories = await ctx.db.query("categories").take(200);
    const categoriesBySlug = new Map(
      categories.map((category) => [category.slug, category]),
    );
    const brandsById = await loadBrandsFor(ctx, products);

    return await Promise.all(
      products.map(async (product) => {
        const storedUrls = await Promise.all(
          product.imageStorageIds.map((storageId) => ctx.storage.getUrl(storageId)),
        );

        const brand = product.brandId
          ? brandsById.get(product.brandId) ?? null
          : null;

        return {
          ...product,
          slug: `${slugify(product.name)}-${product._id.slice(-6)}`,
          imageUrls: [
            ...storedUrls.filter((url): url is string => Boolean(url)),
            ...product.externalImageUrls,
          ],
          brand,
          category: product.categorySlug
            ? categoriesBySlug.get(product.categorySlug) ?? null
            : null,
        };
      }),
    );
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    const products = await hydrateProducts(ctx);

    return products.map(({ costPrice, ...product }) => {
      void costPrice;
      return product;
    });
  },
});

export const listAdmin = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await hydrateProducts(ctx);
  },
});

/**
 * Lagana provera aktuelnog stanja za stavke u korpi. Korpa se čuva u
 * localStorage neograničeno, pa snimljena cena i veličina mogu da zastare.
 * Vraća samo ono što je potrebno za usklađivanje — nikad `costPrice`.
 */
export const availability = query({
  args: {
    productIds: v.array(v.id("products")),
  },
  returns: v.array(
    v.object({
      _id: v.id("products"),
      name: v.string(),
      salePrice: v.number(),
      sizes: v.array(v.string()),
    }),
  ),
  handler: async (ctx, args) => {
    const uniqueIds = [...new Set(args.productIds)].slice(0, 50);
    const products = await Promise.all(uniqueIds.map((id) => ctx.db.get(id)));

    return products
      .filter((product) => product !== null)
      .map((product) => ({
        _id: product._id,
        name: product.name,
        salePrice: product.salePrice,
        sizes: product.sizes,
      }));
  },
});

export const listRecommended = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const requestedLimit = Math.floor(args.limit ?? 12);
    const limit = Math.min(Math.max(requestedLimit, 1), 24);
    const products = await ctx.db
      .query("products")
      .withIndex("by_is_recommended_and_recommendation_order", (q) =>
        q.eq("isRecommended", true),
      )
      .order("asc")
      .take(limit);
    const categories = await ctx.db.query("categories").take(200);
    const categoriesBySlug = new Map(
      categories.map((category) => [category.slug, category]),
    );
    const brandsById = await loadBrandsFor(ctx, products);

    const enrichedProducts = await Promise.all(
      products.map(async (product) => {
        const storedUrls = await Promise.all(
          product.imageStorageIds.map((storageId) => ctx.storage.getUrl(storageId)),
        );

        const brand = product.brandId
          ? brandsById.get(product.brandId) ?? null
          : null;

        const { costPrice, ...publicProduct } = product;
        void costPrice;

        return {
          ...publicProduct,
          slug: `${slugify(product.name)}-${product._id.slice(-6)}`,
          imageUrls: [
            ...storedUrls.filter((url): url is string => Boolean(url)),
            ...product.externalImageUrls,
          ],
          brand,
          category: product.categorySlug
            ? categoriesBySlug.get(product.categorySlug) ?? null
            : null,
        };
      }),
    );

    return enrichedProducts;
  },
});

export const upsert = mutation({
  args: {
    id: v.optional(v.id("products")),
    ...productArgs,
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const now = Date.now();
    const { id, ...product } = args;

    if (id) {
      await ctx.db.patch(id, {
        ...product,
        isRecommended: product.isRecommended || undefined,
        recommendationOrder: product.isRecommended
          ? product.recommendationOrder
          : undefined,
        updatedAt: now,
      });
      return id;
    }

    return await ctx.db.insert("products", {
      ...product,
      isRecommended: product.isRecommended || undefined,
      recommendationOrder: product.isRecommended
        ? product.recommendationOrder
        : undefined,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const remove = mutation({
  args: {
    id: v.id("products"),
  },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    await ctx.db.delete(id);

    // Samo kolekcije koje su zaista sadrzale proizvod — ranije se patchovala
    // svaka kolekcija, sto je nepotrebno upisivanje i lazni `updatedAt`.
    const now = Date.now();
    const collections = await ctx.db.query("collections").take(500);
    const affected = collections.filter((collection) =>
      collection.productIds.includes(id),
    );

    await Promise.all(
      affected.map((collection) =>
        ctx.db.patch(collection._id, {
          productIds: collection.productIds.filter((productId) => productId !== id),
          updatedAt: now,
        }),
      ),
    );
  },
});
