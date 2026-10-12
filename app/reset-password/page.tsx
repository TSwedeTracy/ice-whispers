"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// The reset email links here with one-time tokens in the URL fragment.
export default function ResetPasswordPage() {
  const [tokens, setTokens] = useState<{ accessToken: string; refreshToken: string } | null>(null);
  const [password, setPassword] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.slice(1));
    const accessToken = params.get("access_token");
    if (accessToken) setTokens({ accessToken, refreshToken: params.get("refresh_token") ?? "" });
    else setError("This link is not valid. Please request a new reset link.");
    history.replaceState(null, "", window.location.pathname);
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("busy");
    setError(null);
    const res = await fetch("/api/auth/reset", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...tokens, password }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) setState("done");
    else {
      setError(data.error ?? "Something went wrong.");
      setState("idle");
    }
  }

  return (
    <main className="min-h-screen px-5 py-16 flex flex-col items-center gap-6 text-center">
      <p className="font-display text-2xl text-frost-100 tracking-wide">Choose a new password</p>
      {state === "done" ? (
        <p className="text-frost-300">
          Your password is updated.{" "}
          <Link href="/" className="underline underline-offset-4">
            Back to the runes
          </Link>
        </p>
      ) : (
        tokens && (
          <form onSubmit={submit} className="w-full max-w-sm flex flex-col gap-3">
            <input
              type="password"
              autoComplete="new-password"
              placeholder="New password (at least 8 characters)"
              minLength={8}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl bg-void/60 border border-frost-300/30 focus:border-frost-500 focus:outline-none px-4 py-3 text-parchment"
            />
            <button disabled={state === "busy"} className="w-full rounded-full bg-frost-500 text-void font-semibold py-3 disabled:opacity-60">
              {state === "busy" ? "One moment…" : "Save new password"}
            </button>
          </form>
        )
      )}
      {error && <p className="text-red-400/90 text-sm">{error}</p>}
    </main>
  );
}
