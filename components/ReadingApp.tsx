"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import IceField from "@/components/IceField";
import QuestionForm from "@/components/QuestionForm";
import RuneCard from "@/components/RuneCard";
import ReadingResult from "@/components/ReadingResult";
import WaitlistPrompt from "@/components/WaitlistPrompt";
import UpsellPrompt from "@/components/UpsellPrompt";
import SafetyNotice from "@/components/SafetyNotice";
import FollowUp from "@/components/FollowUp";
import SaveToJournal from "@/components/SaveToJournal";
import TopNav from "@/components/TopNav";
import UpgradeNudge from "@/components/UpgradeNudge";
import type { UpsellReason } from "@/components/UpsellPrompt";
import { Reading, DrawnCard, SpreadType, DEFAULT_LABELS } from "@/lib/ai";
import type { SafetyMessage } from "@/lib/safety";
import { HERO_BG } from "@/lib/rune-assets";

type Stage = "ask" | "drawing" | "revealing" | "locked" | "care";

export default function ReadingApp() {
  const [stage, setStage] = useState<Stage>("ask");
  const [question, setQuestion] = useState("");
  const [spread, setSpread] = useState<SpreadType>("daily");
  const [cards, setCards] = useState<DrawnCard[]>([]);
  const [revealedCount, setRevealedCount] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [reading, setReading] = useState<Reading | null>(null);
  const [isPlus, setIsPlus] = useState(false);
  const [spreadsUnlocked, setSpreadsUnlocked] = useState(false);
  const [hasDayPass, setHasDayPass] = useState(false);
  const [interval, setIntervalName] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [safetyMessage, setSafetyMessage] = useState<SafetyMessage | null>(null);
  const readingTopRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const [drawToken, setDrawToken] = useState<string | null>(null);
  const [readingError, setReadingError] = useState<string | null>(null);
  const [waitedLong, setWaitedLong] = useState(false);
  const [upsellReason, setUpsellReason] = useState<UpsellReason>("limit_reached");
  const [signedIn, setSignedIn] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const flipTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    // Where this visitor came from (short link like /ig, ?utm_source=, or the
    // referring site) — saved once, when the visitor is first seen.
    const firstParams = new URLSearchParams(window.location.search);
    const touch = new URLSearchParams();
    const src = firstParams.get("src") ?? firstParams.get("utm_source");
    let ref = "";
    try {
      ref = document.referrer ? new URL(document.referrer).hostname.replace(/^www\./, "") : "";
    } catch {}
    touch.set("src", src ?? "");
    if (!src) touch.delete("src");
    if (ref) touch.set("ref", ref);
    const camp = firstParams.get("utm_campaign");
    if (camp) touch.set("c", camp);
    touch.set("l", window.location.pathname);
    if (!touch.has("src") && !touch.has("ref")) touch.set("src", "direct");
    if (firstParams.has("src")) {
      firstParams.delete("src");
      const rest = firstParams.toString();
      history.replaceState(null, "", rest ? `/?${rest}` : "/");
    }

    fetch(`/api/entitlement?${touch.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setIsPlus(Boolean(data.isPlus));
        setSpreadsUnlocked(Boolean(data.spreadsUnlocked));
        setHasDayPass(Boolean(data.hasDayPass));
        setIntervalName(data.interval ?? null);
        setSignedIn(Boolean(data.user));
      })
      .catch(() => {});
    // A question asked just before hitting the paywall is kept, so it's
    // waiting in the box after checkout (or when coming back).
    try {
      const pending = JSON.parse(sessionStorage.getItem("iw_pending") ?? "null");
      if (pending?.q) {
        setQuestion(pending.q);
        setSpread(pending.s ?? "daily");
        sessionStorage.removeItem("iw_pending");
      }
    } catch {}
    const params = new URLSearchParams(window.location.search);
    if (params.get("checkout") === "success") {
      setNotice("Thank you — your purchase is active. Ask the runes.");
      history.replaceState(null, "", "/");
    }
  }, []);

  // When the reading appears, start at the top of it (not at the bottom of the page).
  useEffect(() => {
    if (showSummary && reading) {
      requestAnimationFrame(() => readingTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
    }
  }, [showSummary, reading]);

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
    window.scrollTo({ top: 0, behavior: "smooth" });

    const res = await fetch("/api/draw", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ spread: s, question: q }),
    });

    if (res.status === 402) {
      const body = await res.json().catch(() => ({}));
      const reasons: UpsellReason[] = ["limit_reached", "day_pass_used", "monthly_quota", "locked_spread"];
      setUpsellReason(reasons.includes(body.error) ? body.error : "limit_reached");
      try {
        sessionStorage.setItem("iw_pending", JSON.stringify({ q, s }));
      } catch {}
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

    clearFlips();
    setCards(data.cards);
    setRevealedCount(0);
    setShowSummary(false);
    setReading(null);
    setStage("revealing");

    setDrawToken(data.drawToken);
    // Bring the card(s) into view — on phones the page may be scrolled.
    requestAnimationFrame(() => cardsRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }));
    fetchReading(q, data.drawToken);
  }

  // Fetches the full reading in the background while the person turns the
  // runes. If it fails, the drawn cards stay and "Try again" re-asks for the
  // SAME draw (the draw token stays valid until the reading is stored), so a
  // hiccup never costs anyone a reading.
  function fetchReading(q: string, token: string) {
    setReadingError(null);
    setWaitedLong(false);
    const slow = setTimeout(() => setWaitedLong(true), 12_000);
    const ctrl = new AbortController();
    const giveUp = setTimeout(() => ctrl.abort(), 75_000);
    fetch("/api/reading", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ question: q, drawToken: token }),
      signal: ctrl.signal,
    })
      .finally(() => {
        clearTimeout(giveUp);
        clearTimeout(slow);
      })
      .then((r) => r.json())
      .then((result) => {
        if (result.blocked) showCare(result.blocked);
        else if (result.error) {
          setErrorMessage(result.message ?? "Something went wrong — try again in a moment.");
          setStage("ask");
        } else setReading(result);
      })
      .catch(() => setReadingError("The runes went quiet for a moment."));
  }

  // One tap turns the rune(s). With 3 or 5 runes they turn one after
  // another, then the whole reading — every rune and the combined answer —
  // appears at once, as soon as it is ready.
  function handleAdvance() {
    if (revealedCount > 0 || flipTimers.current.length) return;
    const step = cards.length > 1 ? 450 : 0;
    cards.forEach((_, i) => {
      flipTimers.current.push(setTimeout(() => setRevealedCount(i + 1), i * step));
    });
    flipTimers.current.push(
      setTimeout(() => {
        flipTimers.current = [];
        setShowSummary(true);
      }, (cards.length - 1) * step + (cards.length > 1 ? 700 : 300))
    );
  }

  function clearFlips() {
    flipTimers.current.forEach(clearTimeout);
    flipTimers.current = [];
  }

  function openLocked(reason: UpsellReason, q: string, s: SpreadType) {
    try {
      if (q) sessionStorage.setItem("iw_pending", JSON.stringify({ q, s }));
    } catch {}
    setQuestion(q);
    setSpread(s);
    setUpsellReason(reason);
    setStage("locked");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function reset(nextQuestion = "") {
    clearFlips();
    setStage("ask");
    setQuestion(nextQuestion);
    setCards([]);
    setRevealedCount(0);
    setShowSummary(false);
    setReading(null);
    setSafetyMessage(null);
  }

  return (
    <main id="top" className="relative min-h-screen flex flex-col items-center justify-center px-6 py-16 overflow-hidden">
      <div aria-hidden className="fixed inset-0 z-0">
        <Image src={HERO_BG} alt="" fill priority className="object-cover opacity-65" />
        <div className="absolute inset-0 bg-void/40" />
      </div>
      <IceField />
      <div className="absolute top-0 inset-x-0 z-20">
        <TopNav
          signedIn={signedIn}
          isPlus={isPlus}
          onUpgrade={() => {
            setUpsellReason("upgrade");
            setStage("locked");
          }}
        />
      </div>

      <div className="relative z-10 w-full flex flex-col items-center gap-14">
        {stage === "ask" && (
          <>
            {notice && <p className="text-frost-300 text-sm text-center -mb-6">{notice}</p>}
            <QuestionForm
              key={question}
              initialQuestion={question}
              initialSpread={spreadsUnlocked ? spread : "daily"}
              onSubmit={handleAsk}
              isPlus={spreadsUnlocked}
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
            <button onClick={() => reset(question)} className="text-parchment/40 text-sm underline underline-offset-4">
              Back
            </button>
          </>
        )}

        {stage === "care" && safetyMessage && (
          <>
            <SafetyNotice message={safetyMessage} />
            <button onClick={() => reset()} className="text-parchment/40 text-sm underline underline-offset-4">
              Back
            </button>
          </>
        )}

        {(stage === "drawing" || stage === "revealing") && (
          <div
            ref={cardsRef}
            className={`flex flex-col items-center gap-8 w-full ${
              stage === "revealing" && revealedCount === 0 ? "cursor-pointer" : ""
            }`}
            onClick={stage === "revealing" && revealedCount === 0 ? handleAdvance : undefined}
          >
            {stage === "drawing" && (
              <div className="flex flex-col items-center gap-4 animate-fadeUp">
                <RuneCard runeId={null} reversed={false} flipped={false} size="normal" active />
                <p className="text-frost-300/70 text-sm tracking-wide">Shuffling the runes…</p>
              </div>
            )}

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
                      active={stage === "revealing" && revealedCount === 0}
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
                    active={stage === "revealing" && revealedCount === 0}
                  />
                ))}
              </div>
            )}

            {stage === "revealing" && revealedCount === 0 && (
              <p className="text-parchment/50 text-sm animate-fadeUp">
                {cards.length > 1 ? "Tap to turn the runes." : "Tap the rune to turn it."}
              </p>
            )}

            {showSummary && !reading && !readingError && (
              <div className="text-center space-y-1 animate-fadeUp">
                <p className="text-frost-300/80 text-sm tracking-wide animate-pulse">The runes are speaking…</p>
                {waitedLong && (
                  <p className="text-parchment/50 text-xs">
                    {cards.length > 1 ? "Weaving the runes together into one answer — a few more moments." : "Almost there…"}
                  </p>
                )}
              </div>
            )}

            {showSummary && !reading && readingError && (
              <div onClick={(e) => e.stopPropagation()} className="text-center space-y-3 animate-fadeUp">
                <p className="text-parchment/80 text-sm">{readingError} Your runes are kept — try again.</p>
                <button
                  onClick={() => drawToken && fetchReading(question, drawToken)}
                  className="rounded-full bg-frost-500 text-void font-semibold px-6 py-2.5 text-sm hover:bg-frost-300"
                >
                  Try again
                </button>
              </div>
            )}

            {showSummary && reading && (
              <div ref={readingTopRef} onClick={(e) => e.stopPropagation()} className="flex flex-col items-center gap-10 w-full scroll-mt-6">
                <ReadingResult reading={reading} />
                <FollowUp
                  heading={reading.labels?.moreQuestions ?? DEFAULT_LABELS.moreQuestions}
                  placeholder={reading.labels?.askNext ?? DEFAULT_LABELS.askNext}
                  suggestions={reading.suggestions ?? []}
                  spread={spread}
                  spreadsUnlocked={spreadsUnlocked}
                  onLockedSpread={(q, s) => openLocked("locked_spread", q, s)}
                  onAsk={(q, s) => {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                    handleAsk(q, s);
                  }}
                />
                <button onClick={() => { reset(); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="text-parchment/40 text-sm underline underline-offset-4 -mt-6">
                  Start over with a new question
                </button>
                <UpgradeNudge
                  isPlus={isPlus}
                  hasDayPass={hasDayPass}
                  interval={interval}
                  onOpenOptions={() => {
                    setUpsellReason("upgrade");
                    setStage("locked");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  onUpgraded={() => setIntervalName("year")}
                />
                <SaveToJournal readingId={(reading as Reading & { id?: string }).id ?? null} isPlus={isPlus} />
                <WaitlistPrompt />
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

    </main>
  );
}
