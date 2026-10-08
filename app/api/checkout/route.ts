import { NextRequest, NextResponse } from "next/server";
import { stripeClient, PRICING, ProductId } from "@/lib/stripe";
import { getOrCreateVisitorId } from "@/lib/session";

export const runtime = "nodejs"; // Stripe SDK needs the Node runtime, not edge

const PRODUCTS: ProductId[] = ["dayPass", "seeker", "plus"];

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const product = body.product as ProductId;

  if (!PRODUCTS.includes(product)) {
    return NextResponse.json({ error: "invalid_product" }, { status: 400 });
  }

  const visitorId = await getOrCreateVisitorId();
  const stripe = stripeClient();
  const origin = req.headers.get("origin") ?? process.env.PUBLIC_SITE_URL ?? "http://localhost:3000";

  const lineItem =
    product === "dayPass"
      ? {
          price_data: {
            currency: PRICING.dayPass.currency,
            product_data: { name: PRICING.dayPass.label, description: PRICING.dayPass.description },
            unit_amount: PRICING.dayPass.amountCents,
          },
          quantity: 1,
        }
      : {
          price_data: {
            currency: PRICING[product].currency,
            product_data: { name: PRICING[product].label, description: PRICING[product].description },
            recurring: { interval: PRICING[product].interval },
            unit_amount: PRICING[product].amountCents,
          },
          quantity: 1,
        };

  const session = await stripe.checkout.sessions.create({
    mode: product === "dayPass" ? "payment" : "subscription",
    client_reference_id: visitorId,
    metadata: { visitor_id: visitorId, product },
    ...(product === "dayPass" ? {} : { subscription_data: { metadata: { visitor_id: visitorId, plan: product } } }),
    line_items: [lineItem],
    success_url: `${origin}/?checkout=success`,
    cancel_url: `${origin}/?checkout=cancelled`,
  });

  return NextResponse.json({ url: session.url });
}
