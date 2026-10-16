// ICE WHISPERS — Artwork mapping
//
// ⚠️ PLEASE VERIFY: filenames were assigned by matching the standard Elder
// Futhark order (Fehu=1 ... Othala=24) against your numbered files
// (1.png, 2_.png, 3.png ... 24.png). Your files ARE already numbered this
// way, which strongly suggests this is correct — but do a quick visual
// pass (open /public/cards and compare each image's glowing rune symbol
// against lib/runes.ts) before launch. See MAPPING.md for a checklist.

export const CARD_BACK = "/cards/web/back.webp"; // Baksida_NY.png
export const DECK_COVER = "/cards/web/cover.webp"; // framsida_ICE_Whispers_.png
export const LOGO = "/cards/web/logo.webp"; // logo.png, chroma-keyed transparent
export const LOGO_BOTTOM = "/cards/web/logo-bottom.webp"; // logo nederkant.png, chroma-keyed transparent
export const HERO_BG = "/cards/web/hero-bg.webp"; // background app.png, text-free atmosphere

const filenameById: Record<number, string> = {
  0: "0-wyrd.png", // 0_Wyrd_.png
  1: "1.png",
  2: "2.png", // source file was "2_.png"
  3: "3.png",
  4: "4.png",
  5: "5.png",
  6: "6.png",
  7: "7.png",
  8: "8.png",
  9: "9.png",
  10: "10.png",
  11: "11.png",
  12: "12.png",
  13: "13.png",
  14: "14.png",
  15: "15.png",
  16: "16.png",
  17: "17.png",
  18: "18.png",
  19: "19.png",
  20: "20.png",
  21: "21.png",
  22: "22.png",
  23: "23.png",
  24: "24.png",
};

// The original PNGs (~3 MB each) stay in /public/cards as masters. The site
// serves light WebP copies: /cards/web (768 px, ~250 KB) for cards shown
// large, /cards/thumb (240 px, ~30 KB) for grids. Regenerate both if the
// artwork changes.
export function cardImagePath(runeId: number): string {
  const filename = filenameById[runeId];
  if (!filename) throw new Error(`No artwork mapped for rune id ${runeId}`);
  return `/cards/web/${filename.replace(/\.png$/, ".webp")}`;
}

export function cardThumbPath(runeId: number): string {
  return cardImagePath(runeId).replace("/cards/web/", "/cards/thumb/");
}

/** Original full-size PNG (used for social sharing images). */
export function cardOriginalPath(runeId: number): string {
  return `/cards/${filenameById[runeId]}`;
}
