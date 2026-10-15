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
// Prices are what the customer pays (VAT included) — see lib/pricing.ts.

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

// Stripe Tax (active in the ICE WHISPERS account, registered in Sweden):
// calculates and reports VAT. Prices are VAT-inclusive, so the customer
// always pays the price shown. Set STRIPE_AUTOMATIC_TAX=off in Vercel to
// switch it off without a code change.
export const AUTOMATIC_TAX = process.env.STRIPE_AUTOMATIC_TAX !== "off";

export type ProductId = "dayPass" | "plusMonthly" | "plusYearly";

// Amounts per currency live in lib/pricing.ts (USD/EUR 1 / 9.70 / 97,
// SEK 10 / 99 / 990). Both coupons above have SEK and EUR amounts set in
// Stripe (currency_options), so the credits work in every currency.
export const PRODUCT_INFO = {
  dayPass: {
    label: "ICE WHISPERS — 24 hours",
    description: `All spreads, up to ${LIMITS.dayPassReadings} readings, for the next 24 hours.`,
  },
  plusMonthly: {
    label: "ICE WHISPERS+ (monthly)",
    interval: "month" as const,
    description: "All spreads — 1, 3 and 5 runes — and your personal rune journal.",
  },
  plusYearly: {
    label: "ICE WHISPERS+ (yearly)",
    interval: "year" as const,
    description: "All spreads — 1, 3 and 5 runes — and your personal rune journal. Two months free.",
  },
};
