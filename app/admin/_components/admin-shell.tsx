"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { adminCredentials, adminNavItems } from "../_lib/constants";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const sessionAuth = localStorage.getItem("tow_admin_auth");
    if (sessionAuth === "true") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsLoggedIn(true);
    }
    setIsCheckingAuth(false);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();

    if (
      normalizedEmail === adminCredentials.email &&
      password === adminCredentials.password
    ) {
      localStorage.setItem("tow_admin_auth", "true");
      setIsLoggedIn(true);
      setError("");
      return;
    }

    setError("Neispravni kredencijali. Pokusajte ponovo.");
  };

  if (isCheckingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0d100e] font-sans text-white">
        <div className="text-center animate-pulse">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
          <p className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-white/50">
            Provera autorizacije...
          </p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0d100e] p-4 font-sans text-white">
        <div className="pointer-events-none absolute left-1/4 top-1/4 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#276c56]/10 blur-[120px]" />
        <div className="pointer-events-none absolute bottom-1/4 right-1/4 h-96 w-96 translate-x-1/2 translate-y-1/2 rounded-full bg-white/5 blur-[120px]" />

        <div className="relative z-10 w-full max-w-md">
          <div className="mb-8 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#276c56] transition-colors">
              The Original Way
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight">Admin Panel</h1>
            <p className="mt-2 text-sm text-white/50">
              Prijavite se za pristup evidenciji i katalogu
            </p>
          </div>

          <form
            onSubmit={handleLogin}
            className="space-y-5 rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl backdrop-blur-xl sm:p-8"
          >
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-xs font-bold uppercase tracking-wider text-white/60"
              >
                Email adresa
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-white/20 focus:border-[#276c56] focus:bg-white/[0.07]"
                placeholder="theoriginalway@gmail.com"
                required
                autoFocus
                autoComplete="email"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-xs font-bold uppercase tracking-wider text-white/60"
              >
                Lozinka
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-white/20 focus:border-[#276c56] focus:bg-white/[0.07]"
                placeholder="Unesite lozinku"
                required
                autoComplete="current-password"
              />
            </div>

            {error ? (
              <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3.5 py-2.5 text-xs font-medium text-red-400">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              className="w-full cursor-pointer rounded-lg bg-[#276c56] py-3 text-sm font-bold text-white shadow-lg shadow-[#276c56]/20 transition-all hover:bg-[#205947] active:scale-[0.98]"
            >
              Prijavi se
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-xs font-semibold uppercase tracking-wider text-white/40 transition-colors hover:text-white"
            >
              Nazad na pocetnu
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#eef0eb] text-[#141816]">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-black/10 bg-[#111513] px-4 py-3.5 text-white lg:hidden">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">
            The Original Way
          </p>
          <p className="mt-1 text-lg font-semibold leading-none">Admin</p>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Navigacioni meni"
          className="cursor-pointer rounded-md border border-white/15 p-2 hover:bg-white/10 active:bg-white/20 focus:outline-none"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </header>

      {isMobileMenuOpen ? (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity duration-300 lg:hidden"
        />
      ) : null}

      <div className="grid min-h-screen lg:grid-cols-[18rem_minmax(0,1fr)]">
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-72 transform border-black/10 bg-[#111513] text-white transition-transform duration-300 ease-in-out lg:static lg:z-auto lg:h-screen lg:w-auto lg:border-r lg:translate-x-0 ${
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-full flex-col gap-8 overflow-y-auto px-5 py-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/50">
                  The Original Way
                </p>
                <h1 className="mt-3 text-3xl font-semibold leading-none">Admin</h1>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Zatvori meni"
                className="cursor-pointer rounded-md border border-white/15 p-2 hover:bg-white/10 focus:outline-none lg:hidden"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <nav aria-label="Admin sekcije" className="flex flex-col gap-2">
              {adminNavItems.map((item) => {
                const active = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    style={active ? { color: "#111513" } : undefined}
                    className={`rounded-md border px-4 py-2.5 text-sm font-bold transition-all ${
                      active
                        ? "border-white/35 bg-white text-[#111513]"
                        : "border-white/10 text-white/[0.78] hover:border-white/30 hover:bg-white/[0.08] hover:text-white"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto flex flex-col gap-4">
              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem("tow_admin_auth");
                  setIsLoggedIn(false);
                }}
                className="w-full cursor-pointer rounded-md border border-white/10 bg-white/[0.05] px-4 py-2.5 text-center text-xs font-bold text-white transition-all hover:border-white/20 hover:bg-white/10"
              >
                Odjavi se
              </button>

              <div className="rounded-lg border border-white/10 bg-white/[0.07] p-4">
                <p className="text-sm font-semibold text-white">Interni ulaz</p>
                <p className="mt-2 text-xs leading-5 text-white/60">
                  Admin rute nisu povezane u javnom navbaru. Ulaz ostaje rucnim
                  unosom /admin ili konkretne admin rute.
                </p>
              </div>
            </div>
          </div>
        </aside>

        <div className="mx-auto w-full max-w-7xl min-w-0 px-4 py-6 md:px-8">{children}</div>
      </div>
    </main>
  );
}
