import type { Metadata } from "next";
import Link from "next/link";
import LegalPage from "@/components/LegalPage";
import { COMPANY, LEGAL_UPDATED } from "@/lib/legal";

export const metadata: Metadata = { title: "Privacy Policy — ICE WHISPERS™" };

export default function PrivacyPage() {
  const mail = <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>;
  return (
    <LegalPage title="Privacy Policy" updated={LEGAL_UPDATED}>
      <p>
        Your questions to the runes can be personal. We collect as little as possible, keep it only as long as needed, and
        never sell it. This policy explains what we process when you use ICE WHISPERS™.
      </p>

      <h2>Who is responsible</h2>
      <p>
        {COMPANY.name}, org. no. {COMPANY.orgNumber}, {COMPANY.address}, is the controller of your personal data. Contact
        us about privacy at {mail}.
      </p>

      <h2>What we process, why, and for how long</h2>
      <ul>
        <li>
          <strong>Visitor ID (a cookie):</strong> a random ID that lets us enforce the free daily reading and remember
          purchases in your browser. Necessary for the service (legitimate interest / performance of contract). Kept up to
          12 months.
        </li>
        <li>
          <strong>Your questions and readings:</strong> needed to create the reading (performance of contract). If you do
          not save a reading to your journal, its question and text are <strong>automatically erased after 24 hours</strong>;
          we keep only a count, the drawn runes and the short answer so limits work.
        </li>
        <li>
          <strong>Your journal (members):</strong> readings you choose to save, plus your own notes and “what happened
          next”. Kept while your account exists; you can delete any entry at any time and download everything as a PDF.
        </li>
        <li>
          <strong>Account:</strong> email address and password (stored only as a secure hash by our database provider).
          Kept while your account exists.
        </li>
        <li>
          <strong>Purchases:</strong> what you bought, when, and its status. Payment details are handled by Stripe — we
          never see your card number. Bookkeeping records are kept for 7 years as required by Swedish accounting law.
        </li>
        <li>
          <strong>Deck waitlist:</strong> your email (and country, if given) to tell you when the physical deck launches —
          only with your consent, which you can withdraw at any time.
        </li>
        <li>
          <strong>Technical logs:</strong> short-lived server logs (e.g. errors, IP address) to keep the service secure,
          kept for a limited time by our providers.
        </li>
      </ul>
      <p>
        <strong>Please avoid</strong> writing full names, health details or other sensitive information in your
        questions. Questions about self-harm, violence or crime are not read; they are checked automatically and not
        stored in a journal.
      </p>

      <h2>Who processes data for us</h2>
      <p>We use carefully chosen providers (processors) that may only use your data to deliver their service to us:</p>
      <ul>
        <li>
          <strong>Supabase</strong> — database and accounts, stored in the EU (Frankfurt).
        </li>
        <li>
          <strong>Vercel</strong> — website hosting.
        </li>
        <li>
          <strong>Anthropic</strong> — the AI model that writes the reading. It receives only your question and the drawn
          runes, not your name or email.
        </li>
        <li>
          <strong>Stripe</strong> — payments and receipts.
        </li>
        <li>
          <strong>Resend</strong> — sending account emails (e.g. password reset).
        </li>
      </ul>
      <p>
        Some of these providers are based in the United States. Transfers outside the EU/EEA are protected by the EU–US
        Data Privacy Framework and/or the European Commission’s Standard Contractual Clauses.
      </p>

      <h2>Cookies</h2>
      <p>
        We only use cookies that are necessary for the service: the visitor ID and, when you sign in, secure login cookies.
        We do not use advertising or tracking cookies.
      </p>

      <h2>Your rights</h2>
      <p>
        You can ask for a copy of your data, have it corrected or deleted, restrict or object to processing, and receive
        your data in a portable format. Email {mail}. You can also complain to the Swedish Authority for Privacy Protection
        (Integritetsskyddsmyndigheten, imy.se) or the data protection authority in your country.
      </p>

      <h2>Age</h2>
      <p>ICE WHISPERS is intended for people aged 18 and over.</p>

      <h2>Changes</h2>
      <p>
        We will update this policy if our processing changes and show the date at the top. See also our{" "}
        <Link href="/terms">Terms of Use &amp; Sale</Link>.
      </p>
    </LegalPage>
  );
}
