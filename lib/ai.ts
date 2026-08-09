// ICE WHISPERS — Reading Engine
//
// This file is intentionally the ONLY place that talks to an AI provider.
// Swap providers by editing `generateWithProvider` — nothing else in the
// app needs to change. Until you add an API key, `generateWithProvider`
// falls back to `generateMock`, a rule-based generator built from the
// same structured rune data, so the full product works end-to-end today.
//
// To connect a real model later:
//   1. Add ANTHROPIC_API_KEY (or OPENAI_API_KEY) to your environment.
//   2. Implement the fetch call inside `generateWithProvider` (a
//      commented example for Claude is included below).
// The prompt sent to the model deliberately contains ONLY what's needed
// for one reading (see AI COST CONTROL in the original spec) — never the
// full rune database and never prior conversation history.

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
  reading: string; // single-card spreads: the full interpretive body. Multi-card spreads: the closing summary that ties the cards together.
  guidance: string; // what to notice / do
  whisper: string; // one closing reflective question
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

  return "open";
}

function headlineFor(kind: QuestionKind, tendency: YesNoTendency, rune: Rune, reversed: boolean): string {
  if (kind === "yesno") return YES_NO_LABEL[tendency];
  if (kind === "outcome") return OUTCOME_LABEL[tendency];
  return rune.name + (reversed ? " (reversed)" : "");
}

function buildSystemInstruction(): string {
  return [
    "You are the voice of ICE WHISPERS, a Nordic rune oracle.",
    "You never open with a dictionary definition of the rune.",
    "You always answer the person's actual question directly first, then explain why the rune leads there.",
    "For yes/no-shaped questions, you open with one of: YES, LIKELY YES, POSSIBLY BUT..., UNCERTAIN, NOT YET, UNLIKELY, NO.",
    "You write with quiet confidence, warmth, and precision — never generic AI hedging, never disclaimers inside the reading itself.",
    "You end with exactly one reflective question that adds to the reading, never replaces the answer.",
  ].join(" ");
}

/**
 * Builds the minimal context sent to the AI provider for one reading.
 * Deliberately excludes the full rune database — only the drawn card(s).
 */
function buildUserContext(question: string, cards: DrawnCard[], spread: SpreadType) {
  const cardContext = cards.map((c) => {
    const rune = getRuneById(c.runeId);
    const meaning = c.reversed && rune.reversed ? rune.reversed : rune.upright;
    return {
      position: c.position ?? null,
      name: rune.name,
      reversed: c.reversed,
      coreMeaning: rune.coreMeaning,
      interpretation: "interpretation" in meaning ? meaning.interpretation : rune.upright.interpretation,
      guidance: meaning.guidance,
      yesNo: meaning.yesNo,
      keywords: rune.keywords,
    };
  });
  return { question, spread, cards: cardContext };
}

/**
 * Rule-based mock reading generator. Uses the exact same structured data
 * a real model would receive, so the output already follows the required
 * "answer → reading → guidance → whisper" structure and reads as genuine
 * divination rather than a dictionary entry. Swap this out once an AI
 * provider is connected — the JSON shape (Reading) does not need to change.
 */
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

// Plain-language gloss for each yes/no tendency, used to expand the
// "Together" summary beyond just naming the tendency.
const TENDENCY_EXPLAINED: Record<YesNoTendency, string> = {
  yes: "the path ahead is clear and supported",
  likely_yes: "things are leaning in your favor, though nothing is guaranteed",
  possibly: "it can go either way — what you do next matters more than fate here",
  uncertain: "the runes don't point clearly either way yet",
  not_yet: "not now — but the door isn't closed, timing is the issue",
  unlikely: "the current path doesn't lead where you're hoping",
  no: "the runes don't support this outcome as things stand",
};

function generateMock(question: string, cards: DrawnCard[], spread: SpreadType): Reading {
  const kind = classifyQuestion(question);
  // Multi-card spreads always answer with a tendency word (yes/no- or
  // outcome-style) rather than a bare rune name — a single card name isn't
  // a meaningful "answer" once there are several cards in play.
  const headlineKind: QuestionKind = spread === "daily" ? kind : kind === "open" ? "yesno" : kind;

  let headline: string;
  let readingBody: string;
  let cardReadings: CardReading[] | undefined;
  // The card whose meaning drives the headline, guidance, and whisper —
  // for multi-card spreads this is the outcome-facing card (Skuld / the
  // heart of the situation), not just whichever card was drawn first.
  let outcome: DrawnCard;

  if (spread === "daily") {
    outcome = cards[0];
    const rune = getRuneById(outcome.runeId);
    const meaning = meaningOf(rune, outcome.reversed);
    headline = headlineFor(headlineKind, meaning.yesNo, rune, outcome.reversed);
    readingBody = `${rune.name}${outcome.reversed ? " reversed" : ""} answers this by turning your question toward what's real right now: ${meaning.interpretation}`;
  } else if (spread === "three_norns") {
    const [past, present, future] = cards;
    outcome = future;
    cardReadings = [
      cardReadingOf(past, "Urd — Past"),
      cardReadingOf(present, "Verdandi — Present"),
      cardReadingOf(future, "Skuld — What May Come"),
    ];
    const fR = getRuneById(future.runeId);
    const futureMeaning = meaningOf(fR, future.reversed);
    headline = headlineFor(headlineKind, futureMeaning.yesNo, fR, future.reversed);
    const pR = getRuneById(past.runeId);
    const prR = getRuneById(present.runeId);
    readingBody =
      `Together, these three runes point toward ${headline} — ${TENDENCY_EXPLAINED[futureMeaning.yesNo]}. ` +
      `What shaped this (${pR.name}${past.reversed ? " reversed" : ""}) is still working its way through what's happening now (${prR.name}${present.reversed ? " reversed" : ""}), ` +
      `and ${fR.name}${future.reversed ? " reversed" : ""} shows where that's heading if nothing changes.`;
  } else {
    // five_cross
    const positions = [
      "Heart of the situation",
      "Past influence",
      "Where this is heading",
      "Guidance",
      "Hidden challenge",
    ];
    cardReadings = cards.map((c, i) => cardReadingOf(c, c.position ?? positions[i]));
    const heart = cards.find((c) => c.position === "Heart of the situation") ?? cards[0];
    outcome = heart;
    const hR = getRuneById(heart.runeId);
    const heartMeaning = meaningOf(hR, heart.reversed);
    headline = headlineFor(headlineKind, heartMeaning.yesNo, hR, heart.reversed);
    readingBody =
      `Together, these five runes point toward ${headline} — ${TENDENCY_EXPLAINED[heartMeaning.yesNo]}. ` +
      `At the heart of this sits ${hR.name}${heart.reversed ? " reversed" : ""}; the surrounding runes — past influence, where this is heading, guidance, and the hidden challenge — add depth around that core truth rather than changing it.`;
  }

  const outcomeRune = getRuneById(outcome.runeId);
  const outcomeMeaning = meaningOf(outcomeRune, outcome.reversed);
  const guidance = outcomeMeaning.guidance;
  const whisper = buildWhisper(outcomeRune, outcome.reversed, question);

  return {
    answer: headline,
    reading: readingBody,
    cardReadings,
    guidance,
    whisper,
  };
}

function buildWhisper(rune: Rune, reversed: boolean, question: string): string {
  const templates = [
    `What would change for you if you already knew the answer to "${question.trim().replace(/\?$/, "")}"?`,
    `Where in this situation are you already acting as if ${rune.coreMeaning.split(" — ")[0].toLowerCase()} were true?`,
    `If ${rune.name.toLowerCase()}${reversed ? " reversed" : ""} is right, what's the smallest honest step you'd take next?`,
  ];
  return templates[Math.floor(Math.random() * templates.length)];
}

/**
 * Entry point used by the API route. Tries a real provider if configured,
 * otherwise falls back to the mock generator so the product works today.
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

  return generateWithProvider(apiKey, question, cards, spread);
}

async function generateWithProvider(
  apiKey: string,
  question: string,
  cards: DrawnCard[],
  spread: SpreadType
): Promise<Reading> {
  const context = buildUserContext(question, cards, spread);
  const system = buildSystemInstruction();

  // Example wiring for Claude — uncomment and adjust once ANTHROPIC_API_KEY is set.
  // Keep this the ONLY function that changes if you switch providers.
  //
  // const res = await fetch("https://api.anthropic.com/v1/messages", {
  //   method: "POST",
  //   headers: {
  //     "content-type": "application/json",
  //     "x-api-key": apiKey,
  //     "anthropic-version": "2023-06-01",
  //   },
  //   body: JSON.stringify({
  //     model: "claude-sonnet-4-6",
  //     max_tokens: 700,
  //     system,
  //     messages: [
  //       {
  //         role: "user",
  //         content:
  //           `Question: ${context.question}\nSpread: ${context.spread}\n` +
  //           `Cards: ${JSON.stringify(context.cards)}\n\n` +
  //           `Respond ONLY as JSON: {"answer": string, "reading": string, "guidance": string, "whisper": string}`,
  //       },
  //     ],
  //   }),
  // });
  // const data = await res.json();
  // const text = data.content?.[0]?.text ?? "{}";
  // return JSON.parse(text.replace(/```json|```/g, "").trim());

  // Until wired up, keep behaving like the mock so nothing breaks.
  return generateMock(question, cards, spread);
}
