import { v } from "convex/values";

import {
  action,
  internalAction,
  internalMutation,
  query,
  type QueryCtx,
} from "./_generated/server";
import { internal } from "./_generated/api";
import { requireAdmin } from "./lib/authorization";
import {
  DEFAULT_CURRENCY,
  FALLBACK_EUR_RSD,
  isCurrency,
  type Currency,
} from "../lib/currency";

const BASE = "EUR";
const QUOTE = "RSD";

// ---------------------------------------------------------------------------
// Server-side helperi (koriste ih porudžbine i javni query). Tipizovani su
// QueryCtx-om, pa rade i iz mutacija (MutationCtx je nadskup QueryCtx-a).
// ---------------------------------------------------------------------------

export async function readCachedRate(ctx: QueryCtx): Promise<number> {
  const row = await ctx.db
    .query("exchangeRates")
    .withIndex("by_base_and_quote", (q) => q.eq("base", BASE).eq("quote", QUOTE))
    .first();
  return row && Number.isFinite(row.rate) && row.rate > 0
    ? row.rate
    : FALLBACK_EUR_RSD;
}

export async function readDefaultCurrency(ctx: QueryCtx): Promise<Currency> {
  const row = await ctx.db
    .query("settings")
    .withIndex("by_key", (q) => q.eq("key", "currency"))
    .first();
  return row && isCurrency(row.value) ? row.value : DEFAULT_CURRENCY;
}

// ---------------------------------------------------------------------------
// Javni query koji storefront zove: kurs + podrazumevana valuta prodavnice.
// Nikada ne vraća prazno — ako keš ne postoji, vraća hardkodovani fallback.
// ---------------------------------------------------------------------------

export const getPublicConfig = query({
  args: {},
  returns: v.object({
    rate: v.number(),
    rateSource: v.string(),
    rateUpdatedAt: v.number(),
    defaultCurrency: v.union(v.literal("EUR"), v.literal("RSD")),
  }),
  handler: async (ctx) => {
    const row = await ctx.db
      .query("exchangeRates")
      .withIndex("by_base_and_quote", (q) =>
        q.eq("base", BASE).eq("quote", QUOTE),
      )
      .first();
    const defaultCurrency = await readDefaultCurrency(ctx);
    if (row && Number.isFinite(row.rate) && row.rate > 0) {
      return {
        rate: row.rate,
        rateSource: row.source,
        rateUpdatedAt: row.fetchedAt,
        defaultCurrency,
      };
    }
    return {
      rate: FALLBACK_EUR_RSD,
      rateSource: "fallback",
      rateUpdatedAt: 0,
      defaultCurrency,
    };
  },
});

// ---------------------------------------------------------------------------
// Upis keširanog kursa. Internal — poziva ga cron/akcija, ne klijent.
// ---------------------------------------------------------------------------

export const storeRate = internalMutation({
  args: { rate: v.number(), source: v.string() },
  returns: v.null(),
  handler: async (ctx, { rate, source }) => {
    if (!Number.isFinite(rate) || rate <= 0) {
      throw new Error("Neispravan kurs.");
    }
    const existing = await ctx.db
      .query("exchangeRates")
      .withIndex("by_base_and_quote", (q) =>
        q.eq("base", BASE).eq("quote", QUOTE),
      )
      .first();
    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, { rate, source, fetchedAt: now });
    } else {
      await ctx.db.insert("exchangeRates", {
        base: BASE,
        quote: QUOTE,
        rate,
        source,
        fetchedAt: now,
      });
    }
    return null;
  },
});

// ---------------------------------------------------------------------------
// Povlačenje kursa sa eksternih izvora. `fetch` radi u default Convex runtime-u
// (bez "use node"), isto kao slanje mejlova u auth.ts. Nijedan izvor ne traži
// API ključ. CSP se odnosi na browser — Convex akcija nije ograničena njime.
// ---------------------------------------------------------------------------

async function fetchEurRsd(): Promise<{ rate: number; source: string } | null> {
  // 1) Zvanični srednji kurs NBS.
  try {
    const res = await fetch(
      "https://kurs.resenje.org/api/v1/currencies/eur/rates/today",
    );
    if (res.ok) {
      const data = (await res.json()) as { exchange_middle?: unknown };
      const rate = Number(data?.exchange_middle);
      if (Number.isFinite(rate) && rate > 0) {
        return { rate, source: "nbs" };
      }
    }
  } catch (error) {
    console.error("NBS kurs nije dostupan:", error);
  }

  // 2) Rezervni izvor: open.er-api.com.
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/EUR");
    if (res.ok) {
      const data = (await res.json()) as { rates?: { RSD?: unknown } };
      const rate = Number(data?.rates?.RSD);
      if (Number.isFinite(rate) && rate > 0) {
        return { rate, source: "er-api" };
      }
    }
  } catch (error) {
    console.error("Rezervni kurs (er-api) nije dostupan:", error);
  }

  return null;
}

// Dnevni cron cilj.
export const refreshRate = internalAction({
  args: {},
  returns: v.null(),
  handler: async (ctx): Promise<null> => {
    const result = await fetchEurRsd();
    if (!result) {
      console.error(
        "Kurs nije osvežen — svi izvori pali; ostaje poslednja keširana vrednost.",
      );
      return null;
    }
    await ctx.runMutation(internal.currency.storeRate, result);
    return null;
  },
});

// Ručno pokretanje iz admina (za inicijalno seed-ovanje / test).
export const refreshRateNow = action({
  args: {},
  returns: v.object({ rate: v.number(), source: v.string() }),
  handler: async (ctx): Promise<{ rate: number; source: string }> => {
    await requireAdmin(ctx);
    const result = await fetchEurRsd();
    if (!result) {
      throw new Error("Nijedan izvor kursa trenutno ne odgovara.");
    }
    await ctx.runMutation(internal.currency.storeRate, result);
    return result;
  },
});
