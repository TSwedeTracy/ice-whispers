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
  title: "ICE WHISPERS™ — Rune Oracle",
  description:
    "Ask the Elder Futhark runes. ICE WHISPERS™ is a Nordic rune divination experience — the digital companion to the ICE WHISPERS™ physical deck.",
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
