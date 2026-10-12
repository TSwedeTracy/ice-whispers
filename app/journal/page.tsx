"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getRuneById } from "@/lib/runes";
import { cardImagePath } from "@/lib/rune-assets";

interface Entry {
  id: string;
  created_at: string;
  spread_type: string;
  question: string;
  cards: { runeId: number; reversed: boolean; position?: string }[];
  answer: string;
  reading: string;
  guidance: string;
  whisper: string;
  notes: string | null;
  outcome_notes: string | null;
}

const SPREAD_NAME: Record<string, string> = {
  daily: "Daily Rune",
  three_norns: "Three Norns",
  five_cross: "Five Rune Cross",
};

export default function JournalPage() {
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [state, setState] = useState<"loading" | "ok" | "signed_out" | "members_only" | "error">("loading");

  useEffect(() => {
    fetch("/api/journal")
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (res.ok) {
          setEntries(data.entries);
          setState("ok");
        } else setState(data.error === "signed_out" || data.error === "members_only" ? data.error : "error");
      })
      .catch(() => setState("error"));
  }, []);

  return (
    <main className="min-h-screen px-5 py-12 flex flex-col items-center gap-8 journal">
      <div className="w-full max-w-2xl flex justify-between items-center print:hidden">
        <Link href="/" className="text-frost-300/80 text-xs uppercase tracking-[0.25em]">
          ← Ask the runes
        </Link>
        {state === "ok" && entries && entries.length > 0 && (
          <button
            onClick={() => window.print()}
            className="rounded-full border border-frost-300/40 text-frost-100 text-sm px-4 py-2 hover:bg-frost-300/10"
          >
            Download PDF
          </button>
        )}
      </div>

      <div className="text-center space-y-1">
        <p className="uppercase tracking-[0.35em] text-frost-300 text-xs">ICE WHISPERS™</p>
        <h1 className="font-display text-3xl text-frost-100 tracking-wide">Rune Journal</h1>
      </div>

      {state === "loading" && <p className="text-parchment/50 text-sm">Opening your journal…</p>}
      {state === "signed_out" && (
        <p className="text-parchment/70 text-sm">
          Please{" "}
          <Link href="/account" className="underline underline-offset-4">
            sign in
          </Link>{" "}
          to open your journal.
        </p>
      )}
      {state === "members_only" && (
        <p className="text-parchment/70 text-sm text-center max-w-sm">
          The rune journal is part of ICE WHISPERS+.{" "}
          <Link href="/account" className="underline underline-offset-4">
            See membership
          </Link>
        </p>
      )}
      {state === "error" && <p className="text-red-400/90 text-sm">The journal could not be opened — please try again.</p>}
      {state === "ok" && entries?.length === 0 && (
        <p className="text-parchment/60 text-sm text-center max-w-sm">
          Your journal is empty. After a reading, choose “Save to my journal” to keep it here.
        </p>
      )}

      <div className="w-full max-w-2xl flex flex-col gap-6">
        {entries?.map((e) => (
          <JournalEntry key={e.id} entry={e} onRemoved={() => setEntries((all) => all?.filter((x) => x.id !== e.id) ?? null)} />
        ))}
      </div>
    </main>
  );
}

function JournalEntry({ entry, onRemoved }: { entry: Entry; onRemoved: () => void }) {
  const [notes, setNotes] = useState(entry.notes ?? "");
  const [outcome, setOutcome] = useState(entry.outcome_notes ?? "");
  const [saved, setSaved] = useState<"idle" | "saving" | "saved">("idle");
  const date = new Date(entry.created_at).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });

  async function saveNotes() {
    setSaved("saving");
    await fetch("/api/journal", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id: entry.id, notes, outcome }),
    }).catch(() => null);
    setSaved("saved");
  }

  async function remove() {
    if (!window.confirm("Remove this reading from your journal? It will be erased.")) return;
    await fetch("/api/journal", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id: entry.id }),
    }).catch(() => null);
    onRemoved();
  }

  return (
    <article className="journal-entry rounded-2xl border border-white/10 bg-white/[0.02] px-5 py-5 space-y-4">
      <div className="flex justify-between items-baseline gap-3">
        <p className="text-frost-300/80 text-xs uppercase tracking-[0.2em]">
          {date} · {SPREAD_NAME[entry.spread_type] ?? entry.spread_type}
        </p>
        <p className="font-display text-frost-100 text-sm">{entry.answer}</p>
      </div>
      <p className="font-display text-lg text-frost-100 leading-snug">“{entry.question}”</p>

      <div className="flex flex-wrap gap-3">
        {entry.cards.map((c, i) => {
          const rune = getRuneById(c.runeId);
          return (
            <div key={i} className="flex items-center gap-2">
              <div className="relative w-9 aspect-[2/3] rounded overflow-hidden bg-void">
                <Image src={cardImagePath(c.runeId)} alt="" fill sizes="36px" className={`object-contain ${c.reversed ? "rotate-180" : ""}`} />
              </div>
              <div className="text-xs leading-tight">
                {c.position && <p className="text-frost-300/70">{c.position}</p>}
                <p className="text-parchment/90">
                  {rune.symbol} {rune.name}
                  {c.reversed ? " (reversed)" : ""}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {entry.reading && <p className="text-parchment/80 text-sm leading-relaxed">{entry.reading}</p>}
      <p className="text-parchment/90 leading-relaxed">{entry.guidance}</p>
      <p className="text-parchment/80 italic leading-relaxed border-l-2 border-wyrd-400/40 pl-3">{entry.whisper}</p>

      <div className="space-y-2 pt-2 border-t border-white/10">
        <label className="block text-xs uppercase tracking-[0.2em] text-frost-300/70">My notes</label>
        <textarea
          value={notes}
          onChange={(e) => {
            setNotes(e.target.value);
            setSaved("idle");
          }}
          rows={2}
          placeholder="What did this reading stir in you?"
          className="w-full rounded-xl bg-void/50 border border-white/10 focus:border-frost-500 focus:outline-none px-3 py-2 text-sm text-parchment print:hidden"
        />
        <p className="hidden print:block text-sm whitespace-pre-wrap">{notes || "—"}</p>
        <label className="block text-xs uppercase tracking-[0.2em] text-frost-300/70">What happened next</label>
        <textarea
          value={outcome}
          onChange={(e) => {
            setOutcome(e.target.value);
            setSaved("idle");
          }}
          rows={2}
          placeholder="Come back later and write what actually happened."
          className="w-full rounded-xl bg-void/50 border border-white/10 focus:border-frost-500 focus:outline-none px-3 py-2 text-sm text-parchment print:hidden"
        />
        <p className="hidden print:block text-sm whitespace-pre-wrap">{outcome || "—"}</p>
        <div className="flex justify-between items-center print:hidden">
          <button
            onClick={saveNotes}
            disabled={saved === "saving"}
            className="rounded-full border border-frost-300/40 text-frost-100 text-xs px-4 py-1.5 hover:bg-frost-300/10"
          >
            {saved === "saving" ? "Saving…" : saved === "saved" ? "Saved ✓" : "Save notes"}
          </button>
          <button onClick={remove} className="text-parchment/40 text-xs underline underline-offset-4">
            Remove
          </button>
        </div>
      </div>
    </article>
  );
}
