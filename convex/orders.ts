import { v } from "convex/values";

import { mutation, query, type MutationCtx } from "./_generated/server";
import { getUserByAuthSubject, syncShippingFromOrder } from "./auth";
import { safeTrim } from "../lib/auth/crypto";
import { normalizeCourierProfile } from "../lib/storefront-profile";

const orderStatus = v.union(
  v.literal("new"),
  v.literal("processing"),
  v.literal("sent"),
  v.literal("completed"),
);

const storefrontItem = v.object({
  productId: v.id("products"),
  size: v.string(),
  quantity: v.number(),
});

async function nextOrderNumber(ctx: MutationCtx) {
  const latest = await ctx.db.query("orders").order("desc").first();
  const parsed = latest
    ? Number.parseInt(latest.orderNumber.replace(/\D/g, ""), 10)
    : 1039;
  const next = Math.max(1040, (Number.isFinite(parsed) ? parsed : 1039) + 1);
  return `TOW-${String(next).padStart(4, "0")}`;
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("orders").order("desc").collect();
  },
});

export const mine = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const user = await getUserByAuthSubject(ctx, identity.subject);
    if (!user) {
      return [];
    }

    return await ctx.db
      .query("orders")
      .withIndex("by_user_id", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
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
    const orderNumber = await nextOrderNumber(ctx);
    const identity = await ctx.auth.getUserIdentity();
    const user = identity ? await getUserByAuthSubject(ctx, identity.subject) : null;

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

    const orderEmail = safeTrim(args.email) || user?.email;

    if (user && args.city.trim() && args.street.trim() && args.houseNumber.trim()) {
      await syncShippingFromOrder(
        ctx,
        user,
        {
          city: args.city.trim(),
          street: args.street.trim(),
          houseNumber: args.houseNumber.trim(),
        },
      );
    }

    return await ctx.db.insert("orders", {
      orderNumber,
      userId: user?._id,
      firstName: args.firstName,
      lastName: args.lastName,
      email: orderEmail,
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

export const createStorefront = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    phone: v.string(),
    city: v.string(),
    postalCode: v.string(),
    street: v.string(),
    houseNumber: v.string(),
    addressLine2: v.optional(v.string()),
    deliveryNote: v.optional(v.string()),
    saveToProfile: v.boolean(),
    items: v.array(storefrontItem),
  },
  returns: v.object({
    orderId: v.id("orders"),
    orderNumber: v.string(),
  }),
  handler: async (ctx, args) => {
    if (args.items.length === 0 || args.items.length > 50) {
      throw new Error("Porudžbina mora sadržati između 1 i 50 stavki.");
    }

    const now = Date.now();
    const identity = await ctx.auth.getUserIdentity();
    const user = identity ? await getUserByAuthSubject(ctx, identity.subject) : null;
    const shipping = normalizeCourierProfile(args);

    let totalCost = 0;
    let totalSale = 0;
    const items = [];
    for (const input of args.items) {
      const product = await ctx.db.get(input.productId);
      if (!product) throw new Error("Proizvod više nije dostupan.");
      const quantity = Math.min(20, Math.max(1, Math.round(input.quantity)));
      const size = safeTrim(input.size).replace(/\s+/g, " ");
      if (!size || size.length > 30) throw new Error("Veličina nije ispravna.");
      totalCost += product.costPrice * quantity;
      totalSale += product.salePrice * quantity;
      items.push({
        productId: product._id,
        productName: product.name,
        size,
        quantity,
        costPrice: product.costPrice,
        salePrice: product.salePrice,
      });
    }

    const orderNumber = await nextOrderNumber(ctx);
    const orderId = await ctx.db.insert("orders", {
      orderNumber,
      userId: user?._id,
      ...shipping,
      source: "site",
      status: "new",
      items,
      totalCost,
      totalSale,
      createdAt: now,
      updatedAt: now,
      statusUpdatedAt: now,
    });

    if (user) {
      await ctx.db.patch(user._id, {
        ...(args.saveToProfile
          ? {
              firstName: shipping.firstName,
              lastName: shipping.lastName,
              phone: shipping.phone,
              city: shipping.city,
              postalCode: shipping.postalCode,
              street: shipping.street,
              houseNumber: shipping.houseNumber,
              addressLine2: shipping.addressLine2,
              deliveryNote: shipping.deliveryNote,
              profileCompletedAt: user.profileCompletedAt ?? now,
            }
          : {}),
        lastOrderAt: now,
        updatedAt: now,
      });
    }

    return { orderId, orderNumber };
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
