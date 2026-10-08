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

// All pricing lives here — change a price or quota in ONE place.
//
// FAIR_USE_DAILY_CAP: a server-side ceiling per calendar day for every paid
// option, so a script can never turn a purchase into thousands of AI calls.
export const FAIR_USE_DAILY_CAP = 25;

export type ProductId = "dayPass" | "seeker" | "plus";
export type PlanId = "seeker" | "plus"; // stored in entitlements.plan

export const PRICING = {
  dayPass: {
    label: "Day Pass",
    amountCents: 100,
    currency: "usd",
    description: "Unlimited digital rune readings for the next 24 hours.",
  },
  seeker: {
    label: "ICE WHISPERS Seeker",
    amountCents: 590,
    currency: "usd",
    interval: "month" as const,
    monthlyReadings: 100,
    description: "100 rune readings a month, Three Norns, Five Rune Cross.",
  },
  plus: {
    label: "ICE WHISPERS+",
    amountCents: 990,
    currency: "usd",
    interval: "month" as const,
    monthlyReadings: 500,
    description: "500 rune readings a month, Three Norns, Five Rune Cross. Most value.",
  },
};

export function monthlyQuotaFor(plan: string | null | undefined): number {
  return plan === "plus" ? PRICING.plus.monthlyReadings : PRICING.seeker.monthlyReadings;
}
