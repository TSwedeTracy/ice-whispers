import Stripe from "stripe";

let cached: Stripe | null = null;

export function stripeClient(): Stripe {
  if (cached) return cached;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("Missing STRIPE_SECRET_KEY environment variable. See .env.example.");
  }
  cached = new Stripe(key, { apiVersion: "2024-06-20" });
  return cached;
}

// ── All pricing and limits live here — change them in ONE place. ──────────
// Prices are what the customer pays (VAT included).

export const LIMITS = {
  freeReadingsPerDay: 1, // one free Daily Rune per day
  dayPassReadings: 10, // "Unlock 24 hours" — readings in any spread
  memberReadingsPerMonth: 300, // ICE WHISPERS+ — a monthly pool, unused readings last the whole month
  burstPerHour: 30, // anti-bot ceiling for everyone; no real person hits it
};

// Stripe coupon (created 2026-10-12): $1 off the first membership payment
// for anyone who bought "Unlock 24 hours" within the last 24 hours.
export const DAYPASS_CREDIT_COUPON = "DAYPASS_CREDIT_1USD";

// Stripe coupon (created 2026-10-13): $10 off when a monthly member switches
// to yearly — "upgrade for only $87".
export const MONTH_TO_YEAR_COUPON = "MONTH_TO_YEAR_10USD";

export type ProductId = "dayPass" | "plusMonthly" | "plusYearly";

export const PRICING = {
  dayPass: {
    label: "ICE WHISPERS — 24 hours",
    amountCents: 100,
    currency: "usd",
    description: `All spreads, up to ${LIMITS.dayPassReadings} readings, for the next 24 hours.`,
  },
  plusMonthly: {
    label: "ICE WHISPERS+ (monthly)",
    amountCents: 970,
    currency: "usd",
    interval: "month" as const,
    description: "All spreads — 1, 3 and 5 runes — and your personal rune journal.",
  },
  plusYearly: {
    label: "ICE WHISPERS+ (yearly)",
    amountCents: 9700,
    currency: "usd",
    interval: "year" as const,
    description: "All spreads — 1, 3 and 5 runes — and your personal rune journal. Two months free.",
  },
};
