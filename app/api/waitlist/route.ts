import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const email = String(body.email ?? "").trim().toLowerCase();
  const firstName = body.firstName ? String(body.firstName).trim() : null;
  const country = body.country ? String(body.country).trim() : null;
  const source = body.source ? String(body.source) : "unknown";

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!emailValid) {
    return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  }

  const db = supabaseAdmin();
  const { error } = await db
    .from("waitlist")
    .upsert({ email, first_name: firstName, country, source, consent: true }, { onConflict: "email" });

  if (error) {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
