"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SpreadPreview from "@/components/SpreadPreview";
import AuthForm from "@/components/AuthForm";
import type { DisplayPrices } from "@/lib/pricing";

type Product = "dayPass" | "plusMonthly" | "plusYearly";
export type UpsellReason = "limit_reached" | "day_pass_used" | "monthly_quota" | "locked_spread" | "upgrade";

const COPY: Record<UpsellReason, { title: string; subtitle: string }> = {
  limit_reached: {
    title: "The Runes Rest",
    subtitle: "You've drawn today's free rune. Come back tomorrow — or keep asking the runes now.",
  },
  day_pass_used: {
    title: "Your 24 Hours Are Used",
    subtitle: "You've drawn all readings in your 24-hour unlock. Go deeper with ICE WHISPERS+.",
  },
  monthly_quota: {
    title: "This Month's Readings Are Drawn",
    subtitle: "You've used this month's readings. They return at the start of your next month.",
  },
  locked_spread: {
    title: "Three Norns & Five Rune Cross",
    subtitle: "Unlock 24 hours to try them — or keep them with ICE WHISPERS+.",
  },
  upgrade: {
    title: "Choose Your Path",
    subtitle: "Every option uses the same Nordic deck and readings that answer your exact question.",
  },
};

export default function UpsellPrompt({ reason = "limit_reached" }: { reason?: UpsellReason }) {
  const [loading, setLoading] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [needsAccount, setNeedsAccount] = useState<Product | null>(null);
  const [consent, setConsent] = useState(false);
  const [credit, setCredit] = useState(false);
  const [hasDayPass, setHasDayPass] = useState(false);
  const [prices, setPrices] = useState<DisplayPrices | null>(null);

  useEffect(() => {
    fetch("/api/entitlement")
      .then((r) => r.json())
      .then((d) => {
        setCredit(Boolean(d.dayPassCredit));
        setHasDayPass(Boolean(d.hasDayPass));
        if (d.prices) setPrices(d.prices);
      })
      .catch(() => {});
  }, []);

  async function checkout(product: Product) {
    if (!consent) {
      setError("Please tick the box below the options to continue.");
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

  const copy = COPY[reason];
  // Prices arrive with /api/entitlement, in the visitor's own currency.
  const pr = (k: keyof DisplayPrices) => (prices ? prices[k] : "…");
  const showDayPass = !hasDayPass && reason !== "monthly_quota";

  const cols: {
    id: Product;
    name: string;
    price: string;
    per: string;
    note?: string;
    badge?: string;
    features: string[];
    cta: string;
    style: string;
  }[] = [
    ...(showDayPass
      ? [
          {
            id: "dayPass" as Product,
            name: "24 Hours",
            price: pr("dayPass"),
            per: "one time",
            features: ["All spreads: 1, 3 & 5 runes", "Up to 10 readings in 24 h", "No account needed"],
            cta: "Unlock",
            style: "border-white/15",
          },
        ]
      : []),
    {
      id: "plusMonthly",
      name: "ICE WHISPERS+",
      price: credit ? pr("monthlyCredited") : pr("monthly"),
      per: credit ? `first month, then ${pr("monthly")}/mo` : "per month",
      note: credit ? `Your ${pr("dayPass")} is credited` : undefined,
      features: ["All spreads: 1, 3 & 5 runes", "Private journal + PDF", "300 readings / month", `Switch to yearly for ${pr("monthToYear")}`],
      cta: "Join monthly",
      style: "border-frost-300/40",
    },
    {
      id: "plusYearly",
      name: "ICE WHISPERS+",
      price: credit ? pr("yearlyCredited") : pr("yearly"),
      per: credit ? `first year, then ${pr("yearly")}/yr` : "per year",
      note: credit ? `Your ${pr("dayPass")} is credited` : undefined,
      badge: "2 months free",
      features: ["All spreads: 1, 3 & 5 runes", "Private journal + PDF", "300 readings / month"],
      cta: "Join yearly",
      style: "border-wyrd-400/60 shadow-glowViolet",
    },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto text-center space-y-6 animate-fadeUp">
      <div className="space-y-1">
        <p className="font-display text-2xl text-frost-100 tracking-wide">{copy.title}</p>
        <p className="text-parchment/60 text-sm max-w-md mx-auto">{copy.subtitle}</p>
      </div>

      <div className={`grid gap-2 sm:gap-4 ${cols.length === 3 ? "grid-cols-3" : "grid-cols-2"}`}>
        {cols.map((c) => (
          <div key={c.id} className={`relative rounded-2xl border bg-white/[0.03] px-2 sm:px-4 pt-5 pb-3 flex flex-col ${c.style}`}>
            {c.badge && (
              <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-wyrd-600 px-2 py-0.5 text-[9px] sm:text-[10px] uppercase tracking-[0.15em] text-frost-100">
                {c.badge}
              </span>
            )}
            <p className="text-[10px] sm:text-xs uppercase tracking-[0.15em] text-frost-300/80 leading-tight min-h-[2.2em]">{c.name}</p>
            <p className="font-display text-2xl sm:text-3xl text-frost-100 mt-1">{c.price}</p>
            <p className="text-[10px] sm:text-xs text-parchment/50 leading-tight min-h-[2.4em]">{c.per}</p>
            {c.note && <p className="text-[10px] text-frost-300 mt-0.5">{c.note}</p>}
            <ul className="text-[11px] sm:text-sm text-parchment/80 text-left space-y-1.5 mt-3 flex-1">
              {c.features.map((f) => (
                <li key={f} className="leading-snug">
                  <span className="text-frost-300">ᚱ</span> {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => checkout(c.id)}
              disabled={loading !== null}
              className={`mt-3 w-full rounded-full py-2 text-xs sm:text-sm font-semibold transition-colors disabled:opacity-60 ${
                c.id === "dayPass"
                  ? "bg-frost-500 text-void hover:bg-frost-300"
                  : "bg-gradient-to-r from-frost-700 via-frost-500 to-wyrd-600 text-frost-100"
              }`}
            >
              {loading === c.id ? "…" : c.cta}
            </button>
          </div>
        ))}
      </div>

      {credit && reason !== "monthly_quota" && (
        <p className="text-parchment/50 text-xs">You have an active 24-hour unlock — the {pr("dayPass")} is credited if you join today.</p>
      )}

      <label className="flex gap-2 items-start text-left text-[12px] text-parchment/60 leading-snug cursor-pointer max-w-xl mx-auto">
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
          , and ask for access to start right away. I understand that if I withdraw within 14 days I pay for the time used,
          and that the 24-hour unlock can’t be withdrawn once its 24 hours are over.
        </span>
      </label>
      {error && <p className="text-red-400/90 text-sm">{error}</p>}

      <div className="pt-4 border-t border-white/10 space-y-3">
        <p className="text-parchment/60 text-sm">The deeper spreads</p>
        <div className="max-w-md mx-auto">
          <SpreadPreview />
        </div>
        <p className="text-parchment/30 text-[11px]">Cancel anytime. Prices include VAT. Secure payment by Stripe.</p>
      </div>
    </div>
  );
}
