import { NextRequest, NextResponse } from "next/server";
import { generateReading, DrawnCard, SpreadType } from "@/lib/ai";
import { getOrCreateVisitorId } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);

  if (!body?.question || !Array.isArray(body?.cards) || body.cards.length === 0) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const question: string = String(body.question).slice(0, 500); // guard against abuse
  const spread: SpreadType = body.spread ?? "daily";
  const cards: DrawnCard[] = body.cards;

  const visitorId = await getOrCreateVisitorId();

  const reading = await generateReading(question, cards, spread);

  // Store so reopening history never regenerates (cost control).
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("readings")
    .insert({
      visitor_id: visitorId,
      spread_type: spread,
      question,
      cards,
      answer: reading.answer,
      reading: reading.reading,
      guidance: reading.guidance,
      whisper: reading.whisper,
    })
    .select("id, created_at")
    .single();

  if (error) {
    // Non-fatal: still return the reading even if history logging fails.
    console.error("Failed to store reading:", error.message);
  }

  return NextResponse.json({
    ...reading,
    id: data?.id ?? null,
    createdAt: data?.created_at ?? new Date().toISOString(),
  });
}
