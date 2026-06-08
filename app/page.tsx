import { HeroScrollytelling } from "@/components/home/hero-scrollytelling";
import { Navbar } from "@/components/home/navbar";

export default function Home() {
  return (
    <main className="relative min-h-dvh">
      <Navbar />
      <HeroScrollytelling />
    </main>
  );
}
