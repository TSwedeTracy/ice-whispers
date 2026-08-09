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
export const PRICING = {
  topUp: {
    label: "Continue Today",
    amountCents: 99,
    currency: "usd",
    description: "5 more digital rune readings, today only.",
  },
  subscription: {
    label: "ICE WHISPERS+",
    amountCents: 499,
    currency: "usd",
    interval: "month" as const,
    description: "Unlimited readings, Three Norns, Five Rune Cross, reading history.",
  },
};
