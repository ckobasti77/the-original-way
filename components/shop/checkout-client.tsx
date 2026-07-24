"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";

import { useSettings } from "@/components/settings-provider";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { localizeHref } from "@/lib/storefront-i18n";
import { formatShopPrice } from "@/lib/shop-taxonomy";

import { type CartItem, useCart } from "./cart-provider";

type CheckoutValues = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  postalCode: string;
  street: string;
  houseNumber: string;
  addressLine2: string;
  deliveryNote: string;
};

const EMPTY_VALUES: CheckoutValues = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  city: "",
  postalCode: "",
  street: "",
  houseNumber: "",
  addressLine2: "",
  deliveryNote: "",
};

const LABELS = {
  sr: {
    empty: "Korpa je prazna",
    emptyText: "Dodajte proizvod iz kataloga da biste nastavili kupovinu.",
    delivery: "Podaci za dostavu",
    title: "Brza porudžbina",
    signed: "Podaci su učitani sa vašeg profila.",
    guest: "Kupujete kao gost. Nalog nije obavezan.",
    firstName: "Ime",
    lastName: "Prezime",
    email: "Email",
    phone: "Telefon",
    city: "Grad",
    postalCode: "Poštanski broj",
    street: "Ulica",
    houseNumber: "Broj",
    addressLine2: "Sprat / stan (opciono)",
    deliveryNote: "Napomena dostavljaču (opciono)",
    save: "Sačuvaj za sledeću kupovinu",
    submit: "Potvrdi porudžbinu",
    submitting: "Šaljemo porudžbinu...",
    summary: "Pregled korpe",
    total: "Ukupno",
    error: "Porudžbina trenutno ne može da se pošalje.",
    success: "Porudžbina je uspešno poslata.",
  },
  en: {
    empty: "Your cart is empty",
    emptyText: "Add a product from the catalog to continue.",
    delivery: "Delivery details",
    title: "Quick order",
    signed: "Details loaded from your profile.",
    guest: "Checking out as a guest. An account is optional.",
    firstName: "First name",
    lastName: "Last name",
    email: "Email",
    phone: "Phone",
    city: "City",
    postalCode: "Postal code",
    street: "Street",
    houseNumber: "Number",
    addressLine2: "Floor / apartment (optional)",
    deliveryNote: "Courier note (optional)",
    save: "Save for my next order",
    submit: "Confirm order",
    submitting: "Sending order...",
    summary: "Order summary",
    total: "Total",
    error: "The order could not be sent right now.",
    success: "Your order has been sent.",
  },
} as const;

function hasDemoItems(items: CartItem[]) {
  return items.some((item) => item.productId.startsWith("demo-"));
}

export function CheckoutClient({ convexEnabled }: { convexEnabled: boolean }) {
  const { language } = useSettings();
  const copy = LABELS[language];
  const { items, subtotal, clearCart } = useCart();
  const user = useQuery(api.auth.me);
  const createOrder = useMutation(api.orders.createStorefront);
  const [values, setValues] = useState(EMPTY_VALUES);
  const [saveToProfile, setSaveToProfile] = useState(true);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const prefilledUser = useRef<string | null>(null);

  useEffect(() => {
    if (!user || prefilledUser.current === user._id) return;
    prefilledUser.current = user._id;
    setValues((current) => ({
      firstName: current.firstName || user.firstName || "",
      lastName: current.lastName || user.lastName || "",
      email: current.email || user.email || "",
      phone: current.phone || user.phone || "",
      city: current.city || user.city || "",
      postalCode: current.postalCode || user.postalCode || "",
      street: current.street || user.street || "",
      houseNumber: current.houseNumber || user.houseNumber || "",
      addressLine2: current.addressLine2 || user.addressLine2 || "",
      deliveryNote: current.deliveryNote || user.deliveryNote || "",
    }));
  }, [user]);

  const setField = (field: keyof CheckoutValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  if (items.length === 0 && status !== "success") {
    return (
      <div className="premium-panel grid min-h-[28rem] place-items-center p-8 text-center">
        <div>
          <p className="font-display text-5xl font-semibold">{copy.empty}</p>
          <p className="mt-4 text-[var(--text-secondary)]">{copy.emptyText}</p>
          <Link className="store-button-primary mt-7" href={localizeHref("/proizvodi", language)}>
            {language === "sr" ? "Nazad u katalog" : "Back to catalog"}
          </Link>
        </div>
      </div>
    );
  }

  const isDemo = !convexEnabled || hasDemoItems(items);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start">
      <form
        className="premium-panel p-5 md:p-8"
        onSubmit={async (event) => {
          event.preventDefault();
          setStatus("submitting");
          setMessage("");
          try {
            let orderNumber = "DEMO";
            if (!isDemo) {
              const result = await createOrder({
                ...Object.fromEntries(
                  Object.entries(values).map(([key, value]) => [key, value.trim() || undefined]),
                ),
                firstName: values.firstName.trim(),
                lastName: values.lastName.trim(),
                email: values.email.trim(),
                phone: values.phone.trim(),
                city: values.city.trim(),
                postalCode: values.postalCode.trim(),
                street: values.street.trim(),
                houseNumber: values.houseNumber.trim(),
                saveToProfile: Boolean(user) && saveToProfile,
                items: items.map((item) => ({
                  productId: item.productId as Id<"products">,
                  size: item.size,
                  quantity: item.quantity,
                })),
              });
              orderNumber = result.orderNumber;
            }
            clearCart();
            setStatus("success");
            setMessage(`${copy.success} ${orderNumber}`);
          } catch (error) {
            setStatus("error");
            setMessage(error instanceof Error ? error.message : copy.error);
          }
        }}
      >
        <p className="store-eyebrow">{copy.delivery}</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
          <h2 className="font-display text-4xl">{copy.title}</h2>
          <span className="text-xs font-semibold text-[var(--text-muted)]">
            {user ? copy.signed : copy.guest}
          </span>
        </div>

        <div className="mt-7 grid gap-4 sm:grid-cols-2">
          {(Object.keys(values) as (keyof CheckoutValues)[]).map((field) => {
            const optional = field === "addressLine2" || field === "deliveryNote";
            const wide = field === "email" || field === "street" || optional;
            return (
              <label key={field} className={`store-field ${wide ? "sm:col-span-2" : ""}`}>
                <span>{copy[field]}</span>
                {field === "deliveryNote" ? (
                  <textarea
                    value={values[field]}
                    onChange={(event) => setField(field, event.target.value)}
                    className="store-input min-h-24 resize-y"
                  />
                ) : (
                  <input
                    required={!optional}
                    type={field === "email" ? "email" : field === "phone" ? "tel" : "text"}
                    autoComplete={{
                      firstName: "given-name",
                      lastName: "family-name",
                      email: "email",
                      phone: "tel",
                      city: "address-level2",
                      postalCode: "postal-code",
                      street: "address-line1",
                      houseNumber: "address-line2",
                      addressLine2: "address-line3",
                      deliveryNote: "off",
                    }[field]}
                    value={values[field]}
                    onChange={(event) => setField(field, event.target.value)}
                    className="store-input"
                  />
                )}
              </label>
            );
          })}
        </div>

        {user ? (
          <label className="mt-5 flex cursor-pointer items-center gap-3 text-sm font-semibold">
            <input
              type="checkbox"
              checked={saveToProfile}
              onChange={(event) => setSaveToProfile(event.target.checked)}
              className="h-4 w-4 accent-[var(--accent)]"
            />
            {copy.save}
          </label>
        ) : null}

        {message ? (
          <p className={`mt-5 rounded-xl border p-4 text-sm font-semibold ${status === "error" ? "border-red-500/30 text-red-700 dark:text-red-300" : "border-[var(--accent)]/30 text-[var(--text-primary)]"}`}>
            {message}
          </p>
        ) : null}

        <button className="store-button-primary mt-6 w-full" disabled={status === "submitting"} type="submit">
          {status === "submitting" ? copy.submitting : copy.submit}
        </button>
      </form>

      <aside className="premium-panel p-5 lg:sticky lg:top-24">
        <p className="store-eyebrow">{copy.summary}</p>
        <div className="mt-5 grid gap-4">
          {items.map((item) => (
            <article key={item.lineId} className="grid grid-cols-[4.5rem_1fr] gap-3">
              <div className="aspect-[4/5] overflow-hidden rounded-xl bg-[var(--surface-soft)]">
                {item.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
                ) : null}
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold">{item.name}</p>
                <p className="mt-1 text-xs text-[var(--text-muted)]">{item.size} · ×{item.quantity}</p>
                <p className="mt-2 text-sm font-bold">{formatShopPrice(item.price * item.quantity)}</p>
              </div>
            </article>
          ))}
        </div>
        <div className="mt-6 flex items-center justify-between border-t border-[var(--border-soft)] pt-5">
          <span className="text-sm font-semibold text-[var(--text-muted)]">{copy.total}</span>
          <span className="font-display text-3xl">{formatShopPrice(subtotal)}</span>
        </div>
      </aside>
    </div>
  );
}
