import rateLimiter from "@convex-dev/rate-limiter/convex.config.js";
import { defineApp } from "convex/server";
import { v } from "convex/values";

const app = defineApp({
  env: {
    ADMIN_EMAILS: v.optional(v.string()),
    AUTH_EMAIL_FROM: v.optional(v.string()),
    PASSWORD_RESET_BASE_URL: v.optional(v.string()),
    RESEND_API_KEY: v.optional(v.string()),
  },
});

app.use(rateLimiter);

export default app;
