import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RUNES_IN_ORDER, runeBySlug, runeSlug, SITE_URL, YES_NO_LABEL, AETT_LABEL, jsonLd } from "@/lib/seo";
import { cardImagePath, cardThumbPath } from "@/lib/rune-assets";

// One public page per rune: /runes/fehu … /runes/othala, /runes/wyrd.
// All content comes from lib/runes.ts (the same knowledge the readings use).

export function generateStaticParams() {
  return RUNES_IN_ORDER.map((r) => ({ slug: runeSlug(r) }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const r = runeBySlug(params.slug);
  if (!r) return {};
  const rev = r.canReverse ? r.reversed : null;
  const title = r.id === 0 ? "Wyrd — The Blank Rune Meaning" : `${r.name} Rune Meaning — Upright & Reversed`;
  return {
    title,
    description: `${r.name} ${r.symbol}: ${r.coreMeaning} What ${r.name} means in love, work, money and yes/no questions${rev ? ", upright and reversed" : ""}.`.slice(0, 300),
    alternates: { canonical: `/runes/${runeSlug(r)}` },
    openGraph: { images: [{ url: cardImagePath(r.id), width: 768, height: 1152, alt: `${r.name} rune card` }] },
  };
}

const DOMAINS: { key: keyof import("@/lib/runes").Rune["domains"]; label: string }[] = [
  { key: "love", label: "Love & relationships" },
  { key: "career", label: "Work & career" },
  { key: "money", label: "Money" },
  { key: "decisions", label: "Decisions" },
  { key: "personalDevelopment", label: "Personal growth" },
  { key: "challenges", label: "Challenges" },
];

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-void/55 px-5 py-4">
      <h2 className="uppercase tracking-[0.25em] text-[11px] text-frost-300/80 mb-2 font-normal">{title}</h2>
      <div className="text-parchment/85 leading-relaxed space-y-2">{children}</div>
    </section>
  );
}

export default function RunePage({ params }: { params: { slug: string } }) {
  const r = runeBySlug(params.slug);
  if (!r) notFound();
  // Symmetrical runes (Gebo, Isa, Dagaz…) and Wyrd are never read reversed.
  const rev = r.canReverse ? r.reversed : null;

  const i = RUNES_IN_ORDER.findIndex((x) => x.id === r.id);
  const prev = RUNES_IN_ORDER[(i - 1 + RUNES_IN_ORDER.length) % RUNES_IN_ORDER.length];
  const next = RUNES_IN_ORDER[(i + 1) % RUNES_IN_ORDER.length];
  const url = `${SITE_URL}/runes/${runeSlug(r)}`;

  const qa = [
    { q: `What does the ${r.name} rune mean?`, a: `${r.coreMeaning} ${r.upright.interpretation}` },
    rev
      ? { q: `What does ${r.name} reversed mean?`, a: rev.interpretation }
      : { q: `Can ${r.name} be reversed?`, a: `No. ${r.name} ${r.id === 0 ? "is blank" : "looks the same upside down"}, so it is always read upright.` },
    { q: `What does ${r.name} mean in love?`, a: r.domains.love },
    {
      q: `Is ${r.name} a yes or no rune?`,
      a: `Upright, ${r.name} leans “${YES_NO_LABEL[r.upright.yesNo]}”.${rev ? ` Reversed, it leans “${YES_NO_LABEL[rev.yesNo]}”.` : ""} The full answer always depends on your question.`,
    },
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: `${r.name} rune meaning`,
        description: r.coreMeaning,
        image: `${SITE_URL}${cardImagePath(r.id)}`,
        url,
        author: { "@type": "Organization", name: "ICE WHISPERS™", url: SITE_URL },
        publisher: { "@type": "Organization", name: "ICE WHISPERS™", url: SITE_URL },
        about: { "@type": "Thing", name: `${r.name} (rune)` },
      },
      {
        "@type": "FAQPage",
        mainEntity: qa.map((x) => ({ "@type": "Question", name: x.q, acceptedAnswer: { "@type": "Answer", text: x.a } })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Rune reading", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Rune meanings", item: `${SITE_URL}/runes` },
          { "@type": "ListItem", position: 3, name: r.name, item: url },
        ],
      },
    ],
  };

  return (
    <main className="max-w-3xl mx-auto space-y-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(structuredData)} />
      <nav className="text-xs text-parchment/50 text-center">
        <Link href="/runes" className="underline underline-offset-4">
          Rune meanings
        </Link>{" "}
        / {r.name}
      </nav>

      <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
        <Image src={cardImagePath(r.id)} alt={`${r.name} rune card from the ICE WHISPERS deck`} width={768} height={1152} priority className="w-56 md:w-64 h-auto rounded-xl shadow-glow shrink-0" />
        <div className="space-y-4 text-center md:text-left">
          <p className="uppercase tracking-[0.3em] text-[10px] text-frost-300/70">{r.id === 0 ? "The blank rune" : `Elder Futhark rune ${r.id} of 24`}</p>
          <h1 className="font-display text-3xl md:text-4xl text-frost-100 tracking-wide">
            <span className="mr-2">{r.symbol}</span>
            {r.name} rune meaning
          </h1>
          <p className="text-parchment/90 text-lg leading-relaxed">{r.coreMeaning}</p>
          <p className="text-parchment/60 text-sm">Keywords: {r.keywords.join(", ")}</p>
          <p className="text-parchment/60 text-sm">Family: {AETT_LABEL[r.aett]}</p>
          <Link
            href="/"
            className="inline-block rounded-full bg-gradient-to-r from-frost-700 via-frost-500 to-wyrd-600 text-frost-100 font-semibold px-6 py-2.5 text-sm shadow-glow"
          >
            Ask the runes your question — free
          </Link>
        </div>
      </div>

      <Block title={`${r.name} upright`}>
        <p>{r.upright.interpretation}</p>
        <p className="text-parchment/70">
          <strong className="text-frost-100 font-semibold">Guidance:</strong> {r.upright.guidance}
        </p>
      </Block>

      {rev ? (
        <Block title={`${r.name} reversed`}>
          <p>{rev.interpretation}</p>
          <p className="text-parchment/70">
            <strong className="text-frost-100 font-semibold">Guidance:</strong> {rev.guidance}
          </p>
        </Block>
      ) : (
        <Block title="Reversed?">
          <p>
            {r.name} {r.id === 0 ? "is blank" : "looks the same upside down"}, so it is never read reversed.
          </p>
        </Block>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {DOMAINS.map((d) => (
          <Block key={d.key} title={`${r.name} in ${d.label.toLowerCase()}`}>
            <p>{r.domains[d.key]}</p>
          </Block>
        ))}
      </div>

      <Block title={`${r.name} in yes or no questions`}>
        <p>
          Upright: <strong className="text-frost-100">{YES_NO_LABEL[r.upright.yesNo]}</strong>
          {rev && (
            <>
              {" "}
              · Reversed: <strong className="text-frost-100">{YES_NO_LABEL[rev.yesNo]}</strong>
            </>
          )}
        </p>
        <p className="text-parchment/60 text-sm">A rune’s direction is a tendency — your reading weighs it against your actual question.</p>
      </Block>

      <section className="text-center space-y-3 py-4">
        <p className="font-display text-xl text-frost-100">What would {r.name} say about your question?</p>
        <Link href="/" className="inline-block rounded-full bg-gradient-to-r from-frost-700 via-frost-500 to-wyrd-600 text-frost-100 font-semibold px-6 py-3 shadow-glow">
          Get your free rune reading
        </Link>
        <p className="text-parchment/40 text-xs">One free Daily Rune every day. For reflection and entertainment.</p>
      </section>

      <nav className="flex justify-between items-center gap-4 border-t border-white/10 pt-6">
        {[prev, next].map((x, k) => (
          <Link key={x.id} href={`/runes/${runeSlug(x)}`} className={`flex items-center gap-3 group ${k ? "flex-row-reverse text-right" : ""}`}>
            <Image src={cardThumbPath(x.id)} alt="" width={240} height={360} className="w-12 h-auto rounded" />
            <span className="text-sm text-parchment/70 group-hover:text-frost-100">
              {k ? "Next" : "Previous"}
              <br />
              <span className="font-display text-frost-100">{x.name}</span>
            </span>
          </Link>
        ))}
      </nav>
    </main>
  );
}
