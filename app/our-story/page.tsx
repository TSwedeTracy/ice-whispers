import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PageFrame from "@/components/PageFrame";
import { SITE_URL, jsonLd } from "@/lib/seo";

// Booking link for "Bring your own deck to life" (Tracy's Google Calendar).
const DISCOVERY_CALL_URL = "https://calendar.app.google/s7o2sCmtzkKRVZH99";
const CONTACT_EMAIL = "contact@icewhispers.com";

export const metadata: Metadata = {
  title: "Our Story — How ICE WHISPERS Was Created",
  description:
    "ICE WHISPERS was created by Tracy J Hoffman, inspired by a childhood surrounded by her mother’s tarot cards, astrology and crystals — and brought to life through Nordic imagery and AI.",
  alternates: { canonical: "/our-story" },
  openGraph: { images: [{ url: "/deck/tracy-reading.webp", width: 1200, height: 800, alt: "Tracy J Hoffman with the ICE WHISPERS rune deck" }] },
};

const STORY = [
  "ICE WHISPERS was created by Tracy J Hoffman, who grew up surrounded by tarot cards, astrology and crystals. Her mother was well known in the small town where she lived for her accurate tarot readings. She also sold tarot cards, oracle cards and crystals in her health supplement shop.",
  "Tracy didn’t care much about any of it growing up, but as she got older, she learned to read the cards from her mother. Whenever love interests came into the picture, she had a crisis, or she was just bored in general, her mom would read the cards for her. As an adult, Tracy also did readings for her mother in return.",
  "For years, Tracy had an idea for her own tarot deck, which is still coming later. But with the drawing skills of a five-year-old, it wasn’t possible without help from a designer—until AI arrived. During a discussion in her TikTok LIVE VIP group, one of her VIPs mentioned Vikings or runes, and the idea for ICE WHISPERS was born.",
  "Some of the cards were created on Midsummer Night, a time traditionally associated with magic in the Nordic countries. The intention was to create all of the cards that night, but human nature—and the need for sleep—stepped in.",
  "After creating the deck, Tracy realized how costly it would be to print and deliver physical cards, especially worldwide. She wanted to share ICE WHISPERS as soon as possible, so she created a digital platform where people could experience the deck through online readings.",
  "The platform was completed on the day her mom would have turned 77—the woman who helped shape the person Tracy became and inspired her to create this deck.",
  "Every paid reading helps Tracy develop the platform and get closer to printing and sending out physical decks.",
];

export default function OurStory() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "Our Story — ICE WHISPERS™",
    url: `${SITE_URL}/our-story`,
    about: { "@type": "Organization", name: "ICE WHISPERS™", url: SITE_URL, founder: { "@type": "Person", name: "Tracy J Hoffman" } },
  };

  return (
    <PageFrame>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(structuredData)} />
      <main className="max-w-2xl mx-auto space-y-10">
        <div className="text-center space-y-2">
          <p className="uppercase tracking-[0.3em] text-[10px] text-frost-300/70">The story behind the deck</p>
          <h1 className="font-display text-3xl md:text-4xl text-frost-100 tracking-wide">Our Story</h1>
        </div>

        <Image
          src="/deck/tracy-reading.webp"
          alt="Tracy J Hoffman reading the ICE WHISPERS rune cards, with a wolf and a raven under the northern lights"
          width={1200}
          height={800}
          priority
          className="w-full h-auto rounded-2xl border border-white/10 shadow-glow"
        />

        <article className="space-y-5 text-parchment/85 text-lg leading-relaxed">
          {STORY.map((p, i) => (
            <p key={i} className={i === STORY.length - 1 ? "text-frost-100" : undefined}>
              {p}
            </p>
          ))}
        </article>

        <div className="text-center">
          <Link
            href="/"
            className="inline-block rounded-full bg-gradient-to-r from-frost-700 via-frost-500 to-wyrd-600 text-frost-100 font-semibold px-6 py-3 shadow-glow"
          >
            Get your free rune reading
          </Link>
        </div>

        <section id="your-deck" className="scroll-mt-8 rounded-2xl border border-wyrd-400/40 bg-wyrd-600/[0.08] px-6 py-7 text-center space-y-4">
          <p className="uppercase tracking-[0.3em] text-[10px] text-wyrd-400/90">For readers &amp; creators</p>
          <h2 className="font-display text-2xl text-frost-100 tracking-wide">Bring your own deck to life</h2>
          <p className="text-parchment/80 leading-relaxed">
            If you’re a reader with your own cards—or want to create a digital deck—and would love a platform like this,
            reach out to Tracy. She can help you every step of the way, whether you want to learn how to build it yourself,
            bring your existing deck online with your own branding, or turn your ideas into cards using AI-generated images.
          </p>
          <a
            href={DISCOVERY_CALL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-full bg-frost-500 text-void font-semibold px-6 py-3 hover:bg-frost-300 transition-colors"
          >
            Book a free discovery call
          </a>
          <p className="text-parchment/50 text-sm">
            or email{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="underline underline-offset-4 hover:text-parchment/80">
              {CONTACT_EMAIL}
            </a>
          </p>
        </section>
      </main>
    </PageFrame>
  );
}
