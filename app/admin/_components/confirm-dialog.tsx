"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { buttonClass, secondaryButtonClass } from "./admin-ui";

type ConfirmRequest = {
  title: string;
  body: string;
  confirmLabel: string;
  tone?: "danger" | "default";
  onConfirm: () => void | Promise<void>;
};

/**
 * Potvrda za nepovratne admin akcije. Brisanje je do sada bilo jedan klik bez
 * pitanja i bez undo-a, a `categories.remove` uz to nulira `categorySlug` na
 * do 500 proizvoda i `products.remove` brise proizvod iz svih kolekcija.
 *
 * Vraca `confirm(...)` koji otvara dijalog i sam dijalog za render.
 */
export function useConfirmDialog() {
  const [request, setRequest] = useState<ConfirmRequest | null>(null);
  const [busy, setBusy] = useState(false);
  const confirmButtonRef = useRef<HTMLButtonElement | null>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const close = useCallback(() => {
    setRequest(null);
    setBusy(false);
  }, []);

  useEffect(() => {
    if (!request) {
      lastFocusedRef.current?.focus?.();
      lastFocusedRef.current = null;
      return;
    }

    lastFocusedRef.current = document.activeElement as HTMLElement | null;
    confirmButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }

      if (event.key !== "Tab") return;

      const panel = panelRef.current;
      if (!panel) return;

      const focusable = panel.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && (active === first || !panel.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, [close, request]);

  const confirm = useCallback((next: ConfirmRequest) => {
    setRequest(next);
  }, []);

  const dialog = request ? (
    <div
      className="fixed inset-0 z-[90] grid place-items-center bg-black/45 p-4"
      onClick={close}
    >
      <div
        ref={panelRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="admin-confirm-title"
        aria-describedby="admin-confirm-body"
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-md rounded-lg border border-black/10 bg-white p-5 shadow-2xl"
      >
        <h2 id="admin-confirm-title" className="text-xl font-semibold">
          {request.title}
        </h2>
        <p
          id="admin-confirm-body"
          className="mt-2 text-sm leading-6 text-black/60"
        >
          {request.body}
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={close}
            disabled={busy}
            className={secondaryButtonClass}
          >
            Otkazi
          </button>
          <button
            type="button"
            ref={confirmButtonRef}
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await request.onConfirm();
              } finally {
                close();
              }
            }}
            className={
              request.tone === "danger"
                ? "rounded-md bg-[#9d3026] px-4 py-2 text-sm font-bold text-white hover:bg-[#7d2419] disabled:cursor-not-allowed disabled:opacity-60"
                : buttonClass
            }
          >
            {busy ? "Sacekaj..." : request.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  ) : null;

  return { confirm, dialog };
}
