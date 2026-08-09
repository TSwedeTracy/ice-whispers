import { NextResponse } from "next/server";
import { getOrCreateVisitorId } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "edge";

export async function GET() {
  const visitorId = await getOrCreateVisitorId();
  const db = supabaseAdmin();

  const { data: ent } = await db
    .from("entitlements")
    .select("status, current_period_end")
    .eq("visitor_id", visitorId)
    .maybeSingle();

  const isPlus =
    ent?.status === "active" && (!ent.current_period_end || new Date(ent.current_period_end) > new Date());

  return NextResponse.json({ isPlus: Boolean(isPlus) });
}
