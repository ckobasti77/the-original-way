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

type BrandRecord = {
  _id: Id<"brands">;
  name: string;
  logoStorageId?: Id<"_storage">;
  externalLogoUrl?: string;
  logoUrl: string;
};

type BrandForm = {
  id?: Id<"brands">;
  name: string;
  logoStorageId?: Id<"_storage">;
  externalLogoUrl: string;
};

const emptyForm: BrandForm = {
  name: "",
  externalLogoUrl: "",
};

export function BrandsClient({
  convexEnabled,
}: {
  convexEnabled: boolean;
}) {
  if (!convexEnabled) {
    return (
      <div className="space-y-5">
        <SectionHeader
          eyebrow="Brendovi"
          title="Brendovi i logotipi"
          description="Brendovi se čuvaju u Convex bazi podataka."
        />
        <ConvexSetupNotice />
      </div>
    );
  }

  return <BrandsConvex />;
}

function BrandsConvex() {
  const brands = useQuery(api.brands.list) as BrandRecord[] | undefined;
  const upsertBrand = useMutation(api.brands.upsert);
  const removeBrand = useMutation(api.brands.remove);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [form, setForm] = useState<BrandForm>(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  async function uploadLogo(file: File) {
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
        throw new Error("Upload logotipa nije uspeo.");
      }

      const { storageId } = (await response.json()) as {
        storageId: Id<"_storage">;
      };

      setForm((current) => ({
        ...current,
        logoStorageId: storageId,
      }));
      setMessage("Logo brenda je uploadovan.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Upload nije uspeo.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.name.trim()) {
      setMessage("Naziv brenda je obavezan.");
      return;
    }

    await upsertBrand({
      id: form.id,
      name: form.name.trim(),
      logoStorageId: form.logoStorageId,
      externalLogoUrl: form.externalLogoUrl.trim() || undefined,
    });

    setForm(emptyForm);
    setMessage(form.id ? "Brend je izmenjen." : "Brend je dodat.");
  }

  function editBrand(brand: BrandRecord) {
    setForm({
      id: brand._id,
      name: brand.name,
      logoStorageId: brand.logoStorageId,
      externalLogoUrl: brand.externalLogoUrl ?? "",
    });
    setMessage("");
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Brendovi"
        title="Brendovi i logotipi"
        description="Napravi novi brend, dodaj logo (upload ili eksterni URL) kako bi mogao da se bira u proizvodima."
      />

      <div className="grid gap-5 xl:grid-cols-[28rem_minmax(0,1fr)]">
        <form
          onSubmit={handleSubmit}
          className="rounded-lg border border-black/10 bg-white p-4"
        >
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">
              {form.id ? "Izmeni brend" : "Novi brend"}
            </h2>
            {form.id ? (
              <button
                type="button"
                onClick={() => setForm(emptyForm)}
                className={secondaryButtonClass}
              >
                Otkaži
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
                placeholder="Naziv brenda"
              />
            </FieldLabel>

            <div>
              <p className="mb-2 text-sm font-bold text-black/70">Logo</p>
              <div
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  const file = event.dataTransfer.files[0];
                  if (file) {
                    void uploadLogo(file);
                  }
                }}
                className="rounded-lg border border-dashed border-black/20 bg-[#f7f8f4] p-4 text-center"
              >
                <p className="text-sm font-bold">Prevuci logo ovde</p>
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
                      void uploadLogo(file);
                    }
                  }}
                />
                <p className="mt-3 text-xs font-bold text-[#276c56]">
                  {form.logoStorageId ? "Logo je spreman." : "Nema logotipa."}
                </p>
              </div>
            </div>

            <FieldLabel label="Eksterni URL za logo (opciono)">
              <input
                value={form.externalLogoUrl}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    externalLogoUrl: event.target.value,
                  }))
                }
                className={fieldClass}
                placeholder="https://..."
              />
            </FieldLabel>

            {message ? <p className="text-sm font-bold text-[#276c56]">{message}</p> : null}

            <button className={buttonClass}>
              {form.id ? "Sačuvaj brend" : "Dodaj brend"}
            </button>
          </div>
        </form>

        <div className="space-y-3">
          {brands === undefined ? <LoadingBlock /> : null}
          {brands?.length === 0 ? (
            <EmptyState text="Još nema brendova u Convex bazi." />
          ) : null}
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {brands?.map((brand) => {
              return (
                <article
                  key={brand._id}
                  className="rounded-lg border border-black/10 bg-white p-4 flex flex-col justify-between animate-fade-in"
                >
                  <div className="flex flex-col items-center gap-3 text-center">
                    {brand.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={brand.logoUrl}
                        alt={brand.name}
                        className="h-16 w-16 shrink-0 rounded-md border border-black/10 object-contain p-1 bg-white"
                      />
                    ) : (
                      <div className="grid h-16 w-16 shrink-0 place-items-center rounded-md border border-black/10 bg-[#eef0eb] text-xs font-bold text-black/45">
                        LOGO
                      </div>
                    )}
                    <h3 className="text-lg font-semibold truncate w-full">
                      {brand.name}
                    </h3>
                  </div>

                  <div className="mt-4 flex gap-2 w-full justify-center">
                    <button
                      type="button"
                      onClick={() => editBrand(brand)}
                      className={`${secondaryButtonClass} w-full`}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => void removeBrand({ id: brand._id })}
                      className="w-full rounded-md border border-[#b33a2d]/25 px-4 py-2 text-sm font-bold text-[#9d3026] hover:bg-[#fff0ed]"
                    >
                      Obriši
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
