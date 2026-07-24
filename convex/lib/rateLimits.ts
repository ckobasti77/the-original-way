import { HOUR, RateLimiter } from "@convex-dev/rate-limiter";

import { components } from "../_generated/api";

export const authRateLimiter = new RateLimiter(components.rateLimiter, {
  login: {
    kind: "token bucket",
    rate: 10,
    period: HOUR,
    capacity: 5,
  },
  passwordReset: {
    kind: "fixed window",
    rate: 3,
    period: HOUR,
  },
  register: {
    kind: "fixed window",
    rate: 5,
    period: HOUR,
  },
});
