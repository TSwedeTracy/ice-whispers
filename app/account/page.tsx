"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AuthForm from "@/components/AuthForm";
import UpsellPrompt from "@/components/UpsellPrompt";
import UpgradeNudge from "@/components/UpgradeNudge";

interface Status {
  isPlus: boolean;
  interval: string | null;
  readingsLeft: number | null;
  hasDayPass: boolean;
  periodEnd: string | null;
  cancelling: boolean;
  user: { email: string } | null;
}

export default function AccountPage() {
  const [status, setStatus] = useState<Status | null>(null);
  const [opening, setOpening] = useState(false);
  const [portalError, setPortalError] = useState<string | null>(null);

  // Stripe's customer portal: cancel, change card, receipts.
  async function manage() {
    setOpening(true);
    setPortalError(null);
    const res = await fetch("/api/portal", { method: "POST" }).catch(() => null);
    const data = await res?.json().catch(() => ({}));
    if (data?.url) {
      window.location.href = data.url;
      return;
    }
    setPortalError(data?.message ?? "The membership page could not open — please try again.");
    setOpening(false);
  }

  const endDate = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : null;

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
              {status.cancelling ? (
                <p className="text-parchment/70 text-sm">
                  Cancelled — your membership stays active until {endDate(status.periodEnd)} and will not renew.
                </p>
              ) : (
                status.periodEnd && (
                  <p className="text-parchment/50 text-xs">Renews on {endDate(status.periodEnd)}. Cancel anytime.</p>
                )
              )}
              <div className="flex justify-center gap-5 pt-1">
                <Link href="/journal" className="text-frost-300 underline underline-offset-4 text-sm">
                  Open your journal
                </Link>
                <button onClick={manage} disabled={opening} className="text-frost-300 underline underline-offset-4 text-sm disabled:opacity-60">
                  {opening ? "Opening…" : "Manage membership"}
                </button>
              </div>
              <p className="text-parchment/40 text-[11px]">Cancel, change card or download receipts.</p>
              {portalError && <p className="text-red-400/90 text-xs">{portalError}</p>}
            </div>
          ) : null}
          {status.isPlus ? (
            status.cancelling ? null : <UpgradeNudge isPlus hasDayPass={false} interval={status.interval} onOpenOptions={() => {}} onUpgraded={load} />
          ) : (
            <UpsellPrompt reason="upgrade" />
          )}
          <button onClick={signOut} className="text-parchment/40 text-sm underline underline-offset-4">
            Sign out
          </button>
        </div>
      )}
    </main>
  );
}
