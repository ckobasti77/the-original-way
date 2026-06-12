import { cookies } from "next/headers";

import { api } from "@/convex/_generated/api";
import { createServerConvexClient } from "@/lib/convex/server-client";
import {
  AUTH_SESSION_COOKIE,
  getAuthIssuer,
  hashSessionToken,
  signConvexJwt,
} from "@/lib/auth/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(AUTH_SESSION_COOKIE)?.value;

  if (!sessionToken) {
    return Response.json(
      {
        expiresAt: null,
        issuer: getAuthIssuer(),
        token: null,
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      },
    );
  }

  const sessionTokenHash = await hashSessionToken(sessionToken);
  const convex = createServerConvexClient();
  const session = await convex.query(api.auth.sessionByTokenHash, {
    sessionTokenHash,
  });

  if (!session) {
    return Response.json(
      {
        expiresAt: null,
        issuer: getAuthIssuer(),
        token: null,
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      },
    );
  }

  const remainingSeconds = Math.floor((session.session.expiresAt - Date.now()) / 1000);
  if (remainingSeconds <= 0) {
    return Response.json(
      {
        expiresAt: null,
        issuer: getAuthIssuer(),
        token: null,
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      },
    );
  }

  const jwt = signConvexJwt({
    subject: session.user.authSubject,
    email: session.user.email,
    firstName: session.user.firstName,
    lastName: session.user.lastName,
    userId: String(session.user._id),
    sessionTokenHash,
    expiresInSeconds: remainingSeconds,
  });

  return Response.json(
    {
      expiresAt: jwt.expiresAt,
      issuer: getAuthIssuer(),
      token: jwt.token,
    },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    },
  );
}
