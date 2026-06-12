import type { Metadata } from "next";

import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { ForgotPasswordForm } from "@/components/auth/auth-forms";

export const metadata: Metadata = {
  title: "Zaboravljena sifra | The Original Way",
  description: "Zatrazi reset sifre za svoj nalog.",
};

export default function Page() {
  return (
    <AuthPageShell page="forgot">
      <ForgotPasswordForm />
    </AuthPageShell>
  );
}
