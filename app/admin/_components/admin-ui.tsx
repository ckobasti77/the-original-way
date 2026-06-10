export const fieldClass =
  "w-full rounded-md border border-black/12 bg-[#fbfcf8] px-3 py-2 text-sm font-semibold text-[#141816] outline-none placeholder:text-black/35 focus:border-[#276c56] focus:bg-white disabled:cursor-not-allowed disabled:opacity-60";

export const buttonClass =
  "rounded-md bg-[#141816] px-4 py-2 text-sm font-bold text-white hover:bg-[#276c56] disabled:cursor-not-allowed disabled:opacity-60";

export const secondaryButtonClass =
  "rounded-md border border-black/15 px-4 py-2 text-sm font-bold text-[#141816] hover:border-[#276c56] hover:text-[#276c56] disabled:cursor-not-allowed disabled:opacity-60";

export function formatCurrency(value: number) {
  return `${value.toLocaleString("sr-RS")} RSD`;
}

export function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="max-w-3xl">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#276c56]">
        {eyebrow}
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-normal md:text-4xl">
        {title}
      </h1>
      <p className="mt-2 text-sm leading-6 text-black/[0.58]">{description}</p>
    </div>
  );
}

export function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-black/10 bg-white p-4">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-black/45">
        {label}
      </p>
      <p className="mt-2 text-xl font-semibold">{value}</p>
    </div>
  );
}

export function FieldLabel({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-1 text-sm font-bold text-black/70">
      {label}
      {children}
    </label>
  );
}

export function ConvexSetupNotice() {
  return (
    <div className="rounded-lg border border-[#b86b2f]/25 bg-[#fff8ef] p-4 text-sm leading-6 text-[#6f421d]">
      <p className="font-bold">Convex nije povezan u lokalnom okruzenju.</p>
      <p className="mt-1">
        Dodaj <code className="font-mono">NEXT_PUBLIC_CONVEX_URL</code> u
        <code className="font-mono"> .env.local</code> i deployuj Convex funkcije
        iz foldera <code className="font-mono">convex/</code>. Stranica je
        spremna za taj backend i ne koristi lokalni storage kao izvor podataka.
      </p>
    </div>
  );
}

export function LoadingBlock({ label = "Ucitavanje" }: { label?: string }) {
  return (
    <div className="rounded-lg border border-black/10 bg-white p-6 text-sm font-bold text-black/50">
      {label}...
    </div>
  );
}

export function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-dashed border-black/15 bg-white p-6 text-sm text-black/55">
      {text}
    </div>
  );
}
