"use client";

import Link from "next/link";
import { useFormStatus } from "react-dom";
import { useConvexAuth, useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";

import { logout } from "../prijava/actions";

const MONEY_FORMAT = new Intl.NumberFormat("sr-RS", {
  currency: "RSD",
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
  style: "currency",
});

function formatDate(value?: number) {
  if (!value) {
    return "Nema podataka";
  }

  return new Date(value).toLocaleDateString("sr-RS", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function StatusBadge({ status }: { status: string }) {
  const classes: Record<string, string> = {
    completed: "border-[#315f8c]/20 bg-[#e9f2fb] text-[#1d4d7b]",
    new: "border-[#b86b2f]/20 bg-[#fff0df] text-[#7c3e12]",
    processing: "border-[#276c56]/20 bg-[#e7f4ee] text-[#1f5946]",
    sent: "border-[#276c56]/20 bg-[#e7f4ee] text-[#1f5946]",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.22em] ${classes[status] ?? "border-[var(--border-soft)] bg-[rgba(var(--shadow-rgb),0.04)] text-[var(--text-secondary)]"}`}
    >
      {status}
    </span>
  );
}

function LogoutButton() {
  return (
    <form action={logout}>
      <LogoutSubmit />
    </form>
  );
}

function LogoutSubmit() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--border-soft)] bg-[var(--surface)] px-5 text-[0.72rem] font-bold uppercase tracking-[0.22em] text-[var(--text-primary)] transition hover:border-[var(--border-strong)] hover:bg-[var(--surface-strong)] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Odjavljivanje..." : "Odjavi se"}
    </button>
  );
}

export function ProfileClient() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const user = useQuery(api.auth.me);
  const orders = useQuery(api.orders.mine);

  if (isLoading || user === undefined || orders === undefined) {
    return (
      <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto grid w-full max-w-6xl gap-6">
          <div className="h-48 animate-pulse rounded-[1.8rem] border border-[var(--border-soft)] bg-[rgba(var(--shadow-rgb),0.04)]" />
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="h-80 animate-pulse rounded-[1.8rem] border border-[var(--border-soft)] bg-[rgba(var(--shadow-rgb),0.04)]" />
            <div className="h-80 animate-pulse rounded-[1.8rem] border border-[var(--border-soft)] bg-[rgba(var(--shadow-rgb),0.04)]" />
          </div>
        </div>
      </main>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <main className="relative min-h-screen overflow-hidden px-4 py-8 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute left-0 top-20 h-64 w-64 rounded-full bg-[rgba(var(--accent-rgb),0.12)] blur-[120px]" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-[rgba(var(--shadow-rgb),0.08)] blur-[140px]" />

        <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-4xl items-center">
          <section className="rounded-[1.8rem] border border-[var(--border-soft)] bg-[var(--surface)] p-6 shadow-[0_24px_70px_rgba(var(--shadow-rgb),0.12)] backdrop-blur-2xl sm:p-8">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.32em] text-[var(--text-muted)]">
              Profil
            </p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-4xl">
              Prijavi se da otvoris svoj profil.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--text-secondary)]">
              Kada napravis nalog, adresu cemo dodati tek posle prve porudzbine.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/prijava"
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--action-primary-bg)] px-5 text-[0.72rem] font-bold uppercase tracking-[0.22em] text-[var(--action-primary-fg)] transition hover:opacity-95"
              >
                Otvori prijavu
              </Link>
              <Link
                href="/"
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--border-soft)] bg-[var(--surface)] px-5 text-[0.72rem] font-bold uppercase tracking-[0.22em] text-[var(--text-primary)] transition hover:border-[var(--border-strong)] hover:bg-[var(--surface-strong)]"
              >
                Nazad na pocetnu
              </Link>
            </div>
          </section>
        </div>
      </main>
    );
  }

  const hasShippingAddress =
    Boolean(user.city?.trim()) &&
    Boolean(user.street?.trim()) &&
    Boolean(user.houseNumber?.trim());

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-8 text-[var(--text-primary)] sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute left-0 top-20 h-64 w-64 rounded-full bg-[rgba(var(--accent-rgb),0.12)] blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-[rgba(var(--shadow-rgb),0.08)] blur-[140px]" />

      <div className="relative mx-auto grid w-full max-w-7xl gap-6">
        <section className="rounded-[1.8rem] border border-[var(--border-soft)] bg-[var(--surface)] p-6 shadow-[0_24px_70px_rgba(var(--shadow-rgb),0.12)] backdrop-blur-2xl sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.32em] text-[var(--text-muted)]">
                Moj profil
              </p>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                {user.firstName} {user.lastName}
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--text-secondary)]">
                Email je prijavljen preko Convex auth-a. Adresa ce se pojaviti
                nakon prve porudzbine i ostace sacuvana na profilu.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <LogoutButton />
              <Link
                href="/"
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--border-soft)] bg-[var(--surface)] px-5 text-[0.72rem] font-bold uppercase tracking-[0.22em] text-[var(--text-primary)] transition hover:border-[var(--border-strong)] hover:bg-[var(--surface-strong)]"
              >
                Nazad na pocetnu
              </Link>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="rounded-[1.8rem] border border-[var(--border-soft)] bg-[var(--surface)] p-6 shadow-[0_24px_70px_rgba(var(--shadow-rgb),0.1)] backdrop-blur-2xl">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[var(--text-muted)]">
              Podaci naloga
            </p>
            <dl className="mt-5 grid gap-4">
              <div className="rounded-2xl border border-[var(--border-soft)] bg-[rgba(var(--shadow-rgb),0.02)] p-4">
                <dt className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">
                  Email
                </dt>
                <dd className="mt-2 text-sm font-medium text-[var(--text-primary)]">
                  {user.email}
                </dd>
              </div>
              <div className="rounded-2xl border border-[var(--border-soft)] bg-[rgba(var(--shadow-rgb),0.02)] p-4">
                <dt className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">
                  Nalog napravljen
                </dt>
                <dd className="mt-2 text-sm font-medium text-[var(--text-primary)]">
                  {formatDate(user.createdAt)}
                </dd>
              </div>
              <div className="rounded-2xl border border-[var(--border-soft)] bg-[rgba(var(--shadow-rgb),0.02)] p-4">
                <dt className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">
                  Zadnja prijava
                </dt>
                <dd className="mt-2 text-sm font-medium text-[var(--text-primary)]">
                  {formatDate(user.lastLoginAt)}
                </dd>
              </div>
            </dl>
          </section>

          <section className="rounded-[1.8rem] border border-[var(--border-soft)] bg-[var(--surface-strong)] p-6 shadow-[0_24px_70px_rgba(var(--shadow-rgb),0.12)] backdrop-blur-2xl">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[var(--text-muted)]">
              Adresa i porudzbine
            </p>

            <div className="mt-5 grid gap-4">
              <div className="rounded-2xl border border-[var(--border-soft)] bg-[rgba(var(--shadow-rgb),0.02)] p-4">
                <dt className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">
                  Adresa
                </dt>
                <dd className="mt-2 text-sm font-medium text-[var(--text-primary)]">
                  {hasShippingAddress ? (
                    <>
                      {user.city}, {user.street} {user.houseNumber}
                    </>
                  ) : (
                    "Adresa ce biti dodata nakon prve porudzbine."
                  )}
                </dd>
              </div>

              <div className="rounded-2xl border border-[var(--border-soft)] bg-[rgba(var(--shadow-rgb),0.02)] p-4">
                <dt className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">
                  Poslednja porudzbina
                </dt>
                <dd className="mt-2 text-sm font-medium text-[var(--text-primary)]">
                  {formatDate(user.lastOrderAt)}
                </dd>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-[rgba(var(--accent-rgb),0.16)] bg-[rgba(var(--accent-rgb),0.08)] p-4 text-sm leading-6 text-[var(--text-primary)]">
              Prva porudzbina automatski dopunjava adresu na profilu. Kasnije
              mozes da pratis narudzbine ovde bez ponovnog unosa podataka.
            </div>
          </section>
        </div>

        <section className="rounded-[1.8rem] border border-[var(--border-soft)] bg-[var(--surface)] p-6 shadow-[0_24px_70px_rgba(var(--shadow-rgb),0.12)] backdrop-blur-2xl">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[var(--text-muted)]">
                Porudzbine
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                Istorija kupovine
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-[var(--text-secondary)]">
              Sve porudzbine povezane sa tvojim nalogom, ukljucujuci i onu koja
              je prvi put sacuvala adresu na profilu.
            </p>
          </div>

          <div className="mt-6">
            {orders === undefined ? (
              <div className="rounded-2xl border border-[var(--border-soft)] bg-[rgba(var(--shadow-rgb),0.02)] p-5 text-sm text-[var(--text-secondary)]">
                Ucitavam porudzbine...
              </div>
            ) : orders.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[var(--border-soft)] bg-[rgba(var(--shadow-rgb),0.02)] p-5 text-sm leading-6 text-[var(--text-secondary)]">
                Jos nemas porudzbinu. Kada prvi put narucis, ovde ce se pojaviti
                status i adresa ce biti sacuvana na profilu.
              </div>
            ) : (
              <div className="grid gap-4">
                {orders.map((order) => (
                  <article
                    key={order._id}
                    className="rounded-2xl border border-[var(--border-soft)] bg-[rgba(var(--shadow-rgb),0.02)] p-4"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-base font-semibold tracking-tight">
                            {order.orderNumber}
                          </h3>
                          <StatusBadge status={order.status} />
                        </div>
                        <p className="mt-2 text-sm text-[var(--text-secondary)]">
                          {formatDate(order.createdAt)} - {order.city},{" "}
                          {order.street} {order.houseNumber}
                        </p>
                      </div>
                      <div className="text-sm font-semibold text-[var(--text-primary)]">
                        {MONEY_FORMAT.format(order.totalSale)}
                      </div>
                    </div>

                    <div className="mt-4 grid gap-2 text-sm text-[var(--text-secondary)]">
                      {order.items.map((item) => (
                        <div key={`${order._id}-${item.productId}-${item.size}`} className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--border-soft)] pt-2">
                          <span>
                            {item.productName} - {item.size} - x{item.quantity}
                          </span>
                          <span className="font-medium text-[var(--text-primary)]">
                            {MONEY_FORMAT.format(item.salePrice * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
