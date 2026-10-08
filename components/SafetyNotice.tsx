"use client";

import type { SafetyMessage } from "@/lib/safety";

// Shown instead of a reading when a question is about self-harm, hurting
// someone or a crime. Calm and caring — never a "rejected" feeling.
export default function SafetyNotice({ message }: { message: SafetyMessage }) {
  return (
    <div className="w-full max-w-md mx-auto text-center space-y-6 animate-fadeUp">
      <p className="font-display text-2xl text-frost-100 tracking-wide">{message.title}</p>
      <p className="text-parchment/80 leading-relaxed">{message.body}</p>

      {message.resources && (
        <div className="flex flex-col gap-3 text-left">
          {message.resources.map((r) => (
            <a
              key={r.label}
              href={r.href}
              target={r.href?.startsWith("http") ? "_blank" : undefined}
              rel="noopener noreferrer"
              className="rounded-2xl border border-frost-300/30 bg-white/[0.03] px-5 py-4 block hover:border-frost-300/60 transition-colors"
            >
              <p className="text-frost-100 font-semibold">{r.label}</p>
              <p className="text-parchment/70 text-sm">{r.detail}</p>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
