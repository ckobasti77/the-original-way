import { v } from "convex/values";

import type { Doc } from "./_generated/dataModel";
import { internal } from "./_generated/api";
import {
  action,
  env,
  internalMutation,
  mutation,
  query,
  type DatabaseReader,
  type DatabaseWriter,
} from "./_generated/server";
import {
  createPasswordDigest,
  normalizeEmail,
  randomHex,
  safeTrim,
  sha256Hex,
  verifyPassword,
} from "../lib/auth/crypto";
import {
  assertProfileOwnership,
  normalizeCourierProfile,
} from "../lib/storefront-profile";
import { isConfiguredAdminEmail } from "./lib/authorization";
import { authRateLimiter } from "./lib/rateLimits";

const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 30;
const PASSWORD_RESET_TOKEN_DURATION_MS = 1000 * 60 * 60;

type ReaderCtx = {
  db: DatabaseReader;
};

type WriterCtx = {
  db: DatabaseWriter;
};

type PublicUser = {
  _id: Doc<"users">["_id"];
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  city?: string;
  postalCode?: string;
  street?: string;
  houseNumber?: string;
  addressLine2?: string;
  deliveryNote?: string;
  profileCompletedAt?: number;
  lastLoginAt?: number;
  lastOrderAt?: number;
  createdAt: number;
  updatedAt: number;
};

type AuthResult = {
  sessionToken: string;
  sessionExpiresAt: number;
  user: PublicUser;
};

const publicUserValidator = v.object({
  _id: v.id("users"),
  firstName: v.string(),
  lastName: v.string(),
  email: v.string(),
  phone: v.optional(v.string()),
  city: v.optional(v.string()),
  postalCode: v.optional(v.string()),
  street: v.optional(v.string()),
  houseNumber: v.optional(v.string()),
  addressLine2: v.optional(v.string()),
  deliveryNote: v.optional(v.string()),
  profileCompletedAt: v.optional(v.number()),
  lastLoginAt: v.optional(v.number()),
  lastOrderAt: v.optional(v.number()),
  createdAt: v.number(),
  updatedAt: v.number(),
});

const authResultValidator = v.object({
  sessionToken: v.string(),
  sessionExpiresAt: v.number(),
  user: publicUserValidator,
});

async function getRateLimitKey(
  ctx: { meta: { getRequestMetadata(): Promise<{ ip: string | null }> } },
  email: string,
) {
  const request = await ctx.meta.getRequestMetadata();
  return `${request.ip ?? "unknown"}:${normalizeEmail(email)}`;
}

function toPublicUser(user: Doc<"users">): PublicUser {
  return {
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    city: user.city,
    postalCode: user.postalCode,
    street: user.street,
    houseNumber: user.houseNumber,
    addressLine2: user.addressLine2,
    deliveryNote: user.deliveryNote,
    profileCompletedAt: user.profileCompletedAt,
    lastLoginAt: user.lastLoginAt,
    lastOrderAt: user.lastOrderAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

async function getUserByEmailNormalized(ctx: ReaderCtx, emailNormalized: string) {
  return await ctx.db
    .query("users")
    .withIndex("by_email_normalized", (q) => q.eq("emailNormalized", emailNormalized))
    .first();
}

async function getUserByAuthSubject(ctx: ReaderCtx, authSubject: string) {
  return await ctx.db
    .query("users")
    .withIndex("by_auth_subject", (q) => q.eq("authSubject", authSubject))
    .first();
}

async function getSessionByTokenHash(ctx: ReaderCtx, tokenHash: string) {
  return await ctx.db
    .query("sessions")
    .withIndex("by_token_hash", (q) => q.eq("tokenHash", tokenHash))
    .first();
}

async function getPasswordResetTokenByTokenHash(ctx: ReaderCtx, tokenHash: string) {
  return await ctx.db
    .query("passwordResetTokens")
    .withIndex("by_token_hash", (q) => q.eq("tokenHash", tokenHash))
    .first();
}

async function createSession(ctx: WriterCtx, userId: Doc<"users">["_id"]) {
  const now = Date.now();
  const rawToken = randomHex(32);
  const tokenHash = await sha256Hex(rawToken);

  await ctx.db.insert("sessions", {
    tokenHash,
    userId,
    createdAt: now,
    expiresAt: now + SESSION_DURATION_MS,
    lastUsedAt: now,
  });

  return {
    expiresAt: now + SESSION_DURATION_MS,
    rawToken,
    tokenHash,
  };
}

async function revokeSessionsForUser(ctx: WriterCtx, userId: Doc<"users">["_id"]) {
  const sessions = await ctx.db
    .query("sessions")
    .withIndex("by_user_id", (q) => q.eq("userId", userId))
    .take(500);

  for (const session of sessions) {
    await ctx.db.delete(session._id);
  }
}

async function createPasswordResetToken(ctx: WriterCtx, userId: Doc<"users">["_id"]) {
  const now = Date.now();
  const rawToken = randomHex(32);
  const tokenHash = await sha256Hex(rawToken);
  const expiresAt = now + PASSWORD_RESET_TOKEN_DURATION_MS;

  const existingTokens = await ctx.db
    .query("passwordResetTokens")
    .withIndex("by_user_id", (q) => q.eq("userId", userId))
    .take(100);

  for (const token of existingTokens) {
    await ctx.db.delete(token._id);
  }

  await ctx.db.insert("passwordResetTokens", {
    tokenHash,
    userId,
    createdAt: now,
    expiresAt,
  });

  return {
    expiresAt,
    rawToken,
    tokenHash,
  };
}

async function syncShippingFromOrder(
  ctx: WriterCtx,
  user: Doc<"users">,
  address: {
    city: string;
    street: string;
    houseNumber: string;
  },
) {
  const now = Date.now();
  const hasShippingAddress =
    safeTrim(user.city) !== "" &&
    safeTrim(user.street) !== "" &&
    safeTrim(user.houseNumber) !== "";

  if (hasShippingAddress) {
    await ctx.db.patch(user._id, {
      lastOrderAt: now,
      updatedAt: now,
    });
    return;
  }

  await ctx.db.patch(user._id, {
    city: address.city,
    street: address.street,
    houseNumber: address.houseNumber,
    profileCompletedAt: now,
    lastOrderAt: now,
    updatedAt: now,
  });
}

export const registerInternal = internalMutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    password: v.string(),
  },
  returns: authResultValidator,
  handler: async (ctx, args): Promise<AuthResult> => {
    const firstName = safeTrim(args.firstName);
    const lastName = safeTrim(args.lastName);
    const email = safeTrim(args.email);
    const emailNormalized = normalizeEmail(email);

    if (!firstName || !lastName || !emailNormalized || !args.password.trim()) {
      throw new Error("Sva polja su obavezna.");
    }

    if (isConfiguredAdminEmail(emailNormalized)) {
      throw new Error("Registracija za ovu adresu nije dostupna.");
    }

    const existingUser = await getUserByEmailNormalized(ctx, emailNormalized);
    if (existingUser) {
      throw new Error("Nalog sa ovim email-om vec postoji.");
    }

    const now = Date.now();
    const authSubject = randomHex(16);
    const { saltHex, passwordHash } = await createPasswordDigest(args.password);

    const userId = await ctx.db.insert("users", {
      authSubject,
      firstName,
      lastName,
      email,
      emailNormalized,
      passwordHash,
      passwordSalt: saltHex,
      createdAt: now,
      updatedAt: now,
    });

    const session = await createSession(ctx, userId);

    await ctx.db.patch(userId, {
      lastLoginAt: now,
      updatedAt: now,
    });

    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("Nije moguce napraviti nalog.");
    }

    return {
      sessionToken: session.rawToken,
      sessionExpiresAt: session.expiresAt,
      user: toPublicUser(user),
    };
  },
});

export const register = action({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    password: v.string(),
  },
  returns: authResultValidator,
  handler: async (ctx, args): Promise<AuthResult> => {
    await authRateLimiter.limit(ctx, "register", {
      key: await getRateLimitKey(ctx, args.email),
      throws: true,
    });

    return await ctx.runMutation(internal.auth.registerInternal, args);
  },
});

export const loginInternal = internalMutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  returns: authResultValidator,
  handler: async (ctx, args): Promise<AuthResult> => {
    const emailNormalized = normalizeEmail(args.email);
    const user = await getUserByEmailNormalized(ctx, emailNormalized);

    if (!user) {
      throw new Error("Neispravni kredencijali.");
    }

    const isValid = await verifyPassword(args.password, user.passwordSalt, user.passwordHash);
    if (!isValid) {
      throw new Error("Neispravni kredencijali.");
    }

    const now = Date.now();
    const session = await createSession(ctx, user._id);

    await ctx.db.patch(user._id, {
      lastLoginAt: now,
      updatedAt: now,
    });

    return {
      sessionToken: session.rawToken,
      sessionExpiresAt: session.expiresAt,
      user: toPublicUser(user),
    };
  },
});

export const login = action({
  args: {
    email: v.string(),
    password: v.string(),
  },
  returns: authResultValidator,
  handler: async (ctx, args): Promise<AuthResult> => {
    await authRateLimiter.limit(ctx, "login", {
      key: await getRateLimitKey(ctx, args.email),
      throws: true,
    });

    return await ctx.runMutation(internal.auth.loginInternal, args);
  },
});

export const requestPasswordResetInternal = internalMutation({
  args: {
    email: v.string(),
  },
  returns: v.union(
    v.null(),
    v.object({
      email: v.string(),
      token: v.string(),
    }),
  ),
  handler: async (ctx, args) => {
    const emailNormalized = normalizeEmail(args.email);
    const user = await getUserByEmailNormalized(ctx, emailNormalized);

    if (!user) {
      return null;
    }

    const token = await createPasswordResetToken(ctx, user._id);

    return {
      email: user.email,
      token: token.rawToken,
    };
  },
});

export const requestPasswordReset = action({
  args: {
    email: v.string(),
    locale: v.union(v.literal("sr"), v.literal("en")),
  },
  returns: v.object({ ok: v.boolean() }),
  handler: async (ctx, args) => {
    await authRateLimiter.limit(ctx, "passwordReset", {
      key: await getRateLimitKey(ctx, args.email),
      throws: true,
    });

    const request = await ctx.runMutation(
      internal.auth.requestPasswordResetInternal,
      { email: args.email },
    );

    if (!request) {
      return { ok: true };
    }

    const apiKey = env.RESEND_API_KEY;
    const baseUrl = env.PASSWORD_RESET_BASE_URL?.replace(/\/+$/, "");
    const from = env.AUTH_EMAIL_FROM;

    if (!apiKey || !baseUrl || !from) {
      console.error(
        "Password reset email is disabled because RESEND_API_KEY, PASSWORD_RESET_BASE_URL, or AUTH_EMAIL_FROM is missing.",
      );
      return { ok: true };
    }

    const resetUrl = `${baseUrl}/${args.locale}/prijava/nova-sifra?token=${encodeURIComponent(request.token)}`;
    const subject =
      args.locale === "en"
        ? "Reset your The Original Way password"
        : "Promenite lozinku za The Original Way";
    const intro =
      args.locale === "en"
        ? "Use the secure link below to set a new password."
        : "Otvorite bezbedan link ispod da postavite novu lozinku.";

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: request.email,
        subject,
        html: `<p>${intro}</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>Link važi jedan sat.</p>`,
      }),
    });

    if (!response.ok) {
      console.error("Password reset email failed.", {
        status: response.status,
      });
    }

    return { ok: true };
  },
});

export const resetPassword = mutation({
  args: {
    password: v.string(),
    token: v.string(),
  },
  returns: authResultValidator,
  handler: async (ctx, args) => {
    const token = safeTrim(args.token);
    const password = args.password;

    if (!token || !password.trim()) {
      throw new Error("Sva polja su obavezna.");
    }

    const tokenHash = await sha256Hex(token);
    const resetToken = await getPasswordResetTokenByTokenHash(ctx, tokenHash);
    const now = Date.now();

    if (!resetToken || resetToken.usedAt || resetToken.expiresAt <= now) {
      throw new Error("Link za reset je istekao ili nije ispravan.");
    }

    const user = await ctx.db.get(resetToken.userId);
    if (!user) {
      throw new Error("Nije moguce promeniti sifru.");
    }

    const { saltHex, passwordHash } = await createPasswordDigest(password);

    await revokeSessionsForUser(ctx, user._id);

    await ctx.db.patch(user._id, {
      lastLoginAt: now,
      passwordHash,
      passwordSalt: saltHex,
      updatedAt: now,
    });

    await ctx.db.patch(resetToken._id, {
      usedAt: now,
    });

    const freshUser = await ctx.db.get(user._id);
    if (!freshUser) {
      throw new Error("Nije moguce promeniti sifru.");
    }

    const session = await createSession(ctx, freshUser._id);

    return {
      sessionExpiresAt: session.expiresAt,
      sessionToken: session.rawToken,
      user: toPublicUser(freshUser),
    };
  },
});

export const logout = mutation({
  args: {
    sessionTokenHash: v.string(),
  },
  returns: v.object({ ok: v.boolean() }),
  handler: async (ctx, args) => {
    const session = await getSessionByTokenHash(ctx, args.sessionTokenHash);

    if (!session) {
      return { ok: true };
    }

    await ctx.db.delete(session._id);
    return { ok: true };
  },
});

export const sessionByTokenHash = query({
  args: {
    sessionTokenHash: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const session = await getSessionByTokenHash(ctx, args.sessionTokenHash);

    if (!session || session.revokedAt || session.expiresAt <= now) {
      return null;
    }

    const user = await ctx.db.get(session.userId);
    if (!user) {
      return null;
    }

    return {
      user: {
        _id: user._id,
        authSubject: user.authSubject,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        city: user.city,
        postalCode: user.postalCode,
        street: user.street,
        houseNumber: user.houseNumber,
        addressLine2: user.addressLine2,
        deliveryNote: user.deliveryNote,
      },
      session: {
        expiresAt: session.expiresAt,
        lastUsedAt: session.lastUsedAt,
      },
    };
  },
});

export const me = query({
  args: {},
  returns: v.union(
    v.null(),
    v.object({
      ...publicUserValidator.fields,
      isAdmin: v.boolean(),
    }),
  ),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await getUserByAuthSubject(ctx, identity.subject);
    if (!user) {
      return null;
    }

    return {
      ...toPublicUser(user),
      isAdmin: isConfiguredAdminEmail(identity.email),
    };
  },
});

export const updateMyProfile = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    phone: v.string(),
    city: v.string(),
    postalCode: v.string(),
    street: v.string(),
    houseNumber: v.string(),
    addressLine2: v.optional(v.string()),
    deliveryNote: v.optional(v.string()),
  },
  returns: v.object({ ok: v.boolean() }),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Morate biti prijavljeni.");
    }

    const user = await getUserByAuthSubject(ctx, identity.subject);
    if (!user) {
      throw new Error("Korisnički nalog nije pronađen.");
    }
    assertProfileOwnership(identity.subject, user.authSubject);
    const profile = normalizeCourierProfile(args);

    const now = Date.now();
    await ctx.db.patch(user._id, {
      firstName: profile.firstName,
      lastName: profile.lastName,
      phone: profile.phone,
      city: profile.city,
      postalCode: profile.postalCode,
      street: profile.street,
      houseNumber: profile.houseNumber,
      addressLine2: profile.addressLine2,
      deliveryNote: profile.deliveryNote,
      profileCompletedAt: user.profileCompletedAt ?? now,
      updatedAt: now,
    });

    return { ok: true };
  },
});

export {
  getSessionByTokenHash,
  getUserByAuthSubject,
  getUserByEmailNormalized,
  syncShippingFromOrder,
};
