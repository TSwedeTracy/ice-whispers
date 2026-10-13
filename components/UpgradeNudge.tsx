"use client";

import { useState } from "react";

// Shown under a reading:
//  - 24-hour unlock holders: join ICE WHISPERS+ with the $1 credited.
//  - Monthly members: switch to yearly for $87 (the month already paid is credited).
export default function UpgradeNudge({
  isPlus,
  hasDayPass,
  interval,
  onOpenOptions,
  onUpgraded,
}: {
  isPlus: boolean;
  hasDayPass: boolean;
  interval: string | null;
  onOpenOptions: () => void;
  onUpgraded: () => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const box = "w-full max-w-xl mx-auto rounded-2xl border border-wyrd-400/40 bg-wyrd-600/[0.08] px-5 py-4 text-center space-y-2";

  if (!isPlus && hasDayPass) {
    return (
      <div className={box}>
        <p className="text-frost-100 font-semibold">Enjoying the runes?</p>
        <p className="text-parchment/70 text-sm">
          Keep every spread and your private rune journal with ICE WHISPERS+ — your $1 is credited.
        </p>
        <button onClick={onOpenOptions} className="rounded-full bg-gradient-to-r from-frost-700 via-frost-500 to-wyrd-600 text-frost-100 font-semibold px-5 py-2 text-sm">
          Upgrade — first month only $8.70
        </button>
      </div>
    );
  }

  if (isPlus && interval === "month") {
    if (state === "done") {
      return (
        <div className={box}>
          <p className="text-frost-300 text-sm">Welcome to your year with the runes — your yearly membership is active.</p>
        </div>
      );
    }

    async function upgrade() {
      setState("busy");
      setError(null);
      const res = await fetch("/api/upgrade", { method: "POST" }).catch(() => null);
      const data = await res?.json().catch(() => ({}));
      if (res?.ok) {
        setState("done");
        onUpgraded();
      } else {
        setError(data?.message ?? "The upgrade could not be completed — please try again.");
        setState("error");
      }
    }

    return (
      <div className={box}>
        <p className="text-frost-100 font-semibold">Stay a whole year — 2 months free</p>
        {!confirming ? (
          <>
            <p className="text-parchment/70 text-sm">Switch to yearly and the month you’ve paid for is credited.</p>
            <button onClick={() => setConfirming(true)} className="rounded-full bg-gradient-to-r from-frost-700 via-frost-500 to-wyrd-600 text-frost-100 font-semibold px-5 py-2 text-sm">
              Upgrade to a year for only $87
            </button>
          </>
        ) : (
          <>
            <p className="text-parchment/70 text-sm">
              Your card on file is charged <strong>$87</strong> today and your yearly membership starts now. It then
              renews at $97/year. Cancel anytime.
            </p>
            <div className="flex justify-center gap-3">
              <button onClick={upgrade} disabled={state === "busy"} className="rounded-full bg-frost-500 text-void font-semibold px-5 py-2 text-sm disabled:opacity-60">
                {state === "busy" ? "One moment…" : "Confirm upgrade"}
              </button>
              <button onClick={() => setConfirming(false)} className="text-parchment/50 text-sm underline underline-offset-4">
                Not now
              </button>
            </div>
          </>
        )}
        {error && <p className="text-red-400/90 text-xs">{error}</p>}
      </div>
    );
  }

  return null;
}
