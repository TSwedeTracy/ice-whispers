"use client";

import { useState } from "react";

// "Have more questions?" — shown under The Whisper. Suggestions come from
// the same AI call as the reading; clicking one only fills the box so the
// person can edit it. Normal limits apply when the next reading starts.
export default function FollowUp({
  heading,
  placeholder,
  suggestions,
  onAsk,
}: {
  heading: string;
  placeholder: string;
  suggestions: string[];
  onAsk: (question: string) => void;
}) {
  const [question, setQuestion] = useState("");

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
      <button
        type="button"
        disabled={question.trim().length < 3}
        onClick={() => onAsk(question.trim())}
        className="w-full rounded-full border border-frost-500/60 text-frost-100 font-semibold py-3 hover:bg-frost-500/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Draw Your Rune
      </button>
    </div>
  );
}
