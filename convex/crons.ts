import { cronJobs } from "convex/server";

import { internal } from "./_generated/api";

const crons = cronJobs();

// Osvežavanje EUR->RSD kursa jednom dnevno (06:00 UTC).
// Ako fetch padne, akcija zadržava poslednju keširanu vrednost, a storefront
// ionako ima hardkodovani fallback — cena nikad ne izostane.
crons.cron("refresh-eur-rsd-rate", "0 6 * * *", internal.currency.refreshRate, {});

export default crons;
