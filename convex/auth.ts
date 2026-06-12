import { v } from "convex/values";

import type { Doc } from "./_generated/dataModel";
import {
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
  city?: string;
  street?: string;
  houseNumber?: string;
  profileCompletedAt?: number;
  lastLoginAt?: number;
  lastOrderAt?: number;
  createdAt: number;
  updatedAt: number;
};

function toPublicUser(user: Doc<"users">): PublicUser {
  return {
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    city: user.city,
    street: user.street,
    houseNumber: user.houseNumber,
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
    .collect();

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
    .collect();

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

export const register = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const firstName = safeTrim(args.firstName);
    const lastName = safeTrim(args.lastName);
    const email = safeTrim(args.email);
    const emailNormalized = normalizeEmail(email);

    if (!firstName || !lastName || !emailNormalized || !args.password.trim()) {
      throw new Error("Sva polja su obavezna.");
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

export const login = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
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

export const requestPasswordReset = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const emailNormalized = normalizeEmail(args.email);
    const user = await getUserByEmailNormalized(ctx, emailNormalized);

    if (!user) {
      return {
        resetLink: null as string | null,
      };
    }

    const token = await createPasswordResetToken(ctx, user._id);

    return {
      resetLink: `/prijava/nova-sifra?token=${encodeURIComponent(token.rawToken)}`,
    };
  },
});

export const resetPassword = mutation({
  args: {
    password: v.string(),
    token: v.string(),
  },
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
        city: user.city,
        street: user.street,
        houseNumber: user.houseNumber,
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
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await getUserByAuthSubject(ctx, identity.subject);
    if (!user) {
      return null;
    }

    return toPublicUser(user);
  },
});

export {
  getSessionByTokenHash,
  getUserByAuthSubject,
  getUserByEmailNormalized,
  syncShippingFromOrder,
};
