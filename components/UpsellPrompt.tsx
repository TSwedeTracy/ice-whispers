"use client";

import { useState } from "react";

type Product = "dayPass" | "seeker" | "plus";

export default function UpsellPrompt({ reason }: { reason?: "limit_reached" | "monthly_quota" | "locked_spread" }) {
  const [loading, setLoading] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function checkout(product: Product) {
    setLoading(product);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ product }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setError("Checkout could not start — please try again.");
    } catch {
      setError("Checkout could not start — please try again.");
    }
    setLoading(null);
  }

  const title = reason === "monthly_quota" ? "This Month's Readings Are Used" : "The Runes Rest";
  const subtitle =
    reason === "monthly_quota"
      ? "You've used all readings in your plan this month. They renew with your next billing period — or continue today."
      : reason === "locked_spread"
      ? "Three Norns and the Five Rune Cross are part of a monthly plan."
      : "Come back tomorrow for another free reading — or keep asking the runes today.";

  return (
    <div className="w-full max-w-md mx-auto text-center space-y-6 animate-fadeUp">
      <div className="space-y-1">
        <p className="font-display text-2xl text-frost-100 tracking-wide">{title}</p>
        <p className="text-parchment/60 text-sm">{subtitle}</p>
      </div>

      <div className="flex flex-col gap-3">
        <button
          onClick={() => checkout("dayPass")}
          disabled={loading !== null}
          className="w-full rounded-full bg-frost-500 text-void font-semibold py-3 hover:bg-frost-300 transition-colors disabled:opacity-60"
        >
          {loading === "dayPass" ? "Opening checkout…" : "Continue Today — $1"}
        </button>
        <p className="text-parchment/40 text-xs -mt-1">Digital rune readings for the next 24 hours.</p>

        <button
          onClick={() => checkout("seeker")}
          disabled={loading !== null}
          className="w-full rounded-full border border-frost-300/50 text-frost-100 font-semibold py-3 hover:bg-frost-300/10 transition-colors disabled:opacity-60"
        >
          {loading === "seeker" ? "Opening checkout…" : "Seeker — $5.90/month"}
        </button>
        <p className="text-parchment/40 text-xs -mt-1">100 readings a month · Three Norns · Five Rune Cross</p>

        <div className="relative">
          <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-wyrd-600 px-3 py-0.5 text-[10px] uppercase tracking-[0.2em] text-frost-100">
            Most value
          </span>
          <button
            onClick={() => checkout("plus")}
            disabled={loading !== null}
            className="w-full rounded-full border border-wyrd-400/60 text-wyrd-400 font-semibold py-3 hover:bg-wyrd-400/10 transition-colors disabled:opacity-60"
          >
            {loading === "plus" ? "Opening checkout…" : "ICE WHISPERS+ — $9.90/month"}
          </button>
        </div>
        <p className="text-parchment/40 text-xs -mt-1">500 readings a month · Three Norns · Five Rune Cross</p>

        <p className="text-parchment/30 text-[11px] mt-2">Cancel anytime. Secure payment by Stripe.</p>
        {error && <p className="text-red-400/90 text-sm">{error}</p>}
      </div>
    </div>
  );
}
