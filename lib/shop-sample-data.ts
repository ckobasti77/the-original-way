import {
  defaultShopCategories,
  defaultShopCollections,
  type ShopBrand,
  type ShopCatalog,
  type ShopProduct,
} from "@/lib/shop-taxonomy";

const nikeBrand: ShopBrand = {
  id: "demo-brand-nike",
  name: "Nike",
  slug: "nike",
};

const northFaceBrand: ShopBrand = {
  id: "demo-brand-the-north-face",
  name: "The North Face",
  slug: "the-north-face",
};

const lacosteBrand: ShopBrand = {
  id: "demo-brand-lacoste",
  name: "Lacoste",
  slug: "lacoste",
};

const demoBaseTime = 1781222400000;

export const sampleShopProducts: ShopProduct[] = [
  {
    id: "demo-air-max",
    slug: "nike-air-max-demo",
    name: "Nike Air Max Demo",
    description:
      "Lagana patika sa cistim profilom, mekanim gazistem i dovoljno jakim vizuelnim potpisom za svakodnevni outfit.",
    type: "footwear",
    gender: "men",
    categorySlug: "patike",
    category: defaultShopCategories.find((category) => category.slug === "patike"),
    brand: nikeBrand,
    brandName: nikeBrand.name,
    salePrice: 16990,
    costPrice: 9800,
    sizes: ["40", "41", "42", "43", "44", "45"],
    imageUrls: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1200&q=85",
    ],
    collectionSlugs: ["after-dark"],
    tags: ["patike", "air", "urban", "demo"],
    createdAt: demoBaseTime - 1000 * 60 * 60 * 24 * 2,
    isDemo: true,
  },
  {
    id: "demo-nuptse",
    slug: "the-north-face-puffer-demo",
    name: "The North Face Puffer Demo",
    description:
      "Topla kratka jakna sa ostrim ramenom, velikim volumenom i dovoljno mirnom bojom da radi uz farmerke ili trenerku.",
    type: "clothing",
    gender: "women",
    categorySlug: "jakne",
    category: defaultShopCategories.find((category) => category.slug === "jakne"),
    brand: northFaceBrand,
    brandName: northFaceBrand.name,
    salePrice: 28990,
    costPrice: 18200,
    sizes: ["S", "M", "L", "XL"],
    imageUrls: [
      "https://images.unsplash.com/photo-1548126032-079a0fb0099d?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=1200&q=85",
    ],
    collectionSlugs: ["alpska-kapsula"],
    tags: ["jakna", "zima", "puffer", "demo"],
    createdAt: demoBaseTime - 1000 * 60 * 60 * 24,
    isDemo: true,
  },
  {
    id: "demo-polo",
    slug: "lacoste-polo-demo",
    name: "Lacoste Polo Demo",
    description:
      "Polo majica od pamucnog pletiva, ravnog kragna i urednog kroja za dan kada outfit mora da izgleda lako ali skupo.",
    type: "clothing",
    gender: "men",
    categorySlug: "polo-majice",
    category: defaultShopCategories.find((category) => category.slug === "polo-majice"),
    brand: lacosteBrand,
    brandName: lacosteBrand.name,
    salePrice: 8990,
    costPrice: 4300,
    sizes: ["S", "M", "L", "XL", "XXL"],
    imageUrls: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=1200&q=85",
    ],
    collectionSlugs: ["sunset-resort", "after-dark"],
    tags: ["polo", "majica", "leto", "demo"],
    createdAt: demoBaseTime - 1000 * 60 * 60 * 8,
    isDemo: true,
  },
];

export const sampleShopCatalog: ShopCatalog = {
  brands: [nikeBrand, northFaceBrand, lacosteBrand],
  categories: defaultShopCategories,
  collections: defaultShopCollections.map((collection) => ({
    ...collection,
    productIds: sampleShopProducts
      .filter((product) => product.collectionSlugs.includes(collection.slug))
      .map((product) => product.id),
  })),
  products: sampleShopProducts,
};
