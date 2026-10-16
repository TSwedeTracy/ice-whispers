import Image from "next/image";
import Link from "next/link";
import { HERO_BG, LOGO } from "@/lib/rune-assets";

// Shared frame for the public rune pages (/runes and /runes/[slug]).
export default function RunesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen">
      <div aria-hidden className="fixed inset-0 z-0">
        <Image src={HERO_BG} alt="" fill className="object-cover opacity-40" />
        <div className="absolute inset-0 bg-void/60" />
      </div>
      <header className="relative z-10 flex flex-col items-center pt-8 gap-2">
        <Link href="/" aria-label="ICE WHISPERS — ask the runes">
          <Image src={LOGO} alt="ICE WHISPERS — Rune Oracle" width={512} height={512} className="w-28 h-auto" />
        </Link>
      </header>
      <div className="relative z-10 px-6 py-8">{children}</div>
    </div>
  );
}
