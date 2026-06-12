import type { Metadata } from "next";

import { ProfileClient } from "./profile-client";

export const metadata: Metadata = {
  title: "Profil | The Original Way",
  description: "Profil i porudzbine za The Original Way nalog.",
};

export default function Page() {
  return <ProfileClient />;
}
