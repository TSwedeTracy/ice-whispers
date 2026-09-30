// ICE WHISPERS — Reading Engine
//
// This file is intentionally the ONLY place that talks to an AI provider.
// Swap providers by editing `generateWithProvider` — nothing else in the
// app needs to change. Without an API key, `generateWithProvider` falls
// back to `generateMock`, a rule-based generator built from the same
// structured rune data, so the product still works end-to-end.
//
// STRUCTURE (per product direction, Sept 2026): every reading has exactly
// four parts —
//   1. answer          the direct headline (YES / LIKELY YES / ... )
//   2. cardMeaning      what the rune generally means — NOT tied to the
//                       question yet (single-card spreads only; for
//                       multi-card spreads each drawn card's general
//                       meaning is already shown per-position, so this is
//                       omitted at the top level to avoid repeating it)
//   3. interpretation   the actual divination: the rune(s) read SPECIFICALLY
//                       against the person's exact question, in plain
//                       English, explaining why it leads to that answer
//   4. whisper          a deepening of the interpretation, or one concrete
//                       piece of advice for the situation — not required to
//                       be phrased as a question anymore
//
// This is the part that must NOT read like a dictionary entry — see
// "READING QUALITY" in the product spec. A rule-based template can only
// approximate that; a real model reasoning over the specific question is
// what actually delivers it, which is why `generateWithProvider` is wired
// to call Claude directly below whenever ANTHROPIC_API_KEY is set.
//
// AI COST CONTROL: the prompt sent to the model contains ONLY what's
// needed for this one reading (the drawn card(s) + the question) — never
// the full rune database and never prior conversation history. The
// `answer` headline is computed deterministically in this file, not by
// the model, so the YES/NO vocabulary never drifts and cached mock output
// stays consistent with live output.

import { Rune, YesNoTendency, getRuneById } from "./runes";

export type SpreadType = "daily" | "three_norns" | "five_cross";

export interface DrawnCard {
  runeId: number;
  reversed: boolean;
  position?: string; // e.g. "Urd — Past", "Heart of the situation"
}

export interface CardReading {
  position: string; // e.g. "Urd — Past"
  symbol: string;
  runeName: string;
  reversed: boolean;
  text: string;
}

export interface Reading {
  answer: string; // the direct YES/NO/UNCERTAIN-style headline
  cardMeaning: string; // what the card generally means, not tied to the question. Empty string for multi-card spreads (see cardReadings instead).
  interpretation: string; // the rune(s) read specifically against the person's question — the actual divination
  whisper: string; // a deepening of the interpretation, or one concrete piece of advice
  cardReadings?: CardReading[]; // present for multi-card spreads (three_norns, five_cross) — one entry per drawn card
}

const YES_NO_LABEL: Record<YesNoTendency, string> = {
  yes: "YES",
  likely_yes: "LIKELY YES",
  possibly: "POSSIBLY, BUT...",
  uncertain: "UNCERTAIN",
  not_yet: "NOT YET",
  unlikely: "UNLIKELY",
  no: "NO",
};

// For "how will X go/unfold/develop" questions — same underlying tendency,
// worded as an outcome quality rather than a yes/no.
const OUTCOME_LABEL: Record<YesNoTendency, string> = {
  yes: "GOOD",
  likely_yes: "LIKELY GOOD",
  possibly: "MIXED",
  uncertain: "UNCLEAR",
  not_yet: "NOT CLEAR YET",
  unlikely: "CHALLENGING",
  no: "DIFFICULT",
};

type QuestionKind = "yesno" | "outcome" | "open";

function classifyQuestion(question: string): QuestionKind {
  const q = question.trim().toLowerCase();

  // "How will/is/does X ..." asks about the QUALITY of an outcome, not a
  // yes/no fact — answer with good/bad/mixed, not yes/no.
  if (q.startsWith("how ")) return "outcome";

  // Other open-ended question words ("what should I do", "why", "when",
  // "where", "who") don't reduce to a short tendency word at all.
  const openEnded = ["what", "why", "when", "where", "who", "which"];
  if (openEnded.some((w) => q.startsWith(w + " "))) return "open";

  const yesNoStarters = [
    "will", "should", "can", "is", "are", "do", "does", "did",
    "would", "have", "has", "am", "was", "were",
  ];
  if (yesNoStarters.some((s) => q.startsWith(s + " "))) return "yesno";

  // This classifier only recognizes English sentence starters. A question
  // in any other language (or an unrecognized English phrasing) falls
  // through to here — default to "yesno" rather than "open", so it still
  // gets a direct YES/LIKELY YES/... headline instead of a bare rune name.
  // A live AI call (see generateWithProvider) understands the question's
  // actual content regardless of language; this default only governs the
  // deterministic headline classifier and the mock fallback.
  return "yesno";
}

function headlineFor(kind: QuestionKind, tendency: YesNoTendency, rune: Rune, reversed: boolean): string {
  if (kind === "yesno") return YES_NO_LABEL[tendency];
  if (kind === "outcome") return OUTCOME_LABEL[tendency];
  return rune.name + (reversed ? " (reversed)" : "");
}

function meaningOf(rune: Rune, reversed: boolean) {
  return reversed && rune.reversed ? rune.reversed : rune.upright;
}

function cardReadingOf(card: DrawnCard, position: string): CardReading {
  const rune = getRuneById(card.runeId);
  const meaning = meaningOf(rune, card.reversed);
  return {
    position,
    symbol: rune.symbol,
    runeName: rune.name,
    reversed: card.reversed,
    text: meaning.interpretation,
  };
}

interface SpreadContext {
  headline: string;
  headlineTendency: YesNoTendency;
  outcome: DrawnCard; // the card whose meaning most drives the answer (Skuld for three_norns, heart for five_cross, the only card for daily)
  cardReadings?: CardReading[];
}

/**
 * Works out the deterministic parts of a reading — the headline and,
 * for multi-card spreads, each card's general per-position meaning.
 * Shared by both the mock generator and the live-AI path so the headline
 * (and therefore the DB-stored `answer`) never depends on the model.
 */
function buildSpreadContext(question: string, cards: DrawnCard[], spread: SpreadType): SpreadContext {
  const kind = classifyQuestion(question);
  // Multi-card spreads always answer with a tendency word (yes/no- or
  // outcome-style) rather than a bare rune name — a single card name isn't
  // a meaningful "answer" once there are several cards in play.
  const headlineKind: QuestionKind = spread === "daily" ? kind : kind === "open" ? "yesno" : kind;

  if (spread === "daily") {
    const outcome = cards[0];
    const rune = getRuneById(outcome.runeId);
    const meaning = meaningOf(rune, outcome.reversed);
    return {
      headline: headlineFor(headlineKind, meaning.yesNo, rune, outcome.reversed),
      headlineTendency: meaning.yesNo,
      outcome,
    };
  }

  if (spread === "three_norns") {
    const [past, present, future] = cards;
    const fR = getRuneById(future.runeId);
    const futureMeaning = meaningOf(fR, future.reversed);
    return {
      headline: headlineFor(headlineKind, futureMeaning.yesNo, fR, future.reversed),
      headlineTendency: futureMeaning.yesNo,
      outcome: future,
      cardReadings: [
        cardReadingOf(past, "Urd — Past"),
        cardReadingOf(present, "Verdandi — Present"),
        cardReadingOf(future, "Skuld — What May Come"),
      ],
    };
  }

  // five_cross
  const positions = [
    "Heart of the situation",
    "Past influence",
    "Where this is heading",
    "Guidance",
    "Hidden challenge",
  ];
  const heart = cards.find((c) => c.position === "Heart of the situation") ?? cards[0];
  const hR = getRuneById(heart.runeId);
  const heartMeaning = meaningOf(hR, heart.reversed);
  return {
    headline: headlineFor(headlineKind, heartMeaning.yesNo, hR, heart.reversed),
    headlineTendency: heartMeaning.yesNo,
    outcome: heart,
    cardReadings: cards.map((c, i) => cardReadingOf(c, c.position ?? positions[i])),
  };
}

// Plain-language gloss for each yes/no tendency, used by the mock
// generator to expand the synthesis beyond just naming the tendency.
const TENDENCY_EXPLAINED: Record<YesNoTendency, string> = {
  yes: "the path ahead is clear and supported",
  likely_yes: "things are leaning in your favor, though nothing is guaranteed",
  possibly: "it can go either way — what you do next matters more than fate here",
  uncertain: "the runes don't point clearly either way yet",
  not_yet: "not now — but the door isn't closed, timing is the issue",
  unlikely: "the current path doesn't lead where you're hoping",
  no: "the runes don't support this outcome as things stand",
};

/**
 * Rule-based fallback generator, used only when no ANTHROPIC_API_KEY is
 * configured or the live call fails. Uses the exact same structured rune
 * data a real model would receive, so the shape of the output already
 * matches — but templated text can only approximate a reading that's
 * genuinely tied to the person's specific question. See generateWithProvider
 * for the real thing.
 */
function generateMock(question: string, cards: DrawnCard[], spread: SpreadType): Reading {
  const ctx = buildSpreadContext(question, cards, spread);
  const outcomeRune = getRuneById(ctx.outcome.runeId);
  const outcomeMeaning = meaningOf(outcomeRune, ctx.outcome.reversed);
  const cleanQuestion = question.trim().replace(/\?$/, "");

  let cardMeaning = "";
  let interpretation: string;

  if (spread === "daily") {
    cardMeaning = `${outcomeRune.name}${ctx.outcome.reversed ? " reversed" : ""} — ${outcomeRune.coreMeaning}`;
    interpretation =
      `On "${cleanQuestion}": ${ctx.headline.toLowerCase()}. ${outcomeMeaning.interpretation} ` +
      `That is what points this toward ${ctx.headline}.`;
  } else {
    const label = spread === "three_norns" ? "three runes" : "five runes";
    interpretation =
      `On "${cleanQuestion}": together, these ${label} point toward ${ctx.headline} — ${TENDENCY_EXPLAINED[ctx.headlineTendency]}. ` +
      `${outcomeRune.name}${ctx.outcome.reversed ? " reversed" : ""} carries the most weight here: ${outcomeMeaning.interpretation}`;
  }

  const whisper = buildMockWhisper(outcomeRune, ctx.outcome.reversed, outcomeMeaning.guidance);

  return {
    answer: ctx.headline,
    cardMeaning,
    interpretation,
    whisper,
    cardReadings: ctx.cardReadings,
  };
}

function buildMockWhisper(rune: Rune, reversed: boolean, guidance: string): string {
  // Alternates between a piece of advice (drawn straight from the rune's
  // own guidance) and a deepening reflection, per the "deepening OR advice"
  // direction — not forced into a question every time.
  const templates = [
    guidance,
    `The deeper thread here is ${rune.name.toLowerCase()}${reversed ? " reversed" : ""}: ${rune.coreMeaning.split(" — ")[0].toLowerCase()} is quietly shaping more of this than it first looks like.`,
  ];
  return templates[Math.floor(Math.random() * templates.length)];
}

/**
 * Entry point used by the API route. Tries a real provider if configured,
 * otherwise falls back to the mock generator so the product always
 * returns a complete reading.
 */
export async function generateReading(
  question: string,
  cards: DrawnCard[],
  spread: SpreadType
): Promise<Reading> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return generateMock(question, cards, spread);
  }

  try {
    return await generateWithProvider(apiKey, question, cards, spread);
  } catch (err) {
    // Never let an AI-provider hiccup break the core experience — the
    // person still gets a complete, well-structured reading.
    console.error("generateWithProvider failed, falling back to mock:", err);
    return generateMock(question, cards, spread);
  }
}

function buildSystemInstruction(): string {
  return [
    "You are the voice of ICE WHISPERS, a Nordic rune oracle.",
    "Someone has asked a real question and drawn a specific rune (or several, in specific positions). Your only job is to interpret the rune(s) SPECIFICALLY in relation to their exact question.",
    "Never open with, or fall back on, a dictionary definition of the rune detached from the question — always connect it explicitly to what they actually asked, in plain, clear English.",
    "The directional headline (e.g. LIKELY YES) is already decided and given to you — do not restate it as a bare label or contradict it; explain WHY the rune(s) lead there.",
    "Write with quiet confidence and precision. No generic AI hedging, no disclaimers inside the reading itself, no mystical padding that doesn't say anything.",
    "Respond with ONLY a single valid JSON object, no markdown fences, no commentary before or after it.",
  ].join(" ");
}

function cardBlock(card: DrawnCard) {
  const rune = getRuneById(card.runeId);
  const meaning = meaningOf(rune, card.reversed);
  return {
    position: card.position ?? null,
    name: rune.name,
    reversed: card.reversed,
    coreMeaning: rune.coreMeaning,
    interpretation: meaning.interpretation,
    guidance: meaning.guidance,
    keywords: rune.keywords,
  };
}

async function generateWithProvider(
  apiKey: string,
  question: string,
  cards: DrawnCard[],
  spread: SpreadType
): Promise<Reading> {
  const ctx = buildSpreadContext(question, cards, spread);
  const system = buildSystemInstruction();

  const isSingleCard = spread === "daily";
  const userPrompt = isSingleCard
    ? [
        `Question: "${question.trim()}"`,
        `Established headline (do not change): ${ctx.headline}`,
        `Card drawn: ${JSON.stringify(cardBlock(cards[0]))}`,
        "",
        "Return ONLY this JSON shape:",
        `{"cardMeaning": "1-2 sentences: what this rune generally represents, in plain English, not yet tied to the question.", "interpretation": "3-5 sentences: read this rune SPECIFICALLY against the question above, referencing its concrete details, explaining exactly why it leads to '${ctx.headline}'. No fluff, no restating the dictionary meaning without connecting it to the question.", "whisper": "1-2 sentences: either a deepening insight about the interpretation, or one clear, concrete piece of advice for this specific situation. Personal, not generic."}`,
      ].join("\n")
    : [
        `Question: "${question.trim()}"`,
        `Spread: ${spread === "three_norns" ? "Three Norns (past / present / future)" : "Five Rune Cross"}`,
        `Established headline (do not change): ${ctx.headline}`,
        `Cards drawn, in position order: ${JSON.stringify(cards.map(cardBlock))}`,
        "",
        "Return ONLY this JSON shape:",
        `{"interpretation": "4-6 sentences: synthesize how these specific cards, in these specific positions, answer the question above. Reference its concrete details. Explain how the cards relate to each other and why together they lead to '${ctx.headline}'. Plain English, no fluff, no listing each card as an isolated dictionary entry.", "whisper": "1-2 sentences: either a deepening insight, or one clear, concrete piece of advice for this specific situation."}`,
      ].join("\n");

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-5",
      max_tokens: 600,
      system,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });

  if (!res.ok) {
    throw new Error(`Anthropic API error ${res.status}: ${await res.text().catch(() => "")}`);
  }

  const data = await res.json();
  const text: string = data.content?.[0]?.text ?? "{}";
  const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());

  if (typeof parsed.interpretation !== "string" || typeof parsed.whisper !== "string") {
    throw new Error("Malformed AI response: missing interpretation/whisper");
  }

  return {
    answer: ctx.headline,
    cardMeaning: isSingleCard ? String(parsed.cardMeaning ?? "") : "",
    interpretation: parsed.interpretation,
    whisper: parsed.whisper,
    cardReadings: ctx.cardReadings,
  };
}

