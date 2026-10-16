// ICE WHISPERS — search engine & AI-answer (SEO / AEO) helpers.
// Public, crawlable content lives on the home page (components/HomeContent),
// the rune pages (/runes, /runes/[slug]) and /llms.txt.

import { ALL_CARDS, RUNES, WYRD, type Rune, type YesNoTendency } from "./runes";

export const SITE_URL = (process.env.PUBLIC_SITE_URL || "https://www.icewhispers.com").replace(/\/$/, "");
export const SITE_NAME = "ICE WHISPERS™";

export const runeSlug = (rune: Rune) => rune.name.toLowerCase();

/** Fehu…Othala in Elder Futhark order, then Wyrd (the blank 25th card). */
export const RUNES_IN_ORDER: Rune[] = [...RUNES, WYRD];

export function runeBySlug(slug: string): Rune | undefined {
  return ALL_CARDS.find((r) => runeSlug(r) === slug.toLowerCase());
}

export const YES_NO_LABEL: Record<YesNoTendency, string> = {
  yes: "Yes",
  likely_yes: "Likely yes",
  possibly: "Possibly, but…",
  uncertain: "Uncertain",
  not_yet: "Not yet",
  unlikely: "Unlikely",
  no: "No",
};

export const AETT_LABEL: Record<Rune["aett"], string> = {
  Freyr: "Freyr’s ætt (the first family of eight runes)",
  Heimdall: "Heimdall’s ætt (also called Hagal’s ætt — the second family of eight)",
  Tyr: "Tyr’s ætt (the third family of eight runes)",
  Wyrd: "no ætt — Wyrd stands alone, outside the 24 runes",
};

export function jsonLd(data: object) {
  return { __html: JSON.stringify(data).replace(/</g, "\\u003c") };
}
