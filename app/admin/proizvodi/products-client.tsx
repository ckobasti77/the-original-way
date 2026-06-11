"use client";

import { FormEvent, useMemo, useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

import {
  clothingSizes,
  nikeShoeSizesEu,
  productGenders,
  productTypes,
} from "../_lib/constants";
import type { ProductGender, ProductType } from "../_lib/types";
import {
  buttonClass,
  ConvexSetupNotice,
  EmptyState,
  fieldClass,
  FieldLabel,
  formatCurrency,
  LoadingBlock,
  secondaryButtonClass,
  SectionHeader,
} from "../_components/admin-ui";

type ProductRecord = {
  _id: Id<"products">;
  name: string;
  description: string;
  type: ProductType;
  gender: ProductGender;
  costPrice: number;
  salePrice: number;
  sizes: string[];
  imageStorageIds: Id<"_storage">[];
  externalImageUrls: string[];
  imageUrls: string[];
  brandId?: Id<"brands">;
  brand?: { _id: Id<"brands">; name: string } | null;
};

type ProductForm = {
  id?: Id<"products">;
  name: string;
  description: string;
  type: ProductType;
  gender: ProductGender;
  costPrice: string;
  salePrice: string;
  sizes: string[];
  imageStorageIds: Id<"_storage">[];
  externalImageUrls: string;
  brandId?: Id<"brands">;
};

const emptyForm: ProductForm = {
  name: "",
  description: "",
  type: "clothing",
  gender: "men",
  costPrice: "",
  salePrice: "",
  sizes: [],
  imageStorageIds: [],
  externalImageUrls: "",
  brandId: undefined,
};

export function ProductsClient({ convexEnabled }: { convexEnabled: boolean }) {
  if (!convexEnabled) {
    return (
      <div className="space-y-5">
        <SectionHeader
          eyebrow="Proizvodi"
          title="Dodavanje, editovanje i brisanje"
          description="Ova stranica koristi Convex za katalog i Convex Storage za slike."
        />
        <ConvexSetupNotice />
      </div>
    );
  }

  return <ProductsConvex />;
}

function ProductsConvex() {
  const products = useQuery(api.products.list) as ProductRecord[] | undefined;
  const brands = useQuery(api.brands.list);
  const upsertProduct = useMutation(api.products.upsert);
  const removeProduct = useMutation(api.products.remove);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const availableSizes = useMemo(
    () => (form.type === "clothing" ? clothingSizes : nikeShoeSizesEu),
    [form.type],
  );

  async function uploadFiles(files: FileList | File[]) {
    const imageFiles = Array.from(files).filter((file) =>
      file.type.startsWith("image/"),
    );

    if (imageFiles.length === 0) {
      return;
    }

    setUploading(true);
    setMessage("");

    try {
      const uploadedIds: Id<"_storage">[] = [];

      for (const file of imageFiles) {
        const uploadUrl = await generateUploadUrl({});
        const response = await fetch(uploadUrl, {
          method: "POST",
          headers: {
            "Content-Type": file.type,
          },
          body: file,
        });

        if (!response.ok) {
          throw new Error(`Upload failed for ${file.name}`);
        }

        const { storageId } = (await response.json()) as {
          storageId: Id<"_storage">;
        };
        uploadedIds.push(storageId);
      }

      setForm((current) => ({
        ...current,
        imageStorageIds: [...current.imageStorageIds, ...uploadedIds],
      }));
      setMessage(`${uploadedIds.length} slika je uploadovana.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Upload nije uspeo.");
    } finally {
      setUploading(false);
    }
  }

  function toggleSize(size: string) {
    setForm((current) => ({
      ...current,
      sizes: current.sizes.includes(size)
        ? current.sizes.filter((selectedSize) => selectedSize !== size)
        : [...current.sizes, size],
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const costPrice = Number(form.costPrice);
    const salePrice = Number(form.salePrice);

    if (!form.name.trim() || !Number.isFinite(costPrice) || !Number.isFinite(salePrice)) {
      setMessage("Naziv, nabavna cena i prodajna cena su obavezni.");
      return;
    }

    await upsertProduct({
      id: form.id,
      name: form.name.trim(),
      description: form.description.trim(),
      type: form.type,
      gender: form.gender,
      costPrice,
      salePrice,
      sizes: form.sizes,
      imageStorageIds: form.imageStorageIds,
      externalImageUrls: form.externalImageUrls
        .split(",")
        .map((url) => url.trim())
        .filter(Boolean),
      brandId: form.brandId || undefined,
    });

    setForm(emptyForm);
    setMessage(form.id ? "Proizvod je izmenjen." : "Proizvod je dodat.");
  }

  function editProduct(product: ProductRecord) {
    setForm({
      id: product._id,
      name: product.name,
      description: product.description,
      type: product.type,
      gender: product.gender,
      costPrice: String(product.costPrice),
      salePrice: String(product.salePrice),
      sizes: product.sizes,
      imageStorageIds: product.imageStorageIds,
      externalImageUrls: product.externalImageUrls.join(", "),
      brandId: product.brandId,
    });
    setMessage("");
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Proizvodi"
        title="Dodavanje, editovanje i brisanje"
        description="Proizvod ima slike, naziv, opis, nabavnu cenu, prodajnu cenu, tip, pol i dostupne velicine."
      />

      <div className="grid gap-5 xl:grid-cols-[28rem_minmax(0,1fr)]">
        <form
          onSubmit={handleSubmit}
          className="rounded-lg border border-black/10 bg-white p-4"
        >
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">
              {form.id ? "Izmeni proizvod" : "Novi proizvod"}
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
                placeholder="Naziv proizvoda"
              />
            </FieldLabel>

            <FieldLabel label="Opis">
              <textarea
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                className={`${fieldClass} min-h-24 resize-y`}
                placeholder="Opis proizvoda"
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
                      sizes: [],
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

              <FieldLabel label="Pol">
                <select
                  value={form.gender}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      gender: event.target.value as ProductGender,
                    }))
                  }
                  className={fieldClass}
                >
                  {productGenders.map((gender) => (
                    <option key={gender.value} value={gender.value}>
                      {gender.label}
                    </option>
                  ))}
                </select>
              </FieldLabel>
            </div>

            <FieldLabel label="Brend (opciono)">
              <select
                value={form.brandId ?? ""}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    brandId: event.target.value ? (event.target.value as Id<"brands">) : undefined,
                  }))
                }
                className={fieldClass}
              >
                <option value="">Izaberi brend...</option>
                {brands?.map((brand) => (
                  <option key={brand._id} value={brand._id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </FieldLabel>

            <div className="grid gap-3 sm:grid-cols-2">
              <FieldLabel label="Nabavna cena">
                <input
                  value={form.costPrice}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      costPrice: event.target.value,
                    }))
                  }
                  inputMode="decimal"
                  className={fieldClass}
                  placeholder="4500"
                />
              </FieldLabel>
              <FieldLabel label="Prodajna cena">
                <input
                  value={form.salePrice}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      salePrice: event.target.value,
                    }))
                  }
                  inputMode="decimal"
                  className={fieldClass}
                  placeholder="8990"
                />
              </FieldLabel>
            </div>

            <div>
              <p className="mb-2 text-sm font-bold text-black/70">Slike</p>
              <div
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  void uploadFiles(event.dataTransfer.files);
                }}
                className="rounded-lg border border-dashed border-black/20 bg-[#f7f8f4] p-4 text-center"
              >
                <p className="text-sm font-bold">Prevuci slike ovde</p>
                <p className="mt-1 text-xs text-black/50">
                  ili klikni za klasicni upload
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className={`${secondaryButtonClass} mt-3`}
                >
                  {uploading ? "Upload..." : "Izaberi slike"}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  hidden
                  onChange={(event) => {
                    if (event.target.files) {
                      void uploadFiles(event.target.files);
                    }
                  }}
                />
                <p className="mt-3 text-xs font-bold text-[#276c56]">
                  Uploadovano: {form.imageStorageIds.length}
                </p>
              </div>
            </div>

            <FieldLabel label="Eksterni image URL-ovi (opciono, odvojeni zarezom)">
              <input
                value={form.externalImageUrls}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    externalImageUrls: event.target.value,
                  }))
                }
                className={fieldClass}
                placeholder="https://..."
              />
            </FieldLabel>

            <div>
              <p className="mb-2 text-sm font-bold text-black/70">Velicine</p>
              <div className="flex max-h-56 flex-wrap gap-2 overflow-y-auto rounded-lg border border-black/10 bg-[#f7f8f4] p-3 shadow-inner">
                {availableSizes.map((size) => (
                  <label
                    key={size}
                    className={`flex cursor-pointer items-center gap-2 rounded-md border px-3.5 py-2 text-sm font-bold transition-all select-none active:scale-95 ${
                      form.sizes.includes(size)
                        ? "border-[#276c56] bg-[#e7f4ee] text-[#1f5946] shadow-xs"
                        : "border-black/10 bg-white text-black/70 hover:border-black/20"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={form.sizes.includes(size)}
                      onChange={() => toggleSize(size)}
                      className="h-4 w-4 accent-[#276c56] cursor-pointer"
                    />
                    {size}
                  </label>
                ))}
              </div>
            </div>

            {message ? <p className="text-sm font-bold text-[#276c56]">{message}</p> : null}

            <button className={buttonClass}>
              {form.id ? "Sacuvaj izmene" : "Dodaj proizvod"}
            </button>
          </div>
        </form>

        <div className="space-y-3">
          {products === undefined ? <LoadingBlock /> : null}
          {products?.length === 0 ? (
            <EmptyState text="Jos nema proizvoda u Convex bazi." />
          ) : null}
          {products && products.length > 0 ? (
            <div className="space-y-4">
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-hidden rounded-lg border border-black/10 bg-white">
                <div className="overflow-x-auto">
                  <table className="min-w-[900px] w-full text-left text-sm">
                    <thead className="bg-[#f4f5f1] text-xs uppercase tracking-[0.12em] text-black/50">
                      <tr>
                        <th className="px-4 py-3">Proizvod</th>
                        <th className="px-4 py-3">Tip / pol</th>
                        <th className="px-4 py-3">Cene</th>
                        <th className="px-4 py-3">Velicine</th>
                        <th className="px-4 py-3">Slike</th>
                        <th className="px-4 py-3">Akcije</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product) => (
                        <tr key={product._id} className="border-t border-black/[0.08]">
                          <td className="px-4 py-4">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-semibold">{product.name}</p>
                              {product.brand ? (
                                <span className="rounded bg-[#e7f4ee] px-1.5 py-0.5 text-[10px] font-bold text-[#1f5946] uppercase tracking-wider">
                                  {product.brand.name}
                                </span>
                              ) : null}
                            </div>
                            <p className="mt-1 max-w-xs text-xs text-black/55">
                              {product.description}
                            </p>
                          </td>
                          <td className="px-4 py-4">
                            <p>{product.type === "clothing" ? "Odeca" : "Obuca"}</p>
                            <p className="text-xs text-black/50">
                              {
                                productGenders.find(
                                  (gender) => gender.value === product.gender,
                                )?.label
                              }
                            </p>
                          </td>
                          <td className="px-4 py-4">
                            <p>{formatCurrency(product.salePrice)}</p>
                            <p className="text-xs text-black/50">
                              Nabavna: {formatCurrency(product.costPrice)}
                            </p>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex max-w-xs flex-wrap gap-1">
                              {product.sizes.map((size) => (
                                <span
                                  key={size}
                                  className="rounded-md bg-[#edf2ed] px-2 py-1 text-xs font-bold text-[#276c56]"
                                >
                                  {size}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-4">{product.imageUrls.length}</td>
                          <td className="px-4 py-4">
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => editProduct(product)}
                                className={secondaryButtonClass}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => void removeProduct({ id: product._id })}
                                className="rounded-md border border-[#b33a2d]/25 px-4 py-2 text-sm font-bold text-[#9d3026] hover:bg-[#fff0ed]"
                              >
                                Obrisi
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile Cards View */}
              <div className="grid gap-4 sm:grid-cols-2 md:hidden">
                {products.map((product) => (
                  <div
                    key={product._id}
                    className="rounded-lg border border-black/10 bg-white p-4 shadow-xs flex flex-col justify-between gap-4"
                  >
                    <div>
                      {/* Product Name and Brand */}
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <h3 className="font-semibold text-base text-[#141816]">{product.name}</h3>
                        {product.brand ? (
                          <span className="rounded bg-[#e7f4ee] px-1.5 py-0.5 text-[10px] font-bold text-[#1f5946] uppercase tracking-wider">
                            {product.brand.name}
                          </span>
                        ) : null}
                      </div>

                      {/* Description */}
                      <p className="mt-1 text-xs text-black/55 line-clamp-2">
                        {product.description || "Nema opisa."}
                      </p>

                      {/* Type and Gender Info */}
                      <div className="mt-3 text-xs flex justify-between border-b border-black/[0.06] pb-2 text-black/60">
                        <span>Tip: <span className="font-semibold">{product.type === "clothing" ? "Odeca" : "Obuca"}</span></span>
                        <span>Pol: <span className="font-semibold">
                          {
                            productGenders.find(
                              (gender) => gender.value === product.gender,
                            )?.label
                          }
                        </span></span>
                      </div>

                      {/* Pricing */}
                      <div className="mt-2.5 grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <p className="text-black/45 uppercase text-[9px] font-bold tracking-wider">Nabavna cena</p>
                          <p className="font-bold mt-0.5">{formatCurrency(product.costPrice)}</p>
                        </div>
                        <div>
                          <p className="text-black/45 uppercase text-[9px] font-bold tracking-wider">Prodajna cena</p>
                          <p className="font-bold text-[#276c56] mt-0.5">{formatCurrency(product.salePrice)}</p>
                        </div>
                      </div>

                      {/* Sizes list */}
                      <div className="mt-3">
                        <p className="text-black/45 uppercase text-[9px] font-bold tracking-wider mb-1">Dostupne Velicine ({product.sizes.length})</p>
                        <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto p-1 bg-[#f7f8f4] rounded-md">
                          {product.sizes.length > 0 ? (
                            product.sizes.map((size) => (
                              <span
                                key={size}
                                className="rounded bg-white border border-black/10 px-1.5 py-0.5 text-[10px] font-bold text-[#276c56]"
                              >
                                {size}
                              </span>
                            ))
                          ) : (
                            <span className="text-[10px] text-black/45 italic">Nema unetih veličina</span>
                          )}
                        </div>
                      </div>

                      {/* Slike count */}
                      <div className="mt-3 text-xs text-black/45">
                        Slike: <strong>{product.imageUrls.length}</strong>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2 border-t border-black/[0.06] pt-3 mt-1">
                      <button
                        type="button"
                        onClick={() => editProduct(product)}
                        className={`${secondaryButtonClass} flex-1 text-center py-2`}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => void removeProduct({ id: product._id })}
                        className="rounded-md border border-[#b33a2d]/25 px-4 py-2 text-sm font-bold text-[#9d3026] hover:bg-[#fff0ed] flex-1 text-center"
                      >
                        Obrisi
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
