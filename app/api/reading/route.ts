import { NextRequest, NextResponse } from "next/server";
import { generateReading } from "@/lib/ai";
import { getOrCreateVisitorId } from "@/lib/session";
import { getCurrentUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { quickSafetyCheck, safetyMessageFor } from "@/lib/safety";
import { verifyDraw, hashQuestion } from "@/lib/draw-token";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);

  if (!body?.question || !body?.drawToken) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const question: string = String(body.question).slice(0, 500);
  const visitorId = await getOrCreateVisitorId();

  // Only read a real draw from /api/draw (which enforced limits and the full
  // safety check) for this visitor and this exact question. The cards come
  // from the signed token — never from the browser.
  const draw = await verifyDraw(body.drawToken);
  if (!draw || draw.v !== visitorId || draw.q !== (await hashQuestion(question))) {
    return NextResponse.json({ error: "invalid_draw", message: "Please draw your rune again." }, { status: 403 });
  }

  // Extra (free) keyword check — the full AI safety check already ran at the draw.
  const category = quickSafetyCheck(question);
  if (category !== "ok") {
    return NextResponse.json({ blocked: safetyMessageFor(category, "en") });
  }

  const db = supabaseAdmin();
  const user = await getCurrentUser();

  // Each draw is read once. A refresh returns the stored reading for free.
  const { data: existing } = await db
    .from("readings")
    .select("id, created_at, answer, reading, guidance, whisper, suggestions, saved")
    .eq("id", draw.id)
    .maybeSingle();
  if (existing) {
    return NextResponse.json({
      answer: existing.answer,
      cardMeaning: existing.reading,
      interpretation: existing.guidance,
      whisper: existing.whisper,
      suggestions: existing.suggestions ?? [],
      id: existing.id,
      saved: existing.saved,
      createdAt: existing.created_at,
    });
  }

  const reading = await generateReading(question, draw.c, draw.s);

  // Stored so history never regenerates. Not shown in the journal unless the
  // member chooses "Save to journal"; unsaved text is erased after 24 hours.
  const { data, error } = await db
    .from("readings")
    .insert({
      id: draw.id,
      visitor_id: visitorId,
      user_id: user?.id ?? null,
      spread_type: draw.s,
      question,
      cards: draw.c,
      answer: reading.answer,
      reading: reading.cardMeaning,
      guidance: reading.interpretation,
      whisper: reading.whisper,
      suggestions: reading.suggestions ?? [],
      language: reading.language ?? null,
    })
    .select("id, created_at")
    .single();

  if (error) {
    console.error("Failed to store reading:", error.message);
  }

  return NextResponse.json({
    ...reading,
    id: data?.id ?? null,
    saved: false,
    createdAt: data?.created_at ?? new Date().toISOString(),
  });
}
