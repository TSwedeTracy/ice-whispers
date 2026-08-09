"use client";

import { useState } from "react";

const COUNTRIES = [
  "United States", "United Kingdom", "Canada", "Australia", "Sweden", "Norway", "Denmark", "Finland",
  "Iceland", "Germany", "Netherlands", "Belgium", "France", "Spain", "Italy", "Portugal", "Ireland",
  "Switzerland", "Austria", "Poland", "Czech Republic", "Greece", "New Zealand", "Japan", "South Korea",
  "Singapore", "Brazil", "Mexico", "Other",
] as const;

export default function WaitlistPrompt() {
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function submit() {
    setStatus("loading");
    const res = await fetch("/api/waitlist", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, country: country || null, source: "post_reading_cta" }),
    });
    setStatus(res.ok ? "done" : "error");
  }

  if (status === "done") {
    return (
      <div className="w-full max-w-md mx-auto text-center rounded-2xl border border-frost-500/25 bg-void/45 px-5 py-4 animate-fadeUp">
        <p className="text-frost-300 text-sm">You're on the waitlist — we'll email you the moment the physical deck launches.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto text-center space-y-3 rounded-2xl border border-frost-300/40 bg-void/45 shadow-[0_4px_24px_rgba(0,0,0,0.4)] px-5 py-5 animate-fadeUp">
      <p className="uppercase tracking-[0.3em] text-[10px] text-frost-300/70">Pre-launch waitlist</p>
      <p className="font-display text-lg text-frost-100 tracking-wide">Want to hold the runes in your hands?</p>
      <p className="text-parchment/60 text-sm">
        The physical ICE WHISPERS™ Elder Futhark deck is coming soon. Leave your email to show your interest — no
        spam, just one message when it's ready to order.
      </p>
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="flex-1 rounded-full bg-void/60 border border-frost-300/40 focus:border-frost-500 focus:outline-none px-4 py-2 text-sm text-parchment placeholder:text-frost-300/60"
          />
          <button
            onClick={submit}
            disabled={status === "loading" || !email.includes("@")}
            className="rounded-full bg-frost-100 disabled:bg-void/60 disabled:border disabled:border-white/15 disabled:text-parchment/50 text-void text-sm font-semibold px-5 py-2 hover:bg-white disabled:cursor-not-allowed transition-colors"
          >
            Join the Waitlist
          </button>
        </div>
        <select
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="rounded-full bg-void/60 border border-frost-300/40 focus:border-frost-500 focus:outline-none px-4 py-2 text-sm text-parchment appearance-none text-center"
        >
          <option value="" className="bg-void text-parchment/60">
            Where should we ship to? (optional)
          </option>
          {COUNTRIES.map((c) => (
            <option key={c} value={c} className="bg-void text-parchment">
              {c}
            </option>
          ))}
        </select>
      </div>
      {status === "error" && <p className="text-red-400 text-xs">Something went wrong — try again.</p>}
    </div>
  );
}
