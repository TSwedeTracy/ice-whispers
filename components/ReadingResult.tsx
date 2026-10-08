"use client";

import { Reading, DEFAULT_LABELS } from "@/lib/ai";

export default function ReadingResult({ reading }: { reading: Reading }) {
  // Headings come back in the question's language; older stored readings
  // without labels fall back to English.
  const labels = reading.labels ?? DEFAULT_LABELS;

  return (
    <div lang={reading.language} className="w-full max-w-xl mx-auto flex flex-col gap-6 animate-fadeUp">
      <div className="text-center">
        <p className="uppercase tracking-[0.3em] text-xs text-frost-300/80 mb-2">{labels.answer}</p>
        <p className="font-display text-2xl md:text-3xl text-frost-100 tracking-wide">{reading.answer}</p>
      </div>

      {reading.cardReadings ? (
        <>
          {reading.cardReadings.map((c, i) => (
            <div key={i} className="rounded-2xl border border-white/10 bg-white/[0.02] px-5 py-4">
              <p className="uppercase tracking-[0.3em] text-[10px] text-frost-300/70 mb-2">{c.position}</p>
              <p className="font-display text-lg text-frost-100 mb-2">
                <span className="mr-2">{c.symbol}</span>
                {c.runeName}
                {c.reversed ? ` (${labels.reversed})` : ""}
              </p>
              <p className="text-parchment/90 leading-relaxed">{c.text}</p>
            </div>
          ))}
        </>
      ) : (
        <Section title={labels.card} text={reading.cardMeaning} />
      )}
      <Section title={labels.reading} text={reading.interpretation} />

      <div className="rounded-2xl border border-wyrd-400/25 bg-wyrd-600/[0.06] px-5 py-4">
        <p className="uppercase tracking-[0.3em] text-[10px] text-wyrd-400/90 mb-2">{labels.whisper}</p>
        <p className="text-parchment/90 italic leading-relaxed">{reading.whisper}</p>
      </div>

      <p className="text-center text-parchment/40 text-xs leading-relaxed px-4">{labels.disclaimer}</p>
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
