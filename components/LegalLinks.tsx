import Link from "next/link";

export default function LegalLinks() {
  return (
    <div className="flex flex-col items-center gap-3 text-parchment/40 text-xs print:hidden">
      <Link href="/our-story#your-deck" className="hover:text-parchment/70 underline-offset-4 hover:underline">
        Readers &amp; creators: Bring your own deck to life →
      </Link>
      <div className="flex justify-center gap-4">
      <Link href="/terms" className="hover:text-parchment/70 underline-offset-4 hover:underline">
        Terms &amp; refunds
      </Link>
      <Link href="/privacy" className="hover:text-parchment/70 underline-offset-4 hover:underline">
        Privacy
      </Link>
      </div>
    </div>
  );
}
