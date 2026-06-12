import type { AuthConfig } from "convex/server";

const issuer = process.env.AUTH_ISSUER_URL ?? "http://localhost:3000/api/auth";
const normalizedIssuer = issuer.endsWith("/") ? issuer.slice(0, -1) : issuer;

export default {
  providers: [
    {
      type: "customJwt",
      applicationID: process.env.AUTH_AUDIENCE ?? "the-original-way",
      issuer: normalizedIssuer,
      jwks: process.env.AUTH_JWKS_URL ?? `${normalizedIssuer}/jwks`,
      algorithm: "RS256",
    },
  ],
} satisfies AuthConfig;
