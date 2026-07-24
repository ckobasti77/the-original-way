import { v } from "convex/values";

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

async function hydrateProducts(ctx: QueryCtx) {
    const products = await ctx.db.query("products").order("desc").take(500);
    const categories = await ctx.db.query("categories").take(200);
    const categoriesBySlug = new Map(
      categories.map((category) => [category.slug, category]),
    );

    return await Promise.all(
      products.map(async (product) => {
        const storedUrls = await Promise.all(
          product.imageStorageIds.map((storageId) => ctx.storage.getUrl(storageId)),
        );

        let brand = null;
        if (product.brandId) {
          const brandRecord = await ctx.db.get(product.brandId);
          if (brandRecord) {
            brand = {
              _id: brandRecord._id,
              name: brandRecord.name,
            };
          }
        }

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

    const enrichedProducts = await Promise.all(
      products.map(async (product) => {
        const storedUrls = await Promise.all(
          product.imageStorageIds.map((storageId) => ctx.storage.getUrl(storageId)),
        );

        let brand = null;
        if (product.brandId) {
          const brandRecord = await ctx.db.get(product.brandId);
          if (brandRecord) {
            brand = {
              _id: brandRecord._id,
              name: brandRecord.name,
            };
          }
        }

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

    const collections = await ctx.db.query("collections").take(500);
    await Promise.all(
      collections.map((collection) =>
        ctx.db.patch(collection._id, {
          productIds: collection.productIds.filter((productId) => productId !== id),
          updatedAt: Date.now(),
        }),
      ),
    );
  },
});
