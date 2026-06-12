import {
  createHash,
  createPrivateKey,
  createPublicKey,
  createSign,
} from "crypto";

import { sha256Hex } from "@/lib/auth/crypto";

function getAppOrigin() {
  if (process.env.AUTH_BASE_URL) {
    return process.env.AUTH_BASE_URL;
  }

  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
}

function getPrivateKeyPem() {
  const directPem = process.env.AUTH_JWT_PRIVATE_KEY_PEM;
  if (directPem) {
    return directPem;
  }

  const encodedPem = process.env.AUTH_JWT_PRIVATE_KEY_PEM_B64;
  if (encodedPem) {
    return Buffer.from(encodedPem, "base64").toString("utf8");
  }

  throw new Error("AUTH_JWT_PRIVATE_KEY_PEM_B64 is not configured.");
}

export const AUTH_SESSION_COOKIE = "tow_session";

const AUTH_ISSUER = process.env.AUTH_ISSUER_URL ?? `${getAppOrigin()}/api/auth`;
const AUTH_AUDIENCE = process.env.AUTH_AUDIENCE ?? "the-original-way";
const AUTH_JWKS_URL = process.env.AUTH_JWKS_URL ?? `${AUTH_ISSUER}/jwks`;

const PRIVATE_KEY_PEM = getPrivateKeyPem();
const PRIVATE_KEY = createPrivateKey(PRIVATE_KEY_PEM);
const PUBLIC_KEY = createPublicKey(PRIVATE_KEY);
const PUBLIC_KEY_PEM = PUBLIC_KEY.export({ format: "pem", type: "spki" }).toString();
const KEY_ID =
  process.env.AUTH_JWT_KEY_ID ??
  createHash("sha256").update(PUBLIC_KEY_PEM).digest("hex").slice(0, 16);

const PUBLIC_JWK = {
  ...(PUBLIC_KEY.export({ format: "jwk" }) as JsonWebKey),
  alg: "RS256",
  kid: KEY_ID,
  use: "sig",
};

function base64UrlEncode(input: string) {
  return Buffer.from(input, "utf8").toString("base64url");
}

export function getAuthIssuer() {
  return AUTH_ISSUER;
}

export function getAuthAudience() {
  return AUTH_AUDIENCE;
}

export function getAuthJwksUrl() {
  return AUTH_JWKS_URL;
}

export function getAuthJwks() {
  return { keys: [PUBLIC_JWK] };
}

export async function hashSessionToken(sessionToken: string) {
  return await sha256Hex(sessionToken);
}

export function signConvexJwt(payload: {
  subject: string;
  email: string;
  firstName: string;
  lastName: string;
  userId: string;
  sessionTokenHash: string;
  expiresInSeconds?: number;
}) {
  const now = Math.floor(Date.now() / 1000);
  const expiresInSeconds = payload.expiresInSeconds ?? 60 * 60;
  const header = {
    alg: "RS256",
    kid: KEY_ID,
    typ: "JWT",
  };

  const body = {
    aud: AUTH_AUDIENCE,
    email: payload.email,
    exp: now + expiresInSeconds,
    family_name: payload.lastName,
    given_name: payload.firstName,
    iat: now,
    iss: AUTH_ISSUER,
    name: `${payload.firstName} ${payload.lastName}`.trim(),
    sub: payload.subject,
    tow_session_hash: payload.sessionTokenHash,
    tow_user_id: payload.userId,
  };

  const unsignedToken = `${base64UrlEncode(JSON.stringify(header))}.${base64UrlEncode(JSON.stringify(body))}`;
  const signature = createSign("RSA-SHA256").update(unsignedToken).sign(PRIVATE_KEY).toString("base64url");

  return {
    expiresAt: (now + expiresInSeconds) * 1000,
    token: `${unsignedToken}.${signature}`,
  };
}
