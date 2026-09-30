import { NextRequest, NextResponse } from "next/server";
import { drawSpread } from "@/lib/runes";
import { getOrCreateVisitorId, checkAndConsumeEntitlement } from "@/lib/session";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const spread: "daily" | "three_norns" | "five_cross" = body.spread ?? "daily";

  const visitorId = await getOrCreateVisitorId();
  const entitlement = await checkAndConsumeEntitlement(visitorId);

  if (!entitlement.allowed && entitlement.reason === "service_unavailable") {
    // The database itself is unreachable/misconfigured — fail closed
    // rather than silently granting unlimited free readings. Distinct
    // from limit_reached so the frontend doesn't show "you've used
    // today's reading" when that isn't actually true.
    return NextResponse.json(
      { error: "service_unavailable", message: "The runes are unreachable right now — try again shortly." },
      { status: 503 }
    );
  }

  if (!entitlement.allowed && entitlement.reason === "fair_use_cap") {
    // They already have an unlimited grant (day pass or subscription) but
    // hit the fair-use ceiling for today — don't upsell, they already paid.
    return NextResponse.json(
      {
        error: "fair_use_cap",
        message: "You've reached today's fair-use limit — more readings unlock again tomorrow.",
      },
      { status: 429 }
    );
  }

  if (!entitlement.allowed) {
    return NextResponse.json(
      {
        error: "limit_reached",
        message: "You've used today's free reading.",
        upsell: {
          dayPass: { label: "Continue Today — $1", priceId: "dayPass" },
          subscription: { label: "Go Unlimited — $4.90/month", priceId: "subscription" },
        },
      },
      { status: 402 }
    );
  }

  const cardCount = spread === "daily" ? 1 : spread === "three_norns" ? 3 : 5;
  const positions =
    spread === "three_norns"
      ? ["Urd — Past", "Verdandi — Present", "Skuld — What May Come"]
      : spread === "five_cross"
      ? [
          "Heart of the situation",
          "Past influence",
          "Where this is heading",
          "Guidance",
          "Hidden challenge",
        ]
      : [null];

  const cards = drawSpread(cardCount).map(({ rune, reversed }, i) => ({
    runeId: rune.id,
    reversed,
    position: positions[i] ?? undefined,
  }));

  return NextResponse.json({ cards, entitlementReason: entitlement.reason });
}

