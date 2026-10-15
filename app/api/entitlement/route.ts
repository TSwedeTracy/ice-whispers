import { NextRequest, NextResponse } from "next/server";
import { getOrCreateVisitorId, getAccess, monthWindowStart } from "@/lib/session";
import { getCurrentUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { LIMITS } from "@/lib/stripe";
import { displayPrices, resolveCurrency } from "@/lib/pricing";
import { firstTouchFrom } from "@/lib/traffic";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  // The start page's first request says where a new visitor came from.
  const p = req.nextUrl.searchParams;
  const visitorId = await getOrCreateVisitorId(p.has("src") || p.has("ref") ? firstTouchFrom(p) : undefined);
  const user = await getCurrentUser();
  const access = await getAccess(visitorId, user);

  let readingsLeft: number | null = null;
  if (access?.member) {
    const since = monthWindowStart(access.member.current_period_start).toISOString();
    let q = supabaseAdmin().from("readings").select("id", { count: "exact", head: true }).gte("created_at", since);
    q = access.member.user_id ? q.eq("user_id", access.member.user_id) : q.eq("visitor_id", access.member.visitor_id);
    const { count } = await q;
    readingsLeft = Math.max(0, LIMITS.memberReadingsPerMonth - (count ?? 0));
  }

  return NextResponse.json({
    isPlus: Boolean(access?.member),
    spreadsUnlocked: Boolean(access?.member || access?.dayPass), // Three Norns + Five Rune Cross
    interval: access?.member?.billing_interval ?? null,
    readingsLeft,
    hasDayPass: Boolean(access?.dayPass),
    // Membership period, and whether it has been cancelled (ends, not renewed).
    periodEnd: access?.member?.current_period_end ?? null,
    cancelling: Boolean(access?.member?.cancel_at_period_end),
    dayPassCredit: access?.dayPass?.plan === "daypass_paid" && !access?.member, // $1 credited toward membership
    user: user ? { email: user.email } : null,
    // One currency per visitor, ready-formatted for the paywall.
    prices: displayPrices(resolveCurrency(access, req.headers.get("x-vercel-ip-country"))),
  });
}
