import { NextRequest, NextResponse } from "next/server";
import { stripeClient, PRICING } from "@/lib/stripe";
import { getOrCreateVisitorId } from "@/lib/session";

export const runtime = "nodejs"; // Stripe SDK needs the Node runtime, not edge

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const product: "topup" | "subscription" = body.product;

  if (product !== "topup" && product !== "subscription") {
    return NextResponse.json({ error: "invalid_product" }, { status: 400 });
  }

  const visitorId = await getOrCreateVisitorId();
  const stripe = stripeClient();
  const origin = req.headers.get("origin") ?? process.env.PUBLIC_SITE_URL ?? "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: product === "subscription" ? "subscription" : "payment",
    client_reference_id: visitorId,
    metadata: { visitor_id: visitorId, product },
    line_items: [
      product === "subscription"
        ? {
            price_data: {
              currency: PRICING.subscription.currency,
              product_data: { name: PRICING.subscription.label, description: PRICING.subscription.description },
              recurring: { interval: PRICING.subscription.interval },
              unit_amount: PRICING.subscription.amountCents,
            },
            quantity: 1,
          }
        : {
            price_data: {
              currency: PRICING.topUp.currency,
              product_data: { name: PRICING.topUp.label, description: PRICING.topUp.description },
              unit_amount: PRICING.topUp.amountCents,
            },
            quantity: 1,
          },
    ],
    success_url: `${origin}/?checkout=success`,
    cancel_url: `${origin}/?checkout=cancelled`,
  });

  return NextResponse.json({ url: session.url });
}
