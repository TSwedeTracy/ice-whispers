"use client";

import { Reading } from "@/lib/ai";

export default function ReadingResult({ reading }: { reading: Reading }) {
  return (
    <div className="w-full max-w-xl mx-auto flex flex-col gap-6 animate-fadeUp">
      <div className="text-center">
        <p className="uppercase tracking-[0.3em] text-xs text-frost-300/80 mb-2">Your Answer</p>
        <p className="font-display text-2xl md:text-3xl text-frost-100 tracking-wide">{reading.answer}</p>
      </div>

      {reading.cardReadings ? (
        <>
          {reading.cardReadings.map((c) => (
            <div key={c.position} className="rounded-2xl border border-white/10 bg-white/[0.02] px-5 py-4">
              <p className="uppercase tracking-[0.3em] text-[10px] text-frost-300/70 mb-2">{c.position}</p>
              <p className="font-display text-lg text-frost-100 mb-2">
                <span className="mr-2">{c.symbol}</span>
                {c.runeName}
                {c.reversed ? " (reversed)" : ""}
              </p>
              <p className="text-parchment/90 leading-relaxed">{c.text}</p>
            </div>
          ))}
          <Section title="Together" text={reading.reading} />
        </>
      ) : (
        <Section title="The Reading" text={reading.reading} />
      )}
      <Section title="The Guidance" text={reading.guidance} />

      <div className="rounded-2xl border border-wyrd-400/25 bg-wyrd-600/[0.06] px-5 py-4">
        <p className="uppercase tracking-[0.3em] text-[10px] text-wyrd-400/90 mb-2">The Whisper</p>
        <p className="text-parchment/90 italic leading-relaxed">{reading.whisper}</p>
      </div>
    </div>
  );
}

function Section({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-5 py-4">
      <p className="uppercase tracking-[0.3em] text-[10px] text-frost-300/70 mb-2">{title}</p>
      <p className="text-parchment/90 leading-relaxed">{text}</p>
    </div>
  );
}
