import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";
import { supabaseAdmin } from "./supabase";

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
  | { allowed: true; reason: "free_daily" | "extra_purchased" | "subscription" }
  | { allowed: false; reason: "limit_reached"; suggestUpsell: true };

/**
 * Server-side gate for every reading request. This is the ONLY place that
 * decides whether a reading is allowed — never trust a client-side counter.
 */
export async function checkAndConsumeEntitlement(visitorId: string): Promise<EntitlementCheck> {
  const db = supabaseAdmin();

  // 1. Active subscription -> always allowed.
  const { data: ent } = await db
    .from("entitlements")
    .select("status, current_period_end")
    .eq("visitor_id", visitorId)
    .maybeSingle();

  if (ent?.status === "active" && (!ent.current_period_end || new Date(ent.current_period_end) > new Date())) {
    return { allowed: true, reason: "subscription" };
  }

  // 2. Today's usage row (create if missing).
  const today = new Date().toISOString().slice(0, 10);
  const { data: usage } = await db
    .from("usage_daily")
    .select("*")
    .eq("visitor_id", visitorId)
    .eq("usage_date", today)
    .maybeSingle();

  if (!usage) {
    await db.from("usage_daily").insert({ visitor_id: visitorId, usage_date: today });
    await db
      .from("usage_daily")
      .update({ free_reading_used: true })
      .eq("visitor_id", visitorId)
      .eq("usage_date", today);
    return { allowed: true, reason: "free_daily" };
  }

  if (!usage.free_reading_used) {
    await db
      .from("usage_daily")
      .update({ free_reading_used: true })
      .eq("visitor_id", visitorId)
      .eq("usage_date", today);
    return { allowed: true, reason: "free_daily" };
  }

  if (usage.extra_readings_used < usage.extra_readings_purchased) {
    await db
      .from("usage_daily")
      .update({ extra_readings_used: usage.extra_readings_used + 1 })
      .eq("visitor_id", visitorId)
      .eq("usage_date", today);
    return { allowed: true, reason: "extra_purchased" };
  }

  return { allowed: false, reason: "limit_reached", suggestUpsell: true };
}

export { FREE_LIMIT_PER_DAY };
