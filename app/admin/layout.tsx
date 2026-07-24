import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getCurrentAdmin } from "@/lib/auth/current-admin";
import { AdminShell } from "./_components/admin-shell";

export const metadata: Metadata = {
  title: "Admin | The Original Way",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect("/sr/prijava?next=/admin");
  }

  return <AdminShell>{children}</AdminShell>;
}
