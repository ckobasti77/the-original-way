import { v } from "convex/values";

import { mutation, query } from "./_generated/server";

const orderStatus = v.union(
  v.literal("new"),
  v.literal("processing"),
  v.literal("sent"),
  v.literal("completed"),
);

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("orders").order("desc").collect();
  },
});

export const create = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    email: v.optional(v.string()),
    city: v.string(),
    street: v.string(),
    houseNumber: v.string(),
    source: v.union(v.literal("site"), v.literal("manual")),
    items: v.array(
      v.object({
        productId: v.id("products"),
        size: v.string(),
        quantity: v.number(),
        salePriceOverride: v.optional(v.number()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const orders = await ctx.db.query("orders").collect();
    const orderNumber = `TOW-${String(1040 + orders.length).padStart(4, "0")}`;

    const items = [];
    let totalCost = 0;
    let totalSale = 0;

    for (const item of args.items) {
      const product = await ctx.db.get(item.productId);

      if (!product) {
        throw new Error("Product does not exist.");
      }

      const quantity = Math.max(1, Math.round(item.quantity));
      const salePrice = item.salePriceOverride ?? product.salePrice;
      const costLine = product.costPrice * quantity;
      const saleLine = salePrice * quantity;

      totalCost += costLine;
      totalSale += saleLine;
      items.push({
        productId: product._id,
        productName: product.name,
        size: item.size,
        quantity,
        costPrice: product.costPrice,
        salePrice,
        salePriceOverride: item.salePriceOverride,
      });
    }

    return await ctx.db.insert("orders", {
      orderNumber,
      firstName: args.firstName,
      lastName: args.lastName,
      email: args.email,
      city: args.city,
      street: args.street,
      houseNumber: args.houseNumber,
      source: args.source,
      status: "new",
      items,
      totalCost,
      totalSale,
      createdAt: now,
      updatedAt: now,
      statusUpdatedAt: now,
    });
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("orders"),
    status: orderStatus,
    trackingNumber: v.optional(v.string()),
  },
  handler: async (ctx, { id, status, trackingNumber }) => {
    const order = await ctx.db.get(id);

    if (!order) {
      throw new Error("Order does not exist.");
    }

    if (status === "sent" && !trackingNumber?.trim()) {
      throw new Error("Tracking number is required for sent orders.");
    }

    await ctx.db.patch(id, {
      status,
      trackingNumber: status === "sent" ? trackingNumber?.trim() : order.trackingNumber,
      updatedAt: Date.now(),
      statusUpdatedAt: Date.now(),
    });

    return await ctx.db.get(id);
  },
});

export const remove = mutation({
  args: {
    id: v.id("orders"),
  },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
