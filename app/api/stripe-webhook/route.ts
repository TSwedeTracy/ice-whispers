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

      if (product === "topup") {
        const today = new Date().toISOString().slice(0, 10);
        await db.from("usage_daily").upsert(
          {
            visitor_id: visitorId,
            usage_date: today,
            extra_readings_purchased: 5, // "5 more digital rune readings today"
          },
          { onConflict: "visitor_id,usage_date" }
        );
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
