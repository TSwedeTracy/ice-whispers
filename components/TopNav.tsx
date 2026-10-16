"use client";

import Link from "next/link";

export default function TopNav({
  signedIn,
  isPlus,
  onUpgrade,
}: {
  signedIn: boolean;
  isPlus: boolean;
  onUpgrade?: () => void;
}) {
  return (
    <nav className="relative z-20 w-full flex justify-end gap-4 sm:gap-5 px-5 pt-4 text-xs uppercase tracking-[0.15em] sm:tracking-[0.2em] text-frost-300/80 print:hidden">
      <Link href="/our-story" className="hover:text-frost-100">
        Our Story
      </Link>
      {!isPlus && onUpgrade && (
        <button onClick={onUpgrade} className="uppercase tracking-[inherit] text-wyrd-400 hover:text-frost-100">
          Upgrade
        </button>
      )}
      {isPlus && (
        <Link href="/journal" className="hover:text-frost-100">
          Journal
        </Link>
      )}
      <Link href="/account" className="hover:text-frost-100">
        {signedIn ? "Account" : "Sign in"}
      </Link>
    </nav>
  );
}
