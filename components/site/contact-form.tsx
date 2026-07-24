"use client";

import { FormEvent, useState } from "react";

import { useSettings } from "@/components/settings-provider";
import { STORE_COPY } from "@/lib/storefront-i18n";
import { CONTACT_EMAIL } from "@/lib/site-contact";

export function ContactForm() {
  const { language } = useSettings();
  const copy = STORE_COPY[language].contact.form;
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

    setStatus(copy.opened);
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="premium-panel grid gap-4 p-5 md:p-7"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5 text-sm font-bold text-[var(--text-secondary)]">
          {copy.name}
          <input
            name="name"
            required
            autoComplete="name"
            className="store-input"
            placeholder={copy.namePlaceholder}
          />
        </label>
        <label className="grid gap-1.5 text-sm font-bold text-[var(--text-secondary)]">
          Email
          <input
            name="email"
            required
            type="email"
            autoComplete="email"
            className="store-input"
            placeholder="ime@email.com"
          />
        </label>
      </div>

      <label className="grid gap-1.5 text-sm font-bold text-[var(--text-secondary)]">
        {copy.phone}
        <input
          name="phone"
          autoComplete="tel"
          className="store-input"
          placeholder="+381"
        />
      </label>

      <label className="grid gap-1.5 text-sm font-bold text-[var(--text-secondary)]">
        {copy.message}
        <textarea
          name="message"
          required
          rows={6}
          className="store-input min-h-36 resize-y"
          placeholder={copy.messagePlaceholder}
        />
      </label>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-semibold leading-5 text-[var(--text-muted)]" aria-live="polite">
          {status || copy.idle}
        </p>
        <button
          type="submit"
          className="store-button-primary"
        >
          {copy.submit}
        </button>
      </div>
    </form>
  );
}
