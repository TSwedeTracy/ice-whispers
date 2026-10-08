import { NextResponse } from "next/server";
import { getOrCreateVisitorId } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "edge";

export async function GET() {
  const visitorId = await getOrCreateVisitorId();
  const db = supabaseAdmin();

  const { data: ent } = await db
    .from("entitlements")
    .select("status, plan, current_period_end")
    .eq("visitor_id", visitorId)
    .maybeSingle();

  const current = !ent?.current_period_end || new Date(ent.current_period_end) > new Date();
  // Seeker and ICE WHISPERS+ subscribers unlock Three Norns and Five Rune Cross.
  const isPlus = ent?.status === "active" && current;
  const hasDayPass = ent?.status === "day_pass" && current;

  return NextResponse.json({ isPlus: Boolean(isPlus), plan: isPlus ? ent?.plan ?? "seeker" : null, hasDayPass: Boolean(hasDayPass) });
}
