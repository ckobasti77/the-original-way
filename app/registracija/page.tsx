import type { Metadata } from "next";

import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { RegisterForm } from "@/components/auth/auth-forms";

export const metadata: Metadata = {
  title: "Registracija | The Original Way",
  description: "Kreiraj nalog za The Original Way.",
};

export default function Page() {
  return (
    <AuthPageShell page="register">
      <RegisterForm />
    </AuthPageShell>
  );
}
