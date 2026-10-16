import { FAQ } from "@/lib/faq";
import { RUNES_IN_ORDER, runeSlug, SITE_URL, YES_NO_LABEL } from "@/lib/seo";

// /llms.txt — a plain-text summary of the site for AI assistants
// (the llms.txt convention). Generated from the same data as the pages.
export const dynamic = "force-static";

export function GET() {
  const lines: string[] = [
    "# ICE WHISPERS™ — Rune Oracle",
    "",
    "> Free online rune reading with the 24 Elder Futhark runes and Wyrd, the blank rune. Ask a question in any language, draw a rune from the ICE WHISPERS™ deck and receive a reading that answers that exact question — a clear direction first (such as Likely yes, Not yet or Unclear), then why, then one concrete piece of advice.",
    "",
    "- One free Daily Rune reading every day, no account needed.",
    "- Spreads: Daily Rune (1 rune), Three Norns (Urd, Verdandi, Skuld — 3 runes), Five Rune Cross (5 runes).",
    "- Paid options: a 24-hour unlock of all spreads, or the ICE WHISPERS+ membership with a private rune journal.",
    "- A physical ICE WHISPERS™ Elder Futhark deck (24 runes + Wyrd) is planned; waitlist on the home page.",
    "- Readings are for reflection and entertainment. Run by TSwede AB, Sweden. Contact: contact@icewhispers.com",
    "",
    "## Pages",
    `- [Free rune reading](${SITE_URL}/): ask the runes a question`,
    `- [Rune meanings](${SITE_URL}/runes): all 24 Elder Futhark runes and Wyrd, upright and reversed`,
    `- [Our Story](${SITE_URL}/our-story): how Tracy J Hoffman created ICE WHISPERS, and help for readers who want their own digital deck`,
    "",
    "## Rune meanings",
    ...RUNES_IN_ORDER.map(
      (r) =>
        `- [${r.name} ${r.symbol}](${SITE_URL}/runes/${runeSlug(r)}): ${r.coreMeaning} Yes/no upright: ${YES_NO_LABEL[r.upright.yesNo]}${
          r.canReverse && r.reversed ? `; reversed: ${YES_NO_LABEL[r.reversed.yesNo]}` : "; never reversed"
        }.`
    ),
    "",
    "## Questions & answers",
    ...FAQ.flatMap((f) => [`### ${f.q}`, f.a, ""]),
  ];
  return new Response(lines.join("\n"), {
    headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=3600" },
  });
}
