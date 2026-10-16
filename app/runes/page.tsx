import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { RUNES_IN_ORDER, runeSlug, SITE_URL, jsonLd } from "@/lib/seo";
import { cardThumbPath } from "@/lib/rune-assets";

export const metadata: Metadata = {
  title: "Rune Meanings — All 24 Elder Futhark Runes and Wyrd",
  description:
    "The meaning of every Elder Futhark rune, upright and reversed — Fehu to Othala, plus Wyrd, the blank rune. For love, work, money, decisions and challenges.",
  alternates: { canonical: "/runes" },
};

// Families as described in the ICE WHISPERS™ deck (“The Three Ættir”).
const AETTS: { name: string; intro: string; ids: number[] }[] = [
  { name: "Freyr’s ætt", intro: "Runes 1–8 · green & gold · abundance, creation, growth and opportunity.", ids: [1, 2, 3, 4, 5, 6, 7, 8] },
  { name: "Heimdall’s ætt", intro: "Runes 9–16 · ice blue, white & silver · change, challenges, transformation and inner strength.", ids: [9, 10, 11, 12, 13, 14, 15, 16] },
  { name: "Tyr’s ætt", intro: "Runes 17–24 · purple, white & gold · guidance, purpose, community and legacy.", ids: [17, 18, 19, 20, 21, 22, 23, 24] },
  { name: "Wyrd", intro: "The blank rune — what is not yet written.", ids: [0] },
];

export default function RunesIndex() {
  const byId = new Map(RUNES_IN_ORDER.map((r) => [r.id, r]));
  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Rune reading", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Rune meanings", item: `${SITE_URL}/runes` },
    ],
  };
  return (
    <main className="max-w-4xl mx-auto space-y-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(breadcrumbs)} />
      <div className="text-center space-y-3">
        <h1 className="font-display text-3xl md:text-4xl text-frost-100 tracking-wide">Rune meanings</h1>
        <p className="text-parchment/75 max-w-xl mx-auto leading-relaxed">
          The Elder Futhark is the oldest runic alphabet: 24 runes in three families of eight, called ætts. Here is what each
          rune means in a reading — upright and reversed — and Wyrd, the blank 25th card of the ICE WHISPERS™ deck.
        </p>
        <Link href="/" className="inline-block rounded-full bg-gradient-to-r from-frost-700 via-frost-500 to-wyrd-600 text-frost-100 font-semibold px-6 py-2.5 text-sm">
          Get a free rune reading
        </Link>
      </div>
      <section className="flex flex-col md:flex-row items-center gap-8">
        <Image
          src="/deck/three-aettir.webp"
          alt="The three ættir — Freyr’s, Heimdall’s and Tyr’s ætt — from the ICE WHISPERS rune deck"
          width={768}
          height={1152}
          className="w-64 md:w-72 h-auto rounded-xl shadow-glow shrink-0"
        />
        <div className="space-y-3 text-parchment/80 leading-relaxed">
          <h2 className="font-display text-2xl text-frost-100">The three ættir — the rune families</h2>
          <p>
            The 24 runes of the Elder Futhark are divided into three families of eight, called ættir. Each family has its own
            energy: Freyr’s ætt for abundance and new beginnings, Heimdall’s ætt for change and the challenges that make us
            stronger, and Tyr’s ætt for guidance, purpose and what we leave behind.
          </p>
          <p>Three families. Twenty-four runes. One path.</p>
        </div>
      </section>
      {AETTS.map((a) => (
        <section key={a.name} className="space-y-4">
          <div className="text-center">
            <h2 className="font-display text-2xl text-frost-100">{a.name}</h2>
            <p className="text-parchment/60 text-sm">{a.intro}</p>
          </div>
          <ul className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {a.ids.map((id) => {
              const r = byId.get(id)!;
              return (
                <li key={id}>
                  <Link href={`/runes/${runeSlug(r)}`} className="group block rounded-2xl border border-white/10 bg-void/50 p-3 hover:border-frost-300/50 transition-colors">
                    <Image src={cardThumbPath(id)} alt={`${r.name} rune card`} width={240} height={360} className="w-full h-auto rounded-lg" />
                    <p className="font-display text-frost-100 mt-2">
                      <span className="mr-1">{r.symbol}</span> {r.name}
                    </p>
                    <p className="text-parchment/60 text-xs">{r.keywords.slice(0, 3).join(" · ")}</p>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </main>
  );
}
