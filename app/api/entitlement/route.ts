import { NextResponse } from "next/server";
import { getOrCreateVisitorId, getAccess, monthWindowStart } from "@/lib/session";
import { getCurrentUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { LIMITS } from "@/lib/stripe";

export const runtime = "edge";

export async function GET() {
  const visitorId = await getOrCreateVisitorId();
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
    dayPassCredit: Boolean(access?.dayPass) && !access?.member, // $1 credited toward membership
    user: user ? { email: user.email } : null,
  });
}
