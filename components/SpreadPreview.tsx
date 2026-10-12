"use client";

import Image from "next/image";
import { cardImagePath } from "@/lib/rune-assets";

// A small visual of the two monthly-plan spreads, using the real deck art.
function MiniCard({ runeId, label }: { runeId: number; label?: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-11 md:w-14 aspect-[2/3] rounded-md overflow-hidden bg-void shadow-[0_0_12px_rgba(120,180,255,0.25)]">
        <Image src={cardImagePath(runeId)} alt="" fill sizes="56px" className="object-contain" />
      </div>
      {label && <span className="text-[9px] uppercase tracking-[0.15em] text-frost-300/70">{label}</span>}
    </div>
  );
}

export default function SpreadPreview() {
  return (
    <div className="grid grid-cols-2 gap-4 w-full">
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-3 py-4 flex flex-col items-center gap-3">
        <p className="font-display text-sm text-frost-100 tracking-wide">Three Norns</p>
        <div className="flex gap-2 items-end">
          <MiniCard runeId={4} label="Urd" />
          <MiniCard runeId={5} label="Verdandi" />
          <MiniCard runeId={12} label="Skuld" />
        </div>
        <p className="text-parchment/50 text-[11px] leading-snug">Past · Present · What may come</p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-3 py-4 flex flex-col items-center gap-3">
        <p className="font-display text-sm text-frost-100 tracking-wide">Five Rune Cross</p>
        <div
          className="grid gap-1 justify-center"
          style={{ gridTemplateAreas: `". top ." "left center right" ". bottom ."`, gridTemplateColumns: "repeat(3, min-content)" }}
        >
          <div style={{ gridArea: "top" }}><MiniCard runeId={17} /></div>
          <div style={{ gridArea: "left" }}><MiniCard runeId={8} /></div>
          <div style={{ gridArea: "center" }}><MiniCard runeId={23} /></div>
          <div style={{ gridArea: "right" }}><MiniCard runeId={2} /></div>
          <div style={{ gridArea: "bottom" }}><MiniCard runeId={13} /></div>
        </div>
        <p className="text-parchment/50 text-[11px] leading-snug">The whole situation, five angles</p>
      </div>
    </div>
  );
}
