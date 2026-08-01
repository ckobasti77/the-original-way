"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const COPY = {
  sr: {
    eyebrow: "Greska",
    title: "Nesto je poslo naopako",
    text: "Stranica nije mogla da se ucita. Pokusajte ponovo ili se vratite na pocetnu.",
    retry: "Pokusaj ponovo",
    home: "Nazad na pocetnu",
    code: "Kod greske",
  },
  en: {
    eyebrow: "Error",
    title: "Something went wrong",
    text: "This page could not be loaded. Try again or return to the homepage.",
    retry: "Try again",
    home: "Back to homepage",
    code: "Error code",
  },
} as const;

export default function StorefrontError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Namerno se ne koristi `useSettings` — ako je bas SettingsProvider pukao,
  // hook bi bacio i unutar samog error boundary-ja. Putanja je deterministicna
  // na serveru i na klijentu, pa nema hydration neslaganja.
  const pathname = usePathname();
  const language = pathname?.startsWith("/en") ? "en" : "sr";

  useEffect(() => {
    console.error("Storefront greska:", error);
  }, [error]);

  const copy = COPY[language];

  return (
    <main className="mx-auto grid min-h-[70vh] w-full max-w-3xl place-items-center px-5 py-16">
      <div className="premium-panel w-full p-8 text-center md:p-12">
        <p className="store-eyebrow">{copy.eyebrow}</p>
        <h1 className="font-display mt-3 text-4xl md:text-5xl">{copy.title}</h1>
        <p className="mx-auto mt-4 max-w-md text-[var(--text-secondary)]">
          {copy.text}
        </p>
        {error.digest ? (
          <p className="mt-3 font-mono text-xs text-[var(--text-muted)]">
            {copy.code}: {error.digest}
          </p>
        ) : null}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button type="button" onClick={reset} className="store-button-primary">
            {copy.retry}
          </button>
          <a className="store-button-secondary" href={`/${language}`}>
            {copy.home}
          </a>
        </div>
      </div>
    </main>
  );
}
