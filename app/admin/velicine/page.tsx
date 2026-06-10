import { clothingSizes, nikeShoeSizesEu } from "../_lib/constants";
import { SectionHeader } from "../_components/admin-ui";

export default function SizesPage() {
  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Velicine"
        title="Odeca i obuca"
        description="Ove velicine se koriste kao ponudjene vrednosti pri dodavanju proizvoda."
      />

      <div className="grid gap-5 lg:grid-cols-[20rem_minmax(0,1fr)]">
        <section className="rounded-lg border border-black/10 bg-white p-4">
          <h2 className="text-lg font-semibold">Odeca</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {clothingSizes.map((size) => (
              <span
                key={size}
                className="rounded-md border border-black/10 bg-[#f7f8f4] px-4 py-3 text-sm font-bold"
              >
                {size}
              </span>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-black/10 bg-white p-4">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
            <div>
              <h2 className="text-lg font-semibold">Obuca, Nike EU tabela</h2>
              <p className="mt-1 text-sm text-black/55">
                EU velicine su unesene od najmanje do najvece.
              </p>
            </div>
            <a
              href="https://www.nike.com/size-fit/mens-footwear"
              target="_blank"
              rel="noreferrer"
              className="rounded-md border border-black/15 px-3 py-2 text-xs font-bold text-[#276c56] hover:border-[#276c56]"
            >
              Nike izvor
            </a>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {nikeShoeSizesEu.map((size) => (
              <span
                key={size}
                className="rounded-md border border-[#276c56]/20 bg-[#edf5ef] px-3 py-2 text-sm font-bold text-[#1f5946]"
              >
                {size}
              </span>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
