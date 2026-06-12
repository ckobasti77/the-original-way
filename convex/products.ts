import { v } from "convex/values";

import { mutation, query } from "./_generated/server";

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

export const list = query({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db.query("products").order("desc").collect();
    const categories = await ctx.db.query("categories").collect();
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
  },
});

export const upsert = mutation({
  args: {
    id: v.optional(v.id("products")),
    ...productArgs,
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const { id, ...product } = args;

    if (id) {
      await ctx.db.patch(id, {
        ...product,
        updatedAt: now,
      });
      return id;
    }

    return await ctx.db.insert("products", {
      ...product,
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
    await ctx.db.delete(id);

    const collections = await ctx.db.query("collections").collect();
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
