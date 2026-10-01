"use client";

import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Prevlacenje nadole zatvara sheet ako je preslo cetvrtinu visine ili je
// pokret bio brz (px/ms), inace se vraca na mesto.
const CLOSE_DISTANCE_RATIO = 0.25;
const CLOSE_VELOCITY = 0.5;
const DRAG_START_THRESHOLD = 4;

type DragState = {
  pointerId: number;
  startY: number;
  startTime: number;
  lastY: number;
  lastTime: number;
  active: boolean;
};

/**
 * Fioka po uzoru na korpu (scrim, `inert`, Escape, focus trap, povratak
 * fokusa) — `bottom` se izvlaci sa dna i zatvara se i prevlacenjem nadole.
 * Sadrzaj se montira tek pri otvaranju i ostaje dok se zatvaranje ne zavrsi.
 */
export function Sheet({
  children,
  footer,
  header,
  label,
  onClose,
  open,
  side,
}: {
  children: ReactNode;
  footer?: ReactNode;
  header: ReactNode;
  label: string;
  onClose: () => void;
  open: boolean;
  side: "bottom" | "right";
}) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);
  const dragRef = useRef<DragState | null>(null);
  // Roditelj obicno prosledi novu funkciju pri svakom renderu; bez ref-a bi
  // efekat ispod pri svakom kliku vracao fokus na pocetak i palio scroll lock.
  const onCloseRef = useRef(onClose);
  const [lingering, setLingering] = useState(false);
  const [previousOpen, setPreviousOpen] = useState(open);

  // Zatvaranje: sadrzaj ostaje montiran dok traje izlazna animacija.
  if (open !== previousOpen) {
    setPreviousOpen(open);
    if (!open) setLingering(true);
  }

  const renderContent = open || lingering;

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open) {
      lastFocusedRef.current?.focus?.();
      lastFocusedRef.current = null;
      return;
    }

    lastFocusedRef.current = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    const firstFocusable = panel?.querySelector<HTMLElement>("[data-autofocus]") ??
      panel?.querySelector<HTMLElement>(FOCUSABLE);
    firstFocusable?.focus({ preventScroll: true });

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab" || !panel) return;

      const focusable = panel.querySelectorAll<HTMLElement>(FOCUSABLE);
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
    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  function resetDragStyles() {
    const panel = panelRef.current;
    if (!panel) return;
    panel.style.transform = "";
    panel.style.transition = "";
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (side !== "bottom" || !open) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    // Dugmad u zaglavlju (Obrisi, X) ostaju obicni klikovi.
    if ((event.target as HTMLElement).closest("button, a, input")) return;

    const now = performance.now();
    dragRef.current = {
      pointerId: event.pointerId,
      startY: event.clientY,
      startTime: now,
      lastY: event.clientY,
      lastTime: now,
      active: false,
    };
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    const panel = panelRef.current;
    if (!drag || !panel || drag.pointerId !== event.pointerId) return;

    const distance = event.clientY - drag.startY;
    if (!drag.active) {
      if (Math.abs(distance) < DRAG_START_THRESHOLD) return;
      drag.active = true;
      event.currentTarget.setPointerCapture(event.pointerId);
    }

    drag.lastY = event.clientY;
    drag.lastTime = performance.now();
    // Nagore se ne pomera (samo blagi otpor), nadole prati prst.
    const offset = distance > 0 ? distance : distance / 6;
    panel.style.transition = "none";
    panel.style.transform = `translate3d(0, ${offset}px, 0)`;
  }

  function handlePointerEnd(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    const panel = panelRef.current;
    dragRef.current = null;
    if (!drag || !panel || drag.pointerId !== event.pointerId || !drag.active) return;

    const distance = event.clientY - drag.startY;
    const elapsed = Math.max(1, performance.now() - drag.startTime);
    const recentElapsed = Math.max(1, performance.now() - drag.lastTime);
    const velocity = Math.max(distance / elapsed, (event.clientY - drag.lastY) / recentElapsed);
    const shouldClose =
      distance > panel.offsetHeight * CLOSE_DISTANCE_RATIO ||
      (distance > 24 && velocity > CLOSE_VELOCITY);

    // Uklanjanje inline stila pusta CSS tranziciju da odradi ostatak puta
    // (do dna ako se zatvara, nazad na 0 ako ne).
    resetDragStyles();
    if (shouldClose) onClose();
  }

  const isBottom = side === "bottom";

  return (
    <>
      <div
        aria-hidden="true"
        onClick={onClose}
        className={`fixed inset-0 z-[70] bg-black/45 backdrop-blur-[2px] transition-opacity duration-300 ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-label={label}
        aria-modal={open || undefined}
        inert={!open}
        onTransitionEnd={(event) => {
          if (event.target === event.currentTarget && !open) setLingering(false);
        }}
        className={
          isBottom
            ? `fixed inset-x-0 bottom-0 z-[80] flex max-h-[88dvh] flex-col rounded-t-[1.6rem] border-t border-[var(--border-soft)] bg-[var(--surface-opaque)] text-[var(--text-primary)] shadow-[0_-24px_70px_rgba(var(--shadow-rgb),0.24)] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform ${
                open ? "translate-y-0" : "translate-y-full"
              } ${renderContent ? "" : "invisible"}`
            : `fixed right-0 top-0 z-[80] flex h-dvh w-full max-w-[440px] flex-col border-l border-[var(--border-soft)] bg-[var(--surface-opaque)] text-[var(--text-primary)] shadow-[-24px_0_70px_rgba(var(--shadow-rgb),0.22)] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                open ? "translate-x-0" : "translate-x-full"
              } ${renderContent ? "" : "invisible"}`
        }
      >
        {renderContent ? (
          <>
            <div
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerEnd}
              onPointerCancel={handlePointerEnd}
              className={`shrink-0 border-b border-[var(--border-soft)] ${
                isBottom ? "touch-none select-none" : ""
              }`}
            >
              {isBottom ? (
                <div className="flex justify-center pb-1 pt-2.5">
                  <span className="h-1.5 w-11 rounded-full bg-[rgba(var(--accent-rgb),0.22)]" />
                </div>
              ) : null}
              {header}
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>
            {footer ? (
              <div className="shrink-0 border-t border-[var(--border-soft)] bg-[var(--surface-opaque)] px-4 pb-[calc(0.85rem+env(safe-area-inset-bottom))] pt-3 sm:px-5">
                {footer}
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    </>
  );
}
