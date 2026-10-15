// ICE WHISPERS — prices per currency (VAT included). Safe to import anywhere
// (server, edge and browser) — no secrets, no Stripe SDK.
//
// Each visitor sees ONE currency, chosen by country (Vercel's
// x-vercel-ip-country header): Sweden → SEK, EU → EUR, everyone else → USD.
// Members and 24-hour unlock holders keep the currency they paid in.

export type Currency = "usd" | "eur" | "sek";

// Amounts in the smallest unit (cents / öre).
export const PRICES: Record<
  Currency,
  { dayPass: number; plusMonthly: number; plusYearly: number; monthToYear: number; dayPassCredit: number }
> = {
  usd: { dayPass: 100, plusMonthly: 970, plusYearly: 9700, monthToYear: 8700, dayPassCredit: 100 },
  eur: { dayPass: 100, plusMonthly: 970, plusYearly: 9700, monthToYear: 8700, dayPassCredit: 100 },
  sek: { dayPass: 1000, plusMonthly: 9900, plusYearly: 99000, monthToYear: 89000, dayPassCredit: 1000 },
};

// EU member states that are not Sweden (Sweden gets SEK).
const EU = new Set([
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IE", "IT",
  "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES",
]);

export function currencyForCountry(country: string | null | undefined): Currency {
  const c = (country ?? "").toUpperCase();
  if (c === "SE") return "sek";
  if (EU.has(c)) return "eur";
  return "usd";
}

export function isCurrency(v: unknown): v is Currency {
  return v === "usd" || v === "eur" || v === "sek";
}

/** "$9.70", "€9.70", "99 kr", "$1", "€97". */
export function formatPrice(amount: number, currency: Currency): string {
  const whole = amount % 100 === 0;
  const n = whole ? String(amount / 100) : (amount / 100).toFixed(2);
  if (currency === "sek") return `${whole ? n : n.replace(".", ",")} kr`;
  return `${currency === "eur" ? "€" : "$"}${n}`;
}

/** Ready-to-show prices for the paywall and upgrade buttons. */
export function displayPrices(currency: Currency) {
  const p = PRICES[currency];
  const f = (a: number) => formatPrice(a, currency);
  return {
    currency,
    dayPass: f(p.dayPass),
    monthly: f(p.plusMonthly),
    yearly: f(p.plusYearly),
    monthlyCredited: f(p.plusMonthly - p.dayPassCredit), // first month with the 24-hour unlock credited
    yearlyCredited: f(p.plusYearly - p.dayPassCredit),
    monthToYear: f(p.monthToYear),
  };
}

export type DisplayPrices = ReturnType<typeof displayPrices>;

/**
 * The currency a visitor sees and pays in: the currency they already pay
 * in (membership or 24-hour unlock), otherwise their country's.
 */
export function resolveCurrency(
  access: { member?: { currency?: string | null } | null; dayPass?: { currency?: string | null } | null } | null,
  country: string | null | undefined
): Currency {
  const paid = access?.member?.currency ?? access?.dayPass?.currency;
  return isCurrency(paid) ? paid : currencyForCountry(country);
}
