import Link from "next/link";

import type { Language } from "@/components/settings-provider";

import type { NavGroup } from "./content";

type DropdownNavItemProps = {
  group: NavGroup;
  language: Language;
};

export function DropdownNavItem({
  group,
  language,
}: DropdownNavItemProps) {
  return (
    <div className="group relative">
      <Link
        href={group.href}
        prefetch={false}
        className="inline-flex min-h-10 items-center rounded-full px-4 text-[0.78rem] uppercase tracking-[0.28em] text-[var(--text-secondary)] hover:text-[var(--text-primary)] focus-visible:text-[var(--text-primary)]"
      >
        {group.label[language]}
      </Link>
      <div className="pointer-events-none absolute left-1/2 top-full z-20 mt-3 w-[22rem] -translate-x-1/2 opacity-0 transition duration-200 group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100">
        <div className="glass-panel rounded-[1.9rem] p-3 shadow-[0_24px_64px_rgba(var(--shadow-rgb),0.18)]">
          <div className="grid gap-2">
            {group.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                prefetch={false}
                aria-label={item.ariaLabel[language]}
                className="rounded-[1.4rem] border border-transparent px-4 py-3 transition hover:border-[var(--border-soft)] hover:bg-[rgba(var(--accent-rgb),0.08)] focus-visible:border-[var(--border-strong)] focus-visible:bg-[rgba(var(--accent-rgb),0.08)]"
              >
                <p className="text-[0.78rem] uppercase tracking-[0.3em] text-[var(--text-muted)]">
                  {item.label[language]}
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--text-primary)]">
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
