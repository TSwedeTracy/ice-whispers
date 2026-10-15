import { NextRequest, NextResponse } from "next/server";
import { SHORT_LINKS } from "@/lib/traffic";

// icewhispers.com/ig, /fb, /tt → the start page, tagged with the channel.
// No cookies are set here; see lib/traffic.ts.
export function middleware(req: NextRequest) {
  const source = SHORT_LINKS[req.nextUrl.pathname.slice(1).replace(/\/$/, "").toLowerCase()];
  if (!source) return NextResponse.next();
  const home = req.nextUrl.clone();
  home.pathname = "/";
  home.search = `?src=${source}`;
  return NextResponse.redirect(home, 307);
}

// Only the short addresses (any letter case).
export const config = {
  matcher: ["/:short((?:[iI][gG]|[fF][bB]|[tT][tT])/?)"],
};
