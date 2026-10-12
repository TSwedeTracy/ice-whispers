import Link from "next/link";

export default function LegalLinks() {
  return (
    <div className="flex justify-center gap-4 text-parchment/40 text-xs print:hidden">
      <Link href="/terms" className="hover:text-parchment/70 underline-offset-4 hover:underline">
        Terms &amp; refunds
      </Link>
      <Link href="/privacy" className="hover:text-parchment/70 underline-offset-4 hover:underline">
        Privacy
      </Link>
    </div>
  );
}
