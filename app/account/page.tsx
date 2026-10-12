"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AuthForm from "@/components/AuthForm";
import UpsellPrompt from "@/components/UpsellPrompt";

interface Status {
  isPlus: boolean;
  interval: string | null;
  readingsLeft: number | null;
  hasDayPass: boolean;
  user: { email: string } | null;
}

export default function AccountPage() {
  const [status, setStatus] = useState<Status | null>(null);

  async function load() {
    const res = await fetch("/api/entitlement").catch(() => null);
    setStatus(res?.ok ? await res.json() : null);
  }

  useEffect(() => {
    load();
  }, []);

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    load();
  }

  return (
    <main className="min-h-screen px-5 py-12 flex flex-col items-center gap-8">
      <Link href="/" className="text-frost-300/80 text-xs uppercase tracking-[0.25em]">
        ← Ask the runes
      </Link>
      {!status ? (
        <p className="text-parchment/50 text-sm">Loading…</p>
      ) : !status.user ? (
        <AuthForm onDone={load} />
      ) : (
        <div className="w-full max-w-md flex flex-col items-center gap-6 text-center animate-fadeUp">
          <div className="space-y-1">
            <p className="font-display text-2xl text-frost-100 tracking-wide">Your account</p>
            <p className="text-parchment/60 text-sm">{status.user.email}</p>
          </div>
          {status.isPlus ? (
            <div className="rounded-2xl border border-wyrd-400/30 bg-wyrd-600/[0.06] px-5 py-4 w-full space-y-2">
              <p className="text-frost-100 font-semibold">ICE WHISPERS+ {status.interval === "year" ? "· yearly" : "· monthly"}</p>
              {status.readingsLeft !== null && (
                <p className="text-parchment/70 text-sm">{status.readingsLeft} readings left this month</p>
              )}
              <Link href="/journal" className="inline-block text-frost-300 underline underline-offset-4 text-sm">
                Open your journal
              </Link>
            </div>
          ) : (
            <UpsellPrompt reason="locked_spread" />
          )}
          <button onClick={signOut} className="text-parchment/40 text-sm underline underline-offset-4">
            Sign out
          </button>
        </div>
      )}
    </main>
  );
}
