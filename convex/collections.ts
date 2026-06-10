import { v } from "convex/values";

import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const collections = await ctx.db.query("collections").order("desc").collect();

    return await Promise.all(
      collections.map(async (collection) => {
        const imageUrl = collection.imageStorageId
          ? await ctx.storage.getUrl(collection.imageStorageId)
          : collection.externalImageUrl;

        return {
          ...collection,
          imageUrl: imageUrl ?? "",
        };
      }),
    );
  },
});

export const upsert = mutation({
  args: {
    id: v.optional(v.id("collections")),
    name: v.string(),
    imageStorageId: v.optional(v.id("_storage")),
    externalImageUrl: v.optional(v.string()),
    productIds: v.array(v.id("products")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const { id, ...collection } = args;

    if (id) {
      await ctx.db.patch(id, {
        ...collection,
        updatedAt: now,
      });
      return id;
    }

    return await ctx.db.insert("collections", {
      ...collection,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const remove = mutation({
  args: {
    id: v.id("collections"),
  },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
