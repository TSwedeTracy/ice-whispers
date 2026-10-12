import { NextRequest, NextResponse } from "next/server";
import { authClient, setSessionCookies, isValidEmail } from "@/lib/auth";
import { getOrCreateVisitorId } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");

  if (!isValidEmail(email)) return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  if (body.accepted !== true) return NextResponse.json({ error: "Please accept the Terms and Privacy Policy." }, { status: 400 });
  if (password.length < 8) return NextResponse.json({ error: "Your password needs at least 8 characters." }, { status: 400 });

  const client = authClient();
  // Created as confirmed, so signing up works without a confirmation email.
  const { error: createError } = await client.auth.admin.createUser({ email, password, email_confirm: true });
  if (createError) {
    const exists = /already|registered|exists/i.test(createError.message);
    return NextResponse.json(
      { error: exists ? "An account with this email already exists — please sign in." : "Could not create your account. Please try again." },
      { status: exists ? 409 : 400 }
    );
  }

  const { data, error } = await authClient().auth.signInWithPassword({ email, password });
  if (error || !data.session) return NextResponse.json({ error: "Account created — please sign in." }, { status: 200 });

  setSessionCookies(data.session);
  await linkVisitor(data.user.id);
  return NextResponse.json({ ok: true, email });
}

// Attach anything bought in this browser before signing up to the account.
async function linkVisitor(userId: string) {
  const visitorId = await getOrCreateVisitorId();
  const db = supabaseAdmin();
  await db.from("visitors").update({ user_id: userId }).eq("id", visitorId);
  await db.from("entitlements").update({ user_id: userId }).eq("visitor_id", visitorId).is("user_id", null);
}
