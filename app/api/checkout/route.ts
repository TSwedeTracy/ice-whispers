import { NextRequest, NextResponse } from "next/server";
import { stripeClient, PRODUCT_INFO, ProductId, DAYPASS_CREDIT_COUPON, AUTOMATIC_TAX } from "@/lib/stripe";
import { PRICES, resolveCurrency } from "@/lib/pricing";
import { getOrCreateVisitorId, getAccess } from "@/lib/session";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs"; // Stripe SDK needs the Node runtime, not edge

const PRODUCTS: ProductId[] = ["dayPass", "plusMonthly", "plusYearly"];

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const product = body.product as ProductId;

  if (!PRODUCTS.includes(product)) {
    return NextResponse.json({ error: "invalid_product" }, { status: 400 });
  }
  // The buyer must accept the terms and ask for immediate start (EU
  // withdrawal rules). Recorded on the Stripe payment as evidence.
  if (body.consent !== true) {
    return NextResponse.json({ error: "consent_required" }, { status: 400 });
  }

  const visitorId = await getOrCreateVisitorId();
  const user = await getCurrentUser();

  // Membership is tied to an account so it works on every device and the
  // journal stays private. The $1 day pass needs no account.
  if (product !== "dayPass" && !user) {
    return NextResponse.json({ error: "signin_required" }, { status: 401 });
  }

  // Bought "Unlock 24 hours" in the last 24 hours? Credit that $1 toward
  // the first membership payment.
  const access = await getAccess(visitorId, user);
  const dayPassCredit = product !== "dayPass" && access?.dayPass?.plan === "daypass_paid";
  // One currency per visitor: SEK in Sweden, EUR in the EU, USD elsewhere.
  const currency = resolveCurrency(access, req.headers.get("x-vercel-ip-country"));

  const stripe = stripeClient();
  const origin = req.headers.get("origin") ?? process.env.PUBLIC_SITE_URL ?? "http://localhost:3000";
  const metadata = {
    currency,
    visitor_id: visitorId,
    product,
    user_id: user?.id ?? "",
    terms_accepted: `terms-2026-10-08 ${new Date().toISOString()}`,
    immediate_start_requested: "yes",
  };

  const session =
    product === "dayPass"
      ? await stripe.checkout.sessions.create({
          mode: "payment",
          client_reference_id: visitorId,
          metadata,
          line_items: [
            {
              price_data: {
                currency,
                product_data: { name: PRODUCT_INFO.dayPass.label, description: PRODUCT_INFO.dayPass.description },
                unit_amount: PRICES[currency].dayPass,
                tax_behavior: "inclusive",
              },
              quantity: 1,
            },
          ],
          allow_promotion_codes: true,
          ...(AUTOMATIC_TAX ? { automatic_tax: { enabled: true } } : {}),
          success_url: `${origin}/?checkout=success`,
          cancel_url: `${origin}/?checkout=cancelled`,
        })
      : await stripe.checkout.sessions.create({
          mode: "subscription",
          client_reference_id: visitorId,
          customer_email: user!.email,
          metadata,
          subscription_data: { metadata: { ...metadata, plan: "plus" } },
          line_items: [
            {
              price_data: {
                currency,
                product_data: { name: PRODUCT_INFO[product].label, description: PRODUCT_INFO[product].description },
                recurring: { interval: PRODUCT_INFO[product].interval },
                unit_amount: PRICES[currency][product],
                tax_behavior: "inclusive",
              },
              quantity: 1,
            },
          ],
          // Stripe allows either an automatic discount or promotion codes.
          // Codes (e.g. the VIP test code) are created in Stripe → Coupons.
          ...(dayPassCredit ? { discounts: [{ coupon: DAYPASS_CREDIT_COUPON }] } : { allow_promotion_codes: true }),
          // No card needed when a code makes it free.
          payment_method_collection: "if_required",
          ...(AUTOMATIC_TAX ? { automatic_tax: { enabled: true } } : {}),
          success_url: `${origin}/?checkout=success`,
          cancel_url: `${origin}/?checkout=cancelled`,
        });

  return NextResponse.json({ url: session.url });
}
