import type { Metadata } from "next";

import { ProfileClient } from "./profile-client";
import { Navbar } from "@/components/home/navbar";

export const metadata: Metadata = {
  title: "Profil | The Original Way",
  description: "Profil i porudzbine za The Original Way nalog.",
};

export default function Page() {
  return (
    <main className="store-shell min-h-screen px-4 pb-20 pt-28 md:px-8">
      <Navbar />
      <ProfileClient />
    </main>
  );
}
