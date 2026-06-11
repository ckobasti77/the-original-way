"use client";

import { FormEvent, useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

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

type ProductRecord = {
  _id: Id<"products">;
  name: string;
  type: "clothing" | "footwear";
};

type CollectionRecord = {
  _id: Id<"collections">;
  name: string;
  imageStorageId?: Id<"_storage">;
  externalImageUrl?: string;
  imageUrl: string;
  productIds: Id<"products">[];
};

type CollectionForm = {
  id?: Id<"collections">;
  name: string;
  imageStorageId?: Id<"_storage">;
  externalImageUrl: string;
  productIds: Id<"products">[];
};

const emptyForm: CollectionForm = {
  name: "",
  externalImageUrl: "",
  productIds: [],
};

export function CollectionsClient({
  convexEnabled,
}: {
  convexEnabled: boolean;
}) {
  if (!convexEnabled) {
    return (
      <div className="space-y-5">
        <SectionHeader
          eyebrow="Kolekcije"
          title="Kolekcije i povezani proizvodi"
          description="Kolekcije se cuvaju u Convex bazi i povezuju sa proizvodima."
        />
        <ConvexSetupNotice />
      </div>
    );
  }

  return <CollectionsConvex />;
}

function CollectionsConvex() {
  const products = useQuery(api.products.list) as ProductRecord[] | undefined;
  const collections = useQuery(api.collections.list) as
    | CollectionRecord[]
    | undefined;
  const upsertCollection = useMutation(api.collections.upsert);
  const removeCollection = useMutation(api.collections.remove);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [form, setForm] = useState<CollectionForm>(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  async function uploadImage(file: File) {
    if (!file.type.startsWith("image/")) {
      return;
    }

    setUploading(true);
    setMessage("");

    try {
      const uploadUrl = await generateUploadUrl({});
      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });

      if (!response.ok) {
        throw new Error("Upload slike nije uspeo.");
      }

      const { storageId } = (await response.json()) as {
        storageId: Id<"_storage">;
      };

      setForm((current) => ({
        ...current,
        imageStorageId: storageId,
      }));
      setMessage("Slika kolekcije je uploadovana.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Upload nije uspeo.");
    } finally {
      setUploading(false);
    }
  }

  function toggleProduct(productId: Id<"products">) {
    setForm((current) => ({
      ...current,
      productIds: current.productIds.includes(productId)
        ? current.productIds.filter((id) => id !== productId)
        : [...current.productIds, productId],
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.name.trim()) {
      setMessage("Naziv kolekcije je obavezan.");
      return;
    }

    await upsertCollection({
      id: form.id,
      name: form.name.trim(),
      imageStorageId: form.imageStorageId,
      externalImageUrl: form.externalImageUrl.trim() || undefined,
      productIds: form.productIds,
    });

    setForm(emptyForm);
    setMessage(form.id ? "Kolekcija je izmenjena." : "Kolekcija je dodata.");
  }

  function editCollection(collection: CollectionRecord) {
    setForm({
      id: collection._id,
      name: collection.name,
      imageStorageId: collection.imageStorageId,
      externalImageUrl: collection.externalImageUrl ?? "",
      productIds: collection.productIds,
    });
    setMessage("");
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Kolekcije"
        title="Kolekcije i povezani proizvodi"
        description="Napravi novu kolekciju, dodaj sliku i povezi proizvode sa njom."
      />

      <div className="grid gap-5 xl:grid-cols-[28rem_minmax(0,1fr)]">
        <form
          onSubmit={handleSubmit}
          className="rounded-lg border border-black/10 bg-white p-4"
        >
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">
              {form.id ? "Izmeni kolekciju" : "Nova kolekcija"}
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
                  setForm((current) => ({ ...current, name: event.target.value }))
                }
                className={fieldClass}
                placeholder="Naziv kolekcije"
              />
            </FieldLabel>

            <div>
              <p className="mb-2 text-sm font-bold text-black/70">Slika</p>
              <div
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  const file = event.dataTransfer.files[0];
                  if (file) {
                    void uploadImage(file);
                  }
                }}
                className="rounded-lg border border-dashed border-black/20 bg-[#f7f8f4] p-4 text-center"
              >
                <p className="text-sm font-bold">Prevuci sliku ovde</p>
                <p className="mt-1 text-xs text-black/50">
                  ili klikni za upload
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className={`${secondaryButtonClass} mt-3`}
                >
                  {uploading ? "Upload..." : "Izaberi sliku"}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) {
                      void uploadImage(file);
                    }
                  }}
                />
                <p className="mt-3 text-xs font-bold text-[#276c56]">
                  {form.imageStorageId ? "Slika je spremna." : "Nema slike."}
                </p>
              </div>
            </div>

            <FieldLabel label="Eksterni image URL (opciono)">
              <input
                value={form.externalImageUrl}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    externalImageUrl: event.target.value,
                  }))
                }
                className={fieldClass}
                placeholder="https://..."
              />
            </FieldLabel>

            <div>
              <p className="mb-2 text-sm font-bold text-black/70">Proizvodi</p>
              <div className="grid max-h-60 gap-2 overflow-y-auto rounded-lg border border-black/10 bg-[#f7f8f4] p-3">
                {products === undefined ? <p>Ucitavanje proizvoda...</p> : null}
                {products?.length === 0 ? (
                  <p className="text-sm text-black/55">Prvo dodaj proizvode.</p>
                ) : null}
                {products?.map((product) => (
                  <label
                    key={product._id}
                    className={`flex cursor-pointer items-center justify-between gap-3 rounded-md border px-3 py-2.5 text-sm transition-all select-none active:scale-[0.99] ${
                      form.productIds.includes(product._id)
                        ? "border-[#276c56] bg-[#e7f4ee] text-[#1f5946] shadow-xs"
                        : "border-black/10 bg-white text-black/70 hover:border-black/20"
                    }`}
                  >
                    <span>
                      <span className="font-bold">{product.name}</span>
                      <span className={`ml-2 text-xs font-semibold px-1.5 py-0.5 rounded ${
                        form.productIds.includes(product._id) ? "bg-[#1f5946]/10 text-[#1f5946]" : "bg-black/5 text-black/50"
                      }`}>
                        {product.type === "clothing" ? "Odeca" : "Obuca"}
                      </span>
                    </span>
                    <input
                      type="checkbox"
                      checked={form.productIds.includes(product._id)}
                      onChange={() => toggleProduct(product._id)}
                      className="h-4 w-4 accent-[#276c56] cursor-pointer"
                    />
                  </label>
                ))}
              </div>
            </div>

            {message ? <p className="text-sm font-bold text-[#276c56]">{message}</p> : null}

            <button className={buttonClass}>
              {form.id ? "Sacuvaj kolekciju" : "Dodaj kolekciju"}
            </button>
          </div>
        </form>

        <div className="space-y-3">
          {collections === undefined ? <LoadingBlock /> : null}
          {collections?.length === 0 ? (
            <EmptyState text="Jos nema kolekcija u Convex bazi." />
          ) : null}
          <div className="grid gap-4 sm:grid-cols-2">
            {collections?.map((collection) => {
              const linkedProducts =
                products?.filter((product) =>
                  collection.productIds.includes(product._id),
                ) ?? [];

              return (
                <article
                  key={collection._id}
                  className="rounded-lg border border-black/10 bg-white p-4"
                >
                  <div className="flex gap-3">
                    {collection.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={collection.imageUrl}
                        alt=""
                        className="h-16 w-16 shrink-0 rounded-md border border-black/10 object-cover"
                      />
                    ) : (
                      <div className="grid h-16 w-16 shrink-0 place-items-center rounded-md border border-black/10 bg-[#eef0eb] text-xs font-bold text-black/45">
                        IMG
                      </div>
                    )}
                    <div className="min-w-0">
                      <h3 className="truncate text-lg font-semibold">
                        {collection.name}
                      </h3>
                      <p className="mt-1 text-sm text-black/55">
                        {linkedProducts.length} povezana proizvoda
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {linkedProducts.map((product) => (
                      <span
                        key={product._id}
                        className="rounded-md bg-[#edf2ed] px-2 py-1 text-xs font-bold text-[#276c56]"
                      >
                        {product.name}
                      </span>
                    ))}
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => editCollection(collection)}
                      className={secondaryButtonClass}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => void removeCollection({ id: collection._id })}
                      className="rounded-md border border-[#b33a2d]/25 px-4 py-2 text-sm font-bold text-[#9d3026] hover:bg-[#fff0ed]"
                    >
                      Obrisi
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
