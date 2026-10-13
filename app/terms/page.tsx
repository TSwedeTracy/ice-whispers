import type { Metadata } from "next";
import Link from "next/link";
import LegalPage from "@/components/LegalPage";
import { COMPANY, LEGAL_UPDATED } from "@/lib/legal";

export const metadata: Metadata = { title: "Terms of Use & Sale — ICE WHISPERS™" };

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Use & Sale" updated={LEGAL_UPDATED}>
      <p>
        These terms apply when you use ICE WHISPERS™ ({COMPANY.website}) and when you buy access to it. The service is
        provided by {COMPANY.name}, org. no. {COMPANY.orgNumber}, {COMPANY.address} (“we”, “us”). Contact:{" "}
        <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>.
      </p>

      <h2>1. What ICE WHISPERS is</h2>
      <p>
        ICE WHISPERS is a digital rune-reading experience based on the Elder Futhark. Readings are generated with the help
        of artificial intelligence from our own rune interpretations. <strong>Readings are for entertainment, personal
        insight and reflection only.</strong> They are not predictions of fact and not a substitute for medical,
        psychological, legal, financial or other professional advice. You always make your own decisions and are
        responsible for them, whatever a reading says.
      </p>
      <p>
        We do not give readings on questions about self-harm, harming others or crime. If you are in crisis, please contact
        local emergency services (112 in the EU) or a helpline.
      </p>

      <h2>2. Who may use it</h2>
      <p>You must be at least 18 years old to buy access or create an account.</p>

      <h2>3. What you can buy</h2>
      <ul>
        <li>
          <strong>Free:</strong> one Daily Rune reading per day.
        </li>
        <li>
          <strong>Unlock 24 hours — $1 (one-time):</strong> up to 10 readings in any spread (1, 3 or 5 runes) during 24
          hours from purchase.
          No account needed. Unused readings expire after 24 hours.
        </li>
        <li>
          <strong>ICE WHISPERS+ — $9.70/month or $97/year:</strong> all spreads (1, 3 and 5 runes), a private rune journal
          with PDF download, and up to 300 readings per month (a monthly pool — unused readings stay available until the
          month ends; yearly members receive a new pool every month). Requires an account. A limit of 30 readings per hour
          applies to all users to prevent automated abuse.
        </li>
        <li>
          <strong>Upgrade credit:</strong> if you join ICE WHISPERS+ while your 24-hour unlock is active, the $1 is
          deducted from your first membership payment. Monthly members can switch to yearly for $87 (the $97 yearly
          price minus a $10 credit for the month already paid); the yearly period starts on the day you switch.
        </li>
      </ul>
      <p>
        Prices are in US dollars and include VAT where applicable. Payment is handled by Stripe; we never see or store your
        card details.
      </p>

      <h2>4. Subscriptions, renewal and cancellation</h2>
      <p>
        ICE WHISPERS+ renews automatically every month or year until you cancel. You can cancel at any time by emailing{" "}
        <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>; the membership then stays active until the end of the
        period you have paid for and is not renewed. We will tell you in advance by email before any price change takes
        effect, and you can cancel before it applies.
      </p>

      <h2>5. Right of withdrawal (EU consumers)</h2>
      <p>
        <strong>ICE WHISPERS+ membership:</strong> you have the right to withdraw from the purchase within 14 days of the
        day you bought it, without giving a reason. Because you ask us to start the membership immediately, we will refund
        what you paid <em>minus an amount in proportion to the time the membership was active</em> before you told us you
        wished to withdraw. Refunds are made to the original payment method within 14 days of your notice.
      </p>
      <p>
        <strong>Unlock 24 hours ($1):</strong> when you buy it, you ask us to start immediately and confirm that you lose
        your right of withdrawal once the 24-hour service has been fully provided. If you withdraw before the 24 hours have
        ended, we refund the unused part in proportion to the time left.
      </p>
      <p>
        To withdraw, email <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a> with your account email or the email on
        your receipt and the words “I withdraw from my purchase”. You may also use the standard withdrawal form from the
        Swedish Consumer Agency (Konsumentverket). Your statutory rights as a consumer are not limited by these terms.
      </p>

      <h2>6. Your account and journal</h2>
      <p>
        Keep your password secret; you are responsible for activity on your account. Saving a reading to your journal is
        always your choice. You can download your journal as a PDF and delete entries at any time. Your saved journal is
        kept while your account exists, also if your membership ends, so you can download it or rejoin. You can ask us to
        delete your account and all its data at any time.
      </p>

      <h2>7. Fair use</h2>
      <p>
        Do not use scripts, bots or other automated means, try to get around limits or payments, resell access, or use the
        service in a way that harms others. We may suspend accounts that do.
      </p>

      <h2>8. Our content</h2>
      <p>
        The ICE WHISPERS™ name, deck artwork, rune interpretations and website are owned by {COMPANY.name}. You may use
        readings for your own personal, non-commercial purposes.
      </p>

      <h2>9. Availability and liability</h2>
      <p>
        We work to keep ICE WHISPERS available but cannot promise it will always be uninterrupted. If a paid reading fails
        because of a fault on our side, contact us and we will put it right. We are not liable for decisions you make based
        on a reading. Nothing in these terms limits liability that cannot be limited under applicable law.
      </p>

      <h2>10. Complaints and disputes</h2>
      <p>
        Contact us first at <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a> — we answer within a few working days.
        If we cannot agree, consumers in Sweden can turn to the National Board for Consumer Disputes (Allmänna
        reklamationsnämnden, ARN, arn.se). Swedish law applies, without limiting the mandatory consumer protection of your
        country of residence. Disputes are otherwise decided by Swedish courts.
      </p>

      <h2>11. Changes</h2>
      <p>
        We may update these terms. Material changes are announced on the site or by email before they take effect. See
        also our <Link href="/privacy">Privacy Policy</Link>.
      </p>
    </LegalPage>
  );
}
