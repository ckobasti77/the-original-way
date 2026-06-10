"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { adminNavItems } from "../_lib/constants";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <main className="min-h-screen bg-[#eef0eb] text-[#141816]">
      <div className="grid min-h-screen lg:grid-cols-[18rem_minmax(0,1fr)]">
        <aside className="border-b border-black/10 bg-[#111513] text-white lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r">
          <div className="flex h-full flex-col gap-8 px-5 py-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/50">
                The Original Way
              </p>
              <h1 className="mt-3 text-3xl font-semibold leading-none">
                Admin
              </h1>
            </div>

            <nav aria-label="Admin sekcije" className="flex flex-wrap gap-2 lg:flex-col">
              {adminNavItems.map((item) => {
                const active = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    style={active ? { color: "#111513" } : undefined}
                    className={`rounded-md border px-3 py-2 text-sm font-bold lg:px-4 ${
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

            <div className="mt-auto hidden rounded-lg border border-white/10 bg-white/[0.07] p-4 lg:block">
              <p className="text-sm font-semibold text-white">Interni ulaz</p>
              <p className="mt-2 text-sm leading-6 text-white/64">
                Admin rute nisu povezane u javnom navbaru. Ulaz ostaje rucnim
                unosom /admin ili konkretne admin rute.
              </p>
            </div>
          </div>
        </aside>

        <div className="min-w-0 px-4 py-5 sm:px-6 lg:px-8">{children}</div>
      </div>
    </main>
  );
}
