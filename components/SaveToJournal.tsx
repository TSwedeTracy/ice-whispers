"use client";

import { useState } from "react";
import Link from "next/link";

// Saving is always the member's choice — some questions are private.
export default function SaveToJournal({ readingId, isPlus }: { readingId: string | null; isPlus: boolean }) {
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  if (!readingId) return null;

  if (!isPlus) {
    return (
      <p className="text-center text-parchment/40 text-xs">
        Members can keep readings in a private rune journal.
      </p>
    );
  }

  if (state === "saved") {
    return (
      <p className="text-center text-frost-300 text-sm">
        Saved to your journal ·{" "}
        <Link href="/journal" className="underline underline-offset-4">
          open journal
        </Link>
      </p>
    );
  }

  async function save() {
    setState("saving");
    const res = await fetch("/api/journal", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id: readingId, saved: true }),
    }).catch(() => null);
    setState(res?.ok ? "saved" : "error");
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        type="button"
        onClick={save}
        disabled={state === "saving"}
        className="rounded-full border border-wyrd-400/50 text-wyrd-400 text-sm font-semibold px-5 py-2 hover:bg-wyrd-400/10 transition-colors disabled:opacity-60"
      >
        {state === "saving" ? "Saving…" : "Save to my journal"}
      </button>
      <p className="text-parchment/35 text-[11px]">Only you can see your journal. Unsaved readings are erased after 24 hours.</p>
      {state === "error" && <p className="text-red-400/90 text-xs">Could not save — please try again.</p>}
    </div>
  );
}
