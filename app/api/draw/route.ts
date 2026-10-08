import { NextRequest, NextResponse } from "next/server";
import { drawSpread } from "@/lib/runes";
import { getOrCreateVisitorId, checkAndConsumeEntitlement } from "@/lib/session";
import { checkQuestionSafety, safetyMessageFor } from "@/lib/safety";
import { signDraw, hashQuestion } from "@/lib/draw-token";

export const runtime = "edge";

const SPREADS = ["daily", "three_norns", "five_cross"] as const;
type Spread = (typeof SPREADS)[number];

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const spread: Spread = SPREADS.includes(body.spread) ? body.spread : "daily";
  const question = String(body.question ?? "").slice(0, 500);

  if (question.trim().length < 3) {
    return NextResponse.json({ error: "invalid_request", message: "Please write your question first." }, { status: 400 });
  }

  // SAFETY FIRST: questions about self-harm, hurting someone or crime are
  // never read. Checked before any rune is drawn and before the free/paid
  // reading is used up, so the person isn't charged for it.
  const safety = await checkQuestionSafety(question);
  if (safety.category !== "ok") {
    return NextResponse.json({ blocked: safetyMessageFor(safety.category, safety.language) });
  }

  const visitorId = await getOrCreateVisitorId();
  const entitlement = await checkAndConsumeEntitlement(visitorId);

  if (!entitlement.allowed && entitlement.reason === "service_unavailable") {
    return NextResponse.json(
      { error: "service_unavailable", message: "The runes are unreachable right now — try again shortly." },
      { status: 503 }
    );
  }

  if (!entitlement.allowed && entitlement.reason === "fair_use_cap") {
    return NextResponse.json(
      { error: "fair_use_cap", message: "You've reached today's fair-use limit — more readings unlock again tomorrow." },
      { status: 429 }
    );
  }

  if (!entitlement.allowed) {
    return NextResponse.json(
      {
        error: entitlement.reason, // "limit_reached" | "monthly_quota"
        message:
          entitlement.reason === "monthly_quota"
            ? "You've used all readings in your plan this month."
            : "You've used today's free reading.",
      },
      { status: 402 }
    );
  }

  // Multi-rune spreads are for Seeker / ICE WHISPERS+ subscribers (and day pass).
  if (spread !== "daily" && (entitlement.reason === "free_daily" || entitlement.reason === "extra_purchased")) {
    return NextResponse.json({ error: "locked_spread", message: "This spread is part of a monthly plan." }, { status: 402 });
  }

  const cardCount = spread === "daily" ? 1 : spread === "three_norns" ? 3 : 5;
  const positions =
    spread === "three_norns"
      ? ["Urd — Past", "Verdandi — Present", "Skuld — What May Come"]
      : spread === "five_cross"
      ? ["Heart of the situation", "Past influence", "Where this is heading", "Guidance", "Hidden challenge"]
      : [null];

  const cards = drawSpread(cardCount).map(({ rune, reversed }, i) => ({
    runeId: rune.id,
    reversed,
    position: positions[i] ?? undefined,
  }));

  const drawToken = await signDraw({
    id: crypto.randomUUID(),
    v: visitorId,
    s: spread,
    c: cards,
    q: await hashQuestion(question),
    t: Date.now(),
  });

  return NextResponse.json({ cards, drawToken, entitlementReason: entitlement.reason });
}
