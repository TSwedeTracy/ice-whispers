import Image from "next/image";
import Link from "next/link";
import WaitlistPrompt from "@/components/WaitlistPrompt";
import { FAQ } from "@/lib/faq";
import { RUNES_IN_ORDER, runeSlug } from "@/lib/seo";
import { cardThumbPath, DECK_COVER, CARD_BACK } from "@/lib/rune-assets";

// Everything below the reading app on the home page. Server-rendered, so
// search engines and AI assistants can read it (the app above is
// interactive). Copy lives here; questions & answers live in lib/faq.ts.

const SPREADS = [
  {
    name: "Daily Rune",
    count: "1 rune",
    text: "One rune that answers your question directly. Free once every day — no account needed.",
  },
  {
    name: "Three Norns",
    count: "3 runes",
    text: "Urd, Verdandi and Skuld — what has been, what is now and what may come — read together as one answer.",
  },
  {
    name: "Five Rune Cross",
    count: "5 runes",
    text: "The heart of the matter, the past, where it is heading, guidance and the hidden challenge.",
  },
];

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="text-center space-y-2">
      <p className="uppercase tracking-[0.3em] text-[10px] text-frost-300/70">{eyebrow}</p>
      <h2 className="font-display text-2xl md:text-3xl text-frost-100 tracking-wide">{title}</h2>
    </div>
  );
}

export default function HomeContent() {
  return (
    <div className="relative z-10 w-full px-6 pb-16 flex flex-col items-center gap-20 md:gap-24">
      {/* How it works */}
      <section className="w-full max-w-3xl space-y-8" aria-labelledby="how">
        <div id="how">
          <SectionTitle eyebrow="Free rune reading online" title="How a rune reading works" />
        </div>
        <ol className="grid gap-4 md:grid-cols-3">
          {[
            ["Ask", "Write your question — about love, work, money, a decision or the path ahead. Any language."],
            ["Draw", "Draw from the ICE WHISPERS™ deck: the 24 Elder Futhark runes and Wyrd, the blank rune."],
            ["Receive", "Turn the card. Your reading answers your exact question — a clear direction first, then why, then one concrete piece of advice."],
          ].map(([title, text], i) => (
            <li key={title} className="rounded-2xl border border-white/10 bg-void/50 px-5 py-5">
              <p className="font-display text-frost-300 text-lg">
                {i + 1}. {title}
              </p>
              <p className="text-parchment/75 text-sm leading-relaxed mt-1">{text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Spreads */}
      <section className="w-full max-w-3xl space-y-8" aria-labelledby="spreads">
        <div id="spreads">
          <SectionTitle eyebrow="Rune spreads" title="Three ways to ask the runes" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {SPREADS.map((s) => (
            <div key={s.name} className="rounded-2xl border border-white/10 bg-void/50 px-5 py-5">
              <p className="uppercase tracking-[0.2em] text-[10px] text-frost-300/70">{s.count}</p>
              <h3 className="font-display text-lg text-frost-100">{s.name}</h3>
              <p className="text-parchment/75 text-sm leading-relaxed mt-1">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* The deck */}
      <section className="w-full max-w-3xl space-y-8" aria-labelledby="deck">
        <div id="deck">
          <SectionTitle eyebrow="The deck" title="The ICE WHISPERS™ rune deck" />
        </div>
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="flex -space-x-10 shrink-0">
            <Image src={CARD_BACK} alt="ICE WHISPERS rune card back with snowflake design" width={768} height={1316} className="w-32 md:w-40 h-auto rounded-xl -rotate-6 shadow-glow" />
            <Image src={DECK_COVER} alt="ICE WHISPERS Elder Futhark rune deck cover" width={768} height={1096} className="w-32 md:w-40 h-auto rounded-xl rotate-3 shadow-glow" />
          </div>
          <div className="space-y-3 text-parchment/80 leading-relaxed">
            <p>
              ICE WHISPERS™ is a Nordic rune oracle deck of 25 cards: the 24 runes of the Elder Futhark — the oldest runic
              alphabet — and Wyrd, the blank rune of what is not yet written. Every card is original artwork in ice, starlight
              and northern light.
            </p>
            <p>
              The meanings build on the traditional rune meanings, written for modern questions: each rune has an upright and
              a reversed reading, and its own meaning for love, work, money, decisions and challenges.
            </p>
            <p>
              This website is the deck’s digital companion. The physical deck is coming soon — join the waitlist to hear first.
            </p>
          </div>
        </div>
        <WaitlistPrompt source="home_deck_section" />
      </section>

      {/* All runes */}
      <section className="w-full max-w-4xl space-y-8" aria-labelledby="runes">
        <div id="runes">
          <SectionTitle eyebrow="Rune meanings" title="The 24 Elder Futhark runes — and Wyrd" />
        </div>
        <ul className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-9 gap-3">
          {RUNES_IN_ORDER.map((r) => (
            <li key={r.id}>
              <Link href={`/runes/${runeSlug(r)}`} className="group block text-center">
                <Image
                  src={cardThumbPath(r.id)}
                  alt={`${r.name} rune card`}
                  width={240}
                  height={360}
                  loading="lazy"
                  className="w-full h-auto rounded-lg border border-white/10 group-hover:border-frost-300/60 transition-colors"
                />
                <span className="block text-[11px] text-parchment/70 group-hover:text-frost-100 mt-1">{r.name}</span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="text-center">
          <Link href="/runes" className="text-frost-300 underline underline-offset-4 text-sm">
            All rune meanings — upright and reversed
          </Link>
        </p>
      </section>

      {/* Q&A */}
      <section className="w-full max-w-2xl space-y-8" aria-labelledby="faq">
        <div id="faq">
          <SectionTitle eyebrow="Questions & answers" title="About rune readings" />
        </div>
        <div className="flex flex-col gap-2">
          {FAQ.map((f) => (
            <details key={f.q} className="group rounded-2xl border border-white/10 bg-void/50 px-5 py-3">
              <summary className="cursor-pointer list-none flex justify-between gap-4 text-frost-100 font-semibold">
                <h3 className="text-base font-semibold">{f.q}</h3>
                <span className="text-frost-300 group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="text-parchment/75 text-sm leading-relaxed mt-2">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Final call to action */}
      <section className="text-center space-y-4">
        <p className="font-display text-2xl text-frost-100 tracking-wide">What do you wish to ask the runes?</p>
        <a
          href="#top"
          className="inline-block rounded-full bg-gradient-to-r from-frost-700 via-frost-500 to-wyrd-600 text-frost-100 font-semibold px-8 py-3 shadow-glow"
        >
          Get your free rune reading
        </a>
      </section>
    </div>
  );
}
