"use client";

import Image from "next/image";
import { CARD_BACK, cardImagePath } from "@/lib/rune-assets";

export default function RuneCard({
  runeId,
  reversed,
  flipped,
  label,
  onClick,
  size = "normal",
  active = false,
}: {
  runeId: number | null;
  reversed: boolean;
  flipped: boolean;
  label?: string;
  onClick?: () => void;
  size?: "normal" | "small";
  active?: boolean;
}) {
  const dims = size === "small" ? "w-24 md:w-32 aspect-[2/3]" : "w-48 md:w-64 aspect-[2/3]";

  return (
    <div className={`flex flex-col items-center gap-2 ${dims.split(" ").filter((c) => c.startsWith("w-") || c.startsWith("md:w-")).join(" ")}`}>
      {label && (
        <span
          className={`flex items-end justify-center min-h-[3rem] md:min-h-[3.25rem] uppercase tracking-[0.2em] text-[10px] md:text-xs font-body text-center leading-tight transition-colors ${
            active ? "text-frost-100" : "text-frost-300/80"
          }`}
        >
          {label}
        </span>
      )}
      <div
        className={`card-perspective ${dims} cursor-pointer rounded-xl transition-shadow ${
          active ? "shadow-glow animate-pulse" : ""
        }`}
        onClick={onClick}
      >
        <div className={`relative w-full h-full card-inner ${flipped ? "flipped" : ""}`}>
          {/* Back */}
          <div className="absolute inset-0 card-face rounded-xl overflow-hidden bg-void">
            <Image src={CARD_BACK} alt="ICE WHISPERS card back" fill className="object-contain" priority />
          </div>
          {/* Front */}
          <div className="absolute inset-0 card-face card-face-back rounded-xl overflow-hidden bg-void">
            {runeId !== null && (
              <Image
                src={cardImagePath(runeId)}
                alt="Rune revealed"
                fill
                className={`object-contain ${reversed ? "rotate-180" : ""}`}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
