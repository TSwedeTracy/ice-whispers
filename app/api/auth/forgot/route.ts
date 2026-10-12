import { NextRequest, NextResponse } from "next/server";
import { authClient, isValidEmail } from "@/lib/auth";

export const runtime = "edge";

// Sends a password-reset email through Supabase Auth. NOTE: Supabase only
// delivers to real customers once custom SMTP (e.g. Resend) is configured
// in Supabase → Authentication → Emails → SMTP settings.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const email = String(body.email ?? "").trim().toLowerCase();
  if (!isValidEmail(email)) return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });

  const origin = req.headers.get("origin") ?? process.env.PUBLIC_SITE_URL ?? "https://www.icewhispers.com";
  await authClient().auth.resetPasswordForEmail(email, { redirectTo: `${origin}/reset-password` });
  // Same answer whether or not the account exists (don't reveal who has an account).
  return NextResponse.json({ ok: true });
}
