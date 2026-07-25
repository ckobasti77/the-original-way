import type { Metadata } from "next";
import { headers } from "next/headers";

import { bodyFont, displayFont } from "@/app/fonts";
import { ConvexClientProvider } from "@/components/convex-client-provider";
import { SettingsProvider } from "@/components/settings-provider";
import { AmbientScrollBackground } from "@/components/site/ambient-scroll-background";
import { FloatingActions } from "@/components/site/floating-actions";
import { CartProvider } from "@/components/shop/cart-provider";

import "./globals.css";


export const metadata: Metadata = {
  title: "The Original Way",
  description:
    "A cinematic, chapter-based fashion homepage for The Original Way.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const requestHeaders = await headers();
  const locale = requestHeaders.get("x-tow-locale") === "en" ? "en" : "sr";

  return (
    <html
      lang={locale === "sr" ? "sr-Latn-RS" : "en"}
      suppressHydrationWarning
      className={`${bodyFont.variable} ${displayFont.variable} antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var theme = window.localStorage.getItem('tow-theme') || 'light';
                document.documentElement.dataset.theme = theme;
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-screen" suppressHydrationWarning>
        <AmbientScrollBackground />
        <div className="site-content-layer">
          <SettingsProvider>
            <CartProvider>
              <ConvexClientProvider>
                {children}
                <FloatingActions />
              </ConvexClientProvider>
            </CartProvider>
          </SettingsProvider>
        </div>
      </body>
    </html>
  );
}
