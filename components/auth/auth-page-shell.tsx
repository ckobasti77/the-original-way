"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";

import { Navbar } from "@/components/home/navbar";
import { useSettings } from "@/components/settings-provider";

import { AUTH_COPY, type AuthPageKey } from "./content";

export function AuthPageShell({
  children,
  page,
}: Readonly<{
  children: ReactNode;
  page: AuthPageKey;
}>) {
  const { language } = useSettings();
  const copy = AUTH_COPY[language].pages[page];

  useEffect(() => {
    document.title = `${copy.title[language]} | The Original Way`;
  }, [copy.title, language]);

  return (
    <main className="min-h-screen px-4 pb-10 pt-24 text-[var(--text-primary)] sm:px-6 lg:px-8">
      <Navbar />
      <div className="mx-auto flex min-h-[calc(100vh-7rem)] w-full max-w-7xl flex-col items-center justify-center gap-7">
        <header className="max-w-2xl text-center">
          <h1 className="font-display text-[2.6rem] leading-[0.95] tracking-[-0.02em] text-[var(--text-primary)] sm:text-[3.4rem] lg:text-[4rem]">
            {copy.title[language]}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-[var(--text-secondary)] sm:text-lg">
            {copy.subtitle[language]}
          </p>
        </header>

        {children}
      </div>
    </main>
  );
}
