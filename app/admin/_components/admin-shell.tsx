"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { adminNavItems } from "../_lib/constants";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [username, setUsername] = useState("");
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
    if (username === "theoriginalway" && password === "jasamsazvezdare") {
      localStorage.setItem("tow_admin_auth", "true");
      setIsLoggedIn(true);
      setError("");
    } else {
      setError("Neispravni kredencijali. Pokušajte ponovo.");
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#0d100e] text-white flex items-center justify-center font-sans">
        <div className="text-center animate-pulse">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white mx-auto"></div>
          <p className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-white/50">Provera autorizacije...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#0d100e] text-white flex items-center justify-center p-4 font-sans relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#276c56]/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="w-full max-w-md relative z-10">
          <div className="text-center mb-8">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#276c56] transition-colors">
              The Original Way
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight">
              Admin Panel
            </h1>
            <p className="mt-2 text-sm text-white/50">Prijavite se za pristup evidenciji i katalogu</p>
          </div>

          <form
            onSubmit={handleLogin}
            className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6 sm:p-8 shadow-2xl space-y-5"
          >
            <div>
              <label htmlFor="username" className="block text-xs font-bold uppercase tracking-wider text-white/60 mb-2">
                Korisničko ime
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-[#276c56] focus:bg-white/[0.07] transition-all"
                placeholder="Unesite korisničko ime"
                required
                autoFocus
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-white/60 mb-2">
                Lozinka
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-[#276c56] focus:bg-white/[0.07] transition-all"
                placeholder="Unesite lozinku"
                required
              />
            </div>

            {error && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3.5 py-2.5 text-xs text-red-400 font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-lg bg-[#276c56] py-3 text-sm font-bold text-white hover:bg-[#205947] active:scale-[0.98] transition-all cursor-pointer shadow-lg shadow-[#276c56]/20"
            >
              Prijavi se
            </button>
          </form>

          {/* Simple signout/back link */}
          <div className="text-center mt-6">
            <Link
              href="/"
              className="text-xs font-semibold uppercase tracking-wider text-white/40 hover:text-white transition-colors"
            >
              Nazad na početnu
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#eef0eb] text-[#141816]">
      {/* Sticky Mobile Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-black/10 bg-[#111513] px-4 py-3.5 text-white lg:hidden">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">
            The Original Way
          </p>
          <p className="text-lg font-semibold leading-none mt-1">Admin</p>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Navigacioni meni"
          className="rounded-md border border-white/15 p-2 hover:bg-white/10 active:bg-white/20 focus:outline-none cursor-pointer"
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

      {/* Backdrop for Mobile Drawer */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity duration-300 lg:hidden"
        />
      )}

      <div className="grid min-h-screen lg:grid-cols-[18rem_minmax(0,1fr)]">
        {/* Sidebar / Mobile Drawer */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-72 transform bg-[#111513] text-white transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-screen lg:w-auto lg:z-auto lg:border-r border-black/10 ${
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-full flex-col gap-8 px-5 py-6 overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/50">
                  The Original Way
                </p>
                <h1 className="mt-3 text-3xl font-semibold leading-none">
                  Admin
                </h1>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Zatvori meni"
                className="rounded-md border border-white/15 p-2 hover:bg-white/10 lg:hidden focus:outline-none cursor-pointer"
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
                className="w-full rounded-md border border-white/10 bg-white/[0.05] hover:bg-white/10 hover:border-white/20 px-4 py-2.5 text-xs font-bold text-white transition-all cursor-pointer text-center"
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

        <div className="min-w-0 mx-auto w-full max-w-7xl px-4 py-6 md:px-8">{children}</div>
      </div>
    </main>
  );
}


