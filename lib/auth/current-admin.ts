import "server-only";

import { cookies } from "next/headers";

import { api } from "@/convex/_generated/api";
import {
  AUTH_SESSION_COOKIE,
  hashSessionToken,
  isServerAdminEmail,
} from "@/lib/auth/server";
import { createServerConvexClient } from "@/lib/convex/server-client";

export async function getCurrentAdmin() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(AUTH_SESSION_COOKIE)?.value;

  if (!sessionToken) {
    return null;
  }

  const convex = createServerConvexClient();
  const session = await convex.query(api.auth.sessionByTokenHash, {
    sessionTokenHash: await hashSessionToken(sessionToken),
  });

  if (!session || !isServerAdminEmail(session.user.email)) {
    return null;
  }

  return session.user;
}

export async function requireCurrentAdmin() {
  const admin = await getCurrentAdmin();

  if (!admin) {
    throw new Error("Nemate administratorski pristup.");
  }

  return admin;
}
