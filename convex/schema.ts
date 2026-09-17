import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const productType = v.union(
  v.literal("clothing"),
  v.literal("footwear"),
  v.literal("accessories"),
);
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
const currency = v.union(v.literal("EUR"), v.literal("RSD"));

export default defineSchema({
  users: defineTable({
    authSubject: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    emailNormalized: v.string(),
    passwordHash: v.string(),
    passwordSalt: v.string(),
    phone: v.optional(v.string()),
    city: v.optional(v.string()),
    postalCode: v.optional(v.string()),
    street: v.optional(v.string()),
    houseNumber: v.optional(v.string()),
    addressLine2: v.optional(v.string()),
    deliveryNote: v.optional(v.string()),
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
    // Opcioni ručno unet RSD override (za prikaz u katalogu). Ako nedostaje,
    // RSD se računa iz salePrice (EUR baza) po tekućem kursu.
    salePriceRsd: v.optional(v.number()),
    sizes: v.array(v.string()),
    imageStorageIds: v.array(v.id("_storage")),
    externalImageUrls: v.array(v.string()),
    brandId: v.optional(v.id("brands")),
    isRecommended: v.optional(v.boolean()),
    recommendationOrder: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_type", ["type"])
    .index("by_gender", ["gender"])
    .index("by_category_slug", ["categorySlug"])
    .index("by_brand", ["brandId"])
    .index("by_is_recommended_and_recommendation_order", [
      "isRecommended",
      "recommendationOrder",
    ]),

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
    phone: v.optional(v.string()),
    city: v.string(),
    postalCode: v.optional(v.string()),
    street: v.string(),
    houseNumber: v.string(),
    addressLine2: v.optional(v.string()),
    deliveryNote: v.optional(v.string()),
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
    // Zamrznuta valuta i kurs u trenutku porudžbine. Iznosi (salePrice/totalSale)
    // ostaju u EUR bazi; RSD prikaz se računa iz zamrznutog exchangeRate, pa
    // kasnije promene kursa NE menjaju istorijske iznose. Opciono zbog starih
    // porudžbina (bez ovih polja se tretiraju kao EUR).
    currency: v.optional(currency),
    exchangeRate: v.optional(v.number()),
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

  // Keš deviznog kursa (jedan red po valutnom paru, npr. EUR->RSD).
  // Puni ga dnevni cron; storefront ga čita javnim queryjem.
  exchangeRates: defineTable({
    base: v.string(), // "EUR"
    quote: v.string(), // "RSD"
    rate: v.number(), // srednji kurs (exchange_middle)
    source: v.string(), // "nbs" | "er-api" | "fallback"
    fetchedAt: v.number(),
  }).index("by_base_and_quote", ["base", "quote"]),
});
