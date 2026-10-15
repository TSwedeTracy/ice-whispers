"use client";

import { useState } from "react";

// "Have more questions?" — shown under The Whisper. Suggestions come from
// the same AI call as the reading; clicking one only fills the box so the
// person can edit it. Normal limits apply when the next reading starts.
type Spread = "daily" | "three_norns" | "five_cross";

const SPREADS: { id: Spread; label: string }[] = [
  { id: "daily", label: "1 rune" },
  { id: "three_norns", label: "Three Norns · 3" },
  { id: "five_cross", label: "Five Rune Cross · 5" },
];

export default function FollowUp({
  heading,
  placeholder,
  suggestions,
  spread,
  spreadsUnlocked,
  onLockedSpread,
  onAsk,
}: {
  heading: string;
  placeholder: string;
  suggestions: string[];
  spread: Spread;
  spreadsUnlocked: boolean;
  onLockedSpread: (question: string, spread: Spread) => void;
  onAsk: (question: string, spread: Spread) => void;
}) {
  const [question, setQuestion] = useState("");
  // The next reading can use any spread — not only the one just drawn.
  const [next, setNext] = useState<Spread>(spreadsUnlocked ? spread : "daily");

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col gap-3 animate-fadeUp">
      <p className="font-display text-lg text-frost-100 tracking-wide text-center">{heading}</p>
      {suggestions.length > 0 && (
        <div className="flex flex-col gap-2">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setQuestion(s)}
              className="text-left rounded-xl border border-frost-300/25 bg-white/[0.02] px-4 py-2.5 text-sm text-parchment/85 hover:border-frost-300/60 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}
      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder={placeholder}
        rows={2}
        className="w-full resize-none rounded-2xl bg-void/45 border border-frost-300/40 focus:border-frost-500 focus:outline-none px-5 py-3 text-parchment placeholder:text-frost-300/70"
      />
      <div className="flex justify-center gap-2 flex-wrap">
        {SPREADS.map((s) => {
          const locked = s.id !== "daily" && !spreadsUnlocked;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => (locked ? onLockedSpread(question.trim(), s.id) : setNext(s.id))}
              className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                next === s.id ? "border-frost-500 text-frost-100 bg-frost-500/10" : "border-white/10 text-parchment/60 hover:border-white/25"
              } ${locked ? "opacity-40" : ""}`}
            >
              {s.label}
              {locked && <span className="ml-1 text-[9px] align-super">+</span>}
            </button>
          );
        })}
      </div>
      <button
        type="button"
        disabled={question.trim().length < 3}
        onClick={() => onAsk(question.trim(), next)}
        className="w-full rounded-full border border-frost-500/60 text-frost-100 font-semibold py-3 hover:bg-frost-500/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {next === "daily" ? "Draw Your Rune" : "Draw Your Runes"}
      </button>
    </div>
  );
}
