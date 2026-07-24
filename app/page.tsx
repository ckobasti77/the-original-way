import { HeroScrollytelling } from "@/components/home/hero-scrollytelling";
import { Navbar } from "@/components/home/navbar";
import { PostHeroStorefront } from "@/components/home/post-hero-storefront";

export default function Home() {
  return (
    <main className="relative min-h-screen">
      <Navbar />
      <HeroScrollytelling />
      <div className="home-post-hero-shell relative z-20 min-h-screen">
        <PostHeroStorefront />
      </div>
    </main>
  );
}
