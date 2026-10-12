"use client";

import { useState } from "react";
import Link from "next/link";

type Mode = "signin" | "signup" | "forgot";

const input =
  "w-full rounded-xl bg-void/60 border border-frost-300/30 focus:border-frost-500 focus:outline-none px-4 py-3 text-parchment placeholder:text-frost-300/50";

export default function AuthForm({
  onDone,
  initialMode = "signin",
  intro,
}: {
  onDone: (email: string) => void;
  initialMode?: Mode;
  intro?: string;
}) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);
    const path = mode === "signin" ? "/api/auth/login" : mode === "signup" ? "/api/auth/signup" : "/api/auth/forgot";
    try {
      const res = await fetch(path, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password, accepted }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) setError(data.error ?? "Something went wrong — please try again.");
      else if (mode === "forgot") setMessage("If an account exists for this email, a reset link is on its way.");
      else if (data.ok) onDone(data.email ?? email);
      else setMessage("Account created — please sign in.");
    } catch {
      setError("Something went wrong — please try again.");
    }
    setBusy(false);
  }

  return (
    <form onSubmit={submit} className="w-full max-w-sm mx-auto flex flex-col gap-3 text-left">
      {intro && <p className="text-parchment/70 text-sm text-center mb-1">{intro}</p>}
      <p className="font-display text-lg text-frost-100 text-center tracking-wide">
        {mode === "signin" ? "Sign in" : mode === "signup" ? "Create your account" : "Reset your password"}
      </p>
      <input className={input} type="email" autoComplete="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      {mode !== "forgot" && (
        <input
          className={input}
          type="password"
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          placeholder={mode === "signup" ? "Password (at least 8 characters)" : "Password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={mode === "signup" ? 8 : undefined}
        />
      )}
      {mode === "signup" && (
        <label className="flex gap-2 items-start text-[12px] text-parchment/60 leading-snug cursor-pointer">
          <input type="checkbox" required checked={accepted} onChange={(e) => setAccepted(e.target.checked)} className="mt-0.5 accent-frost-500" />
          <span>
            I am 18 or older and accept the{" "}
            <Link href="/terms" target="_blank" className="underline underline-offset-2">Terms</Link> and{" "}
            <Link href="/privacy" target="_blank" className="underline underline-offset-2">Privacy Policy</Link>.
          </span>
        </label>
      )}
      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-full bg-frost-500 text-void font-semibold py-3 hover:bg-frost-300 transition-colors disabled:opacity-60"
      >
        {busy ? "One moment…" : mode === "signin" ? "Sign in" : mode === "signup" ? "Create account" : "Send reset link"}
      </button>
      {error && <p className="text-red-400/90 text-sm text-center">{error}</p>}
      {message && <p className="text-frost-300 text-sm text-center">{message}</p>}
      <div className="flex justify-center gap-4 text-xs text-parchment/50 mt-1">
        {mode !== "signin" && (
          <button type="button" className="underline underline-offset-4" onClick={() => setMode("signin")}>
            I have an account
          </button>
        )}
        {mode !== "signup" && (
          <button type="button" className="underline underline-offset-4" onClick={() => setMode("signup")}>
            Create account
          </button>
        )}
        {mode === "signin" && (
          <button type="button" className="underline underline-offset-4" onClick={() => setMode("forgot")}>
            Forgot password?
          </button>
        )}
      </div>
    </form>
  );
}
