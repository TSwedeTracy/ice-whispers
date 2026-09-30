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

// Product config lives here, not scattered across routes, so pricing is
// one edit away from changing (and eventually admin-configurable).
//
// FAIR_USE_DAILY_CAP: dayPass and subscription both grant "unlimited"
// readings, but "unlimited" still needs a server-side ceiling so a script
// can't turn a single $1 day pass into thousands of AI calls. This cap is
// generous enough that no real person will ever hit it (see lib/session.ts).
export const FAIR_USE_DAILY_CAP = 25;

export const PRICING = {
  dayPass: {
    label: "Continue Today",
    amountCents: 100,
    currency: "usd",
    description: "Unlimited digital rune readings for the next 24 hours.",
  },
  subscription: {
    label: "ICE WHISPERS+",
    amountCents: 490,
    currency: "usd",
    interval: "month" as const,
    description: "Unlimited readings, Three Norns, Five Rune Cross, reading history.",
  },
};

