import type { Metadata } from "next";

import { bodyFont, displayFont } from "@/app/fonts";
import { SettingsProvider } from "@/components/settings-provider";

import "./globals.css";

import "react-toastify/dist/ReactToastify.css";

export const metadata: Metadata = {
  title: "The Original Way",
  description:
    "A cinematic, chapter-based fashion homepage for The Original Way.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="sr-Latn-RS"
      suppressHydrationWarning
      className={`${bodyFont.variable} ${displayFont.variable} antialiased`}
    >
      <body className="min-h-dvh">
        <SettingsProvider>{children}</SettingsProvider>
      </body>
    </html>
  );
}
