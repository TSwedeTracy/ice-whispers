"use client";

export default function UpsellPrompt() {
  async function checkout(product: "topup" | "subscription") {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ product }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  }

  return (
    <div className="w-full max-w-md mx-auto text-center space-y-6 animate-fadeUp">
      <div className="space-y-1">
        <p className="font-display text-2xl text-frost-100 tracking-wide">The Runes Rest</p>
        <p className="text-parchment/60 text-sm">
          Come back tomorrow for another free reading — or keep asking the runes today.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <button
          onClick={() => checkout("topup")}
          className="w-full rounded-full bg-frost-500 text-void font-semibold py-3 hover:bg-frost-300 transition-colors"
        >
          Continue Today — $0.99
        </button>
        <p className="text-parchment/40 text-xs -mt-1">Unlock up to 5 more digital rune readings today.</p>

        <button
          onClick={() => checkout("subscription")}
          className="w-full rounded-full border border-wyrd-400/50 text-wyrd-400 font-semibold py-3 hover:bg-wyrd-400/10 transition-colors"
        >
          Go Unlimited — $4.99/month
        </button>
        <p className="text-parchment/40 text-xs -mt-1">
          ICE WHISPERS+ — unlimited readings, Three Norns, Five Rune Cross, reading history.
        </p>
      </div>
    </div>
  );
}
