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
  dayPassReadings: 10, // "Unlock 24 hours" — single-rune readings
  memberReadingsPerMonth: 300, // ICE WHISPERS+ — a monthly pool, unused readings last the whole month
  burstPerHour: 30, // anti-bot ceiling for everyone; no real person hits it
};

export type ProductId = "dayPass" | "plusMonthly" | "plusYearly";

export const PRICING = {
  dayPass: {
    label: "ICE WHISPERS — 24 hours",
    amountCents: 100,
    currency: "usd",
    description: `Up to ${LIMITS.dayPassReadings} single-rune readings for the next 24 hours.`,
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
