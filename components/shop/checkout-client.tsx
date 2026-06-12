"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation } from "convex/react";

import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { formatShopPrice } from "@/lib/shop-taxonomy";

import { type CartItem, useCart } from "./cart-provider";

type CheckoutValues = {
  city: string;
  email: string;
  firstName: string;
  houseNumber: string;
  lastName: string;
  street: string;
};

const emptyValues: CheckoutValues = {
  city: "",
  email: "",
  firstName: "",
  houseNumber: "",
  lastName: "",
  street: "",
};

function hasDemoItems(items: CartItem[]) {
  return items.some((item) => item.productId.startsWith("demo-"));
}

function CheckoutForm({
  backendLabel,
  items,
  onSubmit,
  subtotal,
}: {
  backendLabel: string;
  items: CartItem[];
  onSubmit: (values: CheckoutValues) => Promise<string>;
  subtotal: number;
}) {
  const { clearCart } = useCart();
  const [values, setValues] = useState<CheckoutValues>(emptyValues);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");

  const handleChange = (field: keyof CheckoutValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("submitting");
    setMessage("");

    try {
      const result = await onSubmit(values);
      clearCart();
      setValues(emptyValues);
      setStatus("success");
      setMessage(result);
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Porudzbina trenutno ne moze da se posalje.",
      );
    }
  };

  if (items.length === 0 && status !== "success") {
    return (
      <div className="grid min-h-[26rem] place-items-center rounded-lg border border-dashed border-[var(--border-soft)] bg-[var(--surface)] p-6 text-center">
        <div>
          <p className="font-display text-5xl font-semibold">Korpa je prazna</p>
          <p className="mt-3 text-sm font-semibold leading-6 text-[var(--text-muted)]">
            Dodaj proizvod iz kataloga da bi nastavio kupovinu.
          </p>
          <Link
            href="/proizvodi"
            className="tow-on-primary mt-6 inline-flex min-h-11 items-center justify-center rounded-md bg-[var(--text-primary)] px-5 text-sm font-bold uppercase tracking-[0.16em]"
          >
            Nazad u katalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
      <form
        onSubmit={handleSubmit}
        className="rounded-lg border border-[var(--border-soft)] bg-[var(--surface-strong)] p-4 shadow-[0_22px_70px_rgba(var(--shadow-rgb),0.12)] md:p-6"
      >
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--text-muted)]">
              Podaci za dostavu
            </p>
            <h2 className="mt-1 text-3xl font-semibold">Brza porudzbina</h2>
          </div>
          <span className="rounded-md border border-[var(--border-soft)] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">
            {backendLabel}
          </span>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-bold">
            Ime
            <input
              required
              value={values.firstName}
              onChange={(event) => handleChange("firstName", event.target.value)}
              className="min-h-12 rounded-md border border-[var(--border-soft)] bg-[var(--surface)] px-3 font-semibold outline-none focus:border-[var(--border-strong)]"
            />
          </label>
          <label className="grid gap-2 text-sm font-bold">
            Prezime
            <input
              required
              value={values.lastName}
              onChange={(event) => handleChange("lastName", event.target.value)}
              className="min-h-12 rounded-md border border-[var(--border-soft)] bg-[var(--surface)] px-3 font-semibold outline-none focus:border-[var(--border-strong)]"
            />
          </label>
          <label className="grid gap-2 text-sm font-bold sm:col-span-2">
            Email
            <input
              type="email"
              value={values.email}
              onChange={(event) => handleChange("email", event.target.value)}
              className="min-h-12 rounded-md border border-[var(--border-soft)] bg-[var(--surface)] px-3 font-semibold outline-none focus:border-[var(--border-strong)]"
              placeholder="ime@email.com"
            />
          </label>
          <label className="grid gap-2 text-sm font-bold">
            Grad
            <input
              required
              value={values.city}
              onChange={(event) => handleChange("city", event.target.value)}
              className="min-h-12 rounded-md border border-[var(--border-soft)] bg-[var(--surface)] px-3 font-semibold outline-none focus:border-[var(--border-strong)]"
            />
          </label>
          <label className="grid gap-2 text-sm font-bold">
            Broj
            <input
              required
              value={values.houseNumber}
              onChange={(event) => handleChange("houseNumber", event.target.value)}
              className="min-h-12 rounded-md border border-[var(--border-soft)] bg-[var(--surface)] px-3 font-semibold outline-none focus:border-[var(--border-strong)]"
            />
          </label>
          <label className="grid gap-2 text-sm font-bold sm:col-span-2">
            Ulica
            <input
              required
              value={values.street}
              onChange={(event) => handleChange("street", event.target.value)}
              className="min-h-12 rounded-md border border-[var(--border-soft)] bg-[var(--surface)] px-3 font-semibold outline-none focus:border-[var(--border-strong)]"
            />
          </label>
        </div>

        {message ? (
          <p
            className={`mt-5 rounded-md border px-3 py-3 text-sm font-semibold ${
              status === "error"
                ? "border-[#b24a35]/30 bg-[#b24a35]/10 text-[#b24a35]"
                : "border-[var(--border-soft)] bg-[rgba(var(--accent-rgb),0.08)] text-[var(--text-primary)]"
            }`}
          >
            {message}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={status === "submitting"}
          className="tow-on-primary mt-6 min-h-12 w-full rounded-md bg-[var(--text-primary)] px-5 text-sm font-bold uppercase tracking-[0.16em] disabled:opacity-45"
        >
          {status === "submitting" ? "Saljem porudzbinu..." : "Potvrdi porudzbinu"}
        </button>
      </form>

      <aside className="rounded-lg border border-[var(--border-soft)] bg-[var(--surface)] p-4 lg:sticky lg:top-24 lg:self-start">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--text-muted)]">
          Pregled korpe
        </p>
        <div className="mt-4 grid gap-3">
          {items.map((item) => (
            <article key={item.lineId} className="grid grid-cols-[4rem_1fr] gap-3">
              <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-[rgba(var(--accent-rgb),0.08)]">
                {item.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold">{item.name}</p>
                <p className="mt-1 text-xs font-semibold text-[var(--text-muted)]">
                  {item.brandName} / {item.size} / x{item.quantity}
                </p>
                <p className="mt-2 text-sm font-bold">
                  {formatShopPrice(item.price * item.quantity)}
                </p>
              </div>
            </article>
          ))}
        </div>
        <div className="mt-5 border-t border-[var(--border-soft)] pt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-[var(--text-muted)]">
              Ukupno
            </span>
            <span className="text-2xl font-bold">{formatShopPrice(subtotal)}</span>
          </div>
        </div>
      </aside>
    </div>
  );
}

function BackendCheckout({
  items,
  subtotal,
}: {
  items: CartItem[];
  subtotal: number;
}) {
  const createOrder = useMutation(api.orders.create);

  return (
    <CheckoutForm
      backendLabel="Backend porudzbina"
      items={items}
      subtotal={subtotal}
      onSubmit={async (values) => {
        await createOrder({
          firstName: values.firstName.trim(),
          lastName: values.lastName.trim(),
          email: values.email.trim() || undefined,
          city: values.city.trim(),
          street: values.street.trim(),
          houseNumber: values.houseNumber.trim(),
          source: "site",
          items: items.map((item) => ({
            productId: item.productId as Id<"products">,
            size: item.size,
            quantity: item.quantity,
          })),
        });

        return "Porudzbina je sacuvana u admin evidenciji.";
      }}
    />
  );
}

function LocalCheckout({
  items,
  subtotal,
}: {
  items: CartItem[];
  subtotal: number;
}) {
  return (
    <CheckoutForm
      backendLabel="Demo checkout"
      items={items}
      subtotal={subtotal}
      onSubmit={async () => "Demo porudzbina je potvrdjena za pregled toka."}
    />
  );
}

export function CheckoutClient({ convexEnabled }: { convexEnabled: boolean }) {
  const { items, subtotal } = useCart();

  if (convexEnabled && items.length > 0 && !hasDemoItems(items)) {
    return <BackendCheckout items={items} subtotal={subtotal} />;
  }

  return <LocalCheckout items={items} subtotal={subtotal} />;
}
