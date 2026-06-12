import { v } from "convex/values";

import { mutation, query } from "./_generated/server";

const categoryType = v.union(v.literal("clothing"), v.literal("footwear"));

const defaultCategories = [
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
] as const;

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
  args: {
    type: v.optional(categoryType),
  },
  handler: async (ctx, { type }) => {
    const categories = type
      ? await ctx.db
          .query("categories")
          .withIndex("by_type", (q) => q.eq("type", type))
          .collect()
      : await ctx.db.query("categories").collect();

    return categories.sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

export const ensureDefaults = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    let created = 0;

    for (const category of defaultCategories) {
      const existing = await ctx.db
        .query("categories")
        .withIndex("by_slug", (q) => q.eq("slug", category.slug))
        .first();

      if (existing) {
        await ctx.db.patch(existing._id, {
          name: category.name,
          type: category.type,
          sortOrder: category.sortOrder,
          updatedAt: now,
        });
        continue;
      }

      await ctx.db.insert("categories", {
        ...category,
        createdAt: now,
        updatedAt: now,
      });
      created += 1;
    }

    return created;
  },
});

export const upsert = mutation({
  args: {
    id: v.optional(v.id("categories")),
    name: v.string(),
    slug: v.optional(v.string()),
    type: categoryType,
    sortOrder: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const slug = args.slug?.trim() || slugify(args.name);

    if (!slug) {
      throw new Error("Slug kategorije nije validan.");
    }

    const existingBySlug = await ctx.db
      .query("categories")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();

    if (existingBySlug && existingBySlug._id !== args.id) {
      throw new Error("Kategorija sa ovim slugom vec postoji.");
    }

    if (args.id) {
      const previous = await ctx.db.get(args.id);
      await ctx.db.patch(args.id, {
        name: args.name.trim(),
        slug,
        type: args.type,
        sortOrder: args.sortOrder,
        updatedAt: now,
      });

      if (previous && previous.slug !== slug) {
        const products = await ctx.db
          .query("products")
          .withIndex("by_category_slug", (q) => q.eq("categorySlug", previous.slug))
          .collect();

        await Promise.all(
          products.map((product) =>
            ctx.db.patch(product._id, {
              categorySlug: slug,
              updatedAt: now,
            }),
          ),
        );
      }

      return args.id;
    }

    return await ctx.db.insert("categories", {
      name: args.name.trim(),
      slug,
      type: args.type,
      sortOrder: args.sortOrder,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const remove = mutation({
  args: {
    id: v.id("categories"),
  },
  handler: async (ctx, { id }) => {
    const category = await ctx.db.get(id);
    if (!category) {
      return;
    }

    await ctx.db.delete(id);

    const products = await ctx.db
      .query("products")
      .withIndex("by_category_slug", (q) => q.eq("categorySlug", category.slug))
      .collect();

    await Promise.all(
      products.map((product) =>
        ctx.db.patch(product._id, {
          categorySlug: undefined,
          updatedAt: Date.now(),
        }),
      ),
    );
  },
});
