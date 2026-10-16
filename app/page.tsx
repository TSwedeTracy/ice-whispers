import type { Metadata } from "next";
import ReadingApp from "@/components/ReadingApp";
import HomeContent from "@/components/HomeContent";
import { FAQ } from "@/lib/faq";
import { SITE_URL, SITE_NAME, jsonLd } from "@/lib/seo";
import { COMPANY } from "@/lib/legal";

export const metadata: Metadata = {
  title: { absolute: "Free Rune Reading Online — Ask the Elder Futhark Runes | ICE WHISPERS™" },
  description:
    "Get a free rune reading every day. Ask your question, draw from the ICE WHISPERS™ Elder Futhark deck and receive a reading that answers it — love, work, money and decisions. Any language.",
  alternates: { canonical: "/" },
};

// Structured data so Google and AI assistants understand what this page is.
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#org`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/cards/web/logo.webp`,
      email: COMPANY.email,
      parentOrganization: { "@type": "Organization", name: COMPANY.name },
    },
    {
      "@type": "WebApplication",
      name: "ICE WHISPERS™ Rune Reading",
      url: SITE_URL,
      applicationCategory: "LifestyleApplication",
      operatingSystem: "Any (web browser)",
      description:
        "Online rune reading with the 24 Elder Futhark runes and Wyrd. One free Daily Rune reading every day; Three Norns and Five Rune Cross spreads.",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD", description: "One free Daily Rune reading every day" },
      publisher: { "@id": `${SITE_URL}/#org` },
      inLanguage: "en",
    },
    {
      "@type": "FAQPage",
      mainEntity: FAQ.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ],
};

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(structuredData)} />
      <ReadingApp />
      <HomeContent />
    </>
  );
}
