import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";
import { supabaseAdmin } from "./supabase";
import { FAIR_USE_DAILY_CAP, monthlyQuotaFor } from "./stripe";

const VISITOR_COOKIE = "iw_visitor";
const FREE_LIMIT_PER_DAY = 1; // one free Daily Rune reading per 24h

/**
 * Gets (or creates) the visitor id for the current request, and ensures a
 * matching row exists in Supabase. The cookie is httpOnly and long-lived so
 * a page refresh cannot reset the free limit — enforcement below is always
 * re-checked against the database, never trusted from the client.
 */
export async function getOrCreateVisitorId(): Promise<string> {
  const store = cookies();
  const existing = store.get(VISITOR_COOKIE)?.value;

  if (existing) {
    return existing;
  }

  const id = uuidv4();
  const db = supabaseAdmin();
  await db.from("visitors").insert({ id }).select().single();

  store.set(VISITOR_COOKIE, id, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: "/",
  });

  return id;
}

export type EntitlementCheck =
  | { allowed: true; reason: "free_daily" | "extra_purchased" | "subscription" | "day_pass" }
  | { allowed: false; reason: "limit_reached"; suggestUpsell: true }
  | { allowed: false; reason: "fair_use_cap"; suggestUpsell: false }
  | { allowed: false; reason: "monthly_quota"; suggestUpsell: true; plan: string | null }
  | { allowed: false; reason: "service_unavailable"; suggestUpsell: false };

/**
 * Server-side gate for every reading request. This is the ONLY place that
 * decides whether a reading is allowed — never trust a client-side counter.
 *
 * FAILS CLOSED: if the database itself is unreachable or misconfigured
 * (wrong SUPABASE_URL/key, table missing, etc.), this returns "not
 * allowed" rather than silently granting a free reading. The alternative
 * — failing open — means a broken DB connection turns into unlimited free
 * AI calls for every visitor, which is a real cost risk, not just a
 * missing feature. Any DB error here is also logged so it's diagnosable
 * from Vercel's function logs instead of failing silently.
 *
 * SUBSCRIPTIONS: Seeker ($5.90/month) = 100 readings per billing period,
 * ICE WHISPERS+ ($9.90/month) = 500. Usage is counted from the readings
 * table since entitlements.current_period_start, so it resets automatically
 * when Stripe renews the subscription.
 *
 * FAIR USE CAP: every paid option (day pass and subscriptions) is also
 * capped at FAIR_USE_DAILY_CAP readings per calendar day, tracked via
 * usage_daily.readings_today, so a script can never turn a purchase into
 * unbounded AI cost. See lib/stripe.ts.
 */
export async function checkAndConsumeEntitlement(visitorId: string): Promise<EntitlementCheck> {
  const db = supabaseAdmin();

  // 1. Look up any entitlement (subscription or day pass) first.
  const { data: ent, error: entError } = await db
    .from("entitlements")
    .select("status, plan, current_period_start, current_period_end")
    .eq("visitor_id", visitorId)
    .maybeSingle();

  if (entError) {
    console.error("checkAndConsumeEntitlement: entitlements query failed, failing closed:", entError.message);
    return { allowed: false, reason: "service_unavailable", suggestUpsell: false };
  }

  const hasUnlimitedGrant =
    (ent?.status === "active" || ent?.status === "day_pass") &&
    (!ent.current_period_end || new Date(ent.current_period_end) > new Date());

  // Subscriptions have a monthly reading quota (day pass does not).
  if (hasUnlimitedGrant && ent!.status === "active") {
    const periodStart = ent!.current_period_start
      ? new Date(ent!.current_period_start)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const { count, error: countError } = await db
      .from("readings")
      .select("id", { count: "exact", head: true })
      .eq("visitor_id", visitorId)
      .gte("created_at", periodStart.toISOString());
    if (countError) {
      console.error("checkAndConsumeEntitlement: monthly count failed, failing closed:", countError.message);
      return { allowed: false, reason: "service_unavailable", suggestUpsell: false };
    }
    if ((count ?? 0) >= monthlyQuotaFor(ent!.plan)) {
      return { allowed: false, reason: "monthly_quota", suggestUpsell: true, plan: ent!.plan ?? null };
    }
  }

  // 2. Today's usage row (create if missing).
  const today = new Date().toISOString().slice(0, 10);
  const { data: usage, error: usageError } = await db
    .from("usage_daily")
    .select("*")
    .eq("visitor_id", visitorId)
    .eq("usage_date", today)
    .maybeSingle();

  if (usageError) {
    console.error("checkAndConsumeEntitlement: usage_daily query failed, failing closed:", usageError.message);
    return { allowed: false, reason: "service_unavailable", suggestUpsell: false };
  }

  if (!usage) {
    // No row yet today — safe to create one. If they have an unlimited
    // grant, this first reading of the day counts toward the fair-use cap;
    // otherwise it's their free daily reading.
    const { error: insertError } = await db.from("usage_daily").insert({
      visitor_id: visitorId,
      usage_date: today,
      free_reading_used: !hasUnlimitedGrant,
      readings_today: 1,
    });
    if (insertError) {
      console.error("checkAndConsumeEntitlement: usage_daily insert failed, failing closed:", insertError.message);
      return { allowed: false, reason: "service_unavailable", suggestUpsell: false };
    }
    return { allowed: true, reason: hasUnlimitedGrant ? (ent!.status === "day_pass" ? "day_pass" : "subscription") : "free_daily" };
  }

  if (hasUnlimitedGrant) {
    if (usage.readings_today >= FAIR_USE_DAILY_CAP) {
      // They already paid — don't upsell, just ask them to wait for the
      // next day. This should be vanishingly rare for a real person.
      return { allowed: false, reason: "fair_use_cap", suggestUpsell: false };
    }
    const { error: updateError } = await db
      .from("usage_daily")
      .update({ readings_today: usage.readings_today + 1 })
      .eq("visitor_id", visitorId)
      .eq("usage_date", today);
    if (updateError) {
      console.error("checkAndConsumeEntitlement: readings_today update failed, failing closed:", updateError.message);
      return { allowed: false, reason: "service_unavailable", suggestUpsell: false };
    }
    return { allowed: true, reason: ent!.status === "day_pass" ? "day_pass" : "subscription" };
  }

  if (!usage.free_reading_used) {
    await db
      .from("usage_daily")
      .update({ free_reading_used: true, readings_today: usage.readings_today + 1 })
      .eq("visitor_id", visitorId)
      .eq("usage_date", today);
    return { allowed: true, reason: "free_daily" };
  }

  if (usage.extra_readings_used < usage.extra_readings_purchased) {
    await db
      .from("usage_daily")
      .update({ extra_readings_used: usage.extra_readings_used + 1, readings_today: usage.readings_today + 1 })
      .eq("visitor_id", visitorId)
      .eq("usage_date", today);
    return { allowed: true, reason: "extra_purchased" };
  }

  return { allowed: false, reason: "limit_reached", suggestUpsell: true };
}

export { FREE_LIMIT_PER_DAY };

