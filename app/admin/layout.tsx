import type { Metadata } from "next";

import { AdminShell } from "./_components/admin-shell";

export const metadata: Metadata = {
  title: "Admin | The Original Way",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminShell>{children}</AdminShell>;
}
