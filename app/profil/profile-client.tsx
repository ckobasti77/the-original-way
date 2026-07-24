"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";

import { logout } from "@/app/prijava/actions";
import { useSettings } from "@/components/settings-provider";
import { api } from "@/convex/_generated/api";
import { localizeHref } from "@/lib/storefront-i18n";

type ProfileValues = {
  firstName: string;
  lastName: string;
  phone: string;
  city: string;
  postalCode: string;
  street: string;
  houseNumber: string;
  addressLine2: string;
  deliveryNote: string;
};

const COPY = {
  sr: {
    signInTitle: "Prijavite se da otvorite profil.",
    signInText: "Sačuvajte kontakt i adresu za brže poručivanje.",
    signIn: "Prijava",
    eyebrow: "Moj nalog",
    title: "Profil i dostava",
    intro: "Vaši kurirski podaci ostaju spremni za sledeću porudžbinu.",
    accountEmail: "Email naloga",
    firstName: "Ime",
    lastName: "Prezime",
    phone: "Telefon",
    city: "Grad",
    postalCode: "Poštanski broj",
    street: "Ulica",
    houseNumber: "Broj",
    addressLine2: "Sprat / stan",
    deliveryNote: "Napomena dostavljaču",
    save: "Sačuvaj izmene",
    saving: "Čuvamo...",
    saved: "Izmene su sačuvane.",
    orders: "Istorija porudžbina",
    noOrders: "Još nema porudžbina.",
    logout: "Odjavi se",
  },
  en: {
    signInTitle: "Sign in to open your profile.",
    signInText: "Save your contact and address details for a faster checkout.",
    signIn: "Sign in",
    eyebrow: "My account",
    title: "Profile and delivery",
    intro: "Keep your courier details ready for the next order.",
    accountEmail: "Account email",
    firstName: "First name",
    lastName: "Last name",
    phone: "Phone",
    city: "City",
    postalCode: "Postal code",
    street: "Street",
    houseNumber: "Number",
    addressLine2: "Floor / apartment",
    deliveryNote: "Courier note",
    save: "Save changes",
    saving: "Saving...",
    saved: "Changes saved.",
    orders: "Order history",
    noOrders: "No orders yet.",
    logout: "Sign out",
  },
} as const;

const EMPTY: ProfileValues = {
  firstName: "",
  lastName: "",
  phone: "",
  city: "",
  postalCode: "",
  street: "",
  houseNumber: "",
  addressLine2: "",
  deliveryNote: "",
};

export function ProfileClient() {
  const { language } = useSettings();
  const copy = COPY[language];
  const { isAuthenticated, isLoading } = useConvexAuth();
  const user = useQuery(api.auth.me);
  const orders = useQuery(api.orders.mine);
  const updateProfile = useMutation(api.auth.updateMyProfile);
  const [values, setValues] = useState<ProfileValues>(EMPTY);
  const [loadedId, setLoadedId] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!user || loadedId === user._id) return;
    const frame = window.requestAnimationFrame(() => {
      setLoadedId(user._id);
      setValues({
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone ?? "",
        city: user.city ?? "",
        postalCode: user.postalCode ?? "",
        street: user.street ?? "",
        houseNumber: user.houseNumber ?? "",
        addressLine2: user.addressLine2 ?? "",
        deliveryNote: user.deliveryNote ?? "",
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [loadedId, user]);

  if (isLoading || user === undefined || orders === undefined) {
    return <div className="mx-auto min-h-[70vh] max-w-7xl animate-pulse rounded-[2rem] bg-[var(--surface-soft)]" />;
  }

  if (!isAuthenticated || !user) {
    return (
      <section className="premium-panel mx-auto grid min-h-[32rem] max-w-4xl place-items-center p-8 text-center">
        <div>
          <p className="store-eyebrow">{copy.eyebrow}</p>
          <h1 className="font-display mt-4 text-5xl md:text-7xl">{copy.signInTitle}</h1>
          <p className="mx-auto mt-5 max-w-xl text-[var(--text-secondary)]">{copy.signInText}</p>
          <Link
            className="store-button-primary mt-7"
            href={`${localizeHref("/prijava", language)}?next=${encodeURIComponent(localizeHref("/profil", language))}`}
          >
            {copy.signIn}
          </Link>
        </div>
      </section>
    );
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
      <form
        className="premium-panel p-5 md:p-8"
        onSubmit={async (event) => {
          event.preventDefault();
          setStatus("saving");
          setMessage("");
          try {
            await updateProfile({
              ...values,
              addressLine2: values.addressLine2.trim() || undefined,
              deliveryNote: values.deliveryNote.trim() || undefined,
            });
            setStatus("success");
            setMessage(copy.saved);
          } catch (error) {
            setStatus("error");
            setMessage(error instanceof Error ? error.message : "Unable to save.");
          }
        }}
      >
        <p className="store-eyebrow">{copy.eyebrow}</p>
        <h1 className="font-display mt-3 text-5xl md:text-7xl">{copy.title}</h1>
        <p className="mt-4 max-w-2xl text-[var(--text-secondary)]">{copy.intro}</p>

        <label className="store-field mt-8">
          <span>{copy.accountEmail}</span>
          <input className="store-input opacity-70" value={user.email} readOnly />
        </label>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {(Object.keys(values) as (keyof ProfileValues)[]).map((field) => {
            const optional = field === "addressLine2" || field === "deliveryNote";
            return (
              <label key={field} className={`store-field ${field === "deliveryNote" ? "sm:col-span-2" : ""}`}>
                <span>{copy[field]}</span>
                {field === "deliveryNote" ? (
                  <textarea className="store-input min-h-28" value={values[field]} onChange={(event) => setValues((current) => ({ ...current, [field]: event.target.value }))} />
                ) : (
                  <input required={!optional} className="store-input" value={values[field]} onChange={(event) => setValues((current) => ({ ...current, [field]: event.target.value }))} />
                )}
              </label>
            );
          })}
        </div>

        {message ? (
          <p className={`mt-5 rounded-xl border p-4 text-sm font-semibold ${status === "error" ? "border-red-500/30 text-red-700 dark:text-red-300" : "border-[var(--accent)]/30"}`}>
            {message}
          </p>
        ) : null}

        <button className="store-button-primary mt-6" type="submit" disabled={status === "saving"}>
          {status === "saving" ? copy.saving : copy.save}
        </button>
      </form>

      <aside className="grid gap-6 lg:self-start">
        <section className="premium-panel p-5">
          <p className="store-eyebrow">{copy.orders}</p>
          <div className="mt-5 grid gap-3">
            {orders.length ? orders.map((order) => (
              <article key={order._id} className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-soft)] p-4">
                <div className="flex items-center justify-between gap-3">
                  <strong>{order.orderNumber}</strong>
                  <span className="rounded-full border border-[var(--border-soft)] px-2 py-1 text-[0.65rem] uppercase tracking-wider">{order.status}</span>
                </div>
                <p className="mt-2 text-sm text-[var(--text-muted)]">
                  {new Intl.DateTimeFormat(language === "sr" ? "sr-RS" : "en-GB").format(order.createdAt)}
                </p>
                <p className="mt-2 font-semibold">{new Intl.NumberFormat(language === "sr" ? "sr-RS" : "en-GB", { style: "currency", currency: "RSD", maximumFractionDigits: 0 }).format(order.totalSale)}</p>
              </article>
            )) : <p className="text-sm text-[var(--text-muted)]">{copy.noOrders}</p>}
          </div>
        </section>

        <form action={logout}>
          <button type="submit" className="store-button-secondary w-full">{copy.logout}</button>
        </form>
      </aside>
    </div>
  );
}
