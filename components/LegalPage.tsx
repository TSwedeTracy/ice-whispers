import Link from "next/link";

export default function LegalPage({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <main className="min-h-screen px-5 py-12 flex flex-col items-center">
      <div className="w-full max-w-2xl">
        <Link href="/" className="text-frost-300/80 text-xs uppercase tracking-[0.25em]">
          ← Ask the runes
        </Link>
        <h1 className="font-display text-3xl text-frost-100 tracking-wide mt-8">{title}</h1>
        <p className="text-parchment/50 text-sm mt-1">Last updated: {updated}</p>
        <div className="legal mt-8 space-y-4 text-parchment/85 leading-relaxed">{children}</div>
      </div>
    </main>
  );
}
