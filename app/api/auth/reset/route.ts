import { NextRequest, NextResponse } from "next/server";
import { authClient, setSessionCookies } from "@/lib/auth";

export const runtime = "edge";

// Called from /reset-password with the one-time recovery tokens from the email link.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const accessToken = String(body.accessToken ?? "");
  const refreshToken = String(body.refreshToken ?? "");
  const password = String(body.password ?? "");

  if (password.length < 8) return NextResponse.json({ error: "Your password needs at least 8 characters." }, { status: 400 });

  const client = authClient();
  const { data, error } = await client.auth.getUser(accessToken);
  if (error || !data.user) {
    return NextResponse.json({ error: "This reset link has expired. Please request a new one." }, { status: 401 });
  }

  const { error: updateError } = await client.auth.admin.updateUserById(data.user.id, { password });
  if (updateError) return NextResponse.json({ error: "Could not update your password." }, { status: 400 });

  if (refreshToken) {
    const { data: refreshed } = await authClient().auth.refreshSession({ refresh_token: refreshToken });
    if (refreshed.session) setSessionCookies(refreshed.session);
  }
  return NextResponse.json({ ok: true });
}
