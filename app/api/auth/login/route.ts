import { NextRequest, NextResponse } from "next/server";
import { authClient, setSessionCookies } from "@/lib/auth";
import { getOrCreateVisitorId } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");

  const { data, error } = await authClient().auth.signInWithPassword({ email, password });
  if (error || !data.session) {
    return NextResponse.json({ error: "Wrong email or password." }, { status: 401 });
  }

  setSessionCookies(data.session);

  const visitorId = await getOrCreateVisitorId();
  const db = supabaseAdmin();
  await db.from("visitors").update({ user_id: data.user.id }).eq("id", visitorId);
  await db.from("entitlements").update({ user_id: data.user.id }).eq("visitor_id", visitorId).is("user_id", null);

  return NextResponse.json({ ok: true, email });
}
