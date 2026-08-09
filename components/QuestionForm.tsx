"use client";

import { useState } from "react";
import Image from "next/image";
import { LOGO } from "@/lib/rune-assets";

const SPREADS = [
  { id: "daily", label: "Daily Rune", subtitle: "One rune", free: true },
  { id: "three_norns", label: "Three Norns", subtitle: "Past · Present · What May Come", free: false },
  { id: "five_cross", label: "Five Rune Cross", subtitle: "A fuller reading of the situation", free: false },
] as const;

export default function QuestionForm({
  onSubmit,
  isPlus,
}: {
  onSubmit: (question: string, spread: "daily" | "three_norns" | "five_cross") => void;
  isPlus: boolean;
}) {
  const [question, setQuestion] = useState("");
  const [spread, setSpread] = useState<"daily" | "three_norns" | "five_cross">("daily");

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center gap-8 animate-fadeUp">
      <div className="text-center space-y-3 flex flex-col items-center">
        <p className="uppercase tracking-[0.35em] text-frost-300 text-xs font-body">Ask the Runes</p>
        <Image src={LOGO} alt="ICE WHISPERS — Rune Oracle" width={1254} height={1254} priority className="w-52 md:w-64 h-auto -my-4" />
        <p className="text-parchment/70 max-w-md mx-auto text-base leading-relaxed">
          Ask your question — of love, work, money, a decision, a challenge, or the path ahead.
        </p>
      </div>

      <div className="w-full flex flex-col gap-3">
        <div className="flex justify-center gap-2 flex-wrap">
          {SPREADS.map((s) => {
            const locked = !s.free && !isPlus;
            return (
              <button
                key={s.id}
                type="button"
                disabled={locked}
                onClick={() => setSpread(s.id)}
                className={`px-4 py-2 rounded-full text-sm border transition-colors ${
                  spread === s.id
                    ? "border-frost-500 text-frost-100 bg-frost-500/10"
                    : "border-white/10 text-parchment/60 hover:border-white/25"
                } ${locked ? "opacity-40 cursor-not-allowed" : ""}`}
                title={locked ? "Unlock with ICE WHISPERS+" : s.subtitle}
              >
                {s.label}
                {locked && <span className="ml-1 text-[10px] align-super">+</span>}
              </button>
            );
          })}
        </div>

        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Write your question here"
          rows={3}
          className="w-full resize-none rounded-2xl bg-void/45 border border-frost-300/40 focus:border-frost-500 focus:outline-none focus:ring-1 focus:ring-frost-500/40 px-5 py-4 text-parchment placeholder:text-frost-300/70 font-body text-lg transition-colors shadow-[0_4px_24px_rgba(0,0,0,0.4)]"
        />

        <button
          type="button"
          disabled={question.trim().length < 3}
          onClick={() => onSubmit(question.trim(), spread)}
          className="mt-2 w-full rounded-full bg-gradient-to-r from-frost-700 via-frost-500 to-wyrd-600 disabled:bg-void/60 disabled:bg-none disabled:border disabled:border-white/15 disabled:text-parchment/50 disabled:cursor-not-allowed text-frost-100 font-body font-semibold tracking-wide py-3.5 shadow-glow hover:from-frost-500 hover:to-wyrd-400 transition-colors"
        >
          Draw Your Rune
        </button>
      </div>
    </div>
  );
}
