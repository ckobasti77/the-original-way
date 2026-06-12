"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

import { defaultProductCategories, productTypes } from "../_lib/constants";
import type { ProductType } from "../_lib/types";
import {
  buttonClass,
  ConvexSetupNotice,
  EmptyState,
  fieldClass,
  FieldLabel,
  LoadingBlock,
  secondaryButtonClass,
  SectionHeader,
} from "../_components/admin-ui";

type CategoryRecord = {
  _id: Id<"categories">;
  name: string;
  slug: string;
  type: ProductType;
  sortOrder: number;
};

type CategoryForm = {
  id?: Id<"categories">;
  name: string;
  slug: string;
  type: ProductType;
  sortOrder: string;
};

const emptyForm: CategoryForm = {
  name: "",
  slug: "",
  type: "clothing",
  sortOrder: "10",
};

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function CategoriesClient({
  convexEnabled,
}: {
  convexEnabled: boolean;
}) {
  if (!convexEnabled) {
    return (
      <div className="space-y-5">
        <SectionHeader
          eyebrow="Kategorije"
          title="Kategorije za odecu i obucu"
          description="Kategorije se cuvaju u Convex bazi i koriste se u formi proizvoda i javnim filterima."
        />
        <ConvexSetupNotice />
      </div>
    );
  }

  return <CategoriesConvex />;
}

function CategoriesConvex() {
  const categories = useQuery(api.categories.list, {}) as
    | CategoryRecord[]
    | undefined;
  const ensureDefaults = useMutation(api.categories.ensureDefaults);
  const upsertCategory = useMutation(api.categories.upsert);
  const removeCategory = useMutation(api.categories.remove);
  const [form, setForm] = useState<CategoryForm>(emptyForm);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (categories && categories.length === 0) {
      void ensureDefaults({});
    }
  }, [categories, ensureDefaults]);

  const groupedCategories = useMemo(() => {
    const safeCategories = categories ?? [];
    return {
      clothing: safeCategories.filter((category) => category.type === "clothing"),
      footwear: safeCategories.filter((category) => category.type === "footwear"),
    };
  }, [categories]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const sortOrder = Number(form.sortOrder);
    const slug = form.slug.trim() || slugify(form.name);

    if (!form.name.trim() || !slug || !Number.isFinite(sortOrder)) {
      setMessage("Naziv, slug i redosled su obavezni.");
      return;
    }

    await upsertCategory({
      id: form.id,
      name: form.name.trim(),
      slug,
      type: form.type,
      sortOrder,
    });

    setForm(emptyForm);
    setMessage(form.id ? "Kategorija je izmenjena." : "Kategorija je dodata.");
  }

  function editCategory(category: CategoryRecord) {
    setForm({
      id: category._id,
      name: category.name,
      slug: category.slug,
      type: category.type,
      sortOrder: String(category.sortOrder),
    });
    setMessage("");
  }

  function renderGroup(title: string, subtitle: string, records: CategoryRecord[]) {
    return (
      <section className="rounded-lg border border-black/10 bg-white p-4">
        <div className="flex items-start justify-between gap-3 border-b border-black/[0.07] pb-3">
          <div>
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="mt-1 text-sm text-black/50">{subtitle}</p>
          </div>
          <span className="rounded-md bg-[#edf2ed] px-2.5 py-1 text-xs font-bold text-[#276c56]">
            {records.length}
          </span>
        </div>

        <div className="mt-4 grid gap-2">
          {records.map((category) => (
            <article
              key={category._id}
              className="grid gap-3 rounded-md border border-black/10 bg-[#f8f9f4] p-3 sm:grid-cols-[1fr_auto] sm:items-center"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">{category.name}</p>
                  <span className="rounded bg-white px-1.5 py-0.5 font-mono text-[11px] font-bold text-black/45">
                    {category.slug}
                  </span>
                </div>
                <p className="mt-1 text-xs text-black/45">
                  Redosled: {category.sortOrder}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => editCategory(category)}
                  className={secondaryButtonClass}
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => void removeCategory({ id: category._id })}
                  className="rounded-md border border-[#b33a2d]/25 px-4 py-2 text-sm font-bold text-[#9d3026] hover:bg-[#fff0ed]"
                >
                  Obrisi
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Kategorije"
        title="Kategorije za odecu i obucu"
        description="Ove kategorije se pojavljuju u proizvodima, javnom katalogu, filterima i navbar pretrazi."
      />

      <div className="grid gap-5 xl:grid-cols-[28rem_minmax(0,1fr)]">
        <form
          onSubmit={handleSubmit}
          className="rounded-lg border border-black/10 bg-white p-4"
        >
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">
              {form.id ? "Izmeni kategoriju" : "Nova kategorija"}
            </h2>
            {form.id ? (
              <button
                type="button"
                onClick={() => setForm(emptyForm)}
                className={secondaryButtonClass}
              >
                Otkazi
              </button>
            ) : null}
          </div>

          <div className="mt-4 grid gap-3">
            <FieldLabel label="Naziv">
              <input
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    name: event.target.value,
                    slug: current.slug ? current.slug : slugify(event.target.value),
                  }))
                }
                className={fieldClass}
                placeholder="Naziv kategorije"
              />
            </FieldLabel>

            <div className="grid gap-3 sm:grid-cols-2">
              <FieldLabel label="Tip">
                <select
                  value={form.type}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      type: event.target.value as ProductType,
                    }))
                  }
                  className={fieldClass}
                >
                  {productTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </FieldLabel>

              <FieldLabel label="Redosled">
                <input
                  value={form.sortOrder}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      sortOrder: event.target.value,
                    }))
                  }
                  inputMode="numeric"
                  className={fieldClass}
                  placeholder="10"
                />
              </FieldLabel>
            </div>

            <FieldLabel label="Slug">
              <input
                value={form.slug}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    slug: slugify(event.target.value),
                  }))
                }
                className={fieldClass}
                placeholder="majice"
              />
            </FieldLabel>

            <div className="rounded-lg border border-black/10 bg-[#f7f8f4] p-3 text-xs leading-5 text-black/55">
              Default set ima {defaultProductCategories.length} kategorija: odeca i
              obuca su razdvojeni, a proizvod bira samo kategorije svog tipa.
            </div>

            {message ? <p className="text-sm font-bold text-[#276c56]">{message}</p> : null}

            <button className={buttonClass}>
              {form.id ? "Sacuvaj kategoriju" : "Dodaj kategoriju"}
            </button>
            <button
              type="button"
              onClick={() => {
                void ensureDefaults({}).then((created) => {
                  setMessage(
                    created
                      ? `Dodato je ${created} default kategorija.`
                      : "Default kategorije su vec sinhronizovane.",
                  );
                });
              }}
              className={secondaryButtonClass}
            >
              Sinhronizuj default kategorije
            </button>
          </div>
        </form>

        <div className="space-y-4">
          {categories === undefined ? <LoadingBlock /> : null}
          {categories?.length === 0 ? (
            <EmptyState text="Kategorije se pripremaju u Convex bazi." />
          ) : null}
          {categories ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {renderGroup(
                "Kategorije za odecu",
                "Majice, jakne, duksevi, trenerke i slicno.",
                groupedCategories.clothing,
              )}
              {renderGroup(
                "Kategorije za obucu",
                "Patike, duboke patike, cipele i papuce.",
                groupedCategories.footwear,
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
