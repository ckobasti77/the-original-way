import { v } from "convex/values";
import { api } from "./_generated/api";
import { action, mutation, query } from "./_generated/server";

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

export const clear = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("brands").collect();
    for (const b of existing) {
      await ctx.db.delete(b._id);
    }
  },
});

export const seedWithStorage = mutation({
  args: {
    name: v.string(),
    logoStorageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("brands")
      .filter((q) => q.eq(q.field("name"), args.name))
      .first();

    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, {
        logoStorageId: args.logoStorageId,
        externalLogoUrl: undefined,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("brands", {
        name: args.name,
        logoStorageId: args.logoStorageId,
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});

export const seedFromUrls = action({
  args: {},
  handler: async (ctx) => {
    // 1. Clear all existing brands first
    await ctx.runMutation(api.brands.clear);

    const list = [
      { name: "Napapijri", url: "https://logo.clearbit.com/napapijri.com" },
      { name: "Lacoste", url: "https://logo.clearbit.com/lacoste.com" },
      { name: "Nike", url: "https://logo.clearbit.com/nike.com" },
      { name: "Tommy Hilfiger", url: "https://logo.clearbit.com/tommy.com" },
      { name: "Hugo", url: "https://logo.clearbit.com/hugoboss.com" },
      { name: "Diesel", url: "https://logo.clearbit.com/diesel.com" },
      { name: "Lyle&Scott", url: "https://logo.clearbit.com/lyleandscott.com" },
      { name: "Ralph Lauren", url: "https://logo.clearbit.com/ralphlauren.com" },
      { name: "The North Face", url: "https://logo.clearbit.com/thenorthface.com" },
      { name: "Jordan", url: "https://logo.clearbit.com/jordan.com" },
      { name: "Adidas", url: "https://logo.clearbit.com/adidas.com" },
      { name: "Stone Island", url: "https://logo.clearbit.com/stoneisland.com" },
      { name: "Calvin Klein", url: "https://logo.clearbit.com/calvinklein.com" },
      { name: "Desigual", url: "https://logo.clearbit.com/desigual.com" },
      { name: "Helly Hansen", url: "https://logo.clearbit.com/hellyhansen.com" },
      { name: "Parajumpers", url: "https://logo.clearbit.com/parajumpers.it" },
      { name: "Moncler", url: "https://logo.clearbit.com/moncler.com" },
      { name: "Bape", url: "https://logo.clearbit.com/bape.com" }
    ];

    for (const b of list) {
      console.log(`Preuzimanje i skladistenje brenda: ${b.name}`);
      try {
        const response = await fetch(b.url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
          }
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch logo: ${response.statusText}`);
        }
        
        const blob = await response.blob();
        
        // Save file in Convex Storage
        const logoStorageId = await ctx.storage.store(blob);
        
        // Link storage file with brand record in database
        await ctx.runMutation(api.brands.seedWithStorage, {
          name: b.name,
          logoStorageId,
        });
        console.log(`Uspesno seed-ovan brend: ${b.name} sa storageId: ${logoStorageId}`);
      } catch (e) {
        console.error(`Greska pri ucitavanju brenda ${b.name}:`, e instanceof Error ? e.message : e);
      }
    }
  }
});
