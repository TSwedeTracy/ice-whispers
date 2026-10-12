import { NextRequest, NextResponse } from "next/server";
import { drawSpread } from "@/lib/runes";
import { getOrCreateVisitorId, checkAndConsumeEntitlement } from "@/lib/session";
import { getCurrentUser } from "@/lib/auth";
import { checkQuestionSafety, safetyMessageFor } from "@/lib/safety";
import { signDraw, hashQuestion } from "@/lib/draw-token";
import { dailyRuneFor } from "@/lib/daily-rune";

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
  // never read — checked before any rune is drawn or any reading is used up.
  const safety = await checkQuestionSafety(question);
  if (safety.category !== "ok") {
    return NextResponse.json({ blocked: safetyMessageFor(safety.category, safety.language) });
  }

  const visitorId = await getOrCreateVisitorId();
  const user = await getCurrentUser();
  const entitlement = await checkAndConsumeEntitlement(visitorId, user, spread);

  if (!entitlement.allowed && entitlement.reason === "service_unavailable") {
    return NextResponse.json(
      { error: "service_unavailable", message: "The runes are unreachable right now — try again shortly." },
      { status: 503 }
    );
  }

  if (!entitlement.allowed && entitlement.reason === "fair_use_cap") {
    return NextResponse.json(
      { error: "fair_use_cap", message: "The runes need a short rest — please try again in a little while." },
      { status: 429 }
    );
  }

  if (!entitlement.allowed) {
    return NextResponse.json({ error: entitlement.reason, signedIn: Boolean(user) }, { status: 402 });
  }

  const cardCount = spread === "daily" ? 1 : spread === "three_norns" ? 3 : 5;
  const positions =
    spread === "three_norns"
      ? ["Urd — Past", "Verdandi — Present", "Skuld — What May Come"]
      : spread === "five_cross"
      ? ["Heart of the situation", "Past influence", "Where this is heading", "Guidance", "Hidden challenge"]
      : [null];

  // The first free reading of the day is "today's rune": the same rune for
  // this person all day (and in the daily email later on).
  const drawn =
    entitlement.reason === "free_daily"
      ? [await dailyRuneFor(user?.id ?? visitorId, new Date().toISOString().slice(0, 10))]
      : drawSpread(cardCount);

  const cards = drawn.map(({ rune, reversed }, i) => ({
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

  return NextResponse.json({ cards, drawToken, entitlementReason: entitlement.reason, remaining: entitlement.remaining ?? null });
}
