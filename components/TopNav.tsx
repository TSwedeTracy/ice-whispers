"use client";

import Link from "next/link";

export default function TopNav({ signedIn, isPlus }: { signedIn: boolean; isPlus: boolean }) {
  return (
    <nav className="relative z-20 w-full flex justify-end gap-5 px-5 pt-4 text-xs uppercase tracking-[0.2em] text-frost-300/80 print:hidden">
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
