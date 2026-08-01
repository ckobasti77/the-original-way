"use client";

import { useEffect } from "react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin greska:", error);
  }, [error]);

  return (
    <div className="rounded-lg border border-[#b33a2d]/25 bg-[#fff6f4] p-6">
      <h2 className="text-xl font-semibold text-[#7d2419]">
        Nesto je poslo naopako
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-[#7d2419]/80">
        Stranica nije mogla da se prikaze. Ako se ovo ponavlja, proveri da li si
        i dalje prijavljen kao admin i da li je Convex dostupan.
      </p>
      {error.digest ? (
        <p className="mt-2 font-mono text-xs text-[#7d2419]/60">
          Kod greske: {error.digest}
        </p>
      ) : null}
      <button
        type="button"
        onClick={reset}
        className="mt-5 rounded-md bg-[#141816] px-4 py-2 text-sm font-bold text-white hover:bg-[#276c56]"
      >
        Pokusaj ponovo
      </button>
    </div>
  );
}
