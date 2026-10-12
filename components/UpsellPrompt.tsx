"use client";

import { useState } from "react";
import SpreadPreview from "@/components/SpreadPreview";
import AuthForm from "@/components/AuthForm";
import Link from "next/link";

type Product = "dayPass" | "plusMonthly" | "plusYearly";
export type UpsellReason = "limit_reached" | "day_pass_used" | "monthly_quota" | "locked_spread";

const COPY: Record<UpsellReason, { title: string; subtitle: string }> = {
  limit_reached: {
    title: "The Runes Rest",
    subtitle: "Come back tomorrow for another free reading — or keep asking the runes today.",
  },
  day_pass_used: {
    title: "Your 24 Hours Are Used",
    subtitle: "You've drawn all readings in your 24-hour unlock. Come back tomorrow for a free reading — or go deeper below.",
  },
  monthly_quota: {
    title: "This Month's Readings Are Drawn",
    subtitle: "You've used this month's readings. They return at the start of your next month.",
  },
  locked_spread: {
    title: "Three Norns & Five Rune Cross",
    subtitle: "The deeper spreads are part of ICE WHISPERS+.",
  },
};

export default function UpsellPrompt({ reason = "limit_reached" }: { reason?: UpsellReason }) {
  const [loading, setLoading] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [yearly, setYearly] = useState(true);
  const [needsAccount, setNeedsAccount] = useState<Product | null>(null);
  const [consent, setConsent] = useState(false);

  async function checkout(product: Product) {
    if (!consent) {
      setError("Please tick the box below to continue.");
      return;
    }
    setLoading(product);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ product, consent: true }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      if (data.error === "signin_required") setNeedsAccount(product);
      else setError("Checkout could not start — please try again.");
    } catch {
      setError("Checkout could not start — please try again.");
    }
    setLoading(null);
  }

  const copy = COPY[reason];
  const plusProduct: Product = yearly ? "plusYearly" : "plusMonthly";

  if (needsAccount) {
    return (
      <div className="w-full max-w-md mx-auto text-center space-y-4 animate-fadeUp">
        <AuthForm
          initialMode="signup"
          intro="Your membership and private journal are linked to your account, so they follow you to every device."
          onDone={() => {
            const p = needsAccount;
            setNeedsAccount(null);
            checkout(p);
          }}
        />
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto text-center space-y-6 animate-fadeUp">
      <div className="space-y-1">
        <p className="font-display text-2xl text-frost-100 tracking-wide">{copy.title}</p>
        <p className="text-parchment/60 text-sm">{copy.subtitle}</p>
      </div>

      {reason !== "monthly_quota" && reason !== "locked_spread" && (
        <div className="flex flex-col gap-3">
          <button
            onClick={() => checkout("dayPass")}
            disabled={loading !== null}
            className="w-full rounded-full bg-frost-500 text-void font-semibold py-3 hover:bg-frost-300 transition-colors disabled:opacity-60"
          >
            {loading === "dayPass" ? "Opening checkout…" : "Unlock 24 hours — $1"}
          </button>
          <p className="text-parchment/40 text-xs -mt-1">Up to 10 single-rune readings for the next 24 hours. No account needed.</p>
          {!consent && <p className="text-parchment/35 text-[11px] -mt-1">Tick the box at the bottom to accept the terms first.</p>}
        </div>
      )}

      <div className="flex flex-col gap-3 pt-6 border-t border-white/10">
        <div className="space-y-1">
          <p className="font-display text-xl text-frost-100 tracking-wide">Want deeper readings?</p>
          <p className="text-parchment/60 text-sm">
            ICE WHISPERS+ opens every spread of the Nordic deck — and keeps your private rune journal.
          </p>
        </div>

        <SpreadPreview />

        <ul className="text-left text-sm text-parchment/75 space-y-1.5 mx-auto">
          <li>ᚱ  Daily Rune, Three Norns and Five Rune Cross</li>
          <li>ᚱ  Readings that answer your exact question, in your language</li>
          <li>ᚱ  A private journal: save readings, add notes, note what happened — download as PDF</li>
          <li>ᚱ  Up to 300 readings a month — what you don't use today stays yours all month</li>
        </ul>

        <div className="mx-auto flex rounded-full border border-white/15 p-1 text-sm mt-1">
          <button
            onClick={() => setYearly(false)}
            className={`px-4 py-1.5 rounded-full transition-colors ${!yearly ? "bg-frost-500/20 text-frost-100" : "text-parchment/60"}`}
          >
            Monthly
          </button>
          <button
            onClick={() => setYearly(true)}
            className={`px-4 py-1.5 rounded-full transition-colors ${yearly ? "bg-frost-500/20 text-frost-100" : "text-parchment/60"}`}
          >
            Yearly · 2 months free
          </button>
        </div>

        <button
          onClick={() => checkout(plusProduct)}
          disabled={loading !== null}
          className="w-full rounded-full bg-gradient-to-r from-frost-700 via-frost-500 to-wyrd-600 text-frost-100 font-semibold py-3 shadow-glow hover:from-frost-500 hover:to-wyrd-400 transition-colors disabled:opacity-60"
        >
          {loading === plusProduct ? "Opening checkout…" : yearly ? "Join ICE WHISPERS+ — $97/year" : "Join ICE WHISPERS+ — $9.70/month"}
        </button>
        <label className="flex gap-2 items-start text-left text-[12px] text-parchment/60 leading-snug mt-1 cursor-pointer">
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 accent-frost-500" />
          <span>
            I accept the{" "}
            <Link href="/terms" target="_blank" className="underline underline-offset-2">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" target="_blank" className="underline underline-offset-2">
              Privacy Policy
            </Link>
            , and ask for access to start right away. I understand that if I withdraw within 14 days I pay for the time
            used, and that the 24-hour unlock can’t be withdrawn once its 24 hours are over.
          </span>
        </label>
        <p className="text-parchment/30 text-[11px]">Cancel anytime. Prices include VAT. Secure payment by Stripe.</p>
        {error && <p className="text-red-400/90 text-sm">{error}</p>}
      </div>
    </div>
  );
}
