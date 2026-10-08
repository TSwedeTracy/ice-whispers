import { NextRequest, NextResponse } from "next/server";
import { stripeClient } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs"; // needs raw body access + Stripe SDK

const iso = (unixSeconds?: number | null) => (unixSeconds ? new Date(unixSeconds * 1000).toISOString() : null);

export async function POST(req: NextRequest) {
  const stripe = stripeClient();
  const signature = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "missing_signature_or_secret" }, { status: 400 });
  }

  const rawBody = await req.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook signature verification failed: ${err.message}` }, { status: 400 });
  }

  const db = supabaseAdmin();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as any;
      const visitorId = session.metadata?.visitor_id ?? session.client_reference_id;
      const product = session.metadata?.product;

      if (!visitorId) break;

      if (product === "dayPass") {
        // 24h of readings (daily fair-use cap still applies, lib/session.ts).
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
        const { error } = await db.from("entitlements").upsert({
          visitor_id: visitorId,
          stripe_customer_id: session.customer,
          status: "day_pass",
          plan: null,
          current_period_start: new Date().toISOString(),
          current_period_end: expires,
          updated_at: new Date().toISOString(),
        });
        if (error) console.error("webhook: day pass upsert failed:", error.message);
      } else if (product === "seeker" || product === "plus" || product === "subscription") {
        // "subscription" = legacy checkouts from before the Seeker/Plus split.
        const plan = product === "plus" ? "plus" : "seeker";
        let periodStart: string | null = new Date().toISOString();
        let periodEnd: string | null = null;
        if (session.subscription) {
          try {
            const sub = (await stripe.subscriptions.retrieve(session.subscription)) as any;
            periodStart = iso(sub.current_period_start) ?? periodStart;
            periodEnd = iso(sub.current_period_end);
          } catch (err: any) {
            console.error("webhook: could not read subscription period:", err.message);
          }
        }
        const { error } = await db.from("entitlements").upsert({
          visitor_id: visitorId,
          stripe_customer_id: session.customer,
          stripe_subscription_id: session.subscription,
          status: "active",
          plan,
          current_period_start: periodStart,
          current_period_end: periodEnd,
          updated_at: new Date().toISOString(),
        });
        if (error) console.error("webhook: subscription upsert failed:", error.message);
      }
      break;
    }

    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      // Renewals move current_period_start forward, which automatically
      // resets the monthly reading count (lib/session.ts).
      const sub = event.data.object as any;
      const status =
        event.type === "customer.subscription.deleted"
          ? "canceled"
          : sub.status === "active" || sub.status === "trialing"
          ? "active"
          : sub.status;
      const update: Record<string, unknown> = {
        status,
        current_period_start: iso(sub.current_period_start),
        current_period_end: iso(sub.current_period_end),
        updated_at: new Date().toISOString(),
      };
      if (sub.metadata?.plan === "seeker" || sub.metadata?.plan === "plus") update.plan = sub.metadata.plan;
      const { error } = await db.from("entitlements").update(update).eq("stripe_subscription_id", sub.id);
      if (error) console.error("webhook: subscription update failed:", error.message);
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
