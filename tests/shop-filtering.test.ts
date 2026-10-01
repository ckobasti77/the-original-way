import assert from "node:assert/strict";
import test from "node:test";

import {
  applyShopFilters,
  computeFacets,
  computePriceStats,
  countActiveFilters,
  countMatches,
  filtersToSearchParams,
  parseShopFilters,
  toFilterRecord,
} from "../lib/shop-filtering.ts";
import { sortSizes, type ShopProduct } from "../lib/shop-taxonomy.ts";
import { formatProductCount } from "../lib/storefront-i18n.ts";

function product(overrides: Partial<ShopProduct> & { id: string }): ShopProduct {
  return {
    slug: overrides.id,
    name: `Proizvod ${overrides.id}`,
    description: "",
    type: "clothing",
    gender: "men",
    brandName: "Nike",
    salePrice: 100,
    sizes: ["M"],
    imageUrls: [],
    collectionSlugs: [],
    tags: [],
    createdAt: 0,
    ...overrides,
  };
}

const catalog: ShopProduct[] = [
  product({ id: "a", brandName: "Nike", gender: "men", categorySlug: "majice", salePrice: 40, sizes: ["S", "M"], createdAt: 3 }),
  product({ id: "b", brandName: "Adidas", gender: "women", categorySlug: "majice", salePrice: 80, sizes: ["M"], createdAt: 2 }),
  product({ id: "c", brandName: "Nike", gender: "women", type: "footwear", categorySlug: "patike", salePrice: 120, sizes: ["38", "39"], createdAt: 1 }),
  product({ id: "d", brandName: "Puma", gender: "kids", categorySlug: "jakne", salePrice: 60, sizes: [], createdAt: 4, collectionSlugs: ["alpska-kapsula"] }),
  product({ id: "e", brandName: "Nike", gender: "men", type: "accessories", categorySlug: "dodaci", salePrice: 20, sizes: ["UNI"], description: "vunena kapa", createdAt: 5 }),
];
const records = catalog.map(toFilterRecord);

test("parseShopFilters normalizuje vrednosti i odbacuje nepoznate", () => {
  const filters = parseShopFilters({
    gender: ["men", "aliens"],
    type: "accessories",
    brand: ["  Nike ", "nike"],
    min: "10",
    max: "abc",
    sort: "price-desc",
    availability: "maybe",
  });
  assert.deepEqual(filters.gender, ["men"]);
  assert.deepEqual(filters.type, ["accessories"]);
  assert.deepEqual(filters.brand, ["nike"]);
  assert.equal(filters.min, 10);
  assert.equal(filters.max, undefined);
  assert.equal(filters.sort, "price-desc");
  assert.equal(filters.availability, undefined);
});

test("applyShopFilters: OR unutar grupe, AND izmedju grupa", () => {
  const filters = parseShopFilters({ brand: ["nike", "adidas"], gender: "women" });
  assert.deepEqual(
    applyShopFilters(catalog, filters).map((item) => item.id),
    ["b", "c"],
  );
});

test("applyShopFilters: cena, dostupnost, pretraga i sortiranje", () => {
  assert.deepEqual(
    applyShopFilters(catalog, parseShopFilters({ min: "40", max: "100", sort: "price-asc" })).map(
      (item) => item.id,
    ),
    ["a", "d", "b"],
  );
  assert.deepEqual(
    applyShopFilters(catalog, parseShopFilters({ availability: "in-stock" })).map((item) => item.id),
    ["e", "a", "b", "c"],
  );
  assert.deepEqual(
    applyShopFilters(catalog, parseShopFilters({ q: "VUNENA" })).map((item) => item.id),
    ["e"],
  );
});

test("countMatches daje isti broj kao applyShopFilters", () => {
  const filters = parseShopFilters({ brand: "nike", size: ["M", "38"] });
  assert.equal(countMatches(records, filters), applyShopFilters(catalog, filters).length);
  assert.equal(countMatches(records, filters), 2);
});

test("computeFacets broji disjunktivno (grupa ne filtrira samu sebe)", () => {
  const facets = computeFacets(records, parseShopFilters({ brand: "nike", gender: "men" }));
  // Brend se racuna bez brend filtera, ali sa pol=men.
  assert.deepEqual(facets.brand, { nike: 2 });
  // Pol se racuna bez pol filtera, ali sa brend=nike.
  assert.deepEqual(facets.gender, { men: 2, women: 1 });
  assert.deepEqual(facets.type, { clothing: 1, accessories: 1 });
  assert.equal(facets.inStock, 2);
});

test("computePriceStats: granice iz celog skupa, histogram bez filtera cene", () => {
  const stats = computePriceStats(records, parseShopFilters({ max: "50", gender: "men" }), 4);
  assert.equal(stats.floor, 20);
  assert.equal(stats.ceil, 120);
  // men: a=40 (korpa 0), e=20 (korpa 0); cena se ignorise.
  assert.deepEqual(stats.histogram, [2, 0, 0, 0]);
});

test("countActiveFilters i filtersToSearchParams", () => {
  const filters = parseShopFilters({
    gender: ["women", "men"],
    size: "M",
    min: "10",
    max: "90",
    sort: "price-asc",
  });
  assert.equal(countActiveFilters(filters), 4);
  assert.equal(
    filtersToSearchParams(filters).toString(),
    "gender=men&gender=women&size=M&min=10&max=90&sort=price-asc",
  );
});

test("sortSizes poštuje stvarni redosled veličina", () => {
  assert.deepEqual(
    sortSizes(["XL", "42", "S", "3XL", "M", "38,5", "UNI", "XS", "L", "40"]),
    ["XS", "S", "M", "L", "XL", "3XL", "38,5", "40", "42", "UNI"],
  );
});

test("formatProductCount: srpska množina", () => {
  assert.equal(formatProductCount(1, "sr"), "1 proizvod");
  assert.equal(formatProductCount(3, "sr"), "3 proizvoda");
  assert.equal(formatProductCount(11, "sr"), "11 proizvoda");
  assert.equal(formatProductCount(21, "sr"), "21 proizvod");
  assert.equal(formatProductCount(1, "en"), "1 product");
  assert.equal(formatProductCount(0, "en"), "0 products");
});
