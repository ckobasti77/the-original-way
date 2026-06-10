import { v } from "convex/values";

import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const brands = await ctx.db.query("brands").order("desc").collect();

    return await Promise.all(
      brands.map(async (brand) => {
        const logoUrl = brand.logoStorageId
          ? await ctx.storage.getUrl(brand.logoStorageId)
          : brand.externalLogoUrl;

        return {
          ...brand,
          logoUrl: logoUrl ?? "",
        };
      }),
    );
  },
});

export const upsert = mutation({
  args: {
    id: v.optional(v.id("brands")),
    name: v.string(),
    logoStorageId: v.optional(v.id("_storage")),
    externalLogoUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const { id, ...brand } = args;

    if (id) {
      await ctx.db.patch(id, {
        ...brand,
        updatedAt: now,
      });
      return id;
    }

    return await ctx.db.insert("brands", {
      ...brand,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const remove = mutation({
  args: {
    id: v.id("brands"),
  },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);

    const products = await ctx.db.query("products").collect();
    await Promise.all(
      products.map((product) => {
        if (product.brandId === id) {
          return ctx.db.patch(product._id, {
            brandId: undefined,
            updatedAt: Date.now(),
          });
        }
      }),
    );
  },
});
