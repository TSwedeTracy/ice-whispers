import { NextResponse } from "next/server";
import { stripeClient, MONTH_TO_YEAR_COUPON } from "@/lib/stripe";
import { PRICES, isCurrency, type Currency } from "@/lib/pricing";
import { getOrCreateVisitorId, getAccess } from "@/lib/session";
import { getCurrentUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

// Monthly member → yearly, "for only $87 / €87 / 890 kr": the yearly price
// minus a credit for the month already paid. Charged now to the card on file.
export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Please sign in first." }, { status: 401 });

  const visitorId = await getOrCreateVisitorId();
  const access = await getAccess(visitorId, user);
  const member = access?.member;
  if (!member || member.billing_interval !== "month") {
    return NextResponse.json({ message: "This upgrade is for monthly members." }, { status: 400 });
  }

  const db = supabaseAdmin();
  const { data: ent } = await db
    .from("entitlements")
    .select("stripe_subscription_id")
    .eq("visitor_id", member.visitor_id)
    .maybeSingle();
  if (!ent?.stripe_subscription_id) return NextResponse.json({ message: "Membership not found." }, { status: 404 });

  const stripe = stripeClient();
  try {
    const sub = (await stripe.subscriptions.retrieve(ent.stripe_subscription_id)) as any;
    const item = sub.items.data[0];
    const product = typeof item.price.product === "string" ? item.price.product : item.price.product.id;
    // Keep an existing discount (e.g. a VIP test code); otherwise give the $10 credit.
    // Stay in the currency they already pay in (a Stripe customer can't mix currencies).
    const currency: Currency = isCurrency(sub.currency) ? sub.currency : "usd";
    const existing = (sub.discounts ?? []).map((d: any) => ({ discount: typeof d === "string" ? d : d.id }));

    const updated = (await stripe.subscriptions.update(sub.id, {
      items: [
        {
          id: item.id,
          price_data: {
            currency,
            product,
            recurring: { interval: "year" },
            unit_amount: PRICES[currency].plusYearly,
            tax_behavior: "inclusive",
          },
        },
      ],
      proration_behavior: "none",
      billing_cycle_anchor: "now",
      payment_behavior: "error_if_incomplete",
      discounts: existing.length ? existing : [{ coupon: MONTH_TO_YEAR_COUPON }],
      metadata: { ...sub.metadata, plan: "plus", upgraded_from: "month" },
    } as any)) as any;

    await db
      .from("entitlements")
      .update({
        billing_interval: "year",
        current_period_start: new Date(updated.current_period_start * 1000).toISOString(),
        current_period_end: new Date(updated.current_period_end * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("stripe_subscription_id", sub.id);

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("upgrade failed:", err?.message);
    return NextResponse.json(
      { message: "Your card could not be charged for the upgrade. Nothing has changed — please try again later." },
      { status: 402 }
    );
  }
}
