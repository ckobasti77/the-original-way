import { ConvexError } from "convex/values";

import { env, type ActionCtx, type MutationCtx, type QueryCtx } from "../_generated/server";

type AuthContext = Pick<ActionCtx | MutationCtx | QueryCtx, "auth">;

function configuredAdminEmails() {
  return new Set(
    (env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function isConfiguredAdminEmail(email: string | undefined) {
  return Boolean(email && configuredAdminEmails().has(email.trim().toLowerCase()));
}

export async function requireAdmin(ctx: AuthContext) {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity || !isConfiguredAdminEmail(identity.email)) {
    throw new ConvexError({
      code: "FORBIDDEN",
      message: "Nemate administratorski pristup.",
    });
  }

  return identity;
}
