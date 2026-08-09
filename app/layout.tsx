import type { Metadata } from "next";
import { Cinzel, EB_Garamond } from "next/font/google";
import "./globals.css";

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
      </body>
    </html>
  );
}
