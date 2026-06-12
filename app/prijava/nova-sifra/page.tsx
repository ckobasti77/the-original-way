import type { Metadata } from "next";

import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { ResetPasswordForm } from "@/components/auth/auth-forms";

function getTokenValue(token: string | string[] | undefined) {
  if (Array.isArray(token)) {
    return token[0] ?? "";
  }

  return token ?? "";
}

export const metadata: Metadata = {
  title: "Nova sifra | The Original Way",
  description: "Postavi novu sifru za svoj nalog.",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const token = getTokenValue(params.token);

  return (
    <AuthPageShell page="reset">
      <ResetPasswordForm token={token} />
    </AuthPageShell>
  );
}
