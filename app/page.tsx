import { headers } from "next/headers";

import { HeroScrollytelling } from "@/components/home/hero-scrollytelling";
import { Navbar } from "@/components/home/navbar";
import { PostHeroStorefront } from "@/components/home/post-hero-storefront";

export default async function Home() {
  const requestHeaders = await headers();
  const locale = requestHeaders.get("x-tow-locale") === "en" ? "en" : "sr";

  return (
    <main className="relative min-h-screen">
      {/*
        Pocetna nije imala nijedan <h1> — sadrzaj je poceo od <h2>. Naslov je
        vizuelno skriven jer je hero namerno tipografski vodjen animiranim
        tekstom; ovo je samo za citace ekrana i pretragu.
      */}
      <h1 className="sr-only">
        {locale === "sr"
          ? "The Original Way — originalna moda, odeća i obuća"
          : "The Original Way — original fashion, clothing and footwear"}
      </h1>
      <Navbar />
      <HeroScrollytelling />
      <div className="home-post-hero-shell relative z-20 min-h-screen">
        <PostHeroStorefront />
      </div>
    </main>
  );
}
