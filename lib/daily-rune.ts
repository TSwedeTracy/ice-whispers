// "Today's rune" — the same rune for the same person on the same day,
// wherever it is shown (the site now, the daily email later).
import { ALL_CARDS } from "./runes";

export async function dailyRuneFor(personKey: string, isoDate: string) {
  const digest = new Uint8Array(
    await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`ice-whispers:${personKey}:${isoDate}`))
  );
  const index = ((digest[0] << 8) | digest[1]) % ALL_CARDS.length;
  const rune = ALL_CARDS[index];
  return { rune, reversed: rune.canReverse ? digest[2] % 2 === 1 : false };
}
