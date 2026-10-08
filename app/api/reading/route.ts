import { NextRequest, NextResponse } from "next/server";
import { generateReading } from "@/lib/ai";
import { getOrCreateVisitorId } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase";
import { checkQuestionSafety, safetyMessageFor } from "@/lib/safety";
import { verifyDraw, hashQuestion } from "@/lib/draw-token";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);

  if (!body?.question || !body?.drawToken) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const question: string = String(body.question).slice(0, 500);
  const visitorId = await getOrCreateVisitorId();

  // Only generate a reading for a real draw from /api/draw (which enforced
  // the free limit / payment), for this visitor and this exact question.
  // The cards come from the signed token — never from the browser.
  const draw = await verifyDraw(body.drawToken);
  if (!draw || draw.v !== visitorId || draw.q !== (await hashQuestion(question))) {
    return NextResponse.json({ error: "invalid_draw", message: "Please draw your rune again." }, { status: 403 });
  }

  // Checked again so the safety rule can't be skipped by calling this
  // endpoint directly.
  const safety = await checkQuestionSafety(question);
  if (safety.category !== "ok") {
    return NextResponse.json({ blocked: safetyMessageFor(safety.category, safety.language) });
  }

  const db = supabaseAdmin();

  // Each draw can only be read once. If it already was (e.g. a refresh),
  // return the stored reading instead of paying for a new AI call.
  const { data: existing } = await db
    .from("readings")
    .select("id, created_at, answer, reading, guidance, whisper")
    .eq("id", draw.id)
    .maybeSingle();
  if (existing) {
    return NextResponse.json({
      answer: existing.answer,
      cardMeaning: existing.reading,
      interpretation: existing.guidance,
      whisper: existing.whisper,
      id: existing.id,
      createdAt: existing.created_at,
    });
  }

  const reading = await generateReading(question, draw.c, draw.s);

  // Store so reopening history never regenerates (cost control).
  const { data, error } = await db
    .from("readings")
    .insert({
      id: draw.id,
      visitor_id: visitorId,
      spread_type: draw.s,
      question,
      cards: draw.c,
      answer: reading.answer,
      reading: reading.cardMeaning,
      guidance: reading.interpretation,
      whisper: reading.whisper,
    })
    .select("id, created_at")
    .single();

  if (error) {
    console.error("Failed to store reading:", error.message);
  }

  return NextResponse.json({
    ...reading,
    id: data?.id ?? null,
    createdAt: data?.created_at ?? new Date().toISOString(),
  });
}
