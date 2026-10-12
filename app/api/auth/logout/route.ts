import { NextResponse } from "next/server";
import { clearSessionCookies } from "@/lib/auth";

export const runtime = "edge";

export async function POST() {
  clearSessionCookies();
  return NextResponse.json({ ok: true });
}
