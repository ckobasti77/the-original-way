"use client";

import { ConvexProviderWithAuth, ConvexReactClient } from "convex/react";

import { useEmailPasswordAuth } from "@/lib/auth/use-email-password-auth";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;

export function ConvexClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!convex) {
    return children;
  }

  return (
    <ConvexProviderWithAuth client={convex} useAuth={useEmailPasswordAuth}>
      {children}
    </ConvexProviderWithAuth>
  );
}
