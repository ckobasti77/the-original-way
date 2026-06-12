import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const productType = v.union(v.literal("clothing"), v.literal("footwear"));
const productGender = v.union(
  v.literal("men"),
  v.literal("women"),
  v.literal("kids"),
);
const orderSource = v.union(v.literal("site"), v.literal("manual"));
const orderStatus = v.union(
  v.literal("new"),
  v.literal("processing"),
  v.literal("sent"),
  v.literal("completed"),
);

export default defineSchema({
  users: defineTable({
    authSubject: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    emailNormalized: v.string(),
    passwordHash: v.string(),
    passwordSalt: v.string(),
    city: v.optional(v.string()),
    street: v.optional(v.string()),
    houseNumber: v.optional(v.string()),
    profileCompletedAt: v.optional(v.number()),
    lastLoginAt: v.optional(v.number()),
    lastOrderAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_email_normalized", ["emailNormalized"])
    .index("by_auth_subject", ["authSubject"]),

  sessions: defineTable({
    tokenHash: v.string(),
    userId: v.id("users"),
    createdAt: v.number(),
    expiresAt: v.number(),
    revokedAt: v.optional(v.number()),
    lastUsedAt: v.optional(v.number()),
  })
    .index("by_token_hash", ["tokenHash"])
    .index("by_user_id", ["userId"])
    .index("by_expires_at", ["expiresAt"]),

  passwordResetTokens: defineTable({
    tokenHash: v.string(),
    userId: v.id("users"),
    createdAt: v.number(),
    expiresAt: v.number(),
    usedAt: v.optional(v.number()),
  })
    .index("by_token_hash", ["tokenHash"])
    .index("by_user_id", ["userId"])
    .index("by_expires_at", ["expiresAt"]),

  products: defineTable({
    name: v.string(),
    description: v.string(),
    type: productType,
    gender: productGender,
    categorySlug: v.optional(v.string()),
    costPrice: v.number(),
    salePrice: v.number(),
    sizes: v.array(v.string()),
    imageStorageIds: v.array(v.id("_storage")),
    externalImageUrls: v.array(v.string()),
    brandId: v.optional(v.id("brands")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_type", ["type"])
    .index("by_gender", ["gender"])
    .index("by_category_slug", ["categorySlug"])
    .index("by_brand", ["brandId"]),

  categories: defineTable({
    name: v.string(),
    slug: v.string(),
    type: productType,
    sortOrder: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_type", ["type"])
    .index("by_sort_order", ["sortOrder"]),

  brands: defineTable({
    name: v.string(),
    logoStorageId: v.optional(v.id("_storage")),
    externalLogoUrl: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),

  collections: defineTable({
    name: v.string(),
    imageStorageId: v.optional(v.id("_storage")),
    externalImageUrl: v.optional(v.string()),
    productIds: v.array(v.id("products")),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),

  orders: defineTable({
    orderNumber: v.string(),
    userId: v.optional(v.id("users")),
    firstName: v.string(),
    lastName: v.string(),
    email: v.optional(v.string()),
    city: v.string(),
    street: v.string(),
    houseNumber: v.string(),
    source: orderSource,
    status: orderStatus,
    trackingNumber: v.optional(v.string()),
    items: v.array(
      v.object({
        productId: v.id("products"),
        productName: v.string(),
        size: v.string(),
        quantity: v.number(),
        costPrice: v.number(),
        salePrice: v.number(),
        salePriceOverride: v.optional(v.number()),
      }),
    ),
    totalCost: v.number(),
    totalSale: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
    statusUpdatedAt: v.number(),
  })
    .index("by_user_id", ["userId"])
    .index("by_status", ["status"])
    .index("by_created_at", ["createdAt"]),

  settings: defineTable({
    key: v.string(),
    value: v.string(),
    updatedAt: v.number(),
  }).index("by_key", ["key"]),
});
