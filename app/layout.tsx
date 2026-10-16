import type { Metadata } from "next";
import { Cinzel, EB_Garamond } from "next/font/google";
import "./globals.css";
import LegalLinks from "@/components/LegalLinks";
import Script from "next/script";

const display = Cinzel({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-display",
});

const body = EB_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.PUBLIC_SITE_URL || "https://www.icewhispers.com"),
  title: {
    default: "Free Rune Reading Online — Ask the Elder Futhark Runes | ICE WHISPERS™",
    template: "%s | ICE WHISPERS™",
  },
  description:
    "Get a free rune reading every day. Ask your question, draw from the ICE WHISPERS™ Elder Futhark deck and receive a reading that answers it — love, work, money and decisions.",
  applicationName: "ICE WHISPERS™",
  keywords: [
    "free rune reading",
    "rune reading online",
    "elder futhark",
    "rune meanings",
    "norse runes",
    "viking runes",
    "rune oracle",
    "rune cards",
    "yes or no rune reading",
    "daily rune",
  ],
  openGraph: {
    type: "website",
    siteName: "ICE WHISPERS™",
    title: "Free Rune Reading — Ask the Elder Futhark Runes",
    description: "Ask your question, draw a rune and receive a reading that answers it. One free Daily Rune every day.",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "ICE WHISPERS rune oracle cards" }],
    locale: "en_US",
  },
  twitter: { card: "summary_large_image", images: ["/og.jpg"] },
  // Search Console / Bing Webmaster verification codes, set in Vercel (optional).
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
    other: process.env.BING_SITE_VERIFICATION ? { "msvalidate.01": process.env.BING_SITE_VERIFICATION } : undefined,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="bg-void text-parchment font-body antialiased min-h-screen">
        {children}
        <footer className="relative z-10 pb-8">
          <LegalLinks />
        </footer>
        {/* Vercel Web Analytics — cookie-free page views, countries, devices.
            Turn it on in Vercel → project → Analytics → Enable. */}
        <Script src="/_vercel/insights/script.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
