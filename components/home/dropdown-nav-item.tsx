import Link from "next/link";

import type { Language } from "@/components/settings-provider";

import type { NavLinkItem } from "./content";

type DropdownNavItemProps = {
  link: NavLinkItem;
  language: Language;
};

export function DropdownNavItem({
  link,
  language,
}: DropdownNavItemProps) {
  return (
    <div className="group relative">
      <Link
        href={link.href}
        prefetch={false}
        className="inline-flex min-h-10 items-center gap-1.5 px-3 text-[0.78rem] uppercase tracking-[0.3em] text-[var(--text-secondary)] hover:text-[var(--text-primary)] focus-visible:text-[var(--text-primary)]"
      >
        <span>{link.label[language]}</span>
        <svg
          viewBox="0 0 24 24"
          className="h-3 w-3 opacity-60 transition-transform duration-200 group-hover:translate-y-0.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </Link>
      <div className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 w-[22rem] -translate-x-1/2 opacity-0 transition duration-200 group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100">
        <div className="glass-panel rounded-[1.6rem] p-2.5 shadow-[0_20px_50px_rgba(var(--shadow-rgb),0.15)]">
          <div className="grid gap-1.5">
            {link.items?.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                prefetch={false}
                aria-label={item.ariaLabel[language]}
                className="rounded-[1.1rem] border border-transparent px-4 py-3 transition hover:border-[var(--border-soft)] hover:bg-[rgba(var(--accent-rgb),0.06)] focus-visible:border-[var(--border-strong)] focus-visible:bg-[rgba(var(--accent-rgb),0.06)]"
              >
                <p className="text-[0.7rem] uppercase tracking-[0.3em] text-[var(--text-muted)]">
                  {item.label[language]}
                </p>
                <p className="mt-1.5 text-xs leading-5 text-[var(--text-primary)]">
                  {item.description[language]}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
