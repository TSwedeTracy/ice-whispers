import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";
import { supabaseAdmin } from "./supabase";
import { LIMITS } from "./stripe";
import type { CurrentUser } from "./auth";

const VISITOR_COOKIE = "iw_visitor";
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Gets (or creates) the visitor id for the current request (a long-lived
 * httpOnly cookie) and makes sure the matching row exists in Supabase.
 * Limits are always re-checked against the database, so a page refresh
 * cannot reset them.
 */
export async function getOrCreateVisitorId(): Promise<string> {
  const store = cookies();
  const existing = store.get(VISITOR_COOKIE)?.value;
  const db = supabaseAdmin();

  if (existing && UUID_RE.test(existing)) {
    // An old cookie (e.g. from before the database moved) would otherwise
    // make every later write fail with a foreign-key error.
    const { error } = await db.from("visitors").upsert({ id: existing }, { onConflict: "id", ignoreDuplicates: true });
    if (error) console.error("getOrCreateVisitorId: visitor upsert failed:", error.message);
    return existing;
  }

  const id = uuidv4();
  const { error } = await db.from("visitors").insert({ id });
  if (error) console.error("getOrCreateVisitorId: visitor insert failed:", error.message);

  store.set(VISITOR_COOKIE, id, { httpOnly: true, secure: true, sameSite: "lax", maxAge: 60 * 60 * 24 * 365, path: "/" });
  return id;
}

// ── Access ────────────────────────────────────────────────────────────────

interface EntitlementRow {
  visitor_id: string;
  user_id: string | null;
  status: string;
  plan: string | null;
  billing_interval: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
}

export interface Access {
  member: EntitlementRow | null; // active ICE WHISPERS+ membership
  dayPass: EntitlementRow | null; // active 24h pass
}

const isCurrent = (e: EntitlementRow) => !e.current_period_end || new Date(e.current_period_end) > new Date();

export async function getAccess(visitorId: string, user: CurrentUser | null): Promise<Access | null> {
  const db = supabaseAdmin();
  const filter = user ? `visitor_id.eq.${visitorId},user_id.eq.${user.id}` : `visitor_id.eq.${visitorId}`;
  const { data, error } = await db
    .from("entitlements")
    .select("visitor_id, user_id, status, plan, billing_interval, current_period_start, current_period_end")
    .or(filter);
  if (error) {
    console.error("getAccess: entitlements query failed:", error.message);
    return null;
  }
  const rows = (data ?? []) as EntitlementRow[];
  return {
    member: rows.find((e) => e.status === "active" && isCurrent(e)) ?? null,
    dayPass: rows.find((e) => e.status === "day_pass" && isCurrent(e)) ?? null,
  };
}

/**
 * Start of the current monthly window. Yearly members get a fresh pool of
 * readings every month too, counted from the day they subscribed.
 */
export function monthWindowStart(anchorIso: string | null, now = new Date()): Date {
  const anchor = anchorIso ? new Date(anchorIso) : new Date(now.getTime() - 30 * 24 * 3600 * 1000);
  let months = (now.getUTCFullYear() - anchor.getUTCFullYear()) * 12 + (now.getUTCMonth() - anchor.getUTCMonth());
  const at = (m: number) => {
    const d = new Date(anchor);
    d.setUTCMonth(anchor.getUTCMonth() + m);
    return d;
  };
  let start = at(months);
  while (start > now && months > 0) start = at(--months);
  return start;
}

async function countReadings(opts: { userId?: string; visitorId?: string; since: Date }): Promise<number | null> {
  const db = supabaseAdmin();
  let q = db.from("readings").select("id", { count: "exact", head: true }).gte("created_at", opts.since.toISOString());
  q = opts.userId ? q.eq("user_id", opts.userId) : q.eq("visitor_id", opts.visitorId!);
  const { count, error } = await q;
  if (error) {
    console.error("countReadings failed:", error.message);
    return null;
  }
  return count ?? 0;
}

export type EntitlementCheck =
  | { allowed: true; reason: "free_daily" | "day_pass" | "member"; remaining?: number }
  | { allowed: false; reason: "limit_reached" | "day_pass_used" | "monthly_quota" | "locked_spread"; suggestUpsell: true }
  | { allowed: false; reason: "fair_use_cap" | "service_unavailable"; suggestUpsell: false };

/**
 * The ONLY place that decides whether a reading may start. Server-side,
 * fails closed (a broken database never turns into free AI calls).
 *
 *  - Free: one Daily Rune per UTC day.
 *  - Unlock 24 hours ($1): up to LIMITS.dayPassReadings readings, all spreads.
 *  - ICE WHISPERS+: all spreads, a pool of LIMITS.memberReadingsPerMonth
 *    readings per month — unused readings stay available all month.
 *  - Everyone: LIMITS.burstPerHour per hour (stops bots, never people).
 */
export async function checkAndConsumeEntitlement(
  visitorId: string,
  user: CurrentUser | null,
  spread: "daily" | "three_norns" | "five_cross"
): Promise<EntitlementCheck> {
  const fail = { allowed: false as const, reason: "service_unavailable" as const, suggestUpsell: false as const };
  const access = await getAccess(visitorId, user);
  if (!access) return fail;

  const lastHour = await countReadings({
    userId: user?.id,
    visitorId,
    since: new Date(Date.now() - 3600 * 1000),
  });
  if (lastHour === null) return fail;
  if (lastHour >= LIMITS.burstPerHour) return { allowed: false, reason: "fair_use_cap", suggestUpsell: false };

  // ICE WHISPERS+ member
  if (access.member) {
    const since = monthWindowStart(access.member.current_period_start);
    const used = await countReadings({ userId: access.member.user_id ?? undefined, visitorId: access.member.visitor_id, since });
    if (used === null) return fail;
    if (used >= LIMITS.memberReadingsPerMonth) return { allowed: false, reason: "monthly_quota", suggestUpsell: true };
    return { allowed: true, reason: "member", remaining: LIMITS.memberReadingsPerMonth - used - 1 };
  }

  // "Unlock 24 hours" gives every spread (up to LIMITS.dayPassReadings).
  const useDayPass = async (): Promise<EntitlementCheck> => {
    const since = new Date(access.dayPass!.current_period_start ?? Date.now() - 24 * 3600 * 1000);
    const used = await countReadings({ visitorId: access.dayPass!.visitor_id, since });
    if (used === null) return fail;
    if (used >= LIMITS.dayPassReadings) return { allowed: false, reason: "day_pass_used", suggestUpsell: true };
    return { allowed: true, reason: "day_pass", remaining: LIMITS.dayPassReadings - used - 1 };
  };

  // Three Norns / Five Rune Cross: members (above) or an active 24-hour unlock.
  if (spread !== "daily") {
    return access.dayPass ? useDayPass() : { allowed: false, reason: "locked_spread", suggestUpsell: true };
  }

  const db = supabaseAdmin();
  const today = new Date().toISOString().slice(0, 10);
  const { data: usage, error: usageError } = await db
    .from("usage_daily")
    .select("free_reading_used")
    .eq("visitor_id", visitorId)
    .eq("usage_date", today)
    .maybeSingle();
  if (usageError) {
    console.error("checkAndConsumeEntitlement: usage_daily query failed:", usageError.message);
    return fail;
  }

  // The free Daily Rune comes first, even for day-pass holders.
  if (!usage?.free_reading_used) {
    const { error } = await db
      .from("usage_daily")
      .upsert({ visitor_id: visitorId, usage_date: today, free_reading_used: true }, { onConflict: "visitor_id,usage_date" });
    if (error) {
      console.error("checkAndConsumeEntitlement: usage_daily upsert failed:", error.message);
      return fail;
    }
    return { allowed: true, reason: "free_daily" };
  }

  if (access.dayPass) return useDayPass();

  return { allowed: false, reason: "limit_reached", suggestUpsell: true };
}
