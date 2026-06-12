import type { Metadata } from "next";

import { bodyFont, displayFont } from "@/app/fonts";
import { ConvexClientProvider } from "@/components/convex-client-provider";
import { SettingsProvider } from "@/components/settings-provider";
import { FloatingActions } from "@/components/site/floating-actions";
import { CartProvider } from "@/components/shop/cart-provider";

import "./globals.css";


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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (window.location.pathname === '/') {
                  window.localStorage.setItem('tow-theme', 'light');
                  document.documentElement.dataset.theme = 'light';
                } else {
                  var theme = window.localStorage.getItem('tow-theme') || 'light';
                  document.documentElement.dataset.theme = theme;
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-screen" suppressHydrationWarning>
        <SettingsProvider>
          <CartProvider>
            <ConvexClientProvider>
              {children}
              <FloatingActions />
            </ConvexClientProvider>
          </CartProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
