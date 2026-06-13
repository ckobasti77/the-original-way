import { BrandsMarquee } from "@/components/home/brands-marquee";
import { CuratedCollections } from "@/components/home/curated-collections";
import { HeroScrollytelling } from "@/components/home/hero-scrollytelling";
import { HomeConversionSections } from "@/components/home/home-conversion-sections";
import { Navbar } from "@/components/home/navbar";

export default function Home() {
  return (
    <main className="relative min-h-screen">
      <Navbar />
      <HeroScrollytelling />
      <BrandsMarquee />
      <div className="home-post-hero-shell">
        <CuratedCollections />
        <HomeConversionSections />
      </div>
    </main>
  );
}
