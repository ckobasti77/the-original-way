"use client";

import { useMemo } from "react";
import { useQuery } from "convex/react";

import type { Language } from "@/components/settings-provider";
import { api } from "@/convex/_generated/api";
import {
  defaultShopCategories,
  defaultShopCollections,
  normalizeCollectionSlug,
  type ProductType,
} from "@/lib/shop-taxonomy";

import { CATEGORY_LABELS_EN, COLLECTION_COPY, type NavLinkItem } from "./content";

export type NavMenuEntry = {
  description?: string;
  href: string;
  label: string;
  slug: string;
};

export type NavMenuColumn = {
  href: string;
  items: NavMenuEntry[];
  type: ProductType;
};

type RawNavCategory = {
  name: string;
  slug: string;
  sortOrder: number;
  type: ProductType;
};

type RawNavCollection = {
  name: string;
};

const CONVEX_ENABLED = Boolean(process.env.NEXT_PUBLIC_CONVEX_URL);

function categoryLabel(category: { name: string; slug: string }, language: Language) {
  if (language === "en") {
    return CATEGORY_LABELS_EN[category.slug] ?? category.name;
  }
  return category.name;
}

/**
 * Categories and collections are admin-managed, so both menus read from Convex
 * and fall back to the seeded taxonomy while the query is in flight (or when
 * Convex is not configured) to keep the navbar stable on first paint.
 */
export function useNavMenu(language: Language) {
  const categoryQuery = useQuery(
    api.categories.list,
    CONVEX_ENABLED ? {} : "skip",
  ) as RawNavCategory[] | undefined;
  const collectionQuery = useQuery(
    api.collections.list,
    CONVEX_ENABLED ? {} : "skip",
  ) as RawNavCollection[] | undefined;

  const categories = useMemo(() => {
    const source =
      categoryQuery && categoryQuery.length > 0
        ? [...categoryQuery].sort((a, b) => a.sortOrder - b.sortOrder)
        : defaultShopCategories;

    return source.map((category) => ({
      name: category.name,
      slug: category.slug,
      type: category.type,
    }));
  }, [categoryQuery]);

  const collections = useMemo(() => {
    if (!collectionQuery || collectionQuery.length === 0) {
      return defaultShopCollections.map((collection) => ({
        name: collection.name,
        slug: collection.slug,
      }));
    }

    const seen = new Set<string>();

    return collectionQuery
      .map((collection) => ({
        name: collection.name,
        slug: normalizeCollectionSlug(collection.name),
      }))
      .filter((collection) => {
        if (!collection.slug || seen.has(collection.slug)) return false;
        seen.add(collection.slug);
        return true;
      });
  }, [collectionQuery]);

  return useMemo(() => {
    const categoryColumns = (gender?: string): NavMenuColumn[] => {
      const genderQuery = gender ? `gender=${gender}&` : "";

      return (["clothing", "footwear"] as const)
        .map((type) => ({
          href: `/proizvodi?${genderQuery}type=${type}`,
          items: categories
            .filter((category) => category.type === type)
            .map((category) => ({
              href: `/proizvodi?${genderQuery}category=${category.slug}`,
              label: categoryLabel(category, language),
              slug: category.slug,
            })),
          type,
        }))
        .filter((column) => column.items.length > 0);
    };

    const collectionEntries = (gender?: string): NavMenuEntry[] => {
      const genderQuery = gender ? `gender=${gender}&` : "";

      return collections.map((collection) => {
        const copy = COLLECTION_COPY[collection.slug];

        return {
          description: copy?.description[language],
          href: `/proizvodi?${genderQuery}collection=${collection.slug}`,
          label: copy?.label[language] ?? collection.name,
          slug: collection.slug,
        };
      });
    };

    return {
      /** Resolves a nav link into the rows/columns its dropdown should render. */
      resolve(link: NavLinkItem) {
        if (link.menu === "categories") {
          return {
            columns: categoryColumns(link.gender),
            entries: [] as NavMenuEntry[],
            kind: "categories" as const,
          };
        }

        return {
          columns: [] as NavMenuColumn[],
          entries: collectionEntries(link.gender),
          kind: "collections" as const,
        };
      },
    };
  }, [categories, collections, language]);
}
