import { NextRequest, NextResponse } from "next/server";
import { drawRandomCard } from "@/lib/runes";
import { getOrCreateVisitorId, checkAndConsumeEntitlement } from "@/lib/session";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const spread: "daily" | "three_norns" | "five_cross" = body.spread ?? "daily";

  const visitorId = await getOrCreateVisitorId();
  const entitlement = await checkAndConsumeEntitlement(visitorId);

  if (!entitlement.allowed) {
    return NextResponse.json(
      {
        error: "limit_reached",
        message: "You've used today's free reading.",
        upsell: {
          topUp: { label: "Continue Today — $0.99", priceId: "topup" },
          subscription: { label: "Go Unlimited — $4.99/month", priceId: "subscription" },
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

  const cards = Array.from({ length: cardCount }).map((_, i) => {
    const { rune, reversed } = drawRandomCard();
    return { runeId: rune.id, reversed, position: positions[i] ?? undefined };
  });

  return NextResponse.json({ cards, entitlementReason: entitlement.reason });
}
