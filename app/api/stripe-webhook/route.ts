import { NextRequest, NextResponse } from "next/server";
import { stripeClient } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs"; // needs raw body access + Stripe SDK

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
        // Unlimited readings for the next 24h — stored as an entitlement,
        // same mechanism as a subscription, just with a short expiry and a
        // distinct status so the UI/DB can tell them apart. The fair-use
        // daily cap (lib/session.ts) still applies even during this window.
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
        await db.from("entitlements").upsert({
          visitor_id: visitorId,
          stripe_customer_id: session.customer,
          status: "day_pass",
          current_period_end: expires,
          updated_at: new Date().toISOString(),
        });
      } else if (product === "subscription") {
        await db.from("entitlements").upsert({
          visitor_id: visitorId,
          stripe_customer_id: session.customer,
          stripe_subscription_id: session.subscription,
          status: "active",
          updated_at: new Date().toISOString(),
        });
      }
      break;
    }

    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object as any;
      const status = sub.status === "active" || sub.status === "trialing" ? "active" : sub.status;
      await db
        .from("entitlements")
        .update({
          status,
          current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("stripe_subscription_id", sub.id);
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}

