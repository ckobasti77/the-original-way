import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { Navbar } from "@/components/home/navbar";

export const metadata: Metadata = {
  title: "Ko smo mi | The Original Way",
  description:
    "The Original Way donosi originalnu garderobu iz Evrope, bez genericke reselling price.",
};

const values = [
  {
    title: "Evropski izvor",
    text: "Komadi dolaze iz evropskih tokova robe, sa jasnim fokusom na originalnost, kroj i materijal.",
  },
  {
    title: "Bez generike",
    text: "Ne gradimo ponudu na klasicnom kineskom reselling modelu. Biramo garderobu koja ima karakter i poreklo.",
  },
  {
    title: "Kuriran izbor",
    text: "Svaki drop je suzen, pregledan i postavljen tako da kupac brzo nadje komad koji nosi dugo.",
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[var(--page-bg)] text-[var(--text-primary)]">
      <Navbar />

      <section className="relative px-4 pb-14 pt-28 md:px-8 md:pb-20">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(135deg,rgba(var(--accent-rgb),0.18),transparent_30%),radial-gradient(circle_at_78%_20%,rgba(255,255,255,0.22),transparent_28%),linear-gradient(180deg,var(--page-bg),var(--page-bg-deep))]" />
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[minmax(0,0.92fr)_minmax(22rem,0.72fr)] lg:items-end">
          <div>
            <p className="reveal-line" />
            <p className="mt-6 text-xs font-bold uppercase tracking-[0.28em] text-[var(--text-muted)]">
              The Original Way / Ko smo mi
            </p>
            <h1 className="font-display mt-5 max-w-4xl text-6xl font-semibold leading-[0.9] tracking-normal md:text-8xl">
              Originalna garderoba, donesena sa ukusom.
            </h1>
            <p className="mt-6 max-w-2xl text-lg font-semibold leading-8 text-[var(--text-secondary)]">
              The Original Way je butik za ljude koji ne zele da izgledaju kao
              algoritam. Uvozimo originalnu garderobu iz Evrope i gradimo izbor
              koji je smiren, kvalitetan i dovoljno poseban da se prepozna bez
              glasnog objasnjavanja.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/proizvodi"
                className="tow-on-primary inline-flex min-h-11 items-center rounded-md bg-[var(--text-primary)] px-5 text-xs font-bold uppercase tracking-[0.16em] hover:opacity-90"
              >
                Pogledaj proizvode
              </Link>
              <Link
                href="/kontakt"
                className="inline-flex min-h-11 items-center rounded-md border border-[var(--border-soft)] bg-[var(--surface)] px-5 text-xs font-bold uppercase tracking-[0.16em] text-[var(--text-primary)] hover:border-[var(--border-strong)]"
              >
                Kontakt
              </Link>
            </div>
          </div>

          <div className="relative min-h-[28rem]">
            <div className="absolute left-0 top-0 w-[70%] overflow-hidden rounded-lg border border-[var(--border-soft)] bg-[rgba(var(--accent-rgb),0.08)] shadow-[0_28px_70px_rgba(var(--shadow-rgb),0.18)]">
              <Image
                src="/assets/images/lacoste.avif"
                alt="Originalna garderoba iz evropske selekcije"
                width={700}
                height={880}
                priority
                className="aspect-[4/5] h-full w-full object-cover"
              />
            </div>
            <div className="absolute bottom-0 right-0 w-[58%] overflow-hidden rounded-lg border border-[var(--border-soft)] bg-[rgba(var(--accent-rgb),0.08)] shadow-[0_28px_70px_rgba(var(--shadow-rgb),0.18)]">
              <Image
                src="/assets/images/air-max.avif"
                alt="Premium obuca u The Original Way selekciji"
                width={640}
                height={640}
                className="aspect-square h-full w-full object-contain p-5"
              />
            </div>
            <div className="absolute left-4 top-[58%] max-w-[16rem] rounded-lg border border-[var(--border-soft)] bg-[var(--surface-elevated)] p-4 shadow-[0_18px_44px_rgba(var(--shadow-rgb),0.16)] backdrop-blur-2xl">
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.22em] text-[var(--text-muted)]">
                Stav
              </p>
              <p className="mt-2 text-sm font-bold leading-6">
                Manje buke. Vise stvarnog kvaliteta, porekla i komada koji ne
                izgledaju potroseno posle jedne sezone.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[var(--border-soft)] bg-[rgba(var(--accent-rgb),0.045)] px-4 py-10 md:px-8">
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-3">
          {values.map((value) => (
            <article
              key={value.title}
              className="rounded-lg border border-[var(--border-soft)] bg-[var(--surface)] p-5 backdrop-blur-xl"
            >
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--text-muted)]">
                {value.title}
              </p>
              <p className="mt-4 text-base font-semibold leading-7 text-[var(--text-secondary)]">
                {value.text}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="px-4 py-14 md:px-8 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.76fr_1fr] lg:items-start">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.26em] text-[var(--text-muted)]">
              Nije masovna prica
            </p>
            <h2 className="font-display mt-4 text-5xl font-semibold leading-[0.94] md:text-7xl">
              Biramo ono sto ima razlog da bude na polici.
            </h2>
          </div>
          <div className="grid gap-5 text-lg font-semibold leading-8 text-[var(--text-secondary)]">
            <p>
              Kupovina garderobe danas lako sklizne u isti scenario: isti kroj,
              ista slika, ista roba koja se samo preprodaje pod novim nazivom.
              The Original Way ide drugim putem.
            </p>
            <p>
              Nas fokus je na originalnim komadima uvezenim iz Evrope, na
              garderobi koja deluje zrelo i nosivo, bez potrebe da glumi luksuz.
              Premium utisak za nas nije napadna etiketa, vec cist izbor,
              pouzdan materijal i komad koji se uklapa u stvaran zivot.
            </p>
            <p>
              Zato katalog ostaje uredan, pregledan i kuriran. Manje beskonacnog
              skrolovanja, vise sigurnog izbora.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
