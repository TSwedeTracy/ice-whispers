"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import IceField from "@/components/IceField";
import QuestionForm from "@/components/QuestionForm";
import RuneCard from "@/components/RuneCard";
import ReadingResult from "@/components/ReadingResult";
import WaitlistPrompt from "@/components/WaitlistPrompt";
import UpsellPrompt from "@/components/UpsellPrompt";
import SafetyNotice from "@/components/SafetyNotice";
import { Reading, DrawnCard, SpreadType } from "@/lib/ai";
import type { SafetyMessage } from "@/lib/safety";
import { HERO_BG } from "@/lib/rune-assets";

type Stage = "ask" | "drawing" | "revealing" | "locked" | "care";

export default function Home() {
  const [stage, setStage] = useState<Stage>("ask");
  const [question, setQuestion] = useState("");
  const [spread, setSpread] = useState<SpreadType>("daily");
  const [cards, setCards] = useState<DrawnCard[]>([]);
  const [revealedCount, setRevealedCount] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [reading, setReading] = useState<Reading | null>(null);
  const [isPlus, setIsPlus] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [safetyMessage, setSafetyMessage] = useState<SafetyMessage | null>(null);
  const [upsellReason, setUpsellReason] = useState<"limit_reached" | "monthly_quota" | "locked_spread">("limit_reached");

  useEffect(() => {
    fetch("/api/entitlement")
      .then((res) => res.json())
      .then((data) => setIsPlus(Boolean(data.isPlus)))
      .catch(() => {});
  }, []);

  function showCare(message: SafetyMessage) {
    setSafetyMessage(message);
    setCards([]);
    setReading(null);
    setStage("care");
  }

  async function handleAsk(q: string, s: SpreadType) {
    setQuestion(q);
    setSpread(s);
    setErrorMessage(null);
    setStage("drawing");

    const res = await fetch("/api/draw", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ spread: s, question: q }),
    });

    if (res.status === 402) {
      const body = await res.json().catch(() => ({}));
      setUpsellReason(body.error === "monthly_quota" || body.error === "locked_spread" ? body.error : "limit_reached");
      setStage("locked");
      return;
    }

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setErrorMessage(body.message ?? "Something went wrong — try again in a moment.");
      setStage("ask");
      return;
    }

    const data = await res.json();

    if (data.blocked) {
      showCare(data.blocked);
      return;
    }

    setCards(data.cards);
    setRevealedCount(0);
    setShowSummary(false);
    setReading(null);
    setStage("revealing");

    // Fetch the full reading now, in the background, so each tap only
    // reveals what's already there — no waiting between cards.
    fetch("/api/reading", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ question: q, drawToken: data.drawToken }),
    })
      .then((r) => r.json())
      .then((result) => {
        if (result.blocked) showCare(result.blocked);
        else if (result.error) {
          setErrorMessage(result.message ?? "Something went wrong — try again in a moment.");
          setStage("ask");
        } else setReading(result);
      })
      .catch(() => {
        setErrorMessage("The runes are unreachable right now — try again shortly.");
        setStage("ask");
      });
  }

  function handleAdvance() {
    if (revealedCount < cards.length) {
      const nextCount = revealedCount + 1;
      setRevealedCount(nextCount);
      if (nextCount >= cards.length && spread === "daily") {
        setShowSummary(true);
      }
    } else {
      setShowSummary(true);
    }
  }

  function reset() {
    setStage("ask");
    setQuestion("");
    setCards([]);
    setRevealedCount(0);
    setShowSummary(false);
    setReading(null);
    setSafetyMessage(null);
  }

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center px-6 py-16 overflow-hidden">
      <div aria-hidden className="fixed inset-0 z-0">
        <Image src={HERO_BG} alt="" fill priority className="object-cover opacity-65" />
        <div className="absolute inset-0 bg-void/40" />
      </div>
      <IceField />

      <div className="relative z-10 w-full flex flex-col items-center gap-14">
        {stage === "ask" && (
          <>
            <QuestionForm
              onSubmit={handleAsk}
              isPlus={isPlus}
              onLockedSpreadSelect={() => {
                setUpsellReason("locked_spread");
                setStage("locked");
              }}
            />
            {errorMessage && (
              <p className="text-red-400/90 text-sm -mt-8 text-center max-w-sm">{errorMessage}</p>
            )}
          </>
        )}

        {stage === "locked" && (
          <>
            <UpsellPrompt reason={upsellReason} />
            <button onClick={reset} className="text-parchment/40 text-sm underline underline-offset-4">
              Back
            </button>
          </>
        )}

        {stage === "care" && safetyMessage && (
          <>
            <SafetyNotice message={safetyMessage} />
            <button onClick={reset} className="text-parchment/40 text-sm underline underline-offset-4">
              Back
            </button>
          </>
        )}

        {(stage === "drawing" || stage === "revealing") && (
          <div
            className={`flex flex-col items-center gap-8 w-full ${
              stage === "revealing" && !showSummary ? "cursor-pointer" : ""
            }`}
            onClick={stage === "revealing" && !showSummary ? handleAdvance : undefined}
          >
            {spread === "five_cross" && cards.length === 5 ? (
              <div
                className="grid gap-3 md:gap-5 justify-center"
                style={{
                  gridTemplateAreas: `". top ." "left center right" ". bottom ."`,
                  gridTemplateColumns: "repeat(3, min-content)",
                }}
              >
                {cards.map((c, i) => (
                  <div key={i} style={{ gridArea: ["center", "left", "right", "top", "bottom"][i] }}>
                    <RuneCard
                      runeId={c.runeId}
                      reversed={c.reversed}
                      flipped={i < revealedCount}
                      label={c.position}
                      size="small"
                      active={stage === "revealing" && i === revealedCount}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap justify-center gap-4 md:gap-8">
                {cards.map((c, i) => (
                  <RuneCard
                    key={i}
                    runeId={c.runeId}
                    reversed={c.reversed}
                    flipped={i < revealedCount}
                    label={c.position}
                    size={cards.length > 1 ? "small" : "normal"}
                    active={stage === "revealing" && i === revealedCount}
                  />
                ))}
              </div>
            )}

            {stage === "revealing" && revealedCount === 0 && cards.length > 1 && (
              <p className="text-parchment/50 text-sm animate-fadeUp">
                Tap anywhere to reveal {cards[0]?.position ?? "the first rune"}.
              </p>
            )}

            {revealedCount > 0 && !reading && (
              <p className="text-frost-300/70 text-sm tracking-wide animate-fadeUp">The runes are speaking…</p>
            )}

            {showSummary && reading && (
              <div onClick={(e) => e.stopPropagation()} className="flex flex-col items-center gap-10 w-full">
                <ReadingResult reading={reading} />
                <WaitlistPrompt />
                <button onClick={reset} className="text-parchment/40 text-sm underline underline-offset-4">
                  Ask another question
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <footer className="relative z-10 mt-16 flex flex-col items-center gap-4 text-center text-parchment/30 text-xs max-w-md">
        ICE WHISPERS™ readings are for entertainment, personal insight and reflection only. They are not
        advice, and they are not a substitute for professional medical, psychological, legal or financial
        advice. You are always responsible for your own decisions and actions, whatever a reading says.
      </footer>

      {revealedCount > 0 && !showSummary && reading?.cardReadings && (
        <div
          key={revealedCount}
          className="fixed inset-0 z-50 flex items-center justify-center bg-void p-6 cursor-pointer animate-fadeUp"
          onClick={(e) => {
            e.stopPropagation();
            handleAdvance();
          }}
        >
          <div className="w-full max-w-2xl mx-auto flex flex-col md:flex-row items-center gap-6">
            <RuneCard
              runeId={cards[revealedCount - 1].runeId}
              reversed={cards[revealedCount - 1].reversed}
              flipped
              size="normal"
            />
            <div className="rounded-2xl border border-white/10 bg-void/60 px-5 py-4 flex-1">
              {(() => {
                const c = reading.cardReadings![revealedCount - 1];
                const reversedLabel = reading.labels?.reversed ?? "reversed";
                return (
                  <>
                    <p className="uppercase tracking-[0.3em] text-[10px] text-frost-300/70 mb-2">{c.position}</p>
                    <p className="font-display text-lg text-frost-100 mb-2">
                      <span className="mr-2">{c.symbol}</span>
                      {c.runeName}
                      {c.reversed ? ` (${reversedLabel})` : ""}
                    </p>
                    <p className="text-parchment/90 leading-relaxed">{c.text}</p>
                    <p className="text-parchment/40 text-xs mt-4">
                      {revealedCount < cards.length ? "Tap anywhere to continue." : "Tap anywhere to see the full reading."}
                    </p>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
