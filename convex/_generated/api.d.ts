/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as brands from "../brands.js";
import type * as categories from "../categories.js";
import type * as collections from "../collections.js";
import type * as files from "../files.js";
import type * as lib_authorization from "../lib/authorization.js";
import type * as lib_rateLimits from "../lib/rateLimits.js";
import type * as orders from "../orders.js";
import type * as products from "../products.js";
import type * as settings from "../settings.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  brands: typeof brands;
  categories: typeof categories;
  collections: typeof collections;
  files: typeof files;
  "lib/authorization": typeof lib_authorization;
  "lib/rateLimits": typeof lib_rateLimits;
  orders: typeof orders;
  products: typeof products;
  settings: typeof settings;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  rateLimiter: import("@convex-dev/rate-limiter/_generated/component.js").ComponentApi<"rateLimiter">;
};
