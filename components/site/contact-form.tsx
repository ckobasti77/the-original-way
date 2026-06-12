"use client";

import { FormEvent, useState } from "react";

import { CONTACT_EMAIL } from "@/lib/site-contact";

export function ContactForm() {
  const [status, setStatus] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();
    const message = String(formData.get("message") ?? "").trim();

    const subject = encodeURIComponent(
      name ? `Upit sa sajta - ${name}` : "Upit sa sajta",
    );
    const body = encodeURIComponent(
      [
        `Ime: ${name || "-"}`,
        `Email: ${email || "-"}`,
        `Telefon: ${phone || "-"}`,
        "",
        message,
      ].join("\n"),
    );

    setStatus("Otvaramo email klijent sa pripremljenom porukom.");
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-4 rounded-lg border border-[var(--border-soft)] bg-[var(--surface-strong)] p-4 shadow-[0_26px_70px_rgba(var(--shadow-rgb),0.12)] backdrop-blur-2xl sm:p-5"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5 text-sm font-bold text-[var(--text-secondary)]">
          Ime
          <input
            name="name"
            required
            autoComplete="name"
            className="min-h-11 rounded-md border border-[var(--border-soft)] bg-[var(--surface)] px-3 text-sm font-semibold text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--border-strong)]"
            placeholder="Vase ime"
          />
        </label>
        <label className="grid gap-1.5 text-sm font-bold text-[var(--text-secondary)]">
          Email
          <input
            name="email"
            required
            type="email"
            autoComplete="email"
            className="min-h-11 rounded-md border border-[var(--border-soft)] bg-[var(--surface)] px-3 text-sm font-semibold text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--border-strong)]"
            placeholder="ime@email.com"
          />
        </label>
      </div>

      <label className="grid gap-1.5 text-sm font-bold text-[var(--text-secondary)]">
        Telefon
        <input
          name="phone"
          autoComplete="tel"
          className="min-h-11 rounded-md border border-[var(--border-soft)] bg-[var(--surface)] px-3 text-sm font-semibold text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--border-strong)]"
          placeholder="+381"
        />
      </label>

      <label className="grid gap-1.5 text-sm font-bold text-[var(--text-secondary)]">
        Poruka
        <textarea
          name="message"
          required
          rows={6}
          className="min-h-36 resize-y rounded-md border border-[var(--border-soft)] bg-[var(--surface)] px-3 py-3 text-sm font-semibold text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--border-strong)]"
          placeholder="Napisite sta trazite, velicinu, brend ili pitanje za porudzbinu."
        />
      </label>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-semibold leading-5 text-[var(--text-muted)]" aria-live="polite">
          {status || "Odgovaramo direktno na email ili poziv."}
        </p>
        <button
          type="submit"
          className="tow-on-primary inline-flex min-h-11 items-center justify-center rounded-md bg-[var(--text-primary)] px-5 text-xs font-bold uppercase tracking-[0.16em] hover:opacity-90"
        >
          Posalji upit
        </button>
      </div>
    </form>
  );
}
