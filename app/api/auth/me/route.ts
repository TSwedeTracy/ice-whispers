import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "edge";

export async function GET() {
  const user = await getCurrentUser();
  return NextResponse.json({ user: user ? { email: user.email } : null });
}
