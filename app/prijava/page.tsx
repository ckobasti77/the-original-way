import type { Metadata } from "next";

import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { LoginForm } from "@/components/auth/auth-forms";

export const metadata: Metadata = {
  title: "Prijava | The Original Way",
  description: "Uloguj se na svoj The Original Way nalog.",
};

export default function Page() {
  return (
    <AuthPageShell page="login">
      <LoginForm />
    </AuthPageShell>
  );
}
