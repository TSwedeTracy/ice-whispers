import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getOrCreateVisitorId, getAccess } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "edge";

const FIELDS = "id, created_at, updated_at, spread_type, question, cards, answer, reading, guidance, whisper, notes, outcome_notes, language";

// The personal rune journal — ICE WHISPERS+ members only, and only
// readings the member chose to save. Nobody else can read them.
async function requireMember() {
  const user = await getCurrentUser();
  if (!user) return { error: NextResponse.json({ error: "signed_out" }, { status: 401 }) };
  const visitorId = await getOrCreateVisitorId();
  const access = await getAccess(visitorId, user);
  if (!access?.member) return { error: NextResponse.json({ error: "members_only" }, { status: 403 }) };
  return { user, visitorId };
}

export async function GET() {
  const auth = await requireMember();
  if ("error" in auth) return auth.error;
  const { data, error } = await supabaseAdmin()
    .from("readings")
    .select(FIELDS)
    .eq("user_id", auth.user.id)
    .eq("saved", true)
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) return NextResponse.json({ error: "service_unavailable" }, { status: 503 });
  return NextResponse.json({ entries: data ?? [] });
}

// Save a reading, or update its notes / "what happened next".
export async function PATCH(req: NextRequest) {
  const auth = await requireMember();
  if ("error" in auth) return auth.error;
  const body = await req.json().catch(() => ({}));
  const id = String(body.id ?? "");
  const db = supabaseAdmin();

  const { data: row } = await db.from("readings").select("id, user_id, visitor_id").eq("id", id).maybeSingle();
  const owns = row && (row.user_id === auth.user.id || (!row.user_id && row.visitor_id === auth.visitorId));
  if (!owns) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const update: Record<string, unknown> = { user_id: auth.user.id, updated_at: new Date().toISOString() };
  if (body.saved === true) update.saved = true;
  if (typeof body.notes === "string") update.notes = body.notes.slice(0, 5000);
  if (typeof body.outcome === "string") update.outcome_notes = body.outcome.slice(0, 5000);

  const { data, error } = await db.from("readings").update(update).eq("id", id).select(FIELDS).single();
  if (error) return NextResponse.json({ error: "service_unavailable" }, { status: 503 });
  return NextResponse.json({ entry: data });
}

// Remove from the journal — the text is erased immediately.
export async function DELETE(req: NextRequest) {
  const auth = await requireMember();
  if ("error" in auth) return auth.error;
  const body = await req.json().catch(() => ({}));
  const { error } = await supabaseAdmin()
    .from("readings")
    .update({ saved: false, question: "", reading: "", guidance: "", whisper: "", notes: null, outcome_notes: null, suggestions: null })
    .eq("id", String(body.id ?? ""))
    .eq("user_id", auth.user.id);
  if (error) return NextResponse.json({ error: "service_unavailable" }, { status: 503 });
  return NextResponse.json({ ok: true });
}
