import { NextRequest, NextResponse } from "next/server";
import { stripeClient } from "@/lib/stripe";
import { getOrCreateVisitorId, getAccess } from "@/lib/session";
import { getCurrentUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

// "Manage membership": opens Stripe's customer portal, where members cancel
// (at the end of the paid period), change card and download receipts.
// Portal settings live in Stripe → Settings → Billing → Customer portal.
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Please sign in first." }, { status: 401 });

  const visitorId = await getOrCreateVisitorId();
  const access = await getAccess(visitorId, user);
  const db = supabaseAdmin();
  const { data } = await db
    .from("entitlements")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .not("stripe_customer_id", "is", null)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const customer = data?.stripe_customer_id ?? null;
  if (!customer || !access) {
    return NextResponse.json(
      { message: "We couldn't find a membership on this account. Email contact@icewhispers.com and we'll help." },
      { status: 404 }
    );
  }

  const origin = req.headers.get("origin") ?? process.env.PUBLIC_SITE_URL ?? "https://www.icewhispers.com";
  try {
    const session = await stripeClient().billingPortal.sessions.create({
      customer,
      return_url: `${origin}/account`,
      ...(process.env.STRIPE_PORTAL_CONFIG ? { configuration: process.env.STRIPE_PORTAL_CONFIG } : {}),
    });
    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("portal failed:", err?.message);
    return NextResponse.json({ message: "The membership page could not open — please try again." }, { status: 500 });
  }
}
